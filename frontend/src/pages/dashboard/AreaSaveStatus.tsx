import { useState } from 'react';
import { ButtonSecondary } from '../../components/ui/DesignSystem';
import type { ModuleType } from '../../modules/moduleProjects';
import { useAreaDocuments } from './AreaDocuments';
const labels = { pending: 'Pendiente', saving: 'Guardando', saved: 'Guardado', error: 'Error · reintenta', conflict: 'Conflicto · recupera' };
export default function AreaSaveStatus({ projectId, type }: {
    projectId: string;
    type: ModuleType;
}) {
    const { entry, save, recover, reload } = useAreaDocuments(projectId, type);
    const [confirm, setConfirm] = useState(false);
    if (!entry?.loaded)
        return null;
    const conflict = entry.taskStatus === 'conflict' || entry.worldStatus === 'conflict';
    return <footer className="area-save-status"><div role="status">{!entry.dirty&&!entry.busy&&!entry.error&&!conflict?<span>✓ Todo guardado</span>:<><span>Tareas: {labels[entry.taskStatus]}</span><span>Decoración: {labels[entry.worldStatus]}</span></>}</div>{entry.error && <p role="alert">{entry.error}</p>}{(entry.dirty||entry.busy||entry.error||conflict||entry.taskRevision===null||entry.worldRevision===null)&&<ButtonSecondary disabled={entry.busy || conflict || (!entry.dirty && entry.taskRevision !== null && entry.worldRevision !== null) || entry.tasks.tasks.some(t => !t.title.trim())} onClick={() => void save()}>{entry.busy ? (entry.taskStatus === 'saving' || entry.worldStatus === 'saving' ? 'Guardando…' : 'Consultando…') : entry.error && !conflict ? 'Reintentar guardado' : 'Guardar cambios'}</ButtonSecondary>}{(entry.error || conflict) && <ButtonSecondary disabled={entry.busy} onClick={() => entry.dirty ? setConfirm(true) : void reload()}>Recuperar datos guardados</ButtonSecondary>}{confirm && <section className="recovery-notice" role="region" aria-label="Confirmar recuperación"><p>Recuperar descartará tus cambios pendientes de este proyecto. Copia lo que quieras conservar antes.</p><ButtonSecondary disabled={entry.busy} onClick={() => { void recover(); setConfirm(false); }}>Descartar pendientes y recuperar</ButtonSecondary><ButtonSecondary onClick={() => setConfirm(false)}>Conservar mi edición</ButtonSecondary></section>}</footer>;
}
