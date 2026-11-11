import toast from 'react-hot-toast';
import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { loadModuleDocument, saveModuleDocument } from '../../services/moduleDocuments';
import type { ModuleType } from '../../modules/moduleProjects';
import { AreaPersistence, type AreaEntry } from './areaPersistence';
const Context = createContext<AreaPersistence | null>(null);
export function AreaDocumentsProvider({ children }: {
    children: ReactNode;
}) {
    const { user } = useAuth();
    const id = user?.id ?? '';
    const controller = useMemo(() => new AreaPersistence({ load: (project, kind) => loadModuleDocument(id, project, kind), save: (project, kind, payload, revision) => saveModuleDocument(id, project, kind, payload, revision) }), [id]);
    const cache = useSyncExternalStore(controller.subscribe, controller.snapshot);
    const dirty = Object.values(cache).some(e => e.dirty);
    useEffect(() => { if (!dirty)
        return; const guard = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; }; window.addEventListener("beforeunload", guard); return () => window.removeEventListener("beforeunload", guard); }, [dirty]);
    useEffect(() => { controller.activate(); return () => controller.dispose(); }, [controller]);
    useEffect(() => {
        const refresh = () => { if (!document.hidden)
            controller.refresh(); };
        const timer = window.setInterval(refresh, 15000);
        window.addEventListener('focus', refresh);
        window.addEventListener('storage', refresh);
        document.addEventListener('visibilitychange', refresh);
        return () => { clearInterval(timer); window.removeEventListener('focus', refresh); window.removeEventListener('storage', refresh); document.removeEventListener('visibilitychange', refresh); };
    }, [controller]);
    return <Context.Provider value={controller}>{children}</Context.Provider>;
}
export function useAreaDocuments(projectId: string, type: ModuleType) {
    const controller = useContext(Context)!;
    const { user } = useAuth();
    const cache = useSyncExternalStore(controller.subscribe, controller.snapshot);
    const entry = cache[projectId];
    useEffect(() => { if (user && !controller.cache[projectId]?.loaded)
        void controller.load(projectId, type); }, [controller, projectId, type, user?.id]);
    return { entry, save: async () => { const saved=await controller.save(projectId); if(saved) toast.success('Tareas y mundo guardados', { id: `area-save-${projectId}` }); return saved; }, reload: () => controller.load(projectId, type), recover: () => controller.load(projectId, type, true), change: (update: Partial<Pick<AreaEntry, 'tasks' | 'world'>>) => controller.change(projectId, update) };
}
export function useAreaCache() { const controller = useContext(Context)!; return useSyncExternalStore(controller.subscribe, controller.snapshot); }
