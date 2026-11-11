import test from 'node:test';
import assert from 'node:assert/strict';
import { explorationProjectsAreUnlimited, isModuleEnabled } from '../src/modules/validationLaunch.ts';

test('the exploration dashboard enables every business workspace', () => {
  for (const type of ['restaurant', 'ecommerce', 'hospitality', 'tourism', 'courses']) {
    assert.equal(isModuleEnabled(type), true);
  }
  assert.equal(isModuleEnabled(null), false);
  assert.equal(explorationProjectsAreUnlimited, true);
});
