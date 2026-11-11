import { Card as DSCard } from '../ui/DesignSystem';
import { ButtonSecondary as DSButtonSecondary, Input as DSInput } from '../ui/DesignSystem';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveProjectsStore } from '../../stores/useActiveProjectsStore';
import { moduleLabels, projectModuleType, type ModuleType } from '../../modules/moduleProjects';
import { isModuleEnabled } from '../../modules/validationLaunch';
import { loadModuleProjects, persistModuleProject } from '../../services/moduleDocuments';
import './moduleProjects.css';

export default function ModuleProjects() {
  const { user, signOut } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();
  const projectsById = useActiveProjectsStore(state => state.projectsById);
  const cloudUserId = useActiveProjectsStore(state => state.cloudUserId);
  const hydrate = useActiveProjectsStore(state => state.hydrateFromSupabase);
  const [attempt, setAttempt] = useState(0);
  const [loadedFor, setLoadedFor] = useState('');
  const loadKey = `${userId ?? ''}:${attempt}`;
  const loaded = loadedFor === loadKey;
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [unsynced, setUnsynced] = useState<string | null>(null);
  const submitting = useRef(false);
  const projects = cloudUserId === userId ? Object.values(projectsById) : [];
  const restaurants = projects.filter(project => projectModuleType(project) === 'restaurant');
  useEffect(() => {
    if (!userId) return;
    let active = true;
    (async () => {
      try { await hydrate(userId); await loadModuleProjects(userId); if (active) { setLoadedFor(loadKey); setMessage(''); } }
      catch (error) { if (active) setMessage((error as Error).message); }
    })();
    return () => { active = false; };
  }, [userId, hydrate, loadKey]);
  function open(id: string) {
    // Read the store at action time: creation updates Zustand asynchronously
    // relative to this render, so the captured projectsById can be stale.
    const project = useActiveProjectsStore.getState().getProjectById(id);
    if (!project || !isModuleEnabled(projectModuleType(project))) return;
    useActiveProjectsStore.getState().switchProject(id);
    const type = projectModuleType(project);
    navigate(`/modules/${type}/editor?project=${encodeURIComponent(id)}`);
  }
  async function sync(id: string) {
    if (!userId || submitting.current) return;
    submitting.current = true; setCreating(true);
    try {
      const project = useActiveProjectsStore.getState().getProjectById(id);
      if (!project) throw new Error('Proyecto no encontrado.');
      await persistModuleProject(userId, project);
      if (useActiveProjectsStore.getState().cloudUserId !== userId) return;
      setUnsynced(null); setName(''); setFormOpen(false);
      open(id);
    } catch (error) { setUnsynced(id); setMessage((error as Error).message); }
    finally { submitting.current = false; setCreating(false); }
  }
  async function create(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || submitting.current || unsynced || !loaded || cloudUserId !== userId) return;
    const store = useActiveProjectsStore.getState();
    const before = new Set(Object.keys(store.projectsById));
    const id = store.openProject({ name: name.trim(), industryKey: 'gastronomy', strategyProfile: { moduleType: 'restaurant' } });
    if (!id || before.has(id)) { setMessage(useActiveProjectsStore.getState().planLimitNotice?.message ?? 'No se pudo crear la ruta.'); return; }
    await sync(id);
  }
  return <main className="module-projects">
    <header><div><span>FOR U · Tu negocio, paso a paso</span><h1>Tu Ruta Digital</h1><p>Crea tu menú, publícalo y recibe pedidos por WhatsApp.</p></div><details><summary>Mi cuenta</summary><nav><Link to="/workspace">Mis otras herramientas</Link><DSButtonSecondary onClick={async () => { try { await signOut(); navigate('/login'); } catch (error) { setMessage((error as Error).message); } }}>Cerrar sesión</DSButtonSecondary></nav></details></header>
    <ol className="module-launch-steps"><li>Crear mi ruta</li><li>Configurar mi menú</li><li>Publicar y compartir</li></ol>
    <p role="status">{message || (!loaded ? 'Cargando tus proyectos…' : '')}</p>
    {!loaded && message && <DSButtonSecondary onClick={() => setAttempt(value => value + 1)}>Reintentar carga</DSButtonSecondary>}
    {unsynced && <DSButtonSecondary disabled={creating} onClick={() => sync(unsynced)}>Reintentar guardado de mi ruta</DSButtonSecondary>}
    {loaded && <>
      {restaurants.length > 0 && <section aria-label="Mis restaurantes" className="module-project-grid">{restaurants.map(project => <DSCard as="article" key={project.id} className="module-project-card module-project-restaurant"><span>Restaurante · Ruta Digital</span><h2>{project.name}</h2><p>Tu menú y enlace público.</p><DSButtonSecondary disabled={creating || project.id === unsynced} onClick={() => open(project.id)}>Continuar con {project.name}</DSButtonSecondary></DSCard>)}</section>}
      {(!restaurants.length || formOpen) ? <form onSubmit={create}><h2>Crea tu Ruta Digital</h2><label>Nombre de tu negocio<DSInput required maxLength={120} value={name} placeholder="Alfajores del Valle" onChange={event => setName(event.target.value)} autoComplete="organization" /></label><p>Tipo de negocio: <strong>Restaurante</strong> · También para pastelerías, cafeterías y comida por encargo.</p><div className="module-project-actions"><DSButtonSecondary type="submit" disabled={creating || !!unsynced || !name.trim()}>{creating ? 'Guardando tu ruta…' : 'Crear mi Ruta Digital'}</DSButtonSecondary>{restaurants.length > 0 && <DSButtonSecondary type="button" disabled={creating} onClick={() => setFormOpen(false)}>Cancelar</DSButtonSecondary>}</div></form> : <DSButtonSecondary className="module-create-project" disabled={!!unsynced} onClick={() => setFormOpen(true)}>Crear otra Ruta Digital</DSButtonSecondary>}
    </>}
    <section aria-label="Módulos disponibles"><h2>Empieza con Restaurante</h2><div className="module-project-grid">{Object.entries(moduleLabels).map(([key, label]) => {
      const enabled = isModuleEnabled(key as ModuleType);
      return <article key={key} className={`module-project-card ${enabled ? 'module-project-restaurant' : 'module-coming-soon'}`}><span>{enabled ? 'Disponible' : 'Muy pronto'}</span><h3>{label}</h3><p>{enabled ? 'Menú, página pública y pedidos por WhatsApp.' : 'Estamos preparando este módulo.'}</p>{!enabled && <DSButtonSecondary disabled aria-label={`${label}: Muy pronto`}>Muy pronto</DSButtonSecondary>}</article>;
    })}</div></section>
  </main>;
}
