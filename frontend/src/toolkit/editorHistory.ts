export type EditorHistory<T> = { past: T[]; present: T; future: T[] };
export type EditorAction<T> = { type: 'edit'; value: T | ((current: T) => T) } | { type: 'undo' } | { type: 'redo' } | { type:'sync'; value:(current:T)=>T };
export function editorHistory<T>(state: EditorHistory<T>, action: EditorAction<T>): EditorHistory<T> {
  if(action.type==='sync')return {past:state.past.map(action.value),present:action.value(state.present),future:state.future.map(action.value)};
  if (action.type === 'undo') {
    if (!state.past.length) return state;
    return { past: state.past.slice(0, -1), present: state.past[state.past.length - 1], future: [state.present, ...state.future] };
  }
  if (action.type === 'redo') {
    if (!state.future.length) return state;
    return { past: [...state.past, state.present].slice(-40), present: state.future[0], future: state.future.slice(1) };
  }
  const next = typeof action.value === 'function' ? (action.value as (value: T) => T)(state.present) : action.value;
  if (next === state.present) return state;
  return { past: [...state.past, state.present].slice(-40), present: next, future: [] };
}
