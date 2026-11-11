import { ButtonSecondary as DSButtonSecondary } from './ui/DesignSystem';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PomodoroTimer from './PomodoroTimer';
import {
  baseBranches,
  type ForUBranchKey,
  type ForUNodePriority,
  type ForUProjectNode,
  useActiveProjectsStore,
} from '../stores/useActiveProjectsStore';

type TaskBoardProps = {
  branchKey: ForUBranchKey;
  onBackToMap: () => void;
};

const priorityRank: Record<ForUNodePriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const priorityIcon: Record<ForUNodePriority, string> = {
  high: '🔴',
  medium: '🟠',
  low: '🟢',
};

export default function TaskBoard({ branchKey, onBackToMap }: TaskBoardProps) {
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const projectsById = useActiveProjectsStore((state) => state.projectsById);
  const updateNode = useActiveProjectsStore((state) => state.updateNode);
  const selectNode = useActiveProjectsStore((state) => state.selectNode);
  const activeProject = activeProjectId ? projectsById[activeProjectId] : null;
  const branch = baseBranches.find((item) => item.key === branchKey) ?? baseBranches[0];

  const tasks = useMemo(() => {
    return (activeProject?.nodes ?? [])
      .filter((node) => node.role === 'free' && node.branchKey === branchKey)
      .sort((a, b) => priorityRank[a.priority ?? 'low'] - priorityRank[b.priority ?? 'low']);
  }, [activeProject?.nodes, branchKey]);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(tasks[0]?.id ?? null);
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? tasks[0] ?? null;

  function completeSelectedTask() {
    if (!activeProjectId || !selectedTask) return;

    updateNode(activeProjectId, selectedTask.id, {
      completedAt: new Date().toISOString(),
      rewardCoins: (selectedTask.rewardCoins ?? 0) + 10,
    });
    toast.success('¡BINGO! +10 monedas');
  }

  return (
    <motion.section
      className="foru-task-board"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      aria-label={`Tablero de enfoque de ${branch.title}`}
    >
      <header className="foru-task-board-header">
        <div>
          <span className="foru-task-board-kicker">Modo Enfoque</span>
          <h1>{branch.icon} {branch.title}</h1>
          <p>{tasks.length} tareas de esta rama, ordenadas por prioridad.</p>
        </div>
        <DSButtonSecondary type="button" onClick={onBackToMap}>Volver al Mapa</DSButtonSecondary>
      </header>

      <div className="foru-task-board-grid">
        <section className="foru-task-list" aria-label="Tareas pendientes">
          <div className="foru-task-section-title">
            <span>Lista de tareas pendientes</span>
            <strong>{tasks.filter((task) => !task.completedAt).length}</strong>
          </div>

          <div className="foru-task-items">
            {tasks.length ? tasks.map((task) => (
              <DSButtonSecondary
                key={task.id}
                type="button"
                className={`${selectedTask?.id === task.id ? 'is-selected' : ''} ${task.completedAt ? 'is-done' : ''}`}
                onClick={() => {
                  setSelectedTaskId(task.id);
                  selectNode(task.id);
                }}
              >
                <span aria-hidden="true">{priorityIcon[task.priority ?? 'low']}</span>
                <div>
                  <strong>{task.title}</strong>
                  <small>{task.completedAt ? `Completada · +${task.rewardCoins ?? 10} monedas` : getPriorityLabel(task.priority)}</small>
                </div>
              </DSButtonSecondary>
            )) : (
              <div className="foru-task-empty">
                <strong>No hay tareas todavía</strong>
                <p>Agrega nodos desde el mapa o procesa notas del Frasco para llenar esta rama.</p>
              </div>
            )}
          </div>
        </section>

        <section className="foru-mini-map" aria-label="Mapa mental mini">
          <div className="foru-task-section-title">
            <span>Mapa mental mini</span>
            <strong>{branch.icon}</strong>
          </div>
          <div className="foru-mini-map-canvas">
            <div className="foru-mini-map-core" style={{ borderColor: branch.color }}>
              {branch.icon} {branch.title}
            </div>
            {tasks.slice(0, 8).map((task, index) => (
              <MiniNode key={task.id} task={task} index={index} isSelected={selectedTask?.id === task.id} />
            ))}
          </div>
        </section>

        <PomodoroTimer taskTitle={selectedTask?.completedAt ? undefined : selectedTask?.title} onComplete={completeSelectedTask} />

        <section className="foru-task-steps" aria-label="Pasos para completar">
          {selectedTask ? (
            <>
              <div className="foru-task-section-title">
                <span>Pasos para completar</span>
                <strong>{selectedTask.icon ?? '✅'}</strong>
              </div>
              <h2>{selectedTask.title}</h2>
              <ol>
                {getSteps(selectedTask).map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <div className="foru-ai-recommendation">
                <span>Recomendación de IA</span>
                <p>{getAiRecommendation(selectedTask, branch.title)}</p>
              </div>
            </>
          ) : (
            <div className="foru-task-empty">
              <strong>Selecciona una tarea</strong>
              <p>Aquí aparecerán pasos pequeños y una recomendación de IA.</p>
            </div>
          )}
        </section>
      </div>
    </motion.section>
  );
}

function MiniNode({ task, index, isSelected }: { task: ForUProjectNode; index: number; isSelected: boolean }) {
  const angle = (Math.PI * 2 * index) / 8 - Math.PI / 2;
  const x = 50 + Math.cos(angle) * 33;
  const y = 50 + Math.sin(angle) * 30;

  return (
    <div
      className={`foru-mini-node ${isSelected ? 'is-selected' : ''} is-${task.priority ?? 'low'}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      title={task.title}
    >
      <span>{task.icon ?? '•'}</span>
    </div>
  );
}

function getPriorityLabel(priority?: ForUNodePriority) {
  if (priority === 'high') return 'Alta prioridad';
  if (priority === 'medium') return 'Prioridad media';
  return 'Baja presión';
}

function getSteps(task: ForUProjectNode) {
  if (task.subtasks?.length) return task.subtasks;

  return [
    'Define el resultado mínimo de esta tarea.',
    'Haz una primera versión de 15 minutos.',
    'Revisa, ajusta y envía o guarda el avance.',
  ];
}

function getAiRecommendation(task: ForUProjectNode, branchTitle: string) {
  if (task.reasoning) return task.reasoning;
  if (task.kind === 'resource') return 'Abre el recurso, rescata una sola idea útil y conviértela en una acción pequeña.';
  if (task.priority === 'high') return `Empieza por una versión simple para ${branchTitle}; lo urgente necesita salida, no perfección.`;
  return `Usa un template liviano de ${branchTitle.toLowerCase()} y trabaja solo el siguiente paso visible.`;
}
