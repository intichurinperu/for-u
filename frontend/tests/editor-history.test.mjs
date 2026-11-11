import test from 'node:test';
import assert from 'node:assert/strict';
import { editorHistory } from '../src/toolkit/editorHistory.ts';
test('editor undo and redo preserve complete draft snapshots', () => {
 const initial = { past: [], present: { blocks: ['a', 'b'], title: 'Original' }, future: [] };
 const moved = editorHistory(initial, { type: 'edit', value: current => ({ ...current, blocks: ['b', 'a'] }) });
 const undone = editorHistory(moved, { type: 'undo' });
 assert.deepEqual(undone.present, initial.present);
 assert.deepEqual(editorHistory(undone, { type: 'redo' }).present, moved.present);
 assert.deepEqual(initial.present.blocks, ['a', 'b']);
});
test('a new edit clears redo and history is bounded', () => {
 let state = { past: [], present: 0, future: [] };
 for (let value = 1; value <= 100; value++) state = editorHistory(state, { type: 'edit', value });
 assert.equal(state.past.length, 40);
 state = editorHistory(state, { type: 'undo' });
 state = editorHistory(state, { type: 'edit', value: 101 });
 assert.deepEqual(state.future, []);
 assert.equal(editorHistory(state, { type: 'redo' }), state);
});
