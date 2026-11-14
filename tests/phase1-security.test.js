import test, { after, before, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { register } from 'node:module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

register(new URL('./helpers/next-test-loader.mjs', import.meta.url));

const BASE_URL = 'http://localhost:3000';
process.env.APP_URL = BASE_URL;
process.env.JWT_SECRET = 'phase1-test-secret-key-at-least-32-chars-long';
process.env.ALLOW_DEMO_SEED = 'true';

let mongod;
let handle;
let models;

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
  return { status: res.status, data, jar };
}

describe('Phase 1 Security & Authorization Integration Suite', () => {
  const jars = {
    customerA: new Map(),
    customerB: new Map(),
    providerA: new Map(),
    providerB: new Map(),
    ownerA: new Map(),
    channelPartner: new Map(),
    admin: new Map()
  };

  let users = {};

  before(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    assert.ok(uri.startsWith('mongodb://127.0.0.1'), 'Test suite must use in-memory MongoDB');
    process.env.MONGODB_URI = uri;

    const apiMod = await import('../lib/api.js');
    handle = apiMod.handle;
    models = await import('../lib/models.js');

    // Register Customer A, Customer B, Owner A, Channel Partner via real register endpoint
    const regA = await callApi('auth/register', {
      method: 'POST',
      jar: jars.customerA,
      body: { name: 'Customer A', email: 'customera@test.local', phone: '9800000001', password: 'Password123', role: 'user' }
    });
    assert.equal(regA.status, 201);
    users.customerA = regA.data.user;

    const regB = await callApi('auth/register', {
      method: 'POST',
      jar: jars.customerB,
      body: { name: 'Customer B', email: 'customerb@test.local', phone: '9800000002', password: 'Password123', role: 'user' }
    });
    assert.equal(regB.status, 201);
    users.customerB = regB.data.user;

    const regOwner = await callApi('auth/register', {
      method: 'POST',
      jar: jars.ownerA,
      body: { name: 'Owner A', email: 'ownera@test.local', phone: '9800000003', password: 'Password123', role: 'owner' }
    });
    assert.equal(regOwner.status, 201);
    users.ownerA = regOwner.data.user;

    const regCP = await callApi('auth/register', {
      method: 'POST',
      jar: jars.channelPartner,
      body: { name: 'Partner A', email: 'partnera@test.local', phone: '9800000004', password: 'Password123', role: 'channel_partner', company: 'CP Homes', reraId: 'RERA-CP-1' }
    });
    assert.equal(regCP.status, 201);
    users.channelPartner = regCP.data.user;

    // Seed two Plumbing service providers + one Admin directly in in-memory DB, then login
    const { hash } = await import('bcryptjs');
    const pwHash = await hash('Password123', 10);

    const pA = await models.User.create({
      name: 'Plumber One',
      email: 'providera@test.local',
      phone: '9800000011',
      password: pwHash,
      role: 'service_provider',
      serviceCategory: 'plumbing',
      active: true
    });
    await models.WorkspaceMembership.create({
      user: pA._id,
      workspaceType: 'provider',
      status: 'active',
      businessProfile: { businessName: 'Plumber One Co', category: 'plumbing' }
    });

    const pB = await models.User.create({
      name: 'Plumber Two',
      email: 'providerb@test.local',
      phone: '9800000012',
      password: pwHash,
      role: 'service_provider',
      serviceCategory: 'plumbing',
      active: true
    });
    await models.WorkspaceMembership.create({
      user: pB._id,
      workspaceType: 'provider',
      status: 'active',
      businessProfile: { businessName: 'Plumber Two Co', category: 'plumbing' }
    });

    await models.User.create({
      name: 'Super Admin',
      email: 'admin@test.local',
      phone: '9800000099',
      password: pwHash,
      role: 'admin',
      active: true
    });

    const logPA = await callApi('auth/login', { method: 'POST', jar: jars.providerA, body: { email: 'providera@test.local', password: 'Password123' } });
    assert.equal(logPA.status, 200);
    users.providerA = logPA.data.user;

    const logPB = await callApi('auth/login', { method: 'POST', jar: jars.providerB, body: { email: 'providerb@test.local', password: 'Password123' } });
    assert.equal(logPB.status, 200);
    users.providerB = logPB.data.user;

    const logAdmin = await callApi('auth/login', { method: 'POST', jar: jars.admin, body: { email: 'admin@test.local', password: 'Password123' } });
    assert.equal(logAdmin.status, 200);
    users.admin = logAdmin.data.user;
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  test('1. Public registration blocks admin role in Next.js and Express backend validation', async () => {
    const res = await callApi('auth/register', {
      method: 'POST',
      jar: new Map(),
      body: { name: 'Attacker', email: 'attacker@test.local', phone: '9811111111', password: 'Password123', role: 'admin' }
    });
    assert.equal(res.status, 422);

    const expressValidation = await import('../../urbanfindr-backend/src/utils/validation.js');
    assert.throws(() => expressValidation.registerSchema.parse({
      name: 'Attacker',
      email: 'attacker2@test.local',
      phone: '9811111112',
      password: 'Password123',
      role: 'admin'
    }));
    const profileParsed = expressValidation.profileUpdateSchema.parse({
      name: 'Updated Name',
      role: 'admin'
    });
    assert.equal(profileParsed.role, undefined);
  });

  test('2. Password change requires currentPassword, revokes prior sessions, and password reset works single-use', async () => {
    const secondJar = new Map();
    const login2 = await callApi('auth/login', {
      method: 'POST',
      jar: secondJar,
      body: { email: 'customerb@test.local', password: 'Password123' }
    });
    assert.equal(login2.status, 200);

    const failMissingCurr = await callApi('auth/password', {
      method: 'POST',
      jar: jars.customerB,
      body: { newPassword: 'NewPassword123' }
    });
    assert.equal(failMissingCurr.status, 422);

    const failWrongCurr = await callApi('auth/password', {
      method: 'POST',
      jar: jars.customerB,
      body: { currentPassword: 'WrongPassword1', newPassword: 'NewPassword123' }
    });
    assert.equal(failWrongCurr.status, 401);

    const okChange = await callApi('auth/password', {
      method: 'POST',
      jar: jars.customerB,
      body: { currentPassword: 'Password123', newPassword: 'NewPassword123' }
    });
    assert.equal(okChange.status, 200);

    // Prior session on secondJar must be invalidated
    const oldSessionCheck = await callApi('auth/me', { jar: secondJar });
    assert.equal(oldSessionCheck.data.user, null);

    // Forgot & reset flow
    const forgot = await callApi('auth/forgot-password', {
      method: 'POST',
      jar: new Map(),
      body: { email: 'customerb@test.local' }
    });
    assert.equal(forgot.status, 200);
    assert.ok(forgot.data.token, 'Dev/test reset token returned only with ALLOW_DEMO_SEED=true');

    const reset = await callApi('auth/reset-password', {
      method: 'POST',
      jar: new Map(),
      body: { token: forgot.data.token, password: 'Password123' }
    });
    assert.equal(reset.status, 200);

    // Reusing same token must fail
    const replay = await callApi('auth/reset-password', {
      method: 'POST',
      jar: new Map(),
      body: { token: forgot.data.token, password: 'AnotherPassword123' }
    });
    assert.equal(replay.status, 400);

    // Re-login Customer B
    const relogin = await callApi('auth/login', {
      method: 'POST',
      jar: jars.customerB,
      body: { email: 'customerb@test.local', password: 'Password123' }
    });
    assert.equal(relogin.status, 200);
  });

  test('3. Customer A private service bookings cannot be accessed or mutated by Customer B or guests without token', async () => {
    const created = await callApi('service-requests', {
      method: 'POST',
      jar: jars.customerA,
      body: {
        category: 'Plumbing',
        categorySlug: 'plumbing',
        serviceType: 'Leak Repair',
        name: 'Customer A',
        phone: '9800000001',
        city: 'Bengaluru',
        address: '123 Secret Villa'
      }
    });
    assert.equal(created.status, 201);
    const srId = created.data.item._id;
    const reqCode = created.data.requestId;

    // Customer B cannot see Customer A's booking in list
    const listB = await callApi('service-requests', { jar: jars.customerB });
    assert.equal(listB.status, 200);
    assert.equal(listB.data.items.some((i) => i._id === srId), false);

    // Customer B cannot fetch detail
    const detailB = await callApi(`service-requests/${srId}`, { jar: jars.customerB });
    assert.equal(detailB.status, 403);

    // Customer B cannot cancel or mutate
    const cancelB = await callApi(`service-requests/${srId}`, {
      method: 'PATCH',
      jar: jars.customerB,
      body: { action: 'cancel', reason: 'Hijack' }
    });
    assert.equal(cancelB.status, 403);

    // Unauthenticated lookup by phone or requestId without token is denied
    const unauthPhone = await callApi('service-requests?phone=9800000001');
    assert.equal(unauthPhone.status, 401);
    const unauthReqId = await callApi(`service-requests?requestId=${reqCode}`);
    assert.equal(unauthReqId.status, 401);
    const unauthDetail = await callApi(`service-requests/${srId}`);
    assert.equal(unauthDetail.status, 401);

    // Guest booking gets trackingToken & cannot be read with wrong token
    const guestPost = await callApi('service-requests', {
      method: 'POST',
      jar: new Map(),
      body: {
        category: 'Plumbing',
        categorySlug: 'plumbing',
        serviceType: 'Tap Replacement',
        name: 'Guest User',
        phone: '9800000055',
        city: 'Bengaluru'
      }
    });
    assert.equal(guestPost.status, 201);
    assert.ok(guestPost.data.trackingToken);
    assert.equal(guestPost.data.item.trackingTokenHash, undefined);

    const wrongGuest = await callApi(`service-requests/${guestPost.data.requestId}?token=wrongtoken123`);
    assert.equal(wrongGuest.status, 401);
    const rightGuest = await callApi(`service-requests/${guestPost.data.requestId}?token=${guestPost.data.trackingToken}`);
    assert.equal(rightGuest.status, 200);
    assert.equal(rightGuest.data.item.requestId, guestPost.data.requestId);
    assert.equal(rightGuest.data.item.trackingTokenHash, undefined);
  });

  test('4. Service provider B cannot access Provider A assigned private booking or escalate role', async () => {
    // Customer B books specifically Provider A
    const created = await callApi('service-requests', {
      method: 'POST',
      jar: jars.customerB,
      body: {
        category: 'Plumbing',
        categorySlug: 'plumbing',
        serviceType: 'Pipe Burst Emergency',
        name: 'Customer B',
        phone: '9800000002',
        city: 'Bengaluru',
        assignedSpecialist: 'Plumber One',
        assignedSpecialistId: users.providerA._id
      }
    });
    assert.equal(created.status, 201);
    const srId = created.data.item._id;

    // Customer A cannot impersonate provider via ?as=provider
    const escalate = await callApi('service-requests?as=provider&category=plumbing', { jar: jars.customerA });
    assert.equal(escalate.status, 403);

    // Provider A sees & quotes the booking
    const listPA = await callApi('service-requests?as=provider', { jar: jars.providerA });
    assert.equal(listPA.status, 200);
    assert.equal(listPA.data.items.some((i) => i._id === srId), true);

    const quotePA = await callApi(`service-requests/${srId}`, {
      method: 'PATCH',
      jar: jars.providerA,
      body: { action: 'quote', amount: 1500, notes: 'Emergency fix' }
    });
    assert.equal(quotePA.status, 200);

    // Provider B must NOT see Provider A's private assigned booking in list, detail, or PATCH
    const listPB = await callApi('service-requests?as=provider', { jar: jars.providerB });
    assert.equal(listPB.status, 200);
    assert.equal(listPB.data.items.some((i) => i._id === srId), false);

    const detailPB = await callApi(`service-requests/${srId}`, { jar: jars.providerB });
    assert.equal(detailPB.status, 403);

    const completePB = await callApi(`service-requests/${srId}`, {
      method: 'PATCH',
      jar: jars.providerB,
      body: { action: 'complete' }
    });
    assert.equal(completePB.status, 403);

    // Provider A cannot accept their own quote on behalf of customer
    const providerSelfAccept = await callApi(`service-requests/${srId}`, {
      method: 'PATCH',
      jar: jars.providerA,
      body: { action: 'accept' }
    });
    assert.equal(providerSelfAccept.status, 403);

    // Customer B CAN accept the quote
    const custAccept = await callApi(`service-requests/${srId}`, {
      method: 'PATCH',
      jar: jars.customerB,
      body: { action: 'accept' }
    });
    assert.equal(custAccept.status, 200);
    assert.equal(custAccept.data.item.status, 'accepted');
  });

  test('5. Customer cannot close an owner property via PATCH /api/leads/:id or confirm own site visit', async () => {
    const prop = await models.Property.create({
      owner: users.ownerA._id,
      title: 'Owner A Luxury Apartment',
      description: 'Spacious 3BHK luxury residence in Indiranagar with covered parking.',
      purpose: 'buy',
      type: 'Apartment',
      price: 8500000,
      city: 'Bengaluru',
      locality: 'Indiranagar',
      address: '100 Feet Road',
      bedrooms: 3,
      bathrooms: 2,
      area: 1650,
      furnishing: 'Semi-furnished',
      status: 'approved',
      verified: true
    });

    const leadRes = await callApi('leads', {
      method: 'POST',
      jar: jars.customerA,
      body: { property: String(prop._id), source: 'enquiry', note: 'Interested in flat' }
    });
    assert.equal(leadRes.status, 201);
    const leadId = leadRes.data._id;

    // Customer A tries to close deal via lead PATCH -> MUST be rejected (403)
    const hijackLead = await callApi(`leads/${leadId}`, {
      method: 'PATCH',
      jar: jars.customerA,
      body: { status: 'deal_closed' }
    });
    assert.equal(hijackLead.status, 403);

    const stillOpenProp = await models.Property.findById(prop._id).lean();
    assert.equal(stillOpenProp.status, 'approved');

    // Customer A cannot use recommend endpoint to spam or inject lead notes
    const recDenied = await callApi('leads/recommend', {
      method: 'POST',
      jar: jars.customerA,
      body: { leadId, customerEmail: 'customerb@test.local', message: 'Spam' }
    });
    assert.equal(recDenied.status, 403);

    // Customer A books a site visit and tries to confirm it -> MUST be rejected (403)
    const futureDate = new Date(Date.now() + 2 * 86400000).toISOString();
    const visitRes = await callApi('visits', {
      method: 'POST',
      jar: jars.customerA,
      body: { property: String(prop._id), scheduledAt: futureDate }
    });
    assert.equal(visitRes.status, 201);

    const hijackVisit = await callApi(`visits/${visitRes.data._id}`, {
      method: 'PATCH',
      jar: jars.customerA,
      body: { status: 'confirmed' }
    });
    assert.equal(hijackVisit.status, 403);

    // Customer A CAN cancel own lead & visit
    const cancelLead = await callApi(`leads/${leadId}`, {
      method: 'PATCH',
      jar: jars.customerA,
      body: { status: 'cancelled' }
    });
    assert.equal(cancelLead.status, 200);
    assert.equal(cancelLead.data.status, 'cancelled');
  });

  test('6. Support ticket IDOR, promotion ownership, provider workspace scope, and CP deactivation revoke sessions', async () => {
    // Support ticket IDOR
    const ticketRes = await callApi('support-tickets', {
      method: 'POST',
      jar: jars.customerA,
      body: { subject: 'Private Issue', message: 'Account question' }
    });
    assert.equal(ticketRes.status, 201);
    const ticketId = ticketRes.data._id;

    const replyB = await callApi(`support-tickets/${ticketId}/reply`, {
      method: 'POST',
      jar: jars.customerB,
      body: { message: 'Snooping' }
    });
    assert.equal(replyB.status, 403);

    const closeB = await callApi(`support-tickets/${ticketId}`, {
      method: 'PATCH',
      jar: jars.customerB,
      body: { status: 'closed' }
    });
    assert.equal(closeB.status, 403);

    // Promotion ownership & approved-only gate
    const ownerPendingProp = await models.Property.create({
      owner: users.ownerA._id,
      title: 'Pending Flat',
      description: 'Well-ventilated apartment in HSR Layout Sector 2.',
      purpose: 'buy',
      type: 'Apartment',
      price: 5000000,
      city: 'Bengaluru',
      locality: 'HSR Layout',
      address: 'Sector 2',
      bedrooms: 2,
      bathrooms: 2,
      area: 1100,
      furnishing: 'Unfurnished',
      status: 'pending'
    });

    const promoOther = await callApi('promotions', {
      method: 'POST',
      jar: jars.customerB,
      body: { targetType: 'property', targetId: String(ownerPendingProp._id) }
    });
    assert.equal(promoOther.status, 403);

    const promoPending = await callApi('promotions', {
      method: 'POST',
      jar: jars.ownerA,
      body: { targetType: 'property', targetId: String(ownerPendingProp._id) }
    });
    assert.equal(promoPending.status, 400);

    // Non-provider denied provider-services and technicians
    const provSvcDenied = await callApi('provider-services', { jar: jars.customerA });
    assert.equal(provSvcDenied.status, 403);
    const techDenied = await callApi('technicians', { jar: jars.customerA });
    assert.equal(techDenied.status, 403);

    // Admin deactivating channel partner revokes active session immediately
    const meBefore = await callApi('auth/me', { jar: jars.channelPartner });
    assert.equal(meBefore.data.user._id, users.channelPartner._id);

    const deactivate = await callApi(`admin/channel-partners/${users.channelPartner._id}`, {
      method: 'PATCH',
      jar: jars.admin,
      body: { active: false }
    });
    assert.equal(deactivate.status, 200);

    const meAfter = await callApi('auth/me', { jar: jars.channelPartner });
    assert.equal(meAfter.data.user, null);
  });

  test('7. Map components escape HTML entities and lib/db.js has no hardcoded credentials', () => {
    const mapView = fs.readFileSync(path.join(process.cwd(), 'components/PropertyMapView.js'), 'utf8');
    const locMap = fs.readFileSync(path.join(process.cwd(), 'components/PropertyLocationMap.js'), 'utf8');
    const dbFile = fs.readFileSync(path.join(process.cwd(), 'lib/db.js'), 'utf8');

    assert.ok(mapView.includes('escapeHtml('), 'PropertyMapView must escape interpolated HTML');
    assert.ok(locMap.includes('escapeHtml('), 'PropertyLocationMap must escape interpolated HTML');
    assert.equal(dbFile.includes('mongodb+srv://'), false, 'lib/db.js must not contain hardcoded Atlas credentials');
  });

  test('8. Business workspace registration stays pending until Admin approves', async () => {
    // Customer A registers for Service Provider workspace
    const applyRes = await callApi('workspaces/register', {
      method: 'POST',
      jar: jars.customerA,
      body: {
        workspaceType: 'provider',
        company: 'Sunny Fix Co',
        category: 'plumbing',
        phone: '9800000001',
        city: 'Bengaluru',
        bio: 'Licensed plumber'
      }
    });
    assert.equal(applyRes.status, 201);
    assert.equal(applyRes.data.pendingApproval, true);
    assert.equal(applyRes.data.membership.status, 'pending');
    const membershipId = applyRes.data.membership._id;

    // Customer A still does NOT have provider access while pending
    const wsBefore = await callApi('workspaces', { jar: jars.customerA });
    assert.equal(wsBefore.status, 200);
    assert.equal(wsBefore.data.authorizedTypes.includes('provider'), false);
    const pendingRec = wsBefore.data.memberships.find((m) => m.workspaceType === 'provider');
    assert.equal(pendingRec?.status, 'pending');

    const deniedSvc = await callApi('provider-services', { jar: jars.customerA });
    assert.equal(deniedSvc.status, 403);
    const deniedReqs = await callApi('service-requests?as=provider', { jar: jars.customerA });
    assert.equal(deniedReqs.status, 403);

    // Customer cannot self-approve via admin endpoint
    const selfApprove = await callApi(`admin/workspace-requests/${membershipId}`, {
      method: 'PATCH',
      jar: jars.customerA,
      body: { status: 'approved' }
    });
    assert.equal(selfApprove.status, 403);

    // Admin sees pending request and approves it
    const adminList = await callApi('admin/workspace-requests?status=pending', { jar: jars.admin });
    assert.equal(adminList.status, 200);
    assert.equal(adminList.data.items.some((m) => m._id === membershipId), true);

    const approveRes = await callApi(`admin/workspace-requests/${membershipId}`, {
      method: 'PATCH',
      jar: jars.admin,
      body: { status: 'approved' }
    });
    assert.equal(approveRes.status, 200);
    assert.equal(approveRes.data.membership.status, 'approved');

    // Now Customer A has provider workspace access
    const wsAfter = await callApi('workspaces', { jar: jars.customerA });
    assert.equal(wsAfter.status, 200);
    assert.equal(wsAfter.data.authorizedTypes.includes('provider'), true);

    const allowedSvc = await callApi('provider-services', { jar: jars.customerA });
    assert.equal(allowedSvc.status, 200);

    // Customer B applies for broker and gets rejected
    const applyB = await callApi('workspaces/register', {
      method: 'POST',
      jar: jars.customerB,
      body: { workspaceType: 'broker', company: 'B Brokers', reraId: 'RERA-B', city: 'Bengaluru' }
    });
    assert.equal(applyB.status, 201);
    const rejRes = await callApi(`admin/workspace-requests/${applyB.data.membership._id}`, {
      method: 'PATCH',
      jar: jars.admin,
      body: { status: 'rejected', rejectionReason: 'Invalid RERA certificate' }
    });
    assert.equal(rejRes.status, 200);
    assert.equal(rejRes.data.membership.status, 'rejected');

    const wsBAfter = await callApi('workspaces', { jar: jars.customerB });
    assert.equal(wsBAfter.data.authorizedTypes.includes('broker'), false);
    const rejRec = wsBAfter.data.memberships.find((m) => m.workspaceType === 'broker');
    assert.equal(rejRec?.status, 'rejected');
    assert.equal(rejRec?.rejectionReason, 'Invalid RERA certificate');
  });
});
