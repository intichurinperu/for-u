import test from 'node:test';
import assert from 'node:assert/strict';
import {videoTemplate, templateLook, templateCaptions} from '../src/toolkit/videoTemplateModel.ts';
import {validTextLook} from '../src/toolkit/textStyles.ts';
import {validCaptionTimes} from '../src/toolkit/videoEditing.ts';

test('only known template parameters produce valid editor presets', () => {
  for (const id of ['story', 'product', 'flash', 'review']) {
    assert.equal(videoTemplate(id).id, id);
    assert.equal(validTextLook(templateLook(id)), true);
  }
  for (const value of [null, '', 'constructor', '__proto__', 'unknown']) assert.equal(videoTemplate(value), undefined);
  assert.equal(templateLook('story').preset, 'editorial');
});

test('source text is preserved in consecutive editable captions within the video duration', () => {
  const text = 'Esta es la historia de mi negocio y de quienes lo hicieron posible. '.repeat(8).trim();
  const rows = templateCaptions(text, 15);
  assert.equal(rows.map(row => row.text).join(' '), text);
  assert.equal(rows[0].start, 0);
  assert.equal(rows.at(-1).end, 15);
  assert.equal(validCaptionTimes(rows, 15), true);
  for (let i = 1; i < rows.length; i++) assert.equal(rows[i].start, rows[i - 1].end);
  for (const duration of [0, -1, NaN, Infinity]) assert.deepEqual(templateCaptions(text, duration), []);
  assert.deepEqual(templateCaptions('   ', 15), []);
});
