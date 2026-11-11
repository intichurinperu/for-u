import { randomId } from '../lib/randomId';
import { playUiTone } from '../lib/sound';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { emptyPomodoro, parsePomodoro, remainingPomodoro, type PomodoroState } from '../lib/pomodoroModel';
type Value = {
    remainingSeconds: number;
    running: boolean;
    completed: boolean;
    totalSeconds: number;
    areaColor: string;
    legacyAvailable: boolean;
    restoreLegacy: () => void;
    completionEvent: number;
    soundEnabled: boolean;
    setSoundEnabled: (value: boolean) => void;
    setAreaColor: (value: string) => void;
    start: (seconds?: number) => void;
    pause: () => void;
    reset: () => void;
};
const Context = createContext<Value | null>(null);
export function PomodoroProvider({ children, account = 'local' }: {
    children: ReactNode;
    account?: string;
}) {
    const key = account === 'local' ? 'foru:pomodoro-v1' : `foru:pomodoro-v2:${account}`;
    const [state, setState] = useState<PomodoroState>(() => { try {
        return parsePomodoro(window.localStorage.getItem(key));
    }
    catch {
        return emptyPomodoro();
    } }), [now, setNow] = useState(Date.now()), [areaColor, setAreaColor] = useState('#fbbf24'), [completionEvent, setCompletionEvent] = useState(0);
    const [legacyAvailable, setLegacyAvailable] = useState(() => { try {
        return account !== "local" && !state.sessionId && Boolean(window.localStorage.getItem("foru:pomodoro-v1"));
    }
    catch {
        return false;
    } });
    const tab = useRef(randomId());
    const latest = useRef(state);
    latest.current = state;
    const notified = useRef<string | null>(null);
    function persist(value: PomodoroState) { latest.current = value; try {
        window.localStorage.setItem(key, JSON.stringify(value));
    }
    catch { /* Visible timer still works without browser storage. */ } setState(value); }
    useEffect(() => { const event = (e: StorageEvent) => { if (e.key === key) {
        const value = parsePomodoro(e.newValue);
        latest.current = value;
        setState(value);
        setNow(Date.now());
    } }; window.addEventListener('storage', event); const timer = setInterval(() => setNow(Date.now()), 1000); const wake = () => setNow(Date.now()); document.addEventListener('visibilitychange', wake); return () => { clearInterval(timer); window.removeEventListener('storage', event); document.removeEventListener('visibilitychange', wake); }; }, [key]);
    useEffect(() => { if (!state.endsAt || state.endsAt > now)
        return; const id = state.sessionId; if (state.ownerTab === tab.current) {
        const value = { ...state, endsAt: null, pausedRemaining: 0, completed: true };
        persist(value);
        if (id && notified.current !== id) {
            notified.current = id;
            setCompletionEvent(n => n + 1);
            if (state.soundEnabled && !document.hidden)
                try {
                    playUiTone('success');
                }
                catch { /* Sound is optional. */ }
        }
    }
    else {
        setState(current => ({ ...current, endsAt: null, pausedRemaining: 0, completed: true }));
    } }, [now, state.endsAt]);
    const remaining = remainingPomodoro(state, now);
    const value = useMemo<Value>(() => ({ remainingSeconds: remaining, totalSeconds: state.totalSeconds, areaColor, legacyAvailable, restoreLegacy() { try {
            const restored = parsePomodoro(window.localStorage.getItem("foru:pomodoro-v1"));
            persist({ ...restored, sessionId: randomId(), ownerTab: tab.current });
            setLegacyAvailable(false);
        }
        catch {
            setLegacyAvailable(false);
        } }, completionEvent, setAreaColor, running: Boolean(state.endsAt && state.endsAt > now), completed: state.completed, soundEnabled: state.soundEnabled, setSoundEnabled: soundEnabled => persist({ ...latest.current, soundEnabled }), start(seconds = remaining || state.totalSeconds) { seconds = Math.round(seconds); if (!Number.isFinite(seconds) || seconds < 1 || seconds > 7200)
            return; const current = latest.current; setNow(Date.now()); persist({ ...current, endsAt: Date.now() + seconds * 1000, pausedRemaining: null, completed: false, totalSeconds: current.pausedRemaining !== null && !current.completed ? current.totalSeconds : seconds, sessionId: current.completed || !current.sessionId ? randomId() : current.sessionId, ownerTab: tab.current }); }, pause() { const current = latest.current; if (current.endsAt)
            persist({ ...current, endsAt: null, pausedRemaining: remainingPomodoro(current, Date.now()), completed: false, ownerTab: tab.current }); }, reset() { persist({ ...emptyPomodoro(), soundEnabled: latest.current.soundEnabled }); } }), [remaining, now, state, areaColor, completionEvent, legacyAvailable]);
    return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function usePomodoro() { const value = useContext(Context); if (!value)
    throw new Error('El Pomodoro necesita su proveedor.'); return value; }
