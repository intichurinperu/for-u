import { areaDefinitions, areaProgress, initialTasks, parseAreaTasks, parseWorldState, recoveredTaskRewards, recordTaskClaims, type AreaTasks, type WorldState } from './areaModel';
import type { ModuleType } from '../../modules/moduleProjects';
export type DocumentStatus = 'pending' | 'saving' | 'saved' | 'error' | 'conflict';
export type AreaEntry = {
    tasks: AreaTasks;
    world: WorldState;
    taskRevision: string | null;
    worldRevision: string | null;
    loaded: boolean;
    dirty: boolean;
    busy: boolean;
    error: string;
    historical: boolean;
    taskDirty: boolean;
    worldDirty: boolean;
    taskStatus: DocumentStatus;
    worldStatus: DocumentStatus;
};
type Document = {
    payload: unknown;
    revision: string;
} | null;
type Transport = {
    load: (project: string, kind: 'area-tasks' | 'world-state' | 'dashboard-progress') => Promise<Document>;
    save: (project: string, kind: 'area-tasks' | 'world-state', payload: unknown, revision: string | null) => Promise<string>;
};
export const savedAreaAchievement = (entry: AreaEntry | undefined) => Boolean(entry?.loaded && !entry.error && entry.taskRevision && !entry.taskDirty && entry.taskStatus === 'saved' && areaDefinitions.every(a => areaProgress(entry.tasks.tasks, a.id).complete));
// One account owns this controller; all consumers share locks and snapshots.
export class AreaPersistence {
    cache: Record<string, AreaEntry> = {};
    private types = new Map<string, ModuleType>();
    private locks = new Set<string>();
    private listeners = new Set<() => void>();
    private alive = true;
    private transport: Transport;
    constructor(transport: Transport) { this.transport = transport; }
    subscribe = (fn: () => void) => { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; };
    snapshot = () => this.cache;
    activate() { this.alive = true; }
    dispose() { this.alive = false; }
    private patch(project: string, value: Partial<AreaEntry>) { if (!this.alive)
        return; this.cache = { ...this.cache, [project]: { ...this.cache[project], ...value } }; this.listeners.forEach(fn => fn()); }
    async load(project: string, type: ModuleType, recover = false) {
        this.types.set(project, type);
        if (!this.alive || this.locks.has(project))
            return;
        this.locks.add(project);
        const before = this.cache[project];
        this.patch(project, { busy: true });
        try {
            const [tasks, world, history] = await Promise.all(['area-tasks', 'world-state', 'dashboard-progress'].map(kind => this.transport.load(project, kind as 'area-tasks' | 'world-state' | 'dashboard-progress')));
            const taskPayload = tasks ? parseAreaTasks(tasks.payload) : before?.tasks ?? initialTasks(type);
            const storedWorld = world ? parseWorldState(world.payload) : { version: 1 as const, areas: {} };
            const worldPayload = recoveredTaskRewards(storedWorld,taskPayload);
            const earnedPending = JSON.stringify(storedWorld)!==JSON.stringify(worldPayload);
            const current = this.cache[project];
            if (current?.loaded && !recover) {
                const dirtyWorld=current.worldDirty||earnedPending;
                const taskConflict = current.taskDirty && current.taskRevision !== (tasks?.revision ?? null);
                const worldConflict = current.worldDirty && current.worldRevision !== (world?.revision ?? null);
                this.patch(project, { ...(current.taskDirty ? {} : { tasks: taskPayload, taskRevision: tasks?.revision ?? null, taskStatus: tasks ? 'saved' : 'pending' }), ...(current.worldDirty ? {} : { world: worldPayload, worldRevision: world?.revision ?? null, worldStatus: earnedPending ? 'pending' : world ? 'saved' : 'pending', worldDirty: earnedPending }), ...(taskConflict ? { taskStatus: 'conflict' as const } : {}), ...(worldConflict ? { worldStatus: 'conflict' as const } : {}), error: taskConflict || worldConflict ? 'Cambió en otra pestaña. Conservamos tus pendientes; recupera explícitamente antes de guardar.' : current.taskDirty || current.worldDirty ? current.error : '', historical: Boolean(history), dirty: current.taskDirty||dirtyWorld });
            }
            else
                this.patch(project, { tasks: taskPayload, world: worldPayload, taskRevision: tasks?.revision ?? null, worldRevision: world?.revision ?? null, loaded: true, dirty: earnedPending, taskDirty: false, worldDirty: earnedPending, taskStatus: tasks ? 'saved' : 'pending', worldStatus: earnedPending ? 'pending' : world ? 'saved' : 'pending', historical: Boolean(history), error: '' });
        }
        catch (e) {
            this.patch(project, { error: (e as Error).message });
        }
        finally {
            this.locks.delete(project);
            this.patch(project, { busy: false });
        }
    }
    change(project: string, update: Partial<Pick<AreaEntry, 'tasks' | 'world'>>) {
        const entry = this.cache[project];
        if (!entry?.loaded || this.locks.has(project) || !this.alive)
            return;
        if(update.tasks){const tasks=recordTaskClaims(entry.tasks,update.tasks);update={...update,tasks,world:recoveredTaskRewards(update.world??entry.world,tasks)};}
        const taskDirty = entry.taskDirty || Boolean(update.tasks && JSON.stringify(update.tasks) !== JSON.stringify(entry.tasks));
        const worldDirty = entry.worldDirty || Boolean(update.world && JSON.stringify(update.world) !== JSON.stringify(entry.world));
        this.patch(project, { ...update, taskDirty, worldDirty, dirty: taskDirty || worldDirty, taskStatus: entry.taskStatus === 'conflict' ? 'conflict' : taskDirty ? 'pending' : entry.taskStatus, worldStatus: entry.worldStatus === 'conflict' ? 'conflict' : worldDirty ? 'pending' : entry.worldStatus });
    }
    async save(project: string) {
        const snapshot = this.cache[project];
        if (!snapshot?.loaded || this.locks.has(project) || !this.alive || snapshot.taskStatus === 'conflict' || snapshot.worldStatus === 'conflict')
            return false;
        this.locks.add(project);
        this.patch(project, { busy: true, error: '' });
        let failed = false;
        for (const kind of ['area-tasks', 'world-state'] as const) {
            if (!this.alive)
                break;
            const task = kind === 'area-tasks', dirty = task ? snapshot.taskDirty : snapshot.worldDirty, revision = task ? snapshot.taskRevision : snapshot.worldRevision;
            if (!dirty && revision !== null)
                continue;
            this.patch(project, task ? { taskStatus: 'saving' } : { worldStatus: 'saving' });
            try {
                const next = await this.transport.save(project, kind, task ? snapshot.tasks : snapshot.world, revision);
                this.patch(project, task ? { taskRevision: next, taskDirty: false, taskStatus: 'saved' } : { worldRevision: next, worldDirty: false, worldStatus: 'saved' });
            }
            catch (e) {
                const message = (e as Error).message;
                const status = /cambi|otra ventana|otra pestaña/i.test(message) ? 'conflict' : 'error';
                this.patch(project, task ? { taskDirty: true, taskStatus: status, error: message } : { worldDirty: true, worldStatus: status, error: message });
                failed = true;
                break;
            }
        }
        this.locks.delete(project);
        const current = this.cache[project];
        this.patch(project, { busy: false, dirty: Boolean(current?.taskDirty || current?.worldDirty) });
        return !failed && this.alive;
    }
    refresh() { for (const [project, type] of this.types)
        if (this.cache[project]?.loaded)
            void this.load(project, type); }
}
