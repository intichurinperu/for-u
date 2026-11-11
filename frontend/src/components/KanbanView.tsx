import { ButtonSecondary as DSButtonSecondary } from './ui/DesignSystem';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import FloatingReward, { type FloatingRewardBurst } from './FloatingReward';
import { baseBranches, type ForUTaskStatus, type ForUProjectNode, useActiveProjectsStore } from '../stores/useActiveProjectsStore';

type KanbanViewProps = {
  includeAllProjectsDefault?: boolean;
};

const columns: Array<{ key: ForUTaskStatus; title: string }> = [
  { key: 'todo', title: 'Por hacer' },
  { key: 'doing', title: 'En proceso' },
  { key: 'done', title: 'Hecho' },
];

const DUST_THRESHOLD_MS = 48 * 60 * 60 * 1000;

function isDustyNode(node: ForUProjectNode) {
  if (node.locked || node.completedAt || node.taskStatus === 'done') return false;
  const lastActiveTime = new Date(node.lastActiveDate).getTime();
  return Number.isFinite(lastActiveTime) && lastActiveTime < Date.now() - DUST_THRESHOLD_MS;
}

export default function KanbanView({ includeAllProjectsDefault = false }: KanbanViewProps) {
  const [includeAllProjects, setIncludeAllProjects] = useState(includeAllProjectsDefault);
  const [rewardBurst, setRewardBurst] = useState<FloatingRewardBurst | null>(null);
  const [completingCardKey, setCompletingCardKey] = useState<string | null>(null);
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const activeProjectIds = useActiveProjectsStore((state) => state.activeProjectIds);
  const projectsById = useActiveProjectsStore((state) => state.projectsById);
  const updateNode = useActiveProjectsStore((state) => state.updateNode);
  const selectNode = useActiveProjectsStore((state) => state.selectNode);
  const addCoins = useActiveProjectsStore((state) => state.addCoins);
  const openIdeaJar = useActiveProjectsStore((state) => state.openIdeaJar);
  const addFreeNodeToBranch = useActiveProjectsStore((state) => state.addFreeNodeToBranch);
  const activeProject = activeProjectId ? projectsById[activeProjectId] : null;

  const cards = useMemo(() => {
    const projectIds = includeAllProjects ? activeProjectIds : activeProjectId ? [activeProjectId] : [];

    return projectIds.flatMap((projectId) => {
      const project = projectsById[projectId];
      if (!project) return [];

      return project.nodes
        .filter((node) => node.role === 'free')
        .map((node) => ({ projectId, projectName: project.name, node }));
    });
  }, [activeProjectId, activeProjectIds, includeAllProjects, projectsById]);

  function showRewardBurst(x: number, y: number, coins = 20, xp = 0) {
    setRewardBurst({ id: `${Date.now()}-${Math.random()}`, x, y, coins, xp });
    window.setTimeout(() => setRewardBurst(null), 1600);
  }

  function moveCard(projectId: string, node: ForUProjectNode, status: ForUTaskStatus, point?: { x: number; y: number }) {
    const wasCompleted = Boolean(node.completedAt || node.taskStatus === 'done');
    const wasDusty = isDustyNode(node);
    const coinReward = status === 'done' && !wasCompleted ? (wasDusty ? 60 : 20) : 0;
    updateNode(projectId, node.id, {
      taskStatus: status,
      completedAt: status === 'done' ? new Date().toISOString() : undefined,
      rewardCoins: coinReward ? (node.rewardCoins ?? 0) + coinReward : node.rewardCoins,
    });

    if (status === 'done' && !wasCompleted && point) {
      addCoins(coinReward);
      setCompletingCardKey(`${projectId}-${node.id}`);
      showRewardBurst(point.x, point.y, coinReward, 0);
      if (wasDusty) toast.success('¡Limpieza Profunda! +40 monedas extra');
      window.setTimeout(() => setCompletingCardKey(null), 900);
    }
  }

  function createFirstKanbanTask() {
    if (!activeProjectId) return;

    addFreeNodeToBranch(activeProjectId, 'actions', {
      title: 'Mi primera tarea',
      kind: 'task',
      icon: '✅',
      priority: 'low',
      x: 690,
      y: 250,
    });
    toast.success('Primera tarea creada');
  }

  return (
    <section className="foru-kanban-view" aria-label="Vista Kanban">
      <header className="foru-view-header">
        <div>
          <span>{activeProject?.name ?? 'Proyecto'}</span>
          <h1>Aquí tienes todas tus tareas.</h1>
          <p>Sin juicio: solo vemos qué está por hacer, qué está andando y qué ya salió.</p>
        </div>
        <div className="foru-view-header-actions">
          <DSButtonSecondary type="button" onClick={() => setIncludeAllProjects((current) => !current)}>
            {includeAllProjects ? 'Ver solo este proyecto' : 'Ver todos'}
          </DSButtonSecondary>
        </div>
      </header>

      {cards.length === 0 ? (
        <section className="foru-kanban-empty-guide">
          <span>📋</span>
          <h2>Tu tablero está listo, solo faltan tareas.</h2>
          <p>Empieza con una acción pequeña o lanza ideas al frasco para que For U las organice contigo.</p>
          <div>
            <DSButtonSecondary type="button" onClick={createFirstKanbanTask}>Agregar tarea manualmente</DSButtonSecondary>
            <DSButtonSecondary type="button" onClick={openIdeaJar}>✨ Echar ideas al frasco</DSButtonSecondary>
          </div>
        </section>
      ) : null}

      {cards.length > 0 ? <div className="foru-kanban-columns">
        {columns.map((column) => {
          const columnCards = cards.filter(({ node }) => getNodeStatus(node) === column.key);

          return (
            <section
              key={column.key}
              className="foru-kanban-column"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                const payload = event.dataTransfer.getData('application/foru-node');
                if (!payload) return;
                const parsed = JSON.parse(payload) as { projectId: string; nodeId: string };
                const project = projectsById[parsed.projectId];
                const node = project?.nodes.find((item) => item.id === parsed.nodeId);
                if (node) moveCard(parsed.projectId, node, column.key, { x: event.clientX, y: event.clientY });
              }}
            >
              <header>
                <h2>{column.title}</h2>
                <span>{columnCards.length}</span>
              </header>

              <div className="foru-kanban-cards">
                {columnCards.map(({ projectId, projectName, node }) => {
                  const branch = baseBranches.find((item) => item.key === node.branchKey);
                  const isDusty = isDustyNode(node);

                  return (
                    <article
                      key={`${projectId}-${node.id}`}
                      className={`foru-kanban-card is-${node.priority ?? 'low'} ${isDusty ? 'is-dusty-card' : ''} ${completingCardKey === `${projectId}-${node.id}` ? 'is-disintegrating' : ''}`}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData('application/foru-node', JSON.stringify({ projectId, nodeId: node.id }));
                      }}
                      onClick={() => selectNode(node.id)}
                    >
                      <div>
                        <strong>{node.title}</strong>
                        <small>{estimateNodeMinutes(node)} min · {includeAllProjects ? projectName : branch?.title ?? 'Proyecto'}</small>
                      </div>
                      <span>{priorityLabel[node.priority ?? 'low']}</span>
                      {isDusty ? <span className="foru-dusty-card-badge">Polvo</span> : null}
                      <em>{branch?.icon ?? '•'} {branch?.title ?? 'Sin rama'}</em>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div> : null}
      <FloatingReward burst={rewardBurst} />
    </section>
  );
}

function getNodeStatus(node: ForUProjectNode): ForUTaskStatus {
  if (node.taskStatus) return node.taskStatus;
  if (node.completedAt) return 'done';
  return 'todo';
}

const priorityLabel = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

function estimateNodeMinutes(node: ForUProjectNode) {
  if (node.subtasks?.length) return 15;
  if (node.priority === 'high') return 15;
  if (node.title.length > 72) return 20;
  return 10;
}
