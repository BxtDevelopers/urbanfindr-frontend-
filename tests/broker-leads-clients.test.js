import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

test('Broker Leads -> Clients: Lead model supports isClient and addedToClientAt fields', () => {
  const modelsContent = readFileSync(path.resolve('lib/models.js'), 'utf8');
  assert.ok(modelsContent.includes('isClient: { type: Boolean, default: false }'), 'Lead schema must define isClient boolean field');
  assert.ok(modelsContent.includes('addedToClientAt: Date'), 'Lead schema must define addedToClientAt Date field');
});

test('Broker Leads -> Clients: API supports isClient update, populates lead user, and syncs message threads to leads', () => {
  const apiContent = readFileSync(path.resolve('lib/api.js'), 'utf8');
  assert.ok(apiContent.includes("{path:'user',select:'name email phone city'}"), 'GET /api/leads must populate customer user details');
  assert.ok(apiContent.includes('const {status,note,assignedTeamMember,isClient}=await body(req);'), 'PATCH /api/leads/:key must accept isClient');
  assert.ok(apiContent.includes("if(typeof isClient==='boolean')"), 'PATCH /api/leads/:key must persist isClient flag');
  assert.ok(apiContent.includes('item.addedToClientAt=new Date()'), 'PATCH /api/leads/:key must timestamp addedToClientAt');
  assert.ok(apiContent.includes("source:'message'") && apiContent.includes('existingLead=await Lead.findOne(leadMatch)'), 'POST /api/threads must create a Lead with source message for customer inquiries');
  assert.ok(apiContent.includes('brokerAddedClients'), 'GET /api/dashboard must compute brokerAddedClients count');
});

test('Broker Leads -> Clients: BrokerWorkspace provides Add to Client action in My Leads and displays added clients in Clients', () => {
  const brokerContent = readFileSync(path.resolve('components/dashboard/workspaces/BrokerWorkspace.jsx'), 'utf8');
  assert.ok(brokerContent.includes('async function addToClient(lead)'), 'BrokerLeadsSection must define addToClient handler');
  assert.ok(brokerContent.includes("body: { isClient: true }"), 'addToClient must send isClient: true to leads PATCH API');
  assert.ok(brokerContent.includes('Add to Client'), 'BrokerLeadsSection must render Add to Client button');
  assert.ok(brokerContent.includes('Added to Clients'), 'BrokerLeadsSection must indicate when a lead is Added to Clients');
  assert.ok(brokerContent.includes("useState('clients')"), 'BrokerClientsSection must default activeTab to clients (My Clients)');
  assert.ok(brokerContent.includes('My Clients ('), 'BrokerClientsSection must render My Clients tab');
  assert.ok(brokerContent.includes('isAddedClient'), 'BrokerClientsSection must display leads marked via isClient');
  assert.ok(!brokerContent.includes('PropertyRecommendationModal'), 'BrokerWorkspace must not render PropertyRecommendationModal');
  assert.ok(!brokerContent.includes('Recommend Property'), 'BrokerWorkspace must not render Recommend Property option');
  assert.ok(!brokerContent.includes('Won / Closed'), 'BrokerWorkspace must not render Won / Closed label');
  assert.ok(brokerContent.includes('isPropertyClosed'), 'BrokerWorkspace must check if property/project status is closed');

  const builderContent = readFileSync(path.resolve('components/dashboard/workspaces/BuilderWorkspace.jsx'), 'utf8');
  assert.ok(!builderContent.includes('PropertyRecommendationModal'), 'BuilderWorkspace must not render PropertyRecommendationModal');
  assert.ok(!builderContent.includes('Recommend Property'), 'BuilderWorkspace must not render Recommend Property option');
});
