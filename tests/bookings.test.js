import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { getCategoryCustomFields, categoryCustomFieldConfigs, getCategoryBySlug, serviceCategories } from '../lib/serviceCategories.js';

test('Shared Booking System: Category configuration supports category-specific fields and workflows', () => {
  // AC Technicians has custom fields for AC type, tonnage, units
  const acFields = getCategoryCustomFields('ac-technicians');
  assert.ok(Array.isArray(acFields) && acFields.length >= 3, 'AC Technicians must define custom fields');
  assert.ok(acFields.some(f => f.id === 'acType'), 'AC Technicians must have acType field');
  assert.ok(acFields.some(f => f.id === 'tonnage'), 'AC Technicians must have tonnage field');

  // Tank Cleaning has custom fields for tank type and capacity
  const tankFields = getCategoryCustomFields('tank-cleaning');
  assert.ok(tankFields.some(f => f.id === 'tankType'), 'Tank cleaning must have tankType field');
  assert.ok(tankFields.some(f => f.id === 'tankCapacity'), 'Tank cleaning must have tankCapacity field');

  // Pest Control has custom fields for pest type and property size
  const pestFields = getCategoryCustomFields('pest-control');
  assert.ok(pestFields.some(f => f.id === 'pestType'), 'Pest control must have pestType field');

  // Lawyers category has consultation workflow type
  const lawyerCat = getCategoryBySlug('lawyers');
  assert.equal(lawyerCat?.workflowType, 'consultation', 'Lawyers must use consultation workflow');

  // Office supplies category has order workflow type
  const officeCat = getCategoryBySlug('office-supplies');
  assert.equal(officeCat?.workflowType, 'order', 'Office supplies must use order workflow');
});

test('Shared Booking System: ServiceRequest model supports full 8-step lifecycle schema', () => {
  const modelsContent = readFileSync(path.resolve('lib/models.js'), 'utf8');
  assert.ok(modelsContent.includes('export const ServiceRequest'), 'models.js must export ServiceRequest');

  // Step 1 & 2 fields
  assert.ok(modelsContent.includes('categoryFields'), 'Model must support categoryFields');
  assert.ok(modelsContent.includes('preferredTimeSlot'), 'Model must support preferredTimeSlot');
  assert.ok(modelsContent.includes('address'), 'Model must support address');
  assert.ok(modelsContent.includes('pincode'), 'Model must support pincode');

  // Step 3 & 4 fields
  assert.ok(modelsContent.includes('quotation'), 'Model must support quotation object');
  assert.ok(modelsContent.includes('inspectionFee'), 'Quotation must include inspectionFee');
  assert.ok(modelsContent.includes('laborCost'), 'Quotation must include laborCost');

  // Step 5 fields
  assert.ok(modelsContent.includes('technician'), 'Model must support technician object');

  // Step 6 statuses
  assert.ok(modelsContent.includes("'quoted'"), "Status enum must include 'quoted'");
  assert.ok(modelsContent.includes("'accepted'"), "Status enum must include 'accepted'");
  assert.ok(modelsContent.includes("'scheduled'"), "Status enum must include 'scheduled'");
  assert.ok(modelsContent.includes("'in_progress'"), "Status enum must include 'in_progress'");
  assert.ok(modelsContent.includes("'completed'"), "Status enum must include 'completed'");
  assert.ok(modelsContent.includes("'disputed'"), "Status enum must include 'disputed'");
  assert.ok(modelsContent.includes("'cancelled'"), "Status enum must include 'cancelled'");
  assert.ok(modelsContent.includes('timeline'), 'Model must track timeline audit entries');

  // Step 7 & 8 fields
  assert.ok(modelsContent.includes('completion'), 'Model must support completion object');
  assert.ok(modelsContent.includes('invoice'), 'Model must support invoice object');
  assert.ok(modelsContent.includes('review'), 'Model must support review object');
});

test('Shared Booking System: Backend API provides actions for quotation, booking confirmation, assignment, tracking, completion, invoice, and reviews', () => {
  const apiContent = readFileSync(path.resolve('lib/api.js'), 'utf8');
  assert.ok(apiContent.includes("root==='service-requests'"), 'lib/api.js must handle service-requests route');

  // Step 3 Quotation submission
  assert.ok(apiContent.includes("action === 'quote'"), "API must support action: 'quote'");

  // Step 4 Booking confirmation / accept quote
  assert.ok(apiContent.includes("action === 'accept'"), "API must support action: 'accept'");

  // Step 5 Job assignment
  assert.ok(apiContent.includes("action === 'assign'"), "API must support action: 'assign'");

  // Step 6 In progress tracking
  assert.ok(apiContent.includes("action === 'start'"), "API must support action: 'start'");

  // Step 7 Completion & Step 8 Automatic Invoice Generation
  assert.ok(apiContent.includes("action === 'complete'"), "API must support action: 'complete'");
  assert.ok(apiContent.includes('invoiceNumber'), 'Completion must generate invoiceNumber');

  // Step 8 Review submission
  assert.ok(apiContent.includes("action === 'review'"), "API must support action: 'review'");

  // Additional states: Cancellation and Dispute
  assert.ok(apiContent.includes("action === 'cancel'"), "API must support action: 'cancel'");
  assert.ok(apiContent.includes("action === 'dispute'"), "API must support action: 'dispute'");
});

test('Shared Booking System: Frontend multi-step form and dashboard booking tracker components exist', () => {
  assert.ok(existsSync(path.resolve('components/bookings-tracker.jsx')), 'components/bookings-tracker.jsx must exist');
  assert.ok(existsSync(path.resolve('components/services/ServiceRequestForm.jsx')), 'components/services/ServiceRequestForm.jsx must exist');

  const formContent = readFileSync(path.resolve('components/services/ServiceRequestForm.jsx'), 'utf8');
  assert.ok(formContent.includes('Select Service Type'), 'Form must prompt for service type');
  assert.ok(formContent.includes('firstName'), 'Form must prompt for firstName');
  assert.ok(formContent.includes('lastName'), 'Form must prompt for lastName');
  assert.ok(formContent.includes('phone'), 'Form must prompt for mobile number');
  assert.ok(formContent.includes('address'), 'Form must prompt for service address');
  assert.ok(formContent.includes('city'), 'Form must prompt for city');

  const trackerContent = readFileSync(path.resolve('components/bookings-tracker.jsx'), 'utf8');
  assert.ok(trackerContent.includes('STEP_ORDER'), 'Tracker must define step order');
  assert.ok(trackerContent.includes('InvoiceAndDetailsModal'), 'Tracker must provide invoice modal');
  assert.ok(trackerContent.includes('ActionModalDialog'), 'Tracker must provide interactive action modal dialog');

  const dashContent = readFileSync(path.resolve('components/dashboard.js'), 'utf8');
  assert.ok(dashContent.includes('BookingsTracker'), 'Dashboard must integrate BookingsTracker');
  assert.ok(dashContent.includes("'bookings'"), 'Dashboard navigation must include bookings section');
});

test('Shared Booking System: Form displays official quotation and customer accepts quotation directly to accepted status', () => {
  const modelsContent = readFileSync(path.resolve('lib/models.js'), 'utf8');
  assert.ok(modelsContent.includes('quotations:'), 'Model must support multiple quotations array');
  assert.ok(modelsContent.includes('selectedQuotationId:'), 'Model must support selectedQuotationId');
  assert.ok(modelsContent.includes("'quotation'"), "Status enum must include 'quotation'");

  const apiContent = readFileSync(path.resolve('lib/api.js'), 'utf8');
  assert.ok(apiContent.includes('generateServiceQuotations'), 'API must define generateServiceQuotations for multiple quotes');
  assert.ok(apiContent.includes("status: 'quotation'") || apiContent.includes("status:'quotation'"), "API must set status to 'quotation' upon generating quotes");
  assert.ok(apiContent.includes('selectedQuotationId'), 'Accept action must record selected quotation ID');

  const formContent = readFileSync(path.resolve('components/services/ServiceRequestForm.jsx'), 'utf8');
  assert.ok(formContent.includes('handleAcceptQuotation'), 'Form must support one-click quotation acceptance');
  assert.ok(formContent.includes('Official Service Quotation'), 'Form must display official service quotation');
  assert.ok(formContent.includes('Accept Quotation &amp; Confirm Service') || formContent.includes('Accept Quotation'), 'Form must provide accept quotation CTA');
  assert.ok(formContent.includes('Service Accepted'), 'Form must confirm service accepted status');

  const trackerContent = readFileSync(path.resolve('components/bookings-tracker.jsx'), 'utf8');
  assert.ok(trackerContent.includes("STEP_ORDER = ['requested', 'quotation', 'accepted', 'completed']"), 'Tracker STEP_ORDER must use quotation step');
  assert.ok(trackerContent.includes("selectedQuotationId"), 'Tracker modal must allow selecting suitable quotation from options list');
});

test('Shared Booking System: ServiceRequestForm defines specialistPreload safely', () => {
  const formContent = readFileSync(path.resolve('components/services/ServiceRequestForm.jsx'), 'utf8');
  assert.ok(formContent.includes('specialistPreload = null'), 'ServiceRequestForm must declare specialistPreload in its parameters');
  assert.ok(formContent.includes('const targetSpecialist = specialistPreload'), 'ServiceRequestForm must safely fallback targetSpecialist');
});

test('Shared Booking System: BookingsTracker defines and passes onDirectAccept safely', () => {
  const trackerContent = readFileSync(path.resolve('components/bookings-tracker.jsx'), 'utf8');
  assert.ok(trackerContent.includes('onDirectAccept = null') || trackerContent.includes('onDirectAccept,'), 'BookingCard must declare onDirectAccept parameter');
  assert.ok(trackerContent.includes('onDirectAccept={handleDirectAccept}'), 'BookingsTracker must pass onDirectAccept to BookingCard');
});
