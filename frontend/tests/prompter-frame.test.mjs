import test from 'node:test';
import assert from 'node:assert/strict';
import {recordingCrop,recordingFrames} from '../src/toolkit/prompterFrame.ts';
test('the camera preview cover crop and output keep the selected ratio without stretching',()=>{
 for(const [sw,sh] of [[1920,1080],[1080,1920],[640,480]])for(const {width,height} of Object.values(recordingFrames))for(const focus of [0,.5,1]){
  const crop=recordingCrop(sw,sh,width,height,focus);assert.ok(crop.x>=0&&crop.y>=0);assert.ok(crop.x+crop.width<=sw+.0001);assert.ok(crop.y+crop.height<=sh+.0001);assert.ok(Math.abs(crop.width/crop.height-width/height)<.0001);
  assert.ok(Math.abs(crop.width-sw)<.0001||Math.abs(crop.height-sh)<.0001);
 }
});
test('the adjustable focus reaches both edges and invalid camera metadata cannot start a recording',()=>{
 const left=recordingCrop(1920,1080,720,1280,0),right=recordingCrop(1920,1080,720,1280,1);
 assert.equal(left.x,0);assert.equal(right.x+right.width,1920);
 assert.deepEqual(recordingCrop(1920,1080,720,1280,-1),left);assert.deepEqual(recordingCrop(1920,1080,720,1280,2),right);
 for(const value of [0,-1,NaN,Infinity])assert.throws(()=>recordingCrop(value,1080,720,1280));
});
