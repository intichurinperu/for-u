import test from 'node:test';
import assert from 'node:assert/strict';
import { externalImageUrl, isPrivateMedia, mediaReference, privateMediaPath } from '../src/components/shared/mediaReference.ts';

test('private images keep a durable path and resolve only for their owner and project', () => {
  const value = mediaReference('owner/project/photo.jpg');
  assert.equal(isPrivateMedia(value), true);
  assert.equal(privateMediaPath(value, 'owner', 'project'), 'owner/project/photo.jpg');
  assert.equal(privateMediaPath(value, 'other-owner', 'project'), null);
  assert.equal(privateMediaPath(value, 'owner', 'other-project'), null);
  assert.equal(privateMediaPath(value, 'owner', 'pro'), null);
});

test('media paths reject traversal, signed links and nested folders', () => {
  for (const path of ['owner/project/..', 'owner/project/../photo.jpg', 'owner/project/%2e%2e', 'owner/project/a.jpg?token=secret', 'https://example.test/a.jpg']) {
    assert.throws(() => mediaReference(path));
    assert.equal(privateMediaPath(`foru-media:${path}`, 'owner', 'project'), null);
  }
});

test('external images allow web URLs while rejecting executable protocols and credentials', () => {
  assert.equal(externalImageUrl('https://example.test/photo.png'), 'https://example.test/photo.png');
  for (const value of ['javascript:alert(1)', 'data:image/svg+xml,test', 'file:///photo.jpg', 'https://user:pass@example.test/photo.jpg', 'not-a-url']) assert.equal(externalImageUrl(value), null);
});
