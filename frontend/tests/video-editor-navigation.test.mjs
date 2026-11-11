import test from 'node:test';
import assert from 'node:assert/strict';
import { studioReturn, studioDesignPath, linkedPieceQuery } from '../src/studio/navigation.ts';
import { recordingFrames } from '../src/toolkit/prompterFrame.ts';
import { timelineClock } from '../src/toolkit/videoTimelineModel.ts';

test('video editor return navigation preserves studio design and piece context', () => {
  const params = new URLSearchParams({
    project: '11111111-1111-4111-8111-111111111111',
    return: 'studio-design',
    piece: '22222222-2222-4222-8222-222222222222',
    offers: 'torta-chocolate,cafe-espresso',
  });

  const res = studioReturn(params, null, '11111111-1111-4111-8111-111111111111');
  assert.equal(res.label, 'Volver a mi diseño');
  assert.ok(res.path.includes('tab=create'));
  assert.ok(res.path.includes('design=22222222-2222-4222-8222-222222222222'));
  assert.ok(res.path.includes('offers=torta-chocolate%2Ccafe-espresso'));
});

test('video editor return navigation falls back to profile when piece exists without return param', () => {
  const params = new URLSearchParams({
    project: '11111111-1111-4111-8111-111111111111',
    piece: '22222222-2222-4222-8222-222222222222',
  });

  const res = studioReturn(params, null, '11111111-1111-4111-8111-111111111111', 'profile');
  assert.ok(res.path.includes('tab=profile'));
});

test('recordingFrames provides correct dimensions for vertical 9:16, 4:5 and 1:1 formats', () => {
  assert.equal(recordingFrames.vertical.width, 720);
  assert.equal(recordingFrames.vertical.height, 1280);
  assert.equal(recordingFrames.vertical.label, '9:16');

  assert.equal(recordingFrames.portrait.width, 720);
  assert.equal(recordingFrames.portrait.height, 900);
  assert.equal(recordingFrames.portrait.label, '4:5');

  assert.equal(recordingFrames.square.width, 720);
  assert.equal(recordingFrames.square.height, 720);
  assert.equal(recordingFrames.square.label, '1:1');
});

test('timeline clock produces formatted time strings for scrubber and pin badges', () => {
  assert.equal(timelineClock(4), '0:04.0');
  assert.equal(timelineClock(12), '0:12.0');
  assert.equal(timelineClock(64.5), '1:04.5');
  assert.equal(timelineClock(0), '0:00.0');
});
