import {test} from 'node:test';
import assert from 'node:assert/strict';
import {scriptLines} from '../src/toolkit/reading.ts';
test('teleprompter wraps Spanish text near 35 characters without dropping words',()=>{
 const text='Mira a la cámara y cuenta qué hace especial a tu pequeño negocio. Invita a tu comunidad a conocerlo.';
 const lines=scriptLines(text);assert.ok(lines.every(line=>Array.from(line).length<=35));assert.equal(lines.join(' '),text);
 assert.deepEqual(scriptLines('Hola\n\nMundo'),['Hola','','Mundo']);
 assert.equal(scriptLines('🙂'.repeat(80)).map(line=>Array.from(line).length).join(','),'35,35,10');
});
