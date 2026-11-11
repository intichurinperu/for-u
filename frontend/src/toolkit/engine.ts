export type FocusState =
  | "focused"
  | "exhausted"
  | "anxious"
  | "low-motivation"
  | "high-energy"
  | "confused";
export type BehaviorAction = {
  id: string;
  type: string;
  at: number;
  duration: number;
  completed: boolean;
  expectedSeconds?: number;
};
export type BehaviorMetrics = {
  lastActionTime: number;
  completionRate: number;
  helpClicks: number[];
  skipped: number;
  fastTasks: number;
  scrollDepth: number;
  mouseMovement: number;
  timeOnTask: number;
};
export function detectState(m: BehaviorMetrics, now = Date.now()): FocusState {
  if (now - m.lastActionTime > 15_000 && m.completionRate < 0.3)
    return "exhausted";
  if (m.helpClicks.filter((t) => now - t < 60_000).length >= 3)
    return "anxious";
  if (m.skipped >= 2) return "low-motivation";
  if (m.fastTasks >= 3) return "high-energy";
  if (m.scrollDepth > 80 && m.mouseMovement < 5) return "confused";
  return "focused";
}
export const statePresentation: Record<
  FocusState,
  { title: string; message: string; limit: number }
> = {
  focused: {
    title: "A tu ritmo",
    message: "Un paso claro para acercarte a tu objetivo.",
    limit: 10,
  },
  exhausted: {
    title: "Un paso pequeño",
    message: "Podemos empezar con solo cinco minutos.",
    limit: 1,
  },
  anxious: {
    title: "Una cosa a la vez",
    message:
      "Dejamos a la vista tu siguiente paso. Puedes ver todo cuando quieras.",
    limit: 1,
  },
  "low-motivation": {
    title: "Pequeñas victorias",
    message: "Elige un primer paso de 90 segundos.",
    limit: 3,
  },
  "high-energy": {
    title: "Tu semana en marcha",
    message: "Tienes a mano el plan completo para seguir avanzando.",
    limit: 10,
  },
  confused: {
    title: "Vamos juntas",
    message: "Abre la ayuda para ver un ejemplo de tu negocio.",
    limit: 3,
  },
};
export type RankedTask = {
  id: string;
  title: string;
  minutes: number;
  impact: string;
  progress: number;
  dependencies: string[];
  done: boolean;
  priority: number;
};
export function prioritizeTasks(
  tasks: RankedTask[],
  objective: string,
  state: FocusState,
) {
  const completed = new Set(tasks.filter((t) => t.done).map((t) => t.id));
  const eligible = tasks.filter(
    (t) => !t.done && t.dependencies.every((id) => completed.has(id)),
  );
  const score = (t: RankedTask) =>
    t.priority +
    (t.impact === objective ? 50 : 0) +
    (t.progress > 0 && t.progress < 100 ? 40 : 0) +
    (["exhausted", "anxious", "low-motivation"].includes(state)
      ? Math.max(0, 30 - t.minutes)
      : 0) +
    tasks.filter((other) => !other.done && other.dependencies.includes(t.id))
      .length *
      20;
  return [...eligible].sort(
    (a, b) => score(b) - score(a) || a.id.localeCompare(b.id),
  );
}
export function learnPatterns(actions: BehaviorAction[]) {
  const completed = actions.filter(
    (a) => a.completed && a.type !== "help" && a.duration > 0,
  );
  const hours = new Map<number, number>();
  const types = new Map<string, number>();
  for (const a of completed) {
    const hour = new Date(a.at).getHours();
    hours.set(hour, (hours.get(hour) ?? 0) + 1);
    types.set(a.type, (types.get(a.type) ?? 0) + 1);
  }
  return {
    sampleSize: completed.length,
    preferredHour: [...hours].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
    preferredType: [...types].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
    averageSeconds: completed.length
      ? Math.round(
          completed.reduce((sum, a) => sum + a.duration, 0) / completed.length,
        )
      : null,
    dropoffTypes: [
      ...new Set(actions.filter((a) => !a.completed).map((a) => a.type)),
    ],
  };
}
export type Segment = { start: number; end: number; text?: string };
// RMS windows across every channel: background music in one channel is not silence.
export function detectSilences(
  channels: Float32Array[],
  sampleRate: number,
  thresholdDb = -38,
  minSeconds = 0.65,
): Segment[] {
  if (!channels.length || sampleRate <= 0) return [];
  const step = Math.max(1, Math.round(sampleRate * 0.02));
  const length = Math.min(...channels.map((c) => c.length));
  const threshold = 10 ** (thresholdDb / 20);
  const result: Segment[] = [];
  let start: number | null = null;
  for (let i = 0; i < length; i += step) {
    const end = Math.min(length, i + step);
    const quiet = channels.every((channel) => {
      let sum = 0;
      for (let j = i; j < end; j++) sum += channel[j] ** 2;
      return Math.sqrt(sum / (end - i)) < threshold;
    });
    if (quiet && start === null) start = i / sampleRate;
    if (!quiet && start !== null) {
      if (i / sampleRate - start >= minSeconds)
        result.push({ start, end: i / sampleRate });
      start = null;
    }
  }
  if (start !== null && length / sampleRate - start >= minSeconds)
    result.push({ start, end: length / sampleRate });
  return result;
}
export function keptSegments(
  duration: number,
  silences: Segment[],
  padding = 0.12,
): Segment[] {
  const cuts = silences
    .map((s) => ({
      start: Math.max(0, s.start + padding),
      end: Math.min(duration, s.end - padding),
    }))
    .filter((s) => s.end > s.start)
    .sort((a, b) => a.start - b.start);
  const result: Segment[] = [];
  let cursor = 0;
  for (const cut of cuts) {
    if (cut.start > cursor) result.push({ start: cursor, end: cut.start });
    cursor = Math.max(cursor, cut.end);
  }
  if (cursor < duration) result.push({ start: cursor, end: duration });
  return result.filter((s) => s.end - s.start > 0.03);
}
export function localDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from < 0 || to < 0 || from >= items.length || to >= items.length)
    return items;
  const next = [...items];
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}
export function safeHttps(value: string, hostname?: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (!hostname || url.hostname === hostname)
      ? url.href
      : "";
  } catch {
    return "";
  }
}
