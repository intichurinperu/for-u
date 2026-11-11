import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PomodoroProvider, usePomodoro } from '../src/contexts/PomodoroContext.tsx';
function readTimer(stored) {
 const original = globalThis.window;
 const originalReact = globalThis.React;
 // The Node test loader uses classic JSX; Vite uses the automatic runtime.
 globalThis.React = React;
 let value;
 globalThis.window = { localStorage: { getItem: () => stored } };
 function Probe() { value = usePomodoro(); return null; }
 try { renderToStaticMarkup(React.createElement(PomodoroProvider, null, React.createElement(Probe))); return value; }
 finally { if (originalReact === undefined) delete globalThis.React; else globalThis.React = originalReact; if (original === undefined) delete globalThis.window; else globalThis.window = original; }
}
test('Pomodoro starts at 25 minutes without a saved session', () => {
 const value = readTimer(null);
 assert.equal(value.remainingSeconds,1500); assert.equal(value.totalSeconds,1500); assert.equal(value.running,false);
});
test('Pomodoro restores paused custom duration and completed sessions', () => {
 const paused = readTimer(JSON.stringify({endsAt:null,pausedRemaining:75,totalSeconds:300,completed:false}));
 assert.equal(paused.remainingSeconds,75); assert.equal(paused.totalSeconds,300);
 const completed = readTimer(JSON.stringify({endsAt:null,pausedRemaining:0,totalSeconds:300,completed:true}));
 assert.equal(completed.remainingSeconds,0); assert.equal(completed.completed,true);
});
test('Pomodoro derives time from the saved deadline instead of restarting', () => {
 const value = readTimer(JSON.stringify({endsAt:Date.now()+5000,pausedRemaining:null,completed:false}));
 assert.equal(value.running,true); assert.ok(value.remainingSeconds > 0 && value.remainingSeconds <= 5);
 assert.equal(readTimer('invalid json').remainingSeconds,1500);
});
test('invalid numeric states reset safely; expired sessions restore completed without new event',async()=>{const {parsePomodoro,remainingPomodoro}=await import('../src/lib/pomodoroModel.ts');for(const patch of [{totalSeconds:0},{totalSeconds:-4},{pausedRemaining:-2},{endsAt:'tomorrow'},{completed:'true'},{totalSeconds:Infinity}]){const state=parsePomodoro(JSON.stringify({endsAt:null,pausedRemaining:null,completed:false,totalSeconds:300,...patch}));assert.equal(state.totalSeconds,1500);}const expired=parsePomodoro(JSON.stringify({endsAt:Date.now()-1000,pausedRemaining:null,completed:false,totalSeconds:60}));assert.equal(expired.completed,true);assert.equal(remainingPomodoro(expired,Date.now()),0);assert.equal(readTimer(JSON.stringify(expired)).completionEvent,0);});
test('reset clears a session paused before its first tick and preserves sound preference',()=>{const oldWindow=globalThis.window,oldReact=globalThis.React;let exposed,saved;globalThis.React=React;globalThis.window={localStorage:{getItem:()=>JSON.stringify({endsAt:null,pausedRemaining:300,totalSeconds:300,completed:false,soundEnabled:true}),setItem:(_key,value)=>saved=JSON.parse(value)}};function Probe(){exposed=usePomodoro();return null;}try{renderToStaticMarkup(React.createElement(PomodoroProvider,null,React.createElement(Probe)));exposed.reset();assert.equal(saved.pausedRemaining,null);assert.equal(saved.endsAt,null);assert.equal(saved.totalSeconds,1500);assert.equal(saved.completed,false);assert.equal(saved.soundEnabled,true);}finally{globalThis.window=oldWindow;if(oldReact===undefined)delete globalThis.React;else globalThis.React=oldReact;}});
