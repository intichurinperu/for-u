import { ButtonSecondary as DSButtonSecondary } from './ui/DesignSystem';
import { useMemo } from 'react';
import { type ForUActiveProject, useActiveProjectsStore } from '../stores/useActiveProjectsStore';
import MagicBadge from './ui/MagicBadge';
import MagicButton from './ui/MagicButton';
import MagicCard from './ui/MagicCard';

type World3DProps = {
  onBackToMap: () => void;
  onOpenProject: (projectId: string) => void;
};

type ProjectMetrics = {
  pending: number;
  completed: number;
  progress: number;
};

export default function World3D({ onBackToMap, onOpenProject }: World3DProps) {
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const activeProjectIds = useActiveProjectsStore((state) => state.activeProjectIds);
  const projectsById = useActiveProjectsStore((state) => state.projectsById);
  const switchProject = useActiveProjectsStore((state) => state.switchProject);

  const projects = useMemo(
    () => activeProjectIds
      .map((projectId) => projectsById[projectId])
      .filter((project): project is ForUActiveProject => Boolean(project) && project.status === 'active'),
    [activeProjectIds, projectsById],
  );

  function enterProject(projectId: string) {
    switchProject(projectId);
    onOpenProject(projectId);
  }

  return (
    <section className="foru-world3d-shell foru-world-lite-shell" aria-label="Mi Mundo de proyectos">
      <div className="foru-world-house-ui">
        <DSButtonSecondary type="button" onClick={onBackToMap}>← Volver al tablero</DSButtonSecondary>
        <span className="foru-world-lite-status">Vista ligera activa</span>
      </div>

      <div className="foru-world-lite-ocean" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="foru-world-lite-content">
        <div className="foru-world-lite-heading">
          <MagicBadge>Mi Mundo</MagicBadge>
          <h2>Tus proyectos como islas</h2>
          <p>
            Esta vista liviana mantiene el archipielago funcionando mientras estabilizamos el 3D pesado en produccion.
          </p>
        </div>

        {projects.length ? (
          <div className="foru-world-lite-grid">
            {projects.map((project, index) => (
              <ProjectIsland
                key={project.id}
                project={project}
                index={index}
                isActive={project.id === activeProjectId}
                onEnter={() => enterProject(project.id)}
              />
            ))}
          </div>
        ) : (
          <MagicCard className="foru-world-lite-empty">
            <span>🏝️</span>
            <h3>Aun no hay islas</h3>
            <p>Crea tu primer proyecto desde el tablero y aparecera aqui.</p>
            <MagicButton variant="soft" onClick={onBackToMap}>Volver al tablero</MagicButton>
          </MagicCard>
        )}
      </div>
    </section>
  );
}

function ProjectIsland({
  project,
  index,
  isActive,
  onEnter,
}: {
  project: ForUActiveProject;
  index: number;
  isActive: boolean;
  onEnter: () => void;
}) {
  const metrics = getProjectMetrics(project);
  const branches = getBranchCounts(project);

  return (
    <MagicCard
      className={`foru-world-lite-island ${isActive ? 'is-active' : ''}`}
      style={{ animationDelay: `${Math.min(index * 90, 540)}ms` }}
    >
      <div className="foru-world-lite-island-art" aria-hidden="true">
        <span className="foru-world-lite-land" />
        <span className="foru-world-lite-house" />
        <span className="foru-world-lite-tree one" />
        <span className="foru-world-lite-tree two" />
        <span className="foru-world-lite-pearl one" />
        <span className="foru-world-lite-pearl two" />
      </div>

      <div className="foru-world-lite-island-body">
        <div>
          <MagicBadge>{isActive ? 'Isla actual' : 'Proyecto activo'}</MagicBadge>
          <h3>{project.name}</h3>
          <p>{metrics.completed}/{metrics.pending + metrics.completed} acciones completadas</p>
        </div>

        <div className="foru-world-lite-progress" aria-label={`${metrics.progress}% completado`}>
          <span style={{ width: `${metrics.progress}%` }} />
        </div>

        <div className="foru-world-lite-branches" aria-label="Areas del proyecto">
          {branches.map((branch) => (
            <span key={branch.key} title={branch.label}>
              {branch.icon} {branch.count}
            </span>
          ))}
        </div>

        <MagicButton onClick={onEnter}>Entrar al proyecto</MagicButton>
      </div>
    </MagicCard>
  );
}

function getProjectMetrics(project: ForUActiveProject): ProjectMetrics {
  const actionNodes = project.nodes.filter((node) => node.role === 'free');
  const completed = actionNodes.filter((node) => node.completedAt || node.taskStatus === 'done').length;
  const pending = Math.max(actionNodes.length - completed, 0);
  const progress = actionNodes.length ? Math.round((completed / actionNodes.length) * 100) : 0;

  return { pending, completed, progress };
}

function getBranchCounts(project: ForUActiveProject) {
  const branches = [
    { key: 'ideas', icon: '💡', label: 'Ideas' },
    { key: 'actions', icon: '✅', label: 'Acciones' },
    { key: 'finances', icon: '💰', label: 'Finanzas' },
    { key: 'marketing', icon: '📱', label: 'Marketing' },
    { key: 'resources', icon: '📚', label: 'Recursos' },
  ] as const;

  return branches.map((branch) => ({
    ...branch,
    count: project.nodes.filter((node) => node.role === 'free' && node.branchKey === branch.key).length,
  }));
}
