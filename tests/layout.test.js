import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

test('layout navigation contains all primary feature sections', () => {
  const content = readFileSync(path.resolve('components/layout.js'), 'utf8');
  assert.ok(content.includes('Builder projects') || content.includes('builder-projects'));
  assert.ok(content.includes('Home interiors') || content.includes('home-interiors'));
  assert.ok(content.includes('Post property') || content.includes('post-property'));
});

test('layout header displays single letter initial avatar with user menu dropdown', () => {
  const content = readFileSync(path.resolve('components/layout.js'), 'utf8');
  // Verify icons are imported from lucide-react
  assert.ok(content.includes('LayoutDashboard'));
  assert.ok(content.includes('LogOut'));
  assert.ok(content.includes('User'));

  const importSection = content.slice(0, content.indexOf('function CityPickerModal'));
  assert.ok(importSection.includes('LayoutDashboard'), 'LayoutDashboard must be imported');
  assert.ok(importSection.includes('LogOut'), 'LogOut must be imported');
  assert.ok(importSection.includes('User'), 'User must be imported');

  // Initial avatar circle
  assert.ok(content.includes('charAt(0).toUpperCase()'));
  assert.ok(content.includes('user-menu-wrap'));
  // Dropdown menu elements
  assert.ok(content.includes('userMenuOpen'));
  assert.ok(content.includes('Dashboard'));
  assert.ok(content.includes('Logout'));
});

test('layout header provides mobile back button option for navigation', () => {
  const content = readFileSync(path.resolve('components/layout.js'), 'utf8');
  assert.ok(content.includes('ArrowLeft'), 'ArrowLeft icon must be imported and used');
  assert.ok(content.includes("pathname !== '/'"), 'Back button shown when navigating subpages');
  assert.ok(content.includes('handleMobileBack'), 'Uses handleMobileBack for step-by-step navigation');
  assert.ok(content.includes('urbanfindr_nav_history'), 'Maintains sequential navigation history stack');
  assert.ok(content.includes('lg:hidden'), 'Restricted exclusively to mobile responsiveness');
});

test('MobileMagicSearch only includes existing website cities and excludes unlisted cities', () => {
  const content = readFileSync(path.resolve('components/MobileMagicSearch.jsx'), 'utf8');
  // Must include website cities
  assert.ok(content.includes('Hyderabad'));
  assert.ok(content.includes('Delhi'));
  assert.ok(content.includes('Bengaluru'));
  assert.ok(content.includes('Mumbai'));
  assert.ok(content.includes('Pune'));
  assert.ok(content.includes('Chennai'));
  assert.ok(content.includes('Gurugram'));
  assert.ok(content.includes('Delhi NCR'));

  // Must not contain extra unlisted cities
  assert.ok(!content.includes("'ghaziabad'"), 'Ghaziabad must not be in the city list');
  assert.ok(!content.includes("'ahmedabad'"), 'Ahmedabad must not be in the city list');
  assert.ok(!content.includes("'kolkata'"), 'Kolkata must not be in the city list');
  assert.ok(!content.includes("'greater-noida'"), 'Greater Noida must not be in the city list');
});

test('mobile menu has Register instead of Sign in and removed promo box', () => {
  const content = readFileSync(path.resolve('components/layout.js'), 'utf8');
  // Promo box removed
  assert.ok(!content.includes('Find Your Perfect Property'), 'Promo box must be removed from menu');
  // Register text used
  assert.ok(content.includes('Register'), 'Menu must feature Register button');
  assert.ok(content.includes('Login'), 'Menu must feature Login button');
});

test('serviceCategories starts with properties card and has unique slugs', () => {
  const content = readFileSync(path.resolve('lib/serviceCategories.js'), 'utf8');
  assert.ok(content.includes("slug: 'properties'"), 'Must include properties category');
  // Verify it is placed first
  const firstCategorySlug = content.match(/slug:\s*'([^']+)'/)?.[1];
  assert.equal(firstCategorySlug, 'properties', 'Properties category must be first in list');

  // Verify all slugs are unique
  const slugs = [...content.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);
  const uniqueSlugs = new Set(slugs);
  assert.equal(slugs.length, uniqueSlugs.size, 'All category slugs must be unique');
});

test('MobileMagicSearch features clean category tabs without post ad and valid Hyderabad image', () => {
  const content = readFileSync(path.resolve('components/MobileMagicSearch.jsx'), 'utf8');
  assert.ok(!content.includes('Post Ad'), 'Post Ad must be removed from mobile search bar');
  assert.ok(content.includes('overflow-x-auto'), 'Tabs must be horizontally scrollable');
  assert.ok(content.includes('/images/city-hyderabad.svg'), 'Hyderabad must have valid fallback image');
  assert.ok(!content.includes('photo-1605649487212-47bdab064df8'), 'Broken 404 Hyderabad image must be replaced');
});

test('BuilderProjectsBanner is hidden on mobile and visible on laptop and desktop', () => {
  const content = readFileSync(path.resolve('components/BuilderProjectsBanner.js'), 'utf8');
  assert.ok(content.includes('hidden lg:block'), 'Must hide on mobile and show on lg+ screens');
});

test('MobileProjectsShowcase renders on mobile with Encyclopedia features and theme colors', () => {
  const comp = readFileSync(path.resolve('components/MobileProjectsShowcase.jsx'), 'utf8');
  assert.ok(comp.includes('lg:hidden'), 'Must be restricted exclusively to mobile view');
  assert.ok(comp.includes('New Launch'), 'Must include New Launch badge');
  assert.ok(comp.includes('Encyclopedia For All New Projects'), 'Must include encyclopedia tagline');
  assert.ok(comp.includes('Directory For All New Projects'), 'Must include directory feature');
  assert.ok(comp.includes('Latest RERA Reports'), 'Must include RERA reports feature');
  assert.ok(comp.includes('Expert Reviews &amp; Advice') || comp.includes('Expert Reviews & Advice'), 'Must include reviews feature');
  assert.ok(comp.includes('View All Projects'), 'Must include View All Projects button');
  assert.ok(comp.includes('#163e35'), 'Button must use website theme color (#163e35)');
  assert.ok(comp.includes('Builder') && comp.includes('Projects'), 'Must display Builder Projects');
  assert.ok(comp.includes('text-[#163e35]') && comp.includes('text-[#749546]'), 'Theme dark and light greens must be used');

  const home = readFileSync(path.resolve('components/home.js'), 'utf8');
  const featIdx = home.indexOf('id="featured-properties"');
  const showcaseIdx = home.indexOf('<MobileProjectsShowcase');
  assert.ok(featIdx !== -1 && showcaseIdx !== -1 && showcaseIdx > featIdx, 'Must be placed directly after Featured Properties');
});
