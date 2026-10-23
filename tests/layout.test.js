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
