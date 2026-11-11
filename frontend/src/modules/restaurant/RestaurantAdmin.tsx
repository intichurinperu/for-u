import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { loadModuleDocument, saveModuleDocument, loadModuleProjects } from '../../services/moduleDocuments';
import { emptyRestaurant, type RestaurantData } from './model';
import { useActiveProjectsStore } from '../../stores/useActiveProjectsStore';
import { ModuleDraftContext } from '../useModuleDraft';
import { MediaScope } from '../../components/shared/mediaScope';
import EditorCarta from '../../components/restaurant/EditorCarta';
import EditorEstilos from '../../components/restaurant/EditorEstilos';
import EditorCategorias from '../../components/restaurant/EditorCategorias';
import RestaurantPublishing from './RestaurantPublishing';

// Mapeo de vistas
type ViewMode = 'carta' | 'categorias' | 'estilos' | 'logistica' | 'ajustes';

export default function RestaurantAdmin() {
  const { user } = useAuth();
  const userId = user?.id;
  const store = useActiveProjectsStore();
  const [params] = useSearchParams();
  const urlProjectId = params.get('project');
  const projectId = urlProjectId || store.activeProjectId;
  const navigate = useNavigate();
  
  const [data, setData] = useState<RestaurantData | null>(null);
  const [revision, setRevision] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pendingDraft, setPendingDraft] = useState(false);
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const [view, setView] = useState<ViewMode>('carta');
  const [projectName, setProjectName] = useState('Restaurante');

  useEffect(() => {
    if (!userId) return;
    if (!projectId) {
      navigate('/dashboard?create=1', { replace: true });
      return;
    }
    loadModuleDocument(userId, projectId, 'restaurant').then(document => {
      const payload = document ? document.payload as RestaurantData : emptyRestaurant('Mi Restaurante');
      setData(payload);
      setRevision(document?.revision ?? null);
      setDirty(false);
    }).catch(err => {
      console.error(err);
      setData(emptyRestaurant('Mi Restaurante'));
    });
    loadModuleProjects(userId).then(projects => {
      const p = projects.find(p => p.id === projectId);
      if (p) setProjectName(p.name);
    });
  }, [userId, projectId, navigate]);

  async function save() {
    if (!data || busy.current || pendingDraft || !userId || !projectId) return;
    busy.current = true; setSaving(true);
    try {
      const nextRevision = await saveModuleDocument(userId, projectId, 'restaurant', data, revision);
      setRevision(nextRevision); setDirty(false);
      alert('Cambios guardados con éxito');
    } catch (reason) { 
      alert((reason as Error).message);
    }
    finally { busy.current = false; setSaving(false); }
  }

  function update(newData: RestaurantData) {
    setData(newData);
    setDirty(true);
  }

  if (!data) return <div className="min-h-screen bg-surface flex items-center justify-center"><div className="animate-pulse flex items-center gap-2"><span className="material-symbols-outlined animate-spin">refresh</span> Cargando sistema...</div></div>;

  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen">
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
        <div className="h-28 px-margin flex flex-col justify-center gap-space-xs">
          <div className="flex items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm min-w-0">
              <button onClick={() => navigate('/dashboard')} aria-label="Volver" className="w-11 h-11 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <div className="flex flex-col min-w-0">
                <h1 className="font-headline-sm text-headline-sm text-on-surface truncate">Creator Studio</h1>
                <span className="font-label-md text-label-md text-on-surface-variant truncate">{projectName}</span>
              </div>
            </div>
            <div className="flex items-center gap-space-sm shrink-0">
              <button disabled={!dirty || saving} onClick={save} className="h-11 px-space-md rounded-full bg-primary text-on-primary flex items-center gap-space-xs shadow-md active:scale-95 transition-transform disabled:opacity-50">
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span className="font-label-lg text-label-lg">{saving ? 'Guardando...' : 'Guardar'}</span>
              </button>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between px-space-xs">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                {!dirty && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${dirty ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span className="font-caption text-caption text-on-surface-variant">{dirty ? 'Cambios sin guardar' : 'Guardado en tiempo real'}</span>
            </div>
            <span className="font-caption text-caption text-on-surface-variant/70">FOR U Restaurant Studio</span>
          </div>
        </div>
      </header>
      
      <main className="flex flex-col relative w-full pt-28 pb-24 px-margin bg-surface flex-1">
        <ModuleDraftContext.Provider value={setPendingDraft}>
          <MediaScope.Provider value={{ userId: userId!, projectId: projectId! }}>
            {view === 'carta' && <EditorCarta />}
            {view === 'estilos' && <EditorEstilos />}
            {view === 'categorias' && <EditorCategorias />}
            {view === 'logistica' && (
              <div className="flex flex-col gap-6">
                <h2 className="font-headline-lg text-headline-lg">Logística y Operaciones</h2>
                <div className="p-6 rounded-2xl bg-surface-container-low">
                   <p>Próximamente: Estadísticas mejoradas y gestión de inventario inteligente.</p>
                </div>
                <RestaurantPublishing data={data} userId={userId!} project={{id: projectId!, name: projectName, type: 'restaurant'}} disabled={dirty} />
              </div>
            )}
            {view === 'ajustes' && (
              <div className="flex flex-col gap-6">
                 <h2 className="font-headline-lg text-headline-lg">Ajustes</h2>
                 <p>Configuración del restaurante.</p>
              </div>
            )}
          </MediaScope.Provider>
        </ModuleDraftContext.Provider>
      </main>

      <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.03)] border-t border-surface-container">
        <div className="flex items-center justify-around h-16 px-space-xs">
          <button onClick={() => setView('carta')} className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all ${view === 'carta' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}>
            <span className="material-symbols-outlined text-[22px]">restaurant_menu</span>
            <span className="font-label-sm text-label-sm mt-0.5">Carta</span>
          </button>
          <button onClick={() => setView('categorias')} className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all ${view === 'categorias' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}>
            <span className="material-symbols-outlined text-[22px]">category</span>
            <span className="font-label-sm text-label-sm mt-0.5">Categorías</span>
          </button>
          <button onClick={() => setView('estilos')} className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all ${view === 'estilos' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}>
            <span className="material-symbols-outlined text-[22px]">palette</span>
            <span className="font-label-sm text-label-sm mt-0.5">Estilos</span>
          </button>
          <button onClick={() => setView('logistica')} className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all ${view === 'logistica' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}>
            <span className="material-symbols-outlined text-[22px]">inventory_2</span>
            <span className="font-label-sm text-label-sm mt-0.5">Logística</span>
          </button>
          <button onClick={() => setView('ajustes')} className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all ${view === 'ajustes' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}>
            <span className="material-symbols-outlined text-[22px]">settings</span>
            <span className="font-label-sm text-label-sm mt-0.5">Ajustes</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
