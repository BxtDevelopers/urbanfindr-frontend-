import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

test('Business Dashboard System: Workspace Context and Switcher exist', () => {
  assert.ok(
    existsSync(path.resolve('components/dashboard/WorkspaceContext.jsx')),
    'WorkspaceContext.jsx must exist'
  );
  assert.ok(
    existsSync(path.resolve('components/dashboard/shared/WorkspaceSwitcher.jsx')),
    'WorkspaceSwitcher.jsx must exist'
  );
  assert.ok(
    existsSync(path.resolve('components/dashboard/shared/DashboardLayout.jsx')),
    'DashboardLayout.jsx must exist'
  );

  const ctxContent = readFileSync(path.resolve('components/dashboard/WorkspaceContext.jsx'), 'utf8');
  assert.ok(ctxContent.includes('WORKSPACE_CONFIG'), 'WorkspaceContext must define WORKSPACE_CONFIG');
  assert.ok(ctxContent.includes('customer'), 'Workspace config must include customer');
  assert.ok(ctxContent.includes('owner'), 'Workspace config must include owner');
  assert.ok(ctxContent.includes('broker'), 'Workspace config must include broker');
  assert.ok(ctxContent.includes('builder'), 'Workspace config must include builder');
  assert.ok(ctxContent.includes('provider'), 'Workspace config must include provider');
  assert.ok(ctxContent.includes('switchWorkspace'), 'Workspace context must provide switchWorkspace method');
  assert.ok(ctxContent.includes('#163e35'), 'Workspace context must use dark green brand color (#163e35)');
  assert.ok(ctxContent.includes('#ecf2e4'), 'Workspace context must use light green pill background (#ecf2e4)');
});

test('Business Dashboard System: All 5 Workspaces are implemented and modular', () => {
  assert.ok(
    existsSync(path.resolve('components/dashboard/workspaces/CustomerWorkspace.jsx')),
    'CustomerWorkspace.jsx must exist'
  );
  assert.ok(
    existsSync(path.resolve('components/dashboard/workspaces/OwnerWorkspace.jsx')),
    'OwnerWorkspace.jsx must exist'
  );
  assert.ok(
    existsSync(path.resolve('components/dashboard/workspaces/BrokerWorkspace.jsx')),
    'BrokerWorkspace.jsx must exist'
  );
  assert.ok(
    existsSync(path.resolve('components/dashboard/workspaces/BuilderWorkspace.jsx')),
    'BuilderWorkspace.jsx must exist'
  );
  assert.ok(
    existsSync(path.resolve('components/dashboard/workspaces/ProviderWorkspace.jsx')),
    'ProviderWorkspace.jsx must exist'
  );
});

test('Business Dashboard System: Customer vs Provider strict segregation logic is enforced', () => {
  const providerContent = readFileSync(
    path.resolve('components/dashboard/workspaces/ProviderWorkspace.jsx'),
    'utf8'
  );
  // Ensure customer's own bookings are excluded from their business incoming leads
  assert.ok(
    providerContent.includes('uId') && providerContent.includes('i.user'),
    'ProviderWorkspace must verify item.user against provider uId to exclude own bookings'
  );

  const apiContent = readFileSync(path.resolve('lib/api.js'), 'utf8');
  assert.ok(
    apiContent.includes("root==='workspaces'"),
    'lib/api.js must provide root workspaces endpoint'
  );
  assert.ok(
    apiContent.includes("root==='provider-services'"),
    'lib/api.js must provide root provider-services endpoint'
  );
  assert.ok(
    apiContent.includes("root==='technicians'"),
    'lib/api.js must provide root technicians endpoint'
  );
  assert.ok(
    apiContent.includes("root==='promotions'"),
    'lib/api.js must provide root promotions endpoint'
  );
  assert.ok(
    apiContent.includes('WorkspaceMembership'),
    'lib/api.js must manage WorkspaceMembership records'
  );
});

test('Business Dashboard System: Database models are exported and indexed', () => {
  const modelsContent = readFileSync(path.resolve('lib/models.js'), 'utf8');
  assert.ok(modelsContent.includes('export const WorkspaceMembership'), 'WorkspaceMembership model must be exported');
  assert.ok(modelsContent.includes('export const ProviderService'), 'ProviderService model must be exported');
  assert.ok(modelsContent.includes('export const Technician'), 'Technician model must be exported');
  assert.ok(modelsContent.includes('export const Promotion'), 'Promotion model must be exported');
});

test('Business Dashboard System: Shared Reusable UI Components exist', () => {
  assert.ok(existsSync(path.resolve('components/dashboard/shared/StatusBadge.jsx')), 'StatusBadge exists');
  assert.ok(existsSync(path.resolve('components/dashboard/shared/StatCard.jsx')), 'StatCard exists');
  assert.ok(existsSync(path.resolve('components/dashboard/shared/AnalyticsChart.jsx')), 'AnalyticsChart exists');
  assert.ok(existsSync(path.resolve('components/dashboard/shared/DataTable.jsx')), 'DataTable exists');
  assert.ok(existsSync(path.resolve('components/dashboard/shared/RegistrationModal.jsx')), 'RegistrationModal exists');
  assert.ok(existsSync(path.resolve('components/dashboard/shared/PromotionModal.jsx')), 'PromotionModal exists');
  assert.ok(existsSync(path.resolve('components/dashboard/shared/NotificationPanel.jsx')), 'NotificationPanel exists');
});

test('Business Dashboard System: Quotations, Completed Revenue, and Calendar/Booking schedules are removed', () => {
  const sidebar = readFileSync(path.resolve('components/dashboard/shared/DashboardSidebar.jsx'), 'utf8');
  assert.ok(!sidebar.includes("id: 'quotations'"), 'Sidebar must not contain quotations in navItems');
  assert.ok(!sidebar.includes("id: 'earnings'"), 'Sidebar must not contain earnings / revenue in navItems');
  assert.ok(!sidebar.includes("id: 'schedule'"), 'Sidebar must not contain calendar schedule in provider navItems');

  const header = readFileSync(path.resolve('components/dashboard/shared/DashboardHeader.jsx'), 'utf8');
  assert.ok(!header.includes("quotations:"), 'Header must not contain quotations title');
  assert.ok(!header.includes("earnings:"), 'Header must not contain earnings / revenue title');

  const customerWs = readFileSync(path.resolve('components/dashboard/workspaces/CustomerWorkspace.jsx'), 'utf8');
  assert.ok(!customerWs.includes("CustomerQuotationsSection"), 'CustomerWorkspace must not render CustomerQuotationsSection');
  assert.ok(!customerWs.includes("pendingQuotations"), 'CustomerWorkspace must not track pending quotations');

  const providerWs = readFileSync(path.resolve('components/dashboard/workspaces/ProviderWorkspace.jsx'), 'utf8');
  assert.ok(!providerWs.includes("ProviderQuotationsSection"), 'ProviderWorkspace must not render ProviderQuotationsSection');
  assert.ok(!providerWs.includes("SubmitQuotationModal"), 'ProviderWorkspace must not render SubmitQuotationModal');
  assert.ok(!providerWs.includes("ProviderEarningsSection"), 'ProviderWorkspace must not render ProviderEarningsSection');
  assert.ok(!providerWs.includes("Completed Revenue"), 'ProviderWorkspace must not have Completed Revenue stat card');
});

test('Business Dashboard System: Category matching and Call/Chat Direct Offer workflow are implemented', () => {
  const apiContent = readFileSync(path.resolve('lib/api.js'), 'utf8');
  // Provider category isolation
  assert.ok(apiContent.includes('providerCat'), 'lib/api.js must filter requests by providerCat');
  assert.ok(apiContent.includes("action === 'offer'") || apiContent.includes("action === 'contact'"), 'lib/api.js must handle provider direct offer');
  assert.ok(apiContent.includes("action === 'accept'"), 'lib/api.js must handle customer offer acceptance');
  assert.ok(apiContent.includes("action === 'decline'") || apiContent.includes("action === 'reject'"), 'lib/api.js must handle customer offer decline');

  const customerWs = readFileSync(path.resolve('components/dashboard/workspaces/CustomerWorkspace.jsx'), 'utf8');
  assert.ok(customerWs.includes('CustomerRequestsSection'), 'CustomerWorkspace must render CustomerRequestsSection');
  assert.ok(customerWs.includes('handleAccept') && customerWs.includes('handleDecline'), 'CustomerWorkspace must allow accepting and declining specialist offers');
  assert.ok(customerWs.includes('wa.me'), 'CustomerWorkspace must provide direct chat link');

  const providerWs = readFileSync(path.resolve('components/dashboard/workspaces/ProviderWorkspace.jsx'), 'utf8');
  assert.ok(providerWs.includes('ProviderReviewModal'), 'ProviderWorkspace must render ProviderReviewModal');
  assert.ok(providerWs.includes('tel:') && providerWs.includes('wa.me'), 'ProviderWorkspace must provide direct Call and WhatsApp Chat actions');
});

test('Business Dashboard System: Website brand color theme & logo styling are applied', () => {
  const sidebar = readFileSync(path.resolve('components/dashboard/shared/DashboardSidebar.jsx'), 'utf8');
  assert.ok(
    sidebar.includes('bg-[#163e35]') && sidebar.includes('text-[#d8edb3]'),
    'Sidebar logo badge must style in dark green (#163e35) and accent (#d8edb3)'
  );
  assert.ok(
    !sidebar.includes('urban<span'),
    'Sidebar must not render urbanfindr name per user specifications'
  );

  const header = readFileSync(path.resolve('components/dashboard/shared/DashboardHeader.jsx'), 'utf8');
  assert.ok(
    header.includes('text-[#163e35]'),
    'Header title must render in dark green (#163e35)'
  );
  assert.ok(
    !header.includes('urban<span'),
    'Header breadcrumbs must not render urbanfindr name per user specifications'
  );
});

test('Build Your Home: Page, Hero section, Stats section (300+ Homes, no cities), and footer link exist', () => {
  assert.ok(existsSync(path.resolve('components/BuildYourHome.jsx')), 'components/BuildYourHome.jsx must exist');
  assert.ok(existsSync(path.resolve('app/build-your-home/page.js')), 'app/build-your-home/page.js must exist');

  const layoutContent = readFileSync(path.resolve('components/layout.js'), 'utf8');
  assert.ok(layoutContent.includes('/build-your-home'), 'Footer in components/layout.js must link to /build-your-home');

  const buildContent = readFileSync(path.resolve('components/BuildYourHome.jsx'), 'utf8');
  // Hero section checks
  assert.ok(buildContent.includes('Construct Your Property With Us'), 'Hero must contain "Construct Your Property With Us"');
  assert.ok(buildContent.includes('Residential & Commercial Construction') || buildContent.includes('Residential &amp; Commercial Construction'), 'Hero must contain Residential & Commercial Construction');
  assert.ok(buildContent.includes('LIVE') && buildContent.includes('App Tracking'), 'Hero must feature LIVE App Tracking');
  assert.ok(buildContent.includes('QASCON') && buildContent.includes('Quality Checks'), 'Hero must feature QASCON Quality Checks');
  assert.ok(buildContent.includes('ESCROW') && buildContent.includes('Protected Payments'), 'Hero must feature ESCROW Protected Payments');
  assert.ok(buildContent.includes('10 LAKHS'), 'Hero must feature SAVE UP TO ₹10 LAKHS special offer');
  assert.ok(buildContent.includes('Connect with Trusted Home Builders'), 'Hero lead card must contain "Connect with Trusted Home Builders"');
  assert.ok(buildContent.includes('Location of your plot'), 'Form must contain Location of your plot');

  // Stats section checks: 300+ Homes, no cities
  assert.ok(buildContent.includes('300+'), 'Stats section must feature 300+ Homes');
  assert.ok(buildContent.includes('8') && buildContent.includes('Months'), 'Stats section must feature 8 Months');
  assert.ok(buildContent.includes('14,247') && buildContent.includes('Design Plans'), 'Stats section must feature 14,247 Design Plans');
  assert.ok(!buildContent.includes('10+ Cities'), 'Stats section must not contain 10+ Cities');
  assert.ok(!buildContent.includes('10,142+'), 'Stats section must not contain 10,142+ Homes');

  // Color theme checks
  assert.ok(buildContent.includes('#163e35'), 'BuildYourHome must use brand dark green (#163e35)');
  assert.ok(buildContent.includes('#749546') || buildContent.includes('#d8edb3'), 'BuildYourHome must use brand green/lime accent');
});
