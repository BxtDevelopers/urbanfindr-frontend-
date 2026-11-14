import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { registerSchema } from '../lib/validation.js';

test('Channel Partner: Schema accepts channel_partner registration with credentials', () => {
  const result = registerSchema.safeParse({
    name: 'Apex Realty Network',
    email: 'partner@agency.demo',
    password: 'SecurePassword123!',
    phone: '+91 98765 43210',
    role: 'channel_partner',
    company: 'Apex Realty Network Pvt Ltd',
    reraId: 'KA/RERA/AGENT/2024/00842'
  });
  assert.equal(result.success, true);
  assert.equal(result.data.role, 'channel_partner');
  assert.equal(result.data.company, 'Apex Realty Network Pvt Ltd');
  assert.equal(result.data.reraId, 'KA/RERA/AGENT/2024/00842');
});

test('Channel Partner: providers.js defines dedicated emerald branding for channel_partner', () => {
  const providersContent = readFileSync(path.resolve('components/providers.js'), 'utf8');
  assert.ok(providersContent.includes("case 'channel_partner':"), 'providers must handle channel_partner role');
  assert.ok(providersContent.includes("key: 'channel_partner'"), 'role key must be channel_partner');
  assert.ok(providersContent.includes("label: 'Channel Partner'"), 'label must be Channel Partner');
  assert.ok(providersContent.includes('#ecfdf5'), 'emerald background color must be set');
  assert.ok(providersContent.includes('#065f46'), 'emerald text color must be set');
});

test('Channel Partner: Registration form contains Channel Partner choice and credentials', () => {
  const authContent = readFileSync(path.resolve('components/auth-page.js'), 'utf8');
  assert.ok(authContent.includes("id: 'channel_partner'"), 'ROLE_OPTIONS must include channel_partner');
  assert.ok(authContent.includes("Channel Partner Credentials"), 'Form must render channel partner credentials panel');
  assert.ok(authContent.includes('reraId'), 'Form must prompt for RERA ID');
  assert.ok(authContent.includes('company'), 'Form must prompt for company / agency name');
});

test('Channel Partner: Models and database schemas are properly defined and exported', () => {
  const modelsContent = readFileSync(path.resolve('lib/models.js'), 'utf8');
  assert.ok(modelsContent.includes('export const ChannelPartner'), 'models.js must export ChannelPartner model');
  assert.ok(modelsContent.includes('export const SupportTicket'), 'models.js must export SupportTicket model');
  assert.ok(modelsContent.includes('export const Lead'), 'models.js must export enhanced Lead model');
  assert.ok(modelsContent.includes("source: { type: String, enum: ['phone','message','enquiry']"), 'Lead model must support phone, message, enquiry touchpoints');
});

test('Channel Partner: Dedicated dashboard component exists and is routed in dashboard', () => {
  assert.ok(existsSync(path.resolve('components/channel-partner-dashboard.js')), 'channel-partner-dashboard.js must exist');
  const dashContent = readFileSync(path.resolve('components/dashboard.js'), 'utf8');
  assert.ok(dashContent.includes('ChannelPartnerDashboard'), 'components/dashboard.js must route to ChannelPartnerDashboard');
  assert.ok(dashContent.includes("user.role === 'channel_partner'"), 'Must check user.role === channel_partner');

  const cpDashContent = readFileSync(path.resolve('components/channel-partner-dashboard.js'), 'utf8');
  assert.ok(cpDashContent.includes('Leads &amp; Inquiries') || cpDashContent.includes('Leads Dashboard'), 'Must include Leads dashboard');
  assert.ok(cpDashContent.includes('Phone Calls'), 'Must support Phone Calls filter');
  assert.ok(cpDashContent.includes('Direct Messages'), 'Must support Direct Messages filter');
  assert.ok(cpDashContent.includes('Support &amp; Verification Desk') || cpDashContent.includes('Support Desk'), 'Must include Support Desk');
  assert.ok(cpDashContent.includes('Channel Sales Network') || cpDashContent.includes('Team Members'), 'Must include Team Members screen');
});

test('Channel Partner: Leads pipeline displays assigned team member with advisor badge and supports advisor filtering', () => {
  const cpDashContent = readFileSync(path.resolve('components/channel-partner-dashboard.js'), 'utf8');
  assert.ok(cpDashContent.includes('leadAdvisorFilter'), 'Dashboard must maintain leadAdvisorFilter state');
  assert.ok(cpDashContent.includes('UserCheck'), 'Dashboard must use UserCheck advisor icon');
  assert.ok(cpDashContent.includes('lead.assignedTeamMember'), 'Pipeline must render lead assigned team member');
  assert.ok(cpDashContent.includes('Assigned Sales Advisor') || cpDashContent.includes('Assigned Advisor'), 'Pipeline must show Assigned Advisor column');
});

test('Channel Partner: Lead Detail Modal displays assigned personal team member details and reassign selector', () => {
  const cpDashContent = readFileSync(path.resolve('components/channel-partner-dashboard.js'), 'utf8');
  assert.ok(cpDashContent.includes('Assigned Personal Team Advisor') || cpDashContent.includes('Assigned Personal Team Member'), 'Modal must render dedicated personal team member section');
  assert.ok(cpDashContent.includes('assignedAdvisor.phone') || cpDashContent.includes('assignedAdvisor.role'), 'Modal must render advisor phone and role');
  assert.ok(cpDashContent.includes('assignedAdvisor.email'), 'Modal must render advisor email');
  assert.ok(cpDashContent.includes('handleUpdateLead(selectedLead._id, { assignedTeamMember:'), 'Modal must provide selector to assign/reassign advisor');
  assert.ok(cpDashContent.includes('handleUpdateLead(selectedLead._id, { status:'), 'Modal must provide selector to update lead status');
});

test('Channel Partner: Team Members tab displays assigned leads with status badges', () => {
  const cpDashContent = readFileSync(path.resolve('components/channel-partner-dashboard.js'), 'utf8');
  assert.ok(cpDashContent.includes('Assigned Leads Portfolio') || cpDashContent.includes('Assigned Leads:'), 'Team members screen must display assigned leads section');
  assert.ok(cpDashContent.includes('contacted') && cpDashContent.includes('interested'), 'Team members screen must render contacted and interested status badges');
  assert.ok(cpDashContent.includes('memberLeads') || cpDashContent.includes('assignedLeads'), 'Must filter leads by advisor name');
});

test('Channel Partner: lib/api.js keeps team member assignedLeadsCount in sync on lead update', () => {
  const apiContent = readFileSync(path.resolve('lib/api.js'), 'utf8');
  assert.ok(apiContent.includes('assignedTeamMember'), 'api.js must handle assignedTeamMember');
  assert.ok(apiContent.includes('assignedLeadsCount'), 'api.js must sync assignedLeadsCount');
  assert.ok(apiContent.includes('Lead.countDocuments'), 'api.js must count leads assigned to each advisor');
});

test('Channel Partner: Recharts library integrated in Overview tab and profile moved to icon modal with password change', () => {
  const cpDashContent = readFileSync(path.resolve('components/channel-partner-dashboard.js'), 'utf8');
  assert.ok(cpDashContent.includes("from 'recharts'"), 'Must import from recharts');
  assert.ok(cpDashContent.includes('ResponsiveContainer'), 'Must use ResponsiveContainer');
  assert.ok(cpDashContent.includes("label: 'Overview'"), 'Sidebar tab must be named Overview');
  assert.ok(!cpDashContent.includes("{ id: 'profile', label: 'Agency Profile'"), 'Agency profile must be removed from sidebar navItems');
  assert.ok(cpDashContent.includes('isProfileOpen'), 'Must control profile modal state via isProfileOpen');
  assert.ok(cpDashContent.includes('handleChangePassword'), 'Must provide password update handler');
  assert.ok(cpDashContent.includes('TODO: In future, integrate SMS / Email OTP verification flow'), 'Must include requested OTP TODO in dashboard');

  const apiContent = readFileSync(path.resolve('lib/api.js'), 'utf8');
  assert.ok(apiContent.includes("key==='password'"), 'api.js must handle password change endpoint');
  assert.ok(apiContent.includes('TODO: In future, integrate SMS / Email OTP verification flow'), 'api.js must include requested OTP TODO');
});

test('Channel Partner: Dedicated Pipeline Filters located in sidebar with sleek active filter summary top bar', () => {
  const cpDashContent = readFileSync(path.resolve('components/channel-partner-dashboard.js'), 'utf8');
  assert.ok(cpDashContent.includes('Pipeline Filters'), 'Must render dedicated Pipeline Filters in sidebar');
  assert.ok(cpDashContent.includes('Reset All'), 'Pipeline Filters must include Reset All functionality');
  assert.ok(cpDashContent.includes('Time Period'), 'Sidebar filters must include Time Period section');
  assert.ok(cpDashContent.includes('Channel / Touchpoint') || cpDashContent.includes('Channel:'), 'Sidebar filters must include Channel / Touchpoint section');
  assert.ok(cpDashContent.includes('Pipeline Status'), 'Sidebar filters must include Pipeline Status section');
  assert.ok(cpDashContent.includes('Assigned Sales Advisor'), 'Sidebar filters must include Assigned Sales Advisor section');
  assert.ok(cpDashContent.includes('leadSearchQuery'), 'Top bar must include search query');
  assert.ok(cpDashContent.includes('isMobileFilterOpen'), 'Must support mobile filter drawer for small screens');
});

test('Channel Partner: Overview replaces huge time tab with compact dropdown and renders self-explanatory Inbound vs Outbound chart', () => {
  const cpDashContent = readFileSync(path.resolve('components/channel-partner-dashboard.js'), 'utf8');
  assert.ok(cpDashContent.includes('time-range-dropdown-container'), 'Must render compact time range dropdown container');
  assert.ok(cpDashContent.includes('isTimeDropdownOpen'), 'Must control time dropdown open/closed state');
  assert.ok(cpDashContent.includes('Inbound Leads vs. Outbound Outreach'), 'Must render explanatory Inbound vs Outbound chart title');
  assert.ok(cpDashContent.includes('Outreach Contact Rate'), 'Must display explanatory Outreach Contact Rate KPI');
  assert.ok(cpDashContent.includes('Avg Speed to Contact'), 'Must display Avg Speed to Contact KPI');
  assert.ok(cpDashContent.includes('ComposedChart'), 'Must utilize ComposedChart for multi-series inbound/outbound visualization');
  assert.ok(cpDashContent.includes('chartViewType'), 'Must support view switching between Grouped Bars and Trend lines');
});

test('Channel Partner Admin: lib/api.js provides channel partner stats, channel-partners endpoints, and tier/verification updates', () => {
  const apiContent = readFileSync(path.resolve('lib/api.js'), 'utf8');
  assert.ok(apiContent.includes('channelPartnerLeads'), 'lib/api.js stats must compute channelPartnerLeads');
  assert.ok(apiContent.includes('channelPartnerProperties'), 'lib/api.js stats must compute channelPartnerProperties');
  assert.ok(apiContent.includes('openTickets'), 'lib/api.js stats must compute openTickets');
  assert.ok(apiContent.includes("key==='channel-partners'"), 'lib/api.js must provide dedicated admin channel-partners route');
  assert.ok(apiContent.includes("['Silver','Gold','Platinum'].includes(data.tier)"), 'lib/api.js must validate and update partner tier');
  assert.ok(apiContent.includes("typeof data.verified==='boolean'"), 'lib/api.js must support updating verified status');
});

test('Channel Partner Admin: components/admin.js renders Tier & RERA controls, Sales Team Roster, and inventory in inspector modal', () => {
  const adminContent = readFileSync(path.resolve('components/admin.js'), 'utf8');
  assert.ok(adminContent.includes('Channel Partner Governance') || adminContent.includes('Institutional Tier:'), 'Modal must render Channel Partner governance controls');
  assert.ok(adminContent.includes("['Silver', 'Gold', 'Platinum']"), 'Modal must provide Silver, Gold, Platinum tier selector');
  assert.ok(adminContent.includes('handleToggleVerification'), 'Modal must provide RERA verification toggle');
  assert.ok(adminContent.includes('Sales Team Roster'), 'Modal must render Sales Team Roster section');
  assert.ok(adminContent.includes('assignedLeadsCount'), 'Sales Team Roster must display assignedLeadsCount');
  assert.ok(adminContent.includes('Listed Properties'), 'Modal must display listed active property inventory');
});

test('Channel Partner Admin: components/admin.js Overview renders CP KPI cards and Enquiries tab renders Touchpoint badges & CP attribution', () => {
  const adminContent = readFileSync(path.resolve('components/admin.js'), 'utf8');
  assert.ok(adminContent.includes('Registered Channel Partners'), 'Overview must render Registered Channel Partners KPI');
  assert.ok(adminContent.includes('Active CP Inventory'), 'Overview must render Active CP Inventory KPI');
  assert.ok(adminContent.includes('Inbound CP Leads'), 'Overview must render Inbound CP Leads KPI');
  assert.ok(adminContent.includes('Phone Callback'), 'Enquiries tab must render Phone Callback touchpoint badge');
  assert.ok(adminContent.includes('Direct Chat'), 'Enquiries tab must render Direct Chat touchpoint badge');
  assert.ok(adminContent.includes('Property Form'), 'Enquiries tab must render Property Form touchpoint badge');
  assert.ok(adminContent.includes('Channel Partner Leads'), 'Enquiries tab must provide filter for Channel Partner leads');
  assert.ok(adminContent.includes('l.assignedTeamMember'), 'Enquiries tab must render advisor attribution');
});
