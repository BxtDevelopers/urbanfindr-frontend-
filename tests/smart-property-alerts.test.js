import test, { after, before, describe } from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

register(new URL('./helpers/next-test-loader.mjs', import.meta.url));

const BASE_URL = 'http://localhost:3000';
process.env.APP_URL = BASE_URL;
process.env.JWT_SECRET = 'property-alerts-secret-at-least-32-chars-long';
process.env.ALLOW_DEMO_SEED = 'true';
process.env.NODE_TEST_CONTEXT = 'true';

let mongod;
let handle;
let models;
let alertMatching;

function withJar(jar, fn) {
  const prev = globalThis.__UF_TEST_COOKIE_STORE__;
  globalThis.__UF_TEST_COOKIE_STORE__ = jar;
  return Promise.resolve().then(fn).finally(() => {
    globalThis.__UF_TEST_COOKIE_STORE__ = prev;
  });
}

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
  const req = new Request(url, { method, headers, body: reqBody });
  const res = await withJar(jar, () => handle(req, { params: Promise.resolve({ path: segments }) }));
  const text = await res.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, ok: res.ok, data };
}

describe('Smart Property Alerts System Test Suite', () => {
  let userAJar = new Map();
  let userBJar = new Map();
  let adminJar = new Map();
  let userAId, userBId, adminId;

  before(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri;

    const apiModule = await import('../lib/api.js');
    handle = apiModule.handle;
    models = await import('../lib/models.js');
    alertMatching = await import('../lib/alertMatching.js');
    const { db } = await import('../lib/db.js');

    await db();

    // Register User A (Customer)
    const resA = await callApi('auth/register', {
      method: 'POST',
      body: { name: 'Customer Alice', email: 'alice@alerts.test', password: 'Password@123', phone: '+919876543210' },
      jar: userAJar
    });
    assert.equal(resA.status, 201);
    userAId = resA.data.user._id;

    // Register User B (Customer)
    const resB = await callApi('auth/register', {
      method: 'POST',
      body: { name: 'Customer Bob', email: 'bob@alerts.test', password: 'Password@123', phone: '+919876543211' },
      jar: userBJar
    });
    assert.equal(resB.status, 201);
    userBId = resB.data.user._id;

    // Create Admin User directly in DB
    const adminUser = await models.User.create({
      name: 'System Admin',
      email: 'admin@alerts.test',
      password: 'hashed-password',
      role: 'admin',
      active: true
    });
    adminId = adminUser._id;

    // Log in as Admin
    await models.User.updateOne({ _id: adminId }, { $set: { password: await (await import('bcryptjs')).default.hash('Admin@1234', 10) } });
    const resAdmin = await callApi('auth/login', {
      method: 'POST',
      body: { email: 'admin@alerts.test', password: 'Admin@1234' },
      jar: adminJar
    });
    assert.equal(resAdmin.status, 200);
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  test('1. Guest cannot create or access property alerts', async () => {
    const res = await callApi('property-alerts');
    assert.equal(res.status, 401);

    const createRes = await callApi('property-alerts', {
      method: 'POST',
      body: { name: 'Guest Alert', filters: { city: 'Hyderabad' } }
    });
    assert.equal(createRes.status, 401);
  });

  test('2. Alert creation validates name, budget constraints, and filter attributes', async () => {
    // Missing name
    const resMissingName = await callApi('property-alerts', {
      method: 'POST',
      body: { name: '', filters: { city: 'Hyderabad' } },
      jar: userAJar
    });
    assert.equal(resMissingName.status, 400);

    // Invalid budget: minPrice > maxPrice
    const resInvalidBudget = await callApi('property-alerts', {
      method: 'POST',
      body: {
        name: 'Invalid Budget Alert',
        filters: { city: 'Hyderabad', minPrice: 12000000, maxPrice: 8000000 }
      },
      jar: userAJar
    });
    assert.equal(resInvalidBudget.status, 400);

    // Negative budget
    const resNegativeBudget = await callApi('property-alerts', {
      method: 'POST',
      body: {
        name: 'Negative Budget Alert',
        filters: { city: 'Hyderabad', minPrice: -500 }
      },
      jar: userAJar
    });
    assert.equal(resNegativeBudget.status, 400);

    // Valid creation
    const resValid = await callApi('property-alerts', {
      method: 'POST',
      body: {
        name: '3 BHK Apartments in Kondapur',
        filters: {
          city: 'Hyderabad',
          localities: ['Kondapur'],
          listingType: 'buy',
          category: 'Residential',
          propertyType: 'Apartment',
          bhk: [3],
          minPrice: 8000000,
          maxPrice: 12000000,
          furnishing: 'Semi-furnished',
          verifiedOnly: true
        },
        notificationPreferences: {
          inApp: true,
          email: false,
          frequency: 'instant'
        }
      },
      jar: userAJar
    });
    assert.equal(resValid.status, 201);
    assert.equal(resValid.data.name, '3 BHK Apartments in Kondapur');
    assert.equal(resValid.data.status, 'active');
    assert.equal(resValid.data.filters.city, 'Hyderabad');
    assert.deepEqual(resValid.data.filters.localities, ['Kondapur']);
    assert.equal(resValid.data.filters.minPrice, 8000000);
    assert.equal(resValid.data.filters.maxPrice, 12000000);
  });

  test('3. Duplicate alert submission prevention', async () => {
    // Attempting to submit the exact same alert name and criteria for User A
    const resDuplicate = await callApi('property-alerts', {
      method: 'POST',
      body: {
        name: '3 BHK Apartments in Kondapur',
        filters: {
          city: 'Hyderabad',
          listingType: 'buy',
          propertyType: 'Apartment'
        }
      },
      jar: userAJar
    });
    assert.equal(resDuplicate.status, 409);
  });

  test('4. Security & Authorization: User B cannot access, edit, or delete User A alert', async () => {
    // Retrieve User A's alerts
    const resListA = await callApi('property-alerts', { jar: userAJar });
    assert.equal(resListA.status, 200);
    assert.equal(resListA.data.items.length, 1);
    const alertAId = resListA.data.items[0]._id;

    // User B attempts to read User A's alert
    const resGetOther = await callApi(`property-alerts/${alertAId}`, { jar: userBJar });
    assert.equal(resGetOther.status, 404);

    // User B attempts to edit User A's alert
    const resEditOther = await callApi(`property-alerts/${alertAId}`, {
      method: 'PATCH',
      body: { name: 'Hacked Name' },
      jar: userBJar
    });
    assert.equal(resEditOther.status, 404);

    // User B attempts to pause User A's alert
    const resPauseOther = await callApi(`property-alerts/${alertAId}/pause`, {
      method: 'PATCH',
      jar: userBJar
    });
    assert.equal(resPauseOther.status, 404);

    // User B attempts to access User A's alert matches
    const resMatchesOther = await callApi(`property-alerts/${alertAId}/matches`, { jar: userBJar });
    assert.equal(resMatchesOther.status, 404);

    // User B attempts to delete User A's alert
    const resDeleteOther = await callApi(`property-alerts/${alertAId}`, {
      method: 'DELETE',
      jar: userBJar
    });
    assert.equal(resDeleteOther.status, 404);
  });

  test('5. Alert Pause and Resume lifecycle', async () => {
    const listRes = await callApi('property-alerts', { jar: userAJar });
    const alertId = listRes.data.items[0]._id;

    // Pause alert
    const pauseRes = await callApi(`property-alerts/${alertId}/pause`, {
      method: 'PATCH',
      jar: userAJar
    });
    assert.equal(pauseRes.status, 200);
    assert.equal(pauseRes.data.status, 'paused');

    // Verify it is paused in database
    const alertRecord = await models.PropertyAlert.findById(alertId);
    assert.equal(alertRecord.status, 'paused');

    // Resume alert
    const resumeRes = await callApi(`property-alerts/${alertId}/resume`, {
      method: 'PATCH',
      jar: userAJar
    });
    assert.equal(resumeRes.status, 200);
    assert.equal(resumeRes.data.status, 'active');

    const alertRecord2 = await models.PropertyAlert.findById(alertId);
    assert.equal(alertRecord2.status, 'active');
  });

  test('6. Matching Algorithm: Compares criteria accurately', async () => {
    const listRes = await callApi('property-alerts', { jar: userAJar });
    const alert = listRes.data.items[0];

    // Perfect matching property
    const matchingProp = {
      status: 'approved',
      city: 'Hyderabad',
      locality: 'Kondapur',
      purpose: 'buy',
      type: 'Apartment',
      bedrooms: 3,
      price: 9500000,
      furnishing: 'Semi-furnished',
      verified: true
    };
    assert.equal(alertMatching.doesPropertyMatchAlert(matchingProp, alert), true);

    // Non-approved property (e.g. pending)
    const pendingProp = { ...matchingProp, status: 'pending' };
    assert.equal(alertMatching.doesPropertyMatchAlert(pendingProp, alert), false);

    // Rejected property
    const rejectedProp = { ...matchingProp, status: 'rejected' };
    assert.equal(alertMatching.doesPropertyMatchAlert(rejectedProp, alert), false);

    // Mismatched city
    const wrongCityProp = { ...matchingProp, city: 'Bengaluru' };
    assert.equal(alertMatching.doesPropertyMatchAlert(wrongCityProp, alert), false);

    // Mismatched locality
    const wrongLocProp = { ...matchingProp, locality: 'Banjara Hills' };
    assert.equal(alertMatching.doesPropertyMatchAlert(wrongLocProp, alert), false);

    // Mismatched BHK (2 BHK instead of 3 BHK)
    const wrongBhkProp = { ...matchingProp, bedrooms: 2 };
    assert.equal(alertMatching.doesPropertyMatchAlert(wrongBhkProp, alert), false);

    // Price too high (₹1.5 Cr > ₹1.2 Cr max)
    const expensiveProp = { ...matchingProp, price: 15000000 };
    assert.equal(alertMatching.doesPropertyMatchAlert(expensiveProp, alert), false);

    // Price too low (₹60 Lakh < ₹80 Lakh min)
    const cheapProp = { ...matchingProp, price: 6000000 };
    assert.equal(alertMatching.doesPropertyMatchAlert(cheapProp, alert), false);

    // Unverified property (alert requires verified only)
    const unverifiedProp = { ...matchingProp, verified: false };
    assert.equal(alertMatching.doesPropertyMatchAlert(unverifiedProp, alert), false);
  });

  test('7. Event-Driven Matching & Strict Deduplication Prevention', async () => {
    // Create an eligible property directly in DB
    const property = await models.Property.create({
      owner: userBId,
      title: 'Luxury 3 BHK in Kondapur Residency',
      description: 'Spacious apartment in prime Kondapur.',
      purpose: 'buy',
      type: 'Apartment',
      city: 'Hyderabad',
      locality: 'Kondapur',
      price: 9500000,
      bedrooms: 3,
      bathrooms: 3,
      area: 1850,
      furnishing: 'Semi-furnished',
      verified: true,
      status: 'approved',
      images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00']
    });

    // 1st Trigger: should find match, generate in-app notification, and record log
    const triggerRes1 = await alertMatching.triggerAlertsForProperty(property._id);
    assert.equal(triggerRes1.matchesCount, 1);
    assert.equal(triggerRes1.notificationsSent, 1);
    assert.equal(triggerRes1.deduplicatedCount, 0);

    // Check notification in DB for User A
    const notifs = await models.Notification.find({ user: userAId, 'metadata.type': 'property_alert' });
    assert.equal(notifs.length, 1);
    assert.equal(notifs[0].title, 'New Property Matches Your Alert');
    assert.equal(notifs[0].metadata.price, 9500000);
    assert.equal(notifs[0].metadata.locality, 'Kondapur');

    // 2nd Trigger: identical property and alert -> MUST BE DEDUPLICATED
    const triggerRes2 = await alertMatching.triggerAlertsForProperty(property._id);
    assert.equal(triggerRes2.matchesCount, 1);
    assert.equal(triggerRes2.notificationsSent, 0); // No second notification!
    assert.equal(triggerRes2.deduplicatedCount, 1); // Deduplication caught it!

    // Verify notification count in DB has not changed
    const notifsAfter = await models.Notification.find({ user: userAId, 'metadata.type': 'property_alert' });
    assert.equal(notifsAfter.length, 1);
  });

  test('8. User A cannot mark User B notification as read', async () => {
    // User A has 1 notification from the previous test
    const notifA = await models.Notification.findOne({ user: userAId });
    assert.ok(notifA);

    // User B attempts to mark User A's notification as read
    const resPatch = await callApi(`notifications/${notifA._id}`, {
      method: 'PATCH',
      jar: userBJar
    });
    assert.equal(resPatch.status, 404);

    // User A marks their own notification as read
    const resPatchSelf = await callApi(`notifications/${notifA._id}`, {
      method: 'PATCH',
      jar: userAJar
    });
    assert.equal(resPatchSelf.status, 200);

    const reloaded = await models.Notification.findById(notifA._id);
    assert.equal(reloaded.read, true);
  });

  test('9. Alert Matches API returns matching properties with pagination and sorting', async () => {
    const listRes = await callApi('property-alerts', { jar: userAJar });
    const alertId = listRes.data.items[0]._id;

    const matchesRes = await callApi(`property-alerts/${alertId}/matches?sort=newest&limit=5`, { jar: userAJar });
    assert.equal(matchesRes.status, 200);
    assert.equal(matchesRes.data.total, 1);
    assert.equal(matchesRes.data.items[0].title, 'Luxury 3 BHK in Kondapur Residency');
    assert.equal(matchesRes.data.items[0].price, 9500000);
  });

  test('10. Daily Digest processing queues and aggregates matches', async () => {
    // Create an alert with frequency === 'daily'
    const resDailyAlert = await callApi('property-alerts', {
      method: 'POST',
      body: {
        name: 'Daily Rent in HSR Layout',
        filters: {
          city: 'Bengaluru',
          localities: ['HSR Layout'],
          listingType: 'rent',
          propertyType: 'Apartment'
        },
        notificationPreferences: {
          inApp: true,
          email: false,
          frequency: 'daily'
        }
      },
      jar: userAJar
    });
    assert.equal(resDailyAlert.status, 201);

    // Create a property matching this daily alert
    const rentProp = await models.Property.create({
      owner: userBId,
      title: 'Cozy 2 BHK in HSR Sector 2',
      purpose: 'rent',
      type: 'Apartment',
      city: 'Bengaluru',
      locality: 'HSR Layout',
      price: 35000,
      bedrooms: 2,
      area: 1100,
      status: 'approved'
    });

    // Trigger alert
    await alertMatching.triggerAlertsForProperty(rentProp._id);

    // Queue item should exist
    const queueItem = await models.AlertDigestQueue.findOne({ alert: resDailyAlert.data._id, processed: false });
    assert.ok(queueItem);

    // Process daily digests
    const digestResult = await alertMatching.processDailyAlertDigests();
    assert.equal(digestResult.digestsSent, 1);

    // Queue item should now be processed
    const reloadedQueue = await models.AlertDigestQueue.findOne({ alert: resDailyAlert.data._id });
    assert.equal(reloadedQueue.processed, true);

    // In-app digest notification should exist
    const digestNotif = await models.Notification.findOne({ user: userAId, 'metadata.type': 'property_alert_digest' });
    assert.ok(digestNotif);
    assert.match(digestNotif.title, /Daily Digest/i);
  });

  test('11. Customer Dashboard Stats endpoint returns live metrics', async () => {
    const resStats = await callApi('property-alerts/stats', { jar: userAJar });
    assert.equal(resStats.status, 200);
    assert.ok(resStats.data.activeAlerts >= 1);
    assert.ok(resStats.data.newMatches >= 1);
  });

  test('12. Admin Property Alerts Management & Disabling Abusive Alerts', async () => {
    // Admin lists alerts with stats
    const resAdminList = await callApi('admin/property-alerts', { jar: adminJar });
    assert.equal(resAdminList.status, 200);
    assert.ok(resAdminList.data.stats.totalAlerts >= 2);
    assert.ok(resAdminList.data.stats.activeAlerts >= 1);
    assert.ok(Array.isArray(resAdminList.data.items));

    // Admin disables an alert
    const targetAlertId = resAdminList.data.items[0]._id;
    const resDisable = await callApi(`admin/property-alerts/${targetAlertId}`, {
      method: 'PATCH',
      body: { status: 'disabled', reason: 'Abusive automated filter frequency' },
      jar: adminJar
    });
    assert.equal(resDisable.status, 200);
    assert.equal(resDisable.data.status, 'disabled');
    assert.equal(resDisable.data.adminDisabledReason, 'Abusive automated filter frequency');

    // Customer can no longer resume a disabled alert
    const resResumeBlocked = await callApi(`property-alerts/${targetAlertId}/resume`, {
      method: 'PATCH',
      jar: userAJar
    });
    assert.equal(resResumeBlocked.status, 403);
  });
});
