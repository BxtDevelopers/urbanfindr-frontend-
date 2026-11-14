import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Direct Messages & Notifications System: Component existence and integration', async (t) => {
  // 1. MessageCenter component
  const messageCenterPath = path.resolve('components/dashboard/shared/MessageCenter.jsx');
  assert.ok(fs.existsSync(messageCenterPath), 'MessageCenter.jsx must exist');

  const mcContent = fs.readFileSync(messageCenterPath, 'utf8');
  assert.ok(mcContent.includes('MessageCenter'), 'MessageCenter component must be exported');
  assert.ok(mcContent.includes('threads?limit=50'), 'MessageCenter must fetch user threads');
  assert.ok(mcContent.includes('threads/${selectedThreadId}/messages'), 'MessageCenter must fetch thread messages');
  assert.ok(mcContent.includes("method: 'POST'"), 'MessageCenter must support posting reply messages');
  assert.ok(mcContent.includes("method: 'DELETE'"), 'MessageCenter must support deleting conversation threads');

  // 2. NotificationsCenter component
  const notifCenterPath = path.resolve('components/dashboard/shared/NotificationsCenter.jsx');
  assert.ok(fs.existsSync(notifCenterPath), 'NotificationsCenter.jsx must exist');
  const notifContent = fs.readFileSync(notifCenterPath, 'utf8');
  assert.ok(notifContent.includes('NotificationsCenter'), 'NotificationsCenter component must be exported');
  assert.ok(notifContent.includes('Chat &amp; Reply') || notifContent.includes('Chat & Reply'), 'NotificationsCenter must provide Chat & Reply action');

  // 3. Verify Sidebar Navigation for all workspaces
  const sidebarPath = path.resolve('components/dashboard/shared/DashboardSidebar.jsx');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
  assert.ok(sidebarContent.includes("{ id: 'notifications', label: 'Notifications', icon: Bell }"), 'Sidebar must include Notifications navigation');

  // 4. Verify integration in Customer Workspace
  const custPath = path.resolve('components/dashboard/workspaces/CustomerWorkspace.jsx');
  const custContent = fs.readFileSync(custPath, 'utf8');
  assert.ok(custContent.includes('MessageCenter'), 'CustomerWorkspace must import MessageCenter');
  assert.ok(custContent.includes('NotificationsCenter'), 'CustomerWorkspace must import NotificationsCenter');
  assert.ok(custContent.includes('<NotificationsCenter'), 'CustomerWorkspace must render NotificationsCenter');

  // 5. Verify integration in Owner Workspace
  const ownerPath = path.resolve('components/dashboard/workspaces/OwnerWorkspace.jsx');
  const ownerContent = fs.readFileSync(ownerPath, 'utf8');
  assert.ok(ownerContent.includes('MessageCenter'), 'OwnerWorkspace must import MessageCenter');
  assert.ok(ownerContent.includes('NotificationsCenter'), 'OwnerWorkspace must import NotificationsCenter');
  assert.ok(ownerContent.includes('<NotificationsCenter'), 'OwnerWorkspace must render NotificationsCenter');

  // 6. Verify integration in Builder Workspace
  const builderPath = path.resolve('components/dashboard/workspaces/BuilderWorkspace.jsx');
  const builderContent = fs.readFileSync(builderPath, 'utf8');
  assert.ok(builderContent.includes('MessageCenter'), 'BuilderWorkspace must import MessageCenter');
  assert.ok(builderContent.includes('NotificationsCenter'), 'BuilderWorkspace must import NotificationsCenter');
  assert.ok(builderContent.includes('<NotificationsCenter'), 'BuilderWorkspace must render NotificationsCenter');

  // 7. Verify integration in Broker Workspace
  const brokerPath = path.resolve('components/dashboard/workspaces/BrokerWorkspace.jsx');
  const brokerContent = fs.readFileSync(brokerPath, 'utf8');
  assert.ok(brokerContent.includes('MessageCenter'), 'BrokerWorkspace must import MessageCenter');
  assert.ok(brokerContent.includes('NotificationsCenter'), 'BrokerWorkspace must import NotificationsCenter');
  assert.ok(brokerContent.includes('<NotificationsCenter'), 'BrokerWorkspace must render NotificationsCenter');

  // 8. Verify integration in Provider Workspace
  const providerPath = path.resolve('components/dashboard/workspaces/ProviderWorkspace.jsx');
  const providerContent = fs.readFileSync(providerPath, 'utf8');
  assert.ok(providerContent.includes('MessageCenter'), 'ProviderWorkspace must import MessageCenter');
  assert.ok(providerContent.includes('NotificationsCenter'), 'ProviderWorkspace must import NotificationsCenter');
  assert.ok(providerContent.includes('<NotificationsCenter'), 'ProviderWorkspace must render NotificationsCenter');

  // 9. Verify integration in Channel Partner Dashboard
  const cpPath = path.resolve('components/channel-partner-dashboard.js');
  const cpContent = fs.readFileSync(cpPath, 'utf8');
  assert.ok(cpContent.includes("id: 'messages'"), 'Channel Partner Dashboard navItems must include messages');
  assert.ok(cpContent.includes('MessageCenter'), 'Channel Partner Dashboard must import MessageCenter');
  assert.ok(cpContent.includes("tab === 'messages'"), 'Channel Partner Dashboard must render messages tab');
  assert.ok(cpContent.includes('Chat &amp; Reply') || cpContent.includes('Chat & Reply'), 'Channel Partner Dashboard notifications must have Chat & Reply button');

  // 10. Verify API endpoint support
  const apiPath = path.resolve('lib/api.js');
  const apiContent = fs.readFileSync(apiPath, 'utf8');
  assert.ok(apiContent.includes("root==='threads'"), 'API must handle threads root');
  assert.ok(apiContent.includes('Thread.deleteOne'), 'API must support deleting thread');
  assert.ok(apiContent.includes('Notification.deleteMany'), 'API must support deleting notifications');
});
