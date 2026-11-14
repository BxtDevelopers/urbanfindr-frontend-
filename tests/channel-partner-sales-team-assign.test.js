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
process.env.JWT_SECRET = 'cp-sales-team-assign-test-secret-at-least-32-chars';

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

describe('Channel Partner Sales Team (5 Advisors) Property & Lead Assignment', () => {
  const cpJar = new Map();
  let team = [];
  let propertyId = '';

  before(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    const apiMod = await import('../lib/api.js');
    handle = apiMod.handle;
    models = await import('../lib/models.js');

    const reg = await callApi('auth/register', {
      method: 'POST',
      jar: cpJar,
      body: {
        name: 'Channel Partner Owner',
        email: 'cp-sales@test.local',
        phone: '+91 98765 33333',
        password: 'PartnerPassword123',
        role: 'channel_partner',
        company: 'Apex Sales Firm',
        reraId: 'RERA-SALES-01'
      }
    });
    assert.equal(reg.status, 201);

    const cpRes = await callApi('channel-partner', { jar: cpJar });
    assert.equal(cpRes.status, 200);
    team = cpRes.data.partner.team;
    assert.equal(team.length, 5, 'Sales Team must have 5 advisors by default');

    const propRes = await callApi('properties', {
      method: 'POST',
      jar: cpJar,
      body: {
        title: 'Signature 3BHK Residence in Whitefield',
        description: 'Bright corner 3BHK apartment with landscaped balcony and covered parking.',
        purpose: 'buy',
        type: 'Apartment',
        city: 'Bengaluru',
        locality: 'Whitefield',
        address: 'ITPL Main Road, Whitefield, Bengaluru',
        price: 18500000,
        bedrooms: 3,
        bathrooms: 3,
        area: 1920,
        furnishing: 'Semi-furnished',
        availableFrom: '2026-12-01',
        amenities: ['Lift', 'Power backup'],
        images: ['/photos/living-1.jpg'],
        ownership: 'channel_partner',
        transaction: 'sale'
      }
    });
    assert.equal(propRes.status, 201);
    propertyId = propRes.data._id;

    // Create a lead on this property
    await models.Lead.create({
      manager: reg.data.user._id,
      property: propertyId,
      kind: 'property',
      source: 'enquiry',
      name: 'Interested Buyer One',
      phone: '+91 99000 11111',
      email: 'buyer1@test.local',
      city: 'Bengaluru',
      status: 'uncontacted'
    });
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  test('Sidebar shows Team Members and UI supports assigning properties to advisors', () => {
    const ui = readFileSync(path.resolve('components/channel-partner-dashboard.js'), 'utf8');
    assert.ok(ui.includes("label: 'Team Members'"), 'Sidebar must show Team Members label');
    assert.ok(ui.includes('handleAssignListingMember'), 'Must support assigning listed property to advisor');
    assert.ok(ui.includes('teamViewMemberId'), 'Must support advisor-scoped property & lead visibility view');
  });

  test('Same property cannot be assigned to another advisor while already assigned; only CP and assigned advisor see it', async () => {
    const advisor2 = team[1]; // 2nd of the 5 advisors
    const advisor4 = team[3]; // 4th of the 5 advisors

    // Assign property to Advisor 2
    const assign1 = await callApi(`properties/${propertyId}`, {
      method: 'PATCH',
      jar: cpJar,
      body: { assignTeamMemberId: advisor2._id }
    });
    assert.equal(assign1.status, 200);
    assert.equal(String(assign1.data.assignedTeamMemberId), String(advisor2._id));

    // Attempting to assign the SAME property to Advisor 4 while assigned to Advisor 2 must be rejected (409)
    const conflict = await callApi(`properties/${propertyId}`, {
      method: 'PATCH',
      jar: cpJar,
      body: { assignTeamMemberId: advisor4._id }
    });
    assert.equal(conflict.status, 409);

    // Channel Partner sees the property
    const cpProps = await callApi('properties?mine=true', { jar: cpJar });
    assert.equal(cpProps.status, 200);
    assert.equal(cpProps.data.items.length, 1);

    // Advisor 2 sees the property and its lead
    const assignedWs = await callApi(`channel-partner/team/${advisor2._id}/workspace`, { jar: cpJar });
    assert.equal(assignedWs.status, 200);
    assert.equal(assignedWs.data.properties.length, 1);
    assert.equal(String(assignedWs.data.properties[0]._id), String(propertyId));
    assert.equal(assignedWs.data.leads.length, 1);
    assert.equal(assignedWs.data.leads[0].name, 'Interested Buyer One');

    // Other 4 advisors (1, 3, 4, 5) see 0 properties and 0 leads
    for (const idx of [0, 2, 3, 4]) {
      const otherWs = await callApi(`channel-partner/team/${team[idx]._id}/workspace`, { jar: cpJar });
      assert.equal(otherWs.status, 200);
      assert.equal(otherWs.data.properties.length, 0, `${team[idx].name} must not see property`);
      assert.equal(otherWs.data.leads.length, 0, `${team[idx].name} must not see leads`);
    }

    // Unassign Advisor 2 -> now it CAN be assigned to Advisor 4
    const unassign2 = await callApi(`properties/${propertyId}`, {
      method: 'PATCH',
      jar: cpJar,
      body: { unassignTeamMemberId: advisor2._id }
    });
    assert.equal(unassign2.status, 200);
    assert.equal(unassign2.data.assignedTeamMemberId, null);

    const assign4 = await callApi(`properties/${propertyId}`, {
      method: 'PATCH',
      jar: cpJar,
      body: { assignTeamMemberId: advisor4._id }
    });
    assert.equal(assign4.status, 200);
    assert.equal(String(assign4.data.assignedTeamMemberId), String(advisor4._id));
  });
});
