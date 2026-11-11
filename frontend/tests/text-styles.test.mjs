import test from 'node:test';import assert from 'node:assert/strict';
import {textPresets,defaultTextLook,readVisualBrand,validTextLook,captionLines,paintStyledCaption,readableInk} from '../src/toolkit/textStyles.ts';
function context(){const calls=[],properties=[];const ctx=new Proxy({measureText:text=>({width:text.length*10}),fillText:(text,...rest)=>calls.push({text,rest}),strokeText:()=>{},save:()=>{},restore:()=>{},beginPath:()=>{},rect:()=>{},clip:()=>{},translate:()=>{},scale:()=>{},fillRect:()=>{},strokeRect:()=>{},moveTo:()=>{},lineTo:()=>{},closePath:()=>{},fill:()=>{}},{set(target,key,value){properties.push([key,value]);target[key]=value;return true;}});return {ctx,calls,properties};}
test('all 20 distinct presets render actual text through the shared export painter',()=>{
 assert.equal(textPresets.length,20);assert.equal(new Set(textPresets.map(p=>p.id)).size,20);
 for(const preset of textPresets){const {ctx,calls}=context();paintStyledCaption(ctx,'Mi idea S/ 20',720,1280,{...defaultTextLook,preset:preset.id},1e6);assert.equal(calls.map(row=>row.text).join(' '),'Mi idea S/ 20',preset.id);}
});
test('project style records round-trip; corrupt, foreign and unsupported records cannot overwrite preferences',()=>{
 const value={version:1,projectId:'project-a',look:{...defaultTextLook,preset:'marker',useBrand:true,font:'mono'},favorites:['marker','slide']};assert.deepEqual(readVisualBrand(value,'project-a'),value);
 for(const bad of [{...value,projectId:'project-b'},{...value,look:{...value.look,primary:'url(secret)'}},{...value,favorites:['marker','marker']},{...value,look:{...value.look,font:'remote-font'}},{...value,look:{...value.look,size:99}}])assert.throws(()=>readVisualBrand(bad,'project-a'));
 assert.equal(validTextLook(defaultTextLook),true);assert.equal(readVisualBrand(undefined,'a').favorites.length,0);
});
test('brand glass uses chosen colors with contrasting ink, and fonts reach the canvas',()=>{
 const {ctx,properties}=context();paintStyledCaption(ctx,'Hola',720,1280,{...defaultTextLook,useBrand:true,primary:'#B9DDCC',font:'mono'},1);
 assert.ok(properties.some(([k,v])=>k==='fillStyle'&&v==='#B9DDCCE6'));assert.ok(properties.some(([k,v])=>k==='font'&&v.includes('monospace')));assert.equal(readableInk('#FFFFFF'),'#15251D');assert.equal(readableInk('#000000'),'#FFFFFF');
});
test('entrance animations have real temporal phases without inferring spoken word timing',()=>{
 const first=context(),last=context();paintStyledCaption(first.ctx,'Hola',720,1280,{...defaultTextLook,preset:'fade'},0);paintStyledCaption(last.ctx,'Hola',720,1280,{...defaultTextLook,preset:'fade'},1);
 assert.ok(first.properties.some(([k,v])=>k==='globalAlpha'&&v===0));assert.ok(last.properties.some(([k,v])=>k==='globalAlpha'&&v===1));
 const a=context(),b=context();paintStyledCaption(a.ctx,'Un texto que aparece',720,1280,{...defaultTextLook,preset:'typewriter'},.1);paintStyledCaption(b.ctx,'Un texto que aparece',720,1280,{...defaultTextLook,preset:'typewriter'},1e6);assert.ok(a.calls.map(c=>c.text).join('').length<b.calls.map(c=>c.text).join('').length);
});
test('long words wrap without silently dropping characters',()=>{const {ctx}=context();const text='x'.repeat(60);assert.equal(captionLines(ctx,text,100).join(''),text);});
