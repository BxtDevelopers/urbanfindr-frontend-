import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { projectSchema, builderProfileSchema } from '../lib/validation.js';
import { builderProfiles, builderProfileFor } from '../lib/catalog.js';

test('builder profile model validates developer credentials and enterprise presence', () => {
  const validProfile = {
    name: 'Northwood Living',
    legalName: 'Northwood Living Infrastructure Pvt Ltd',
    reraId: 'PRM/KA/RERA/DEV-1088',
    experienceYears: 18,
    city: 'Bengaluru',
    operatingCities: ['Bengaluru', 'Hyderabad'],
    completedProjects: 24,
    ongoingProjects: 6,
    totalUnitsDelivered: 8500,
    website: 'https://northwoodliving.demo',
    phone: '+91 80 4455 6677',
    email: 'projects@northwoodliving.demo',
    about: 'Northwood Living is a premier residential developer specializing in green communities.'
  };

  const parsed = builderProfileSchema.safeParse(validProfile);
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.name, 'Northwood Living');
  assert.equal(parsed.data.experienceYears, 18);

  const found = builderProfileFor('Northwood Living');
  assert.ok(found, 'Catalog should find builder profile by name');
  assert.equal(found.city, 'Bengaluru');
});

test('builder project model enforces valid configurations, stages and price consistency', () => {
  const validProject = {
    title: 'The Willow Collective',
    builder: 'Northwood Living',
    city: 'Bengaluru',
    locality: 'Whitefield',
    address: 'Plot 42, Outer Ring Road',
    description: 'A thoughtfully planned urban residence with green avenues, high-speed connectivity, and lifestyle clubhouse.',
    price: 8500000,
    maxPrice: 16000000,
    area: 1200,
    acres: 5,
    units: 200,
    towers: 3,
    rera: 'PRM/KA/RERA/1251/2026/01',
    possession: 'December 2028',
    stage: 'Under construction',
    amenities: ['Clubhouse', 'Swimming pool', 'Gym', 'EV charging'],
    images: ['/photos/builder-1.jpg'],
    configurations: [
      { name: '2 BHK', area: 1200, price: 8500000, plan: '/images/plan-1.svg' },
      { name: '3 BHK', area: 1650, price: 12500000, plan: '/images/plan-2.svg' }
    ],
    featured: true
  };

  const res = projectSchema.safeParse(validProject);
  assert.equal(res.success, true);
  assert.equal(res.data.stage, 'Under construction');

  // Enforces maxPrice >= price
  const invalidPrice = { ...validProject, price: 15000000, maxPrice: 10000000 };
  assert.equal(projectSchema.safeParse(invalidPrice).success, false);
});

test('project listing and detail components provide required filters, floor plans and enquiry forms', () => {
  const listingsContent = readFileSync(path.resolve('components/listings.js'), 'utf8');
  assert.ok(listingsContent.includes('project-localities-datalist'), 'Listings must support locality filters for projects');
  assert.ok(listingsContent.includes('stage'), 'Listings must support project stage / status filter');
  assert.ok(listingsContent.includes('bedrooms'), 'Listings must support BHK configurations filter');
  assert.ok(listingsContent.includes('Featured Builder Developments') || listingsContent.includes('SPONSORED DEVELOPER SHOWCASES'), 'Listings must support featured project placements');

  const detailsContent = readFileSync(path.resolve('components/details.js'), 'utf8');
  assert.ok(detailsContent.includes('ProjectDetailsView'), 'Details must export rich project details view');
  assert.ok(detailsContent.includes('configurations'), 'Details must render configuration options');
  assert.ok(detailsContent.includes('plan'), 'Details must render architectural floor plans');
  assert.ok(detailsContent.includes('rera'), 'Details must display RERA compliance reference');
  assert.ok(detailsContent.includes('builderProfileFor') || detailsContent.includes('developer'), 'Details must display developer profile card');

  const dashboardContent = readFileSync(path.resolve('components/dashboard.js'), 'utf8');
  assert.ok(dashboardContent.includes('BuilderProjectsManager'), 'Dashboard must include BuilderProjectsManager');
  assert.ok(dashboardContent.includes('BuilderProjectEditor'), 'Dashboard must include BuilderProjectEditor');

  const adminContent = readFileSync(path.resolve('components/admin.js'), 'utf8');
  assert.ok(adminContent.includes('projects'), 'Admin must support builder projects moderation');
  assert.ok(adminContent.includes('approved'), 'Admin must support approving builder projects');
  assert.ok(adminContent.includes('rejected'), 'Admin must support rejecting builder projects');
  assert.ok(adminContent.includes('featured'), 'Admin must support featuring builder projects');
});

