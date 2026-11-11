import test from 'node:test';
import assert from 'node:assert/strict';
import { withProjectCompass, parseProjectCompass, compassEmotions } from '../src/lib/projectCompassModel.ts';
test('emotional compass keeps existing project config keys without mutation', () => {
 const config={ menu:{currency:'PEN'}, existing:true };
 const next=withProjectCompass(config,'  Lanzar mis alfajores  ','joy');
 assert.deepEqual(next.menu,config.menu);assert.equal(next.existing,true);
 assert.equal(config.emotionalCompass,undefined);
 assert.equal(parseProjectCompass(next).goal,'Lanzar mis alfajores');
 assert.equal(parseProjectCompass(next).emotion,'joy');
});
test('emotional compass supports all requested emotions and rejects unknown or empty answers', () => {
 assert.equal(compassEmotions.length,8);
 for(const emotion of compassEmotions) assert.equal(parseProjectCompass(withProjectCompass(null,'Mi propósito',emotion.id)).emotion,emotion.id);
 assert.throws(()=>withProjectCompass({},' ','joy'));
 assert.throws(()=>withProjectCompass({},'Mi propósito','unknown'));
 assert.throws(()=>withProjectCompass([], 'Mi propósito','joy'));
 assert.equal(parseProjectCompass({emotionalCompass:{version:99}}),null);
});
