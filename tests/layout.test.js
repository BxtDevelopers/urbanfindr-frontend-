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
