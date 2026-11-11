export type PomodoroState = {
    endsAt: number | null;
    pausedRemaining: number | null;
    completed: boolean;
    totalSeconds: number;
    sessionId: string | null;
    ownerTab: string | null;
    soundEnabled: boolean;
};
export const emptyPomodoro = (): PomodoroState => ({ endsAt: null, pausedRemaining: null, completed: false, totalSeconds: 1500, sessionId: null, ownerTab: null, soundEnabled: false });
export function parsePomodoro(raw: string | null): PomodoroState {
    try {
        const s = JSON.parse(raw || 'null');
        if (!s)
            return emptyPomodoro();
        const total = s.totalSeconds ?? 1500;
        if (!Number.isInteger(total) || total < 1 || total > 7200 || typeof s.completed !== 'boolean' || !(s.endsAt === null || Number.isFinite(s.endsAt) && s.endsAt > 0) || !(s.pausedRemaining === null || Number.isInteger(s.pausedRemaining) && s.pausedRemaining >= 0 && s.pausedRemaining <= total) || s.endsAt && s.completed)
            return emptyPomodoro();
        return { ...emptyPomodoro(), ...s, ...(s.endsAt && s.endsAt <= Date.now() ? { endsAt: null, pausedRemaining: 0, completed: true } : {}), totalSeconds: total, sessionId: typeof s.sessionId === 'string' ? s.sessionId : null, ownerTab: typeof s.ownerTab === 'string' ? s.ownerTab : null, soundEnabled: s.soundEnabled === true };
    }
    catch {
        return emptyPomodoro();
    }
}
export function remainingPomodoro(s: PomodoroState, now: number) { return s.endsAt ? Math.max(0, Math.min(s.totalSeconds, Math.ceil((s.endsAt - now) / 1000))) : s.pausedRemaining ?? s.totalSeconds; }
