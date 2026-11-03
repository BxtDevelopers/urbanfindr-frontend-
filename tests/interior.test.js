import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import {
  interiorCategories,
  interiorDesigners,
  interiorPackages,
  interiorPortfolio,
  sampleInteriorProject,
  interiorReviews
} from '../lib/interiorData.js';
import { getCategoryCustomFields, getCategoryBySlug } from '../lib/serviceCategories.js';

test('1. Interior designer profiles: verified profiles with ratings, portfolios, awards and bios exist', () => {
  assert.ok(Array.isArray(interiorDesigners) && interiorDesigners.length >= 4, 'Must have at least 4 verified interior designers');

  const deepika = interiorDesigners.find(d => d.name === 'Deepika Rao');
  assert.ok(deepika, 'Deepika Rao must exist as lead architect');
  assert.equal(deepika.rating, 4.9);
  assert.ok(deepika.reviewsCount > 100);
  assert.ok(deepika.specialties.includes('Modern Luxury'));
  assert.ok(Array.isArray(deepika.awards) && deepika.awards.length > 0);
  assert.ok(deepika.portfolioHighlights.length > 0);

  // Check component exists
  assert.ok(existsSync(path.resolve('components/interior/InteriorDesignerCard.jsx')), 'InteriorDesignerCard component must exist');
  const cardContent = readFileSync(path.resolve('components/interior/InteriorDesignerCard.jsx'), 'utf8');
  assert.ok(cardContent.includes('interiorDesigners'), 'Designer card must render interiorDesigners');
  assert.ok(cardContent.includes('Book Consultation'), 'Designer card must provide Book Consultation CTA');
});

test('2. Interior design categories: specialized categories with scopes, starting prices, and turnaround exist', () => {
  assert.ok(Array.isArray(interiorCategories) && interiorCategories.length >= 7, 'Must define at least 7 specialized interior categories');

  const kitchen = interiorCategories.find(c => c.id === 'modular-kitchens');
  assert.ok(kitchen, 'Modular Kitchen category must exist');
  assert.ok(kitchen.startingPrice.includes('₹1,49,000'));
  assert.ok(kitchen.features.some(f => f.includes('BWP 710')));

  const living = interiorCategories.find(c => c.id === 'living-dining');
  assert.ok(living, 'Living & Dining category must exist');

  const turnkey = interiorCategories.find(c => c.id === 'full-home-turnkey');
  assert.ok(turnkey, 'Full Home Turnkey category must exist');
  assert.ok(turnkey.turnaround.includes('45-Day'), 'Turnkey category must feature 45-day guarantee');

  assert.ok(existsSync(path.resolve('components/interior/InteriorCategoriesSection.jsx')), 'InteriorCategoriesSection must exist');
});

test('3. Design packages: tiered packages with essential, premium, luxe tiers and 45-day guarantee exist', () => {
  assert.ok(Array.isArray(interiorPackages) && interiorPackages.length >= 5, 'Must define 1 BHK, 2 BHK, 3 BHK, 4 BHK/Villa and Kitchen packages');

  const pkg2bhk = interiorPackages.find(p => p.bhk === '2 BHK');
  assert.ok(pkg2bhk, '2 BHK package must exist');
  assert.ok(pkg2bhk.tiers.essential && pkg2bhk.tiers.premium && pkg2bhk.tiers.luxe, 'Package must define Essential, Premium, and Luxe tiers');
  assert.ok(pkg2bhk.tiers.premium.inclusions.length >= 5, 'Tier must define comprehensive inclusions');
  assert.ok(pkg2bhk.tiers.premium.materials.includes('Acrylic') || pkg2bhk.tiers.premium.materials.includes('Hafele'));

  const pkg3bhk = interiorPackages.find(p => p.bhk === '3 BHK');
  assert.ok(pkg3bhk.tiers.luxe.price > pkg3bhk.tiers.premium.price);

  assert.ok(existsSync(path.resolve('components/interior/InteriorPackagesSection.jsx')), 'InteriorPackagesSection must exist');
});

test('4. Portfolio galleries: filterable galleries with room types, styles, and before/after views exist', () => {
  assert.ok(Array.isArray(interiorPortfolio) && interiorPortfolio.length >= 6, 'Must define at least 6 rich portfolio projects');

  const item1 = interiorPortfolio[0];
  assert.ok(item1.title && item1.room && item1.style);
  assert.ok(item1.beforeImage && item1.afterImage, 'Portfolio item must support before and after images');
  assert.ok(item1.budget && item1.carpetArea);

  assert.ok(existsSync(path.resolve('components/interior/InteriorPortfolioSection.jsx')), 'InteriorPortfolioSection must exist');
  const portContent = readFileSync(path.resolve('components/interior/InteriorPortfolioSection.jsx'), 'utf8');
  assert.ok(portContent.includes('toggleBeforeAfter') || portContent.includes('currentMode ==='), 'Portfolio must support before/after switcher');
});

test('5, 6 & 7: Consultation booking, floor-plan uploads and site-visit requests: multi-step workflow exists', () => {
  assert.ok(existsSync(path.resolve('components/interior/InteriorConsultationModal.jsx')), 'InteriorConsultationModal must exist');
  const modalContent = readFileSync(path.resolve('components/interior/InteriorConsultationModal.jsx'), 'utf8');

  // Step 5: Consultation booking
  assert.ok(modalContent.includes('Book Free Design Consultation'), 'Modal must support consultation booking');
  assert.ok(modalContent.includes('preferredDate'), 'Must prompt for preferred date');
  assert.ok(modalContent.includes('preferredTimeSlot'), 'Must prompt for preferred time slot');

  // Step 6: Floor-plan uploads
  assert.ok(modalContent.includes('Upload 2D / 3D Floor Plan'), 'Modal must support floor-plan uploads');
  assert.ok(modalContent.includes('carpetAreaSqFt'), 'Must record carpet area');
  assert.ok(modalContent.includes('floorPlanFile') || modalContent.includes('handleFileChange'), 'Must handle file uploads');

  // Step 7: Site-visit requests
  assert.ok(modalContent.includes('Doorstep Site Measurement & Laser Survey'), 'Must support site measurement survey visit');

  // Check category custom fields support
  const intFields = getCategoryCustomFields('interior-designers');
  assert.ok(intFields.some(f => f.id === 'bhkType'), 'interior-designers must have bhkType custom field');
  assert.ok(intFields.some(f => f.id === 'consultationType'), 'interior-designers must have consultationType custom field');
});

test('8. Customized quotations: itemized room-by-room bill of quantities with GST breakdown exists', () => {
  assert.ok(sampleInteriorProject.customQuote, 'Interior project must have customQuote');
  assert.ok(sampleInteriorProject.customQuote.items.length >= 5, 'Quotation must have itemized scope items');
  assert.ok(sampleInteriorProject.customQuote.subtotal > 0);
  assert.ok(sampleInteriorProject.customQuote.gst > 0);
  assert.ok(sampleInteriorProject.customQuote.grandTotal > 0);

  const hubContent = readFileSync(path.resolve('components/interior/InteriorProjectHub.jsx'), 'utf8');
  assert.ok(hubContent.includes('Customized Bill of Quantities & Estimate') || hubContent.includes('project.customQuote'), 'Hub must render itemized quotation');
  assert.ok(hubContent.includes('Print Quote') || hubContent.includes('window.print()'), 'Must allow printing / saving quotation');
});

test('9. Design proposals: 3D interactive renders, moodboards, material specs, and proposal versioning exist', () => {
  assert.ok(Array.isArray(sampleInteriorProject.proposals) && sampleInteriorProject.proposals.length >= 2, 'Project must contain design proposals');
  const prop = sampleInteriorProject.proposals[1];
  assert.ok(prop.renders.length > 0, 'Proposal must include 3D renders');
  assert.ok(prop.materials.length > 0, 'Proposal must include material specifications');
  assert.ok(prop.version.includes('v1.'), 'Proposal must track version');

  const hubContent = readFileSync(path.resolve('components/interior/InteriorProjectHub.jsx'), 'utf8');
  assert.ok(hubContent.includes('handleApproveProposal'), 'Hub must allow customer to approve or request changes on proposals');
});

test('10. Project milestones: 6-stage lifecycle with deliverables, site photos, and payment percentages exist', () => {
  assert.ok(Array.isArray(sampleInteriorProject.milestones) && sampleInteriorProject.milestones.length === 6, 'Project must define 6 standard interior milestones');

  const m1 = sampleInteriorProject.milestones[0];
  assert.equal(m1.stage, 1);
  assert.ok(m1.title.includes('Design Signoff'));

  const m3 = sampleInteriorProject.milestones[2];
  assert.equal(m3.stage, 3);
  assert.ok(m3.title.includes('Modular Factory Production'));

  const m6 = sampleInteriorProject.milestones[5];
  assert.equal(m6.stage, 6);
  assert.ok(m6.title.includes('Final Snag Audit') || m6.title.includes('Handover'));

  const hubContent = readFileSync(path.resolve('components/interior/InteriorProjectHub.jsx'), 'utf8');
  assert.ok(hubContent.includes('handleApproveMilestone'), 'Hub must allow milestone sign-off');
});

test('11. Customer approvals: centralized approvals audit trail for floor plans, 3D designs, and milestones exists', () => {
  assert.ok(Array.isArray(sampleInteriorProject.approvals) && sampleInteriorProject.approvals.length >= 4, 'Project must have customer approval records');
  assert.ok(sampleInteriorProject.approvals.some(a => a.approvalType.includes('3D') || a.approvalType.includes('Design')));
  assert.ok(sampleInteriorProject.approvals.some(a => a.approvalType.includes('Milestone') || a.approvalType.includes('Sign-off')));

  const hubContent = readFileSync(path.resolve('components/interior/InteriorProjectHub.jsx'), 'utf8');
  assert.ok(hubContent.includes('Customer Digital Approval Audit Trail'), 'Hub must render customer approvals');
});

test('12. Progress tracking: live percent completion, 45-day guarantee day counter, and daily supervisor photo logs exist', () => {
  assert.equal(typeof sampleInteriorProject.percentComplete, 'number');
  assert.ok(sampleInteriorProject.totalDays === 45);
  assert.ok(sampleInteriorProject.currentDay > 0);
  assert.ok(Array.isArray(sampleInteriorProject.progressUpdates) && sampleInteriorProject.progressUpdates.length > 0);

  const update = sampleInteriorProject.progressUpdates[0];
  assert.ok(update.title && update.description && update.photos.length > 0);

  const hubContent = readFileSync(path.resolve('components/interior/InteriorProjectHub.jsx'), 'utf8');
  assert.ok(hubContent.includes('Day ') && hubContent.includes('45-Day Guarantee'), 'Hub must display 45-day countdown');
  assert.ok(hubContent.includes('Live Site Photo Feed'), 'Hub must render supervisor photo updates');
  assert.ok(hubContent.includes('handleAddProgressUpdate'), 'Hub must allow posting progress updates');
});

test('13. Invoice management: milestone-based invoices with payment tracking and receipt preview exist', () => {
  assert.ok(Array.isArray(sampleInteriorProject.invoices) && sampleInteriorProject.invoices.length >= 5, 'Project must have milestone-based invoices');
  const paidInv = sampleInteriorProject.invoices.find(i => i.status === 'paid');
  assert.ok(paidInv, 'Must have at least one paid invoice');
  assert.ok(paidInv.paidAt && paidInv.paymentMethod);

  const unpaidInv = sampleInteriorProject.invoices.find(i => i.status === 'unpaid');
  assert.ok(unpaidInv, 'Must have an unpaid milestone invoice');

  const hubContent = readFileSync(path.resolve('components/interior/InteriorProjectHub.jsx'), 'utf8');
  assert.ok(hubContent.includes('handlePayInvoice'), 'Hub must allow paying milestone invoices');
});

test('14. Project completion: 10-year warranty certificate and snag checklist verification exist', () => {
  assert.ok(sampleInteriorProject.warranty, 'Project must have warranty object');
  assert.equal(sampleInteriorProject.warranty.years, 10, 'Warranty must be 10 years');
  assert.ok(sampleInteriorProject.warranty.certificateId.startsWith('WAR-'));

  const hubContent = readFileSync(path.resolve('components/interior/InteriorProjectHub.jsx'), 'utf8');
  assert.ok(hubContent.includes('10-Year Comprehensive Material'), 'Hub must render 10-year warranty card');
});

test('15. Customer reviews: verified reviews with ratings, photos, and review submission exist', () => {
  assert.ok(Array.isArray(interiorReviews) && interiorReviews.length >= 3, 'Must have verified customer reviews');
  const rev = interiorReviews[0];
  assert.equal(rev.rating, 5);
  assert.ok(rev.author && rev.property && rev.comment);

  assert.ok(existsSync(path.resolve('components/interior/InteriorReviewsSection.jsx')), 'InteriorReviewsSection must exist');
  const revContent = readFileSync(path.resolve('components/interior/InteriorReviewsSection.jsx'), 'utf8');
  assert.ok(revContent.includes('FEATURE 15: VERIFIED CUSTOMER REVIEWS'), 'Review section must render verified customer reviews');
});

test('Integration: Interiors page and User Dashboard incorporate the Interior Project Management System', () => {
  const dashContent = readFileSync(path.resolve('components/dashboard.js'), 'utf8');
  assert.ok(dashContent.includes("'interiors'"), 'Dashboard must route interiors section');
  assert.ok(dashContent.includes('InteriorProjectHub'), 'Dashboard must render InteriorProjectHub for interiors section');

  const apiContent = readFileSync(path.resolve('lib/api.js'), 'utf8');
  assert.ok(apiContent.includes("root === 'interior-project'"), 'lib/api.js must provide interior-project endpoint');
  assert.ok(apiContent.includes("action.startsWith('interior_')"), 'lib/api.js must handle interior project actions');
});
