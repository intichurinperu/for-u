import { ButtonSecondary as DSButtonSecondary, Textarea as DSTextarea } from './ui/DesignSystem';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, FileText, Mic2, Sparkles, X } from '../lib/icons';
import { processRawNotes, type AiNodeType } from '../services/aiProcessor';
import { type ForUNodeKind, type ForURawNoteKind, type ForURouteStep, useActiveProjectsStore } from '../stores/useActiveProjectsStore';
import { useRewardBurst } from '../hooks/useRewardBurst';

const noteModes: Array<{ kind: ForURawNoteKind; label: string; icon: typeof FileText }> = [
  { kind: 'text', label: 'Texto', icon: FileText },
  { kind: 'audio', label: 'Audio', icon: Mic2 },
  { kind: 'photo', label: 'Foto', icon: Camera },
];

type IdeaJarFabProps = {
  centered?: boolean;
  hiddenLauncher?: boolean;
  title?: string;
  description?: string;
};

export default function IdeaJarFab({ centered = false, hiddenLauncher = false, title = 'Captura primero', description = 'Suelta ideas desordenadas. For U las ordena después contigo.' }: IdeaJarFabProps) {
  const [kind, setKind] = useState<ForURawNoteKind>('text');
  const [content, setContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState('');
  const [routeSummary, setRouteSummary] = useState<ForURouteStep[]>([]);
  const isJarOpen = useActiveProjectsStore((state) => state.isJarOpen);
  const rawNotes = useActiveProjectsStore((state) => state.rawNotes);
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const projectsById = useActiveProjectsStore((state) => state.projectsById);
  const openIdeaJar = useActiveProjectsStore((state) => state.openIdeaJar);
  const closeIdeaJar = useActiveProjectsStore((state) => state.closeIdeaJar);
  const addRawNote = useActiveProjectsStore((state) => state.addRawNote);
  const addFreeNodesToBranches = useActiveProjectsStore((state) => state.addFreeNodesToBranches);
  const setDigitalRoute = useActiveProjectsStore((state) => state.setDigitalRoute);
  const setView = useActiveProjectsStore((state) => state.setView);
  const selectNode = useActiveProjectsStore((state) => state.selectNode);
  const clearRawNotes = useActiveProjectsStore((state) => state.clearRawNotes);
  const reward = useRewardBurst();

  const activeProject = activeProjectId ? projectsById[activeProjectId] : null;

  function saveNote() {
    addRawNote({
      kind,
      content: content || placeholderByKind[kind],
    });
    setContent('');
    setKind('text');
    reward.trigger('ideaCaptured');
  }

  async function organizeWithAi() {
    if (!activeProjectId || !activeProject || rawNotes.length === 0 || isProcessing) return;

    setIsProcessing(true);

    try {
      const response = await processRawNotes(rawNotes.map((note) => note.content), activeProject.name);

      const createdNodeIds = addFreeNodesToBranches(
        activeProjectId,
        response.nodos.map((node) => ({
          title: node.label,
          kind: mapAiTypeToNodeKind(node.type),
          icon: iconByAiType[node.type],
          branchKey: node.branchKey,
          description: node.description,
          priority: node.priority,
          subtasks: node.subtasks,
          reasoning: node.reasoning,
          x: node.position.x,
          y: node.position.y,
        })),
      );
      const tempToRealNodeId = new Map(response.nodos.map((node, index) => [node.id, createdNodeIds[index]]));
      const route: ForURouteStep[] = response.digitalRoute
        .map((step) => {
          const linkedNodeId = tempToRealNodeId.get(step.linkedNodeId);
          if (!linkedNodeId) return null;

          return {
            ...step,
            linkedNodeId,
          };
        })
        .filter((step): step is ForURouteStep => Boolean(step));

      if (route.length > 0) {
        setDigitalRoute(activeProjectId, route);
        setRouteSummary(route);
      }

      clearRawNotes();
      closeIdeaJar();
      showToast(createdNodeIds.length > 0
        ? response.mensaje
        : '⚓ La guía local organizó ideas, pero no encontró una rama válida para ubicarlas.');
    } catch {
      showToast('🌊 La marea se movió raro. Intenta organizar tus ideas otra vez.');
    } finally {
      setIsProcessing(false);
    }
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 4200);
  }

  function startRoute() {
    const firstStep = routeSummary[0];
    if (firstStep) selectNode(firstStep.linkedNodeId);
    setView('kanban');
    setRouteSummary([]);
  }

  return (
    <>
      {hiddenLauncher ? null : centered ? (
        <section className="foru-centered-idea-jar">
          <div className="foru-centered-idea-jar-orb">
            <Sparkles size={34} />
          </div>
          <h2>{title}</h2>
          <p>{description}</p>
          {rawNotes.length > 0 ? <strong>{rawNotes.length === 1 ? 'Tienes 1 idea lista para organizar ✨' : `Tienes ${rawNotes.length} ideas listas para organizar ✨`}</strong> : null}
          <DSButtonSecondary type="button" onClick={openIdeaJar}>
            {rawNotes.length > 0 ? '✨ Organizar con guía local' : '✨ Echar ideas al frasco'}
          </DSButtonSecondary>
        </section>
      ) : (
        <motion.button
          type="button"
          className="foru-idea-jar-fab"
          onClick={openIdeaJar}
          whileHover={{ y: -4, scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          aria-label="Abrir Frasco de Ideas"
        >
          <Sparkles size={26} />
          <span>{rawNotes.length}</span>
          <small>Frasco</small>
        </motion.button>
      )}

      <AnimatePresence>
        {isJarOpen && (
          <motion.div
            className="foru-idea-jar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.section
              className="foru-idea-jar-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="idea-jar-title"
              initial={{ opacity: 0, y: 36, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
              <header className="foru-idea-jar-header">
                <div>
                  <span className="foru-step-kicker">Brain dump</span>
                  <h2 id="idea-jar-title">Frasco de Ideas</h2>
                </div>
                <DSButtonSecondary type="button" onClick={closeIdeaJar} aria-label="Cerrar Frasco de Ideas">
                  <X size={18} />
                </DSButtonSecondary>
              </header>

              <div className="foru-idea-jar-modes" aria-label="Tipo de captura">
                {noteModes.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <DSButtonSecondary
                      key={mode.kind}
                      type="button"
                      className={kind === mode.kind ? 'is-active' : ''}
                      onClick={() => setKind(mode.kind)}
                    >
                      <Icon size={17} />
                      {mode.label}
                    </DSButtonSecondary>
                  );
                })}
              </div>

              <DSTextarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={placeholderByKind[kind]}
              />

              <div className="foru-idea-jar-footer">
                <p>Se guarda como nota cruda. No tienes que ordenarla ahora.</p>
                <DSButtonSecondary type="button" className="foru-primary-action" onClick={saveNote}>
                  Guardar en el frasco
                </DSButtonSecondary>
              </div>

              <DSButtonSecondary
                type="button"
                className="foru-ai-action"
                onClick={organizeWithAi}
                disabled={rawNotes.length === 0 || isProcessing || !activeProjectId}
              >
                {isProcessing ? 'Organizando tus ideas…' : '✨ Ordenar mis ideas · guía local'}
              </DSButtonSecondary>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="foru-ai-toast"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {routeSummary.length > 0 ? (
          <motion.div
            className="foru-route-ready-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.section
              className="foru-route-ready-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="route-ready-title"
              initial={{ opacity: 0, y: 34, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <span className="foru-route-ready-orb">✨</span>
              <h2 id="route-ready-title">¡🎉 Tu Ruta Digital está lista!</h2>
              <p>For U convirtió tus ideas en un camino concreto. Ahora solo necesitas seguir la primera estación.</p>
              <div className="foru-route-ready-steps">
                {routeSummary.map((step, index) => (
                  <article key={step.id}>
                    <span>{index + 1}</span>
                    <strong>{step.title}</strong>
                  </article>
                ))}
              </div>
              <DSButtonSecondary type="button" onClick={startRoute}>
                🚀 Empezar mi Ruta
              </DSButtonSecondary>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function mapAiTypeToNodeKind(type: AiNodeType): ForUNodeKind {
  if (type === 'Acción') return 'task';
  if (type === 'Recurso') return 'resource';

  return 'idea';
}

const iconByAiType: Record<AiNodeType, string> = {
  Idea: '💡',
  Acción: '✅',
  Recurso: '🔗',
};

const placeholderByKind: Record<ForURawNoteKind, string> = {
  text: 'Escribe la idea tal como salga...',
  audio: 'Audio pendiente de grabacion: deja una nota breve para simular la captura.',
  photo: 'Foto pendiente de subida: describe lo que quieres recordar.',
};
