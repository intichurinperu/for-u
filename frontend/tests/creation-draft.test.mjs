import test from 'node:test';
import assert from 'node:assert/strict';
import { creationDraft } from '../src/experience/creationDraft.ts';

const prefs = { version: 1, preferredName: 'Alex', addressing: 'neutral', reducedMotion: false };
const saved = (patch = {}) => ({ version: 2, step: 2, entry: 'guided', name: 'Mi cafetería', route: 'restaurant', preferredName: 'Nico', addressing: 'feminine', projectId: null, ...patch });

test('a new direct project starts at its name without saving unedited account preferences', () => {
  const direct = creationDraft(null, prefs, true);
  assert.equal(direct.step, 2);
  assert.equal(direct.entry, 'guided');
  assert.equal(direct.savePreferences, false);
  assert.equal(direct.projectId, null);
  assert.equal(direct.preferredName, prefs.preferredName);
  assert.equal(direct.addressing, prefs.addressing);
  const legacy = creationDraft(null, prefs);
  assert.equal(legacy.step, -1);
  assert.equal(legacy.entry, null);
  assert.equal(legacy.savePreferences, true);
});

test('direct entry skips legacy welcome/personal steps while retaining explicit personal choices', () => {
  for (const step of [0, 1]) {
    const draft = saved({ step });
    const before = structuredClone(draft);
    const resumed = creationDraft(draft, prefs, true);
    assert.equal(resumed.step, 2);
    assert.equal(resumed.preferredName, 'Nico');
    assert.equal(resumed.addressing, 'feminine');
    assert.equal(resumed.name, 'Mi cafetería');
    assert.equal(resumed.route, 'restaurant');
    assert.equal(resumed.savePreferences, true);
    assert.deepEqual(draft, before);
    assert.equal(creationDraft(draft, prefs).step, step);
  }
  const welcome = creationDraft(saved({ step: -1, entry: null }), prefs, true);
  assert.equal(welcome.entry, 'guided');
  assert.equal(welcome.step, 2);
  assert.equal(welcome.savePreferences, false);
});

test('saved project identity and activity step survive retries without creating a fresh draft', () => {
  const id = '135fcc67-e2e5-4d2d-be7e-d290caf98605';
  const resumed = creationDraft(saved({ step: 3, projectId: id, route: 'services' }), prefs, true);
  assert.equal(resumed.projectId, id);
  assert.equal(resumed.step, 3);
  assert.equal(resumed.route, 'services');
  assert.equal(resumed.name, 'Mi cafetería');
});

test('manual and explore drafts preserve their destinations instead of becoming guided', () => {
  for (const entry of ['manual', 'explore']) {
    const resumed = creationDraft(saved({ entry, step: 3 }), prefs, true);
    assert.equal(resumed.entry, entry);
    assert.equal(resumed.step, 3);
    assert.equal(resumed.savePreferences, false);
  }
});

test('explicit preference-save flags survive reloads and direct-entry migration', () => {
  for (const startWithName of [false, true]) {
    const direct = creationDraft(saved({ savePreferences: false }), prefs, startWithName);
    assert.equal(direct.savePreferences, false);
    assert.equal(creationDraft(direct, prefs, startWithName).savePreferences, false);
    assert.equal(creationDraft(saved({ savePreferences: true }), prefs, startWithName).savePreferences, true);
  }
});

test('unsupported or malformed drafts fall back to the selected entry without trusting invalid fields', () => {
  const malformed = [null, [], 'draft', {}, saved({ version: 9 }), saved({ step: 10 }), saved({ entry: 'foreign' }), saved({ name: 3 }), saved({ preferredName: null }), saved({ route: 'unknown' }), saved({ addressing: 'guessed' }), saved({ projectId: 42 }), saved({ savePreferences: 'false' })];
  for (const value of malformed) {
    const direct = creationDraft(value, prefs, true);
    assert.equal(direct.step, 2);
    assert.equal(direct.projectId, null);
    assert.equal(direct.name, '');
    assert.equal(direct.savePreferences, false);
  }
});
