import test, { after, before, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { register } from 'node:module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

register(new URL('./helpers/next-test-loader.mjs', import.meta.url));

const BASE_URL = 'http://localhost:3000';
process.env.APP_URL = BASE_URL;
process.env.JWT_SECRET = 'password-reset-test-secret-key-at-least-32-chars';
process.env.ALLOW_DEMO_SEED = 'true';

let mongod;
let handle;
let models;

async function callApi(routePath, { method = 'GET', body = undefined, jar = new Map() } = {}) {
  const clean = routePath.replace(/^\/+/, '');
  const url = `${BASE_URL}/api/${clean}`;
  const pathPart = clean.split('?')[0];
  const segments = pathPart.split('/').filter(Boolean);
  const headers = new Headers();
  if (method !== 'GET' && method !== 'HEAD') {
    headers.set('origin', BASE_URL);
  }
  let reqBody;
  if (body !== undefined) {
    headers.set('content-type', 'application/json');
    reqBody = JSON.stringify(body);
  }
  const prev = globalThis.__UF_TEST_COOKIE_STORE__;
  globalThis.__UF_TEST_COOKIE_STORE__ = jar;
  try {
    const req = new Request(url, { method, headers, body: reqBody });
    const res = await handle(req, { params: Promise.resolve({ path: segments }) });
    const text = await res.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { status: res.status, data, jar };
  } finally {
    globalThis.__UF_TEST_COOKIE_STORE__ = prev;
  }
}

describe('Forgot Password Resend 6-digit OTP Flow', () => {
  before(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    const apiMod = await import('../lib/api.js');
    handle = apiMod.handle;
    models = await import('../lib/models.js');

    const reg = await callApi('auth/register', {
      method: 'POST',
      body: {
        name: 'Reset Test User',
        email: 'resetuser@test.local',
        phone: '+91 98765 43210',
        password: 'InitialPassword123',
        role: 'user'
      }
    });
    assert.equal(reg.status, 201);

    const reg2 = await callApi('auth/register', {
      method: 'POST',
      body: {
        name: 'Attempt Limit User',
        email: 'limituser@test.local',
        phone: '+91 98765 43211',
        password: 'InitialPassword123',
        role: 'user'
      }
    });
    assert.equal(reg2.status, 201);

    const reg3 = await callApi('auth/register', {
      method: 'POST',
      body: {
        name: 'Expired OTP User',
        email: 'expireduser@test.local',
        phone: '+91 98765 43212',
        password: 'InitialPassword123',
        role: 'user'
      }
    });
    assert.equal(reg3.status, 201);
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  test('UI uses email-only verification flow with 10-minute expiry and cooldown', () => {
    const ui = readFileSync(path.resolve('components/password-reset.js'), 'utf8');
    assert.ok(!ui.includes('window.alert'), 'Must not show code in window.alert');
    assert.ok(!ui.includes('deliveredCode'), 'Must not display code on screen');
    assert.ok(!ui.includes('Email or phone number'), 'Must use email only');
    assert.ok(!ui.includes('auth-art'), 'Must not render the left-side image panel');
    assert.ok(ui.includes('Valid for 10 minutes'), 'Must state 10-minute expiry');
    assert.ok(ui.includes('Send Verification Code'), 'Must show Send Verification Code button');
    assert.ok(ui.includes('Reset Password'), 'Must show Reset Password button');
    assert.ok(ui.includes('placeholder="Enter Code"'), 'Must show Enter Code placeholder');
    assert.ok(ui.includes('verify-reset-code'), 'Must verify code before setting new password');
  });

  test('Reset password via email -> 6-digit OTP -> verify -> set new password -> single-use -> login', async () => {
    const forgot = await callApi('auth/forgot-password', {
      method: 'POST',
      body: { email: 'resetuser@test.local' }
    });
    assert.equal(forgot.status, 200);
    assert.equal(forgot.data.code, undefined, 'Must not expose OTP in code field');
    assert.match(String(forgot.data.token), /^\d{6}$/, 'Generated OTP must be 6 digits');

    // Resend cooldown: immediate second request within 60s must be rejected with 429
    const resendTooSoon = await callApi('auth/forgot-password', {
      method: 'POST',
      body: { email: 'resetuser@test.local' }
    });
    assert.equal(resendTooSoon.status, 429);

    // Check 10-minute expiration in DB
    const userDoc = await models.User.findOne({ email: 'resetuser@test.local' });
    const tokenDoc = await models.PasswordResetToken.findOne({ userId: userDoc._id, used: false });
    assert.ok(tokenDoc, 'Hashed OTP record must exist in MongoDB');
    const ttlMs = tokenDoc.expiresAt.getTime() - tokenDoc.createdAt.getTime();
    assert.ok(ttlMs >= 9 * 60 * 1000 && ttlMs <= 10.5 * 60 * 1000, 'OTP expiration must be 10 minutes');

    const verify = await callApi('auth/verify-reset-code', {
      method: 'POST',
      body: { email: 'resetuser@test.local', code: forgot.data.token }
    });
    assert.equal(verify.status, 200);
    assert.equal(verify.data.valid, true);

    const reset = await callApi('auth/reset-password', {
      method: 'POST',
      body: {
        email: 'resetuser@test.local',
        code: forgot.data.token,
        password: 'UpdatedPassword123'
      }
    });
    assert.equal(reset.status, 200);

    // Single-use: reusing the same OTP must fail
    const reuse = await callApi('auth/reset-password', {
      method: 'POST',
      body: {
        email: 'resetuser@test.local',
        code: forgot.data.token,
        password: 'AnotherPassword123'
      }
    });
    assert.equal(reuse.status, 400);

    const oldLogin = await callApi('auth/login', {
      method: 'POST',
      body: { email: 'resetuser@test.local', password: 'InitialPassword123' }
    });
    assert.equal(oldLogin.status, 401);

    const newLogin = await callApi('auth/login', {
      method: 'POST',
      body: { email: 'resetuser@test.local', password: 'UpdatedPassword123' }
    });
    assert.equal(newLogin.status, 200);
  });

  test('Verification attempt limit invalidates OTP after 5 failed attempts', async () => {
    const forgot = await callApi('auth/forgot-password', {
      method: 'POST',
      body: { email: 'limituser@test.local' }
    });
    assert.equal(forgot.status, 200);

    for (let i = 0; i < 4; i++) {
      const bad = await callApi('auth/verify-reset-code', {
        method: 'POST',
        body: { email: 'limituser@test.local', code: '000000' }
      });
      assert.equal(bad.status, 400);
    }

    // 5th invalid attempt locks out / invalidates the OTP
    const fifth = await callApi('auth/verify-reset-code', {
      method: 'POST',
      body: { email: 'limituser@test.local', code: '000000' }
    });
    assert.equal(fifth.status, 429);

    // Even the real OTP must now fail because it was invalidated
    const validAfterLockout = await callApi('auth/verify-reset-code', {
      method: 'POST',
      body: { email: 'limituser@test.local', code: forgot.data.token }
    });
    assert.equal(validAfterLockout.status, 400);
  });

  test('Expired OTP is rejected on verify and reset', async () => {
    const forgot = await callApi('auth/forgot-password', {
      method: 'POST',
      body: { email: 'expireduser@test.local' }
    });
    assert.equal(forgot.status, 200);

    const userDoc = await models.User.findOne({ email: 'expireduser@test.local' });
    await models.PasswordResetToken.updateMany(
      { userId: userDoc._id },
      { $set: { expiresAt: new Date(Date.now() - 1000) } }
    );

    const verifyExpired = await callApi('auth/verify-reset-code', {
      method: 'POST',
      body: { email: 'expireduser@test.local', code: forgot.data.token }
    });
    assert.equal(verifyExpired.status, 400);

    const resetExpired = await callApi('auth/reset-password', {
      method: 'POST',
      body: { email: 'expireduser@test.local', code: forgot.data.token, password: 'NewPassword123' }
    });
    assert.equal(resetExpired.status, 400);
  });

  test('Forgot password rejects non-email phone input', async () => {
    const res = await callApi('auth/forgot-password', {
      method: 'POST',
      body: { email: '9876543210' }
    });
    assert.equal(res.status, 422);
  });
});
