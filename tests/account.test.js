import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

test('shared account system components exist and export required functionality', () => {
  const appContent = readFileSync(path.resolve('components/application.js'), 'utf8');
  assert.ok(appContent.includes('forgot-password'), 'Forgot password route must be registered');
  assert.ok(appContent.includes('reset-password'), 'Reset password route must be registered');
  assert.ok(appContent.includes('ForgotPasswordPage'), 'ForgotPasswordPage must be imported');
  assert.ok(appContent.includes('ResetPasswordPage'), 'ResetPasswordPage must be imported');

  const authContent = readFileSync(path.resolve('components/auth-page.js'), 'utf8');
  assert.ok(authContent.includes('customer'), 'Auth page must support customer account');
  assert.ok(authContent.includes('owner'), 'Auth page must support owner account');
  assert.ok(authContent.includes('broker'), 'Auth page must support broker account');
  assert.ok(authContent.includes('builder'), 'Auth page must support builder account');
  assert.ok(authContent.includes('service_provider'), 'Auth page must support service-provider account');

  const providersContent = readFileSync(path.resolve('components/providers.js'), 'utf8');
  assert.ok(providersContent.includes('getRoleMeta'), 'providers must export getRoleMeta');
  assert.ok(providersContent.includes('canPostProperty'), 'providers must export canPostProperty helper');
  assert.ok(providersContent.includes('canPostProject'), 'providers must export canPostProject helper');
  assert.ok(providersContent.includes('logout'), 'providers must export unified logout');
});

