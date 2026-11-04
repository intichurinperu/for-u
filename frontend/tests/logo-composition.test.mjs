import test from 'node:test';import assert from 'node:assert/strict';
import {removeFlatBackground} from '../src/toolkit/logoBackground.ts';
import {layerAppearance,paintLayers,endingLogoLayout} from '../src/toolkit/videoComposition.ts';
function picture(w,h,color=[255,255,255,255]){const data=new Uint8ClampedArray(w*h*4);for(let i=0;i<w*h;i++)data.set(color,i*4);return data;}
test('flat background removal makes only edge-connected background transparent and preserves source pixels',()=>{
 const data=picture(7,7);for(let y=2;y<=4;y++)for(let x=2;x<=4;x++)data.set([10,20,30,255],(y*7+x)*4);const before=new Uint8ClampedArray(data),result=removeFlatBackground(data,7,7);
 assert.equal(result.pixels[3],0);assert.equal(result.pixels[(3*7+3)*4+3],255);assert.deepEqual(Array.from(result.pixels.slice((3*7+3)*4,(3*7+3)*4+4)),[10,20,30,255]);assert.deepEqual(data,before);assert.equal(result.removed,40);
});
test('enclosed white artwork is preserved while a black uniform background can be removed',()=>{
 const data=picture(7,7);for(let y=1;y<6;y++)for(let x=1;x<6;x++)data.set([0,0,0,255],(y*7+x)*4);data.set([255,255,255,255],(3*7+3)*4);const result=removeFlatBackground(data,7,7);assert.equal(result.pixels[(3*7+3)*4+3],255);
 const inverse=picture(5,5,[0,0,0,255]);inverse.set([255,255,255,255],(2*5+2)*4);const cut=removeFlatBackground(inverse,5,5);assert.equal(cut.pixels[3],0);assert.equal(cut.pixels[(2*5+2)*4+3],255);
});
test('transparent and irregular backgrounds receive an honest fallback instead of destructive guessing',()=>{
 assert.throws(()=>removeFlatBackground(picture(3,3,[0,0,0,0]),3,3),/transparencia/);
 const data=picture(3,3);data.set([255,0,0,255],0);data.set([0,255,0,255],8);data.set([0,0,255,255],24);assert.throws(()=>removeFlatBackground(data,3,3),/uniforme/);
});
test('logo motion has explicit timing boundaries and the export painter respects position and opacity',()=>{
 const logo={id:'logo',name:'logo',url:'blob:qa',start:2,end:5,x:.3,y:.4,width:.2,ratio:2,animation:'pop'};
 assert.equal(layerAppearance(logo,1).opacity,0);assert.equal(layerAppearance(logo,2).opacity,0);assert.equal(layerAppearance(logo,5).opacity,0);assert.equal(layerAppearance(logo,3).opacity,1);
 const draws=[],ctx={save(){},restore(){},drawImage(...args){draws.push({args,opacity:this.globalAlpha});}};
 paintLayers(ctx,[logo],new Map([['logo',{}]]),1,1000,1000);assert.equal(draws.length,0);
 paintLayers(ctx,[logo],new Map([['logo',{}]]),3,1000,1000);assert.equal(draws.length,1);assert.deepEqual(draws[0].args.slice(1),[200,350,200,100]);assert.equal(draws[0].opacity,1);
 assert.ok(layerAppearance({...logo,animation:'rise'},2.1).rise>0);assert.equal(layerAppearance({...logo,animation:'fade'},3).scale,1);
});
test('the optional ending layout keeps manually placed overlays unchanged',()=>{
 const logo={id:'logo',name:'logo',url:'blob:qa',start:0,end:10,x:.3,y:.4,width:.2,ratio:2,placement:'overlay'};
 const rows=endingLogoLayout([logo,{...logo,id:'end1',placement:'end'},{...logo,id:'end2',placement:'end'}],10);
 assert.deepEqual(rows[0],logo);assert.equal(rows[1].start,7);assert.equal(rows[2].end,10);assert.notEqual(rows[1].x,rows[2].x);
});
