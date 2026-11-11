import { Card as DSCard } from './ui/DesignSystem';
import { ButtonSecondary as DSButtonSecondary } from './ui/DesignSystem';
import { useMemo, useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { baseBranches, type ForUActiveProject, type ForUBranchKey, useActiveProjectsStore } from '../stores/useActiveProjectsStore';

type ProjectDashboardProps = {
  onEnterProject: (projectId: string) => void;
};

type ProjectMetrics = {
  progress: number;
  pendingCount: number;
  completedCount: number;
  coins: number;
  branchCounts: Record<ForUBranchKey, number>;
};

export default function ProjectDashboard({ onEnterProject }: ProjectDashboardProps) {
  const [openMenuProjectId, setOpenMenuProjectId] = useState<string | null>(null);
  const activeProjectIds = useActiveProjectsStore((state) => state.activeProjectIds);
  const projectsById = useActiveProjectsStore((state) => state.projectsById);
  const openProject = useActiveProjectsStore((state) => state.openProject);
  const closeProject = useActiveProjectsStore((state) => state.closeProject);
  const renameProject = useActiveProjectsStore((state) => state.renameProject);
  const updateProjectStatus = useActiveProjectsStore((state) => state.updateProjectStatus);

  const projects = useMemo(() => {
    return activeProjectIds.map((projectId) => projectsById[projectId]).filter(Boolean);
  }, [activeProjectIds, projectsById]);

  function createProject() {
    const name = window.prompt('Nombre del nuevo proyecto', `Proyecto ${projects.length + 1}`);
    if (!name) return;

    const projectId = openProject({ name });
    onEnterProject(projectId);
  }

  function editProject(project: ForUActiveProject) {
    const nextName = window.prompt('Nuevo nombre del proyecto', project.name);
    if (!nextName) return;
    renameProject(project.id, nextName);
    setOpenMenuProjectId(null);
  }

  function deleteProject(project: ForUActiveProject) {
    const confirmed = window.confirm(`¿Eliminar "${project.name}" de tus proyectos activos?`);
    if (!confirmed) return;
    closeProject(project.id);
    setOpenMenuProjectId(null);
  }

  return (
    <motion.section
      className="foru-project-dashboard"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      aria-label="Dashboard de proyectos"
    >
      <header className="foru-project-dashboard-header">
        <div>
          <span>Archipiélago de proyectos</span>
          <h1>Elige dónde quieres aterrizar</h1>
          <p>Todos tus proyectos activos en una sola vista, con sus áreas, pendientes y avance.</p>
        </div>
        <DSButtonSecondary type="button" onClick={createProject}>+ Nuevo Proyecto</DSButtonSecondary>
      </header>

      {projects.length ? (
        <div className="foru-project-grid">
          {projects.map((project, index) => {
            const metrics = getProjectMetrics(project);
            const isMenuOpen = openMenuProjectId === project.id;

            return (
              <DSCard as="article" key={project.id} className="foru-project-card">
                <div className="foru-project-island" aria-hidden="true">
                  <span>{index + 1}</span>
                </div>

                <div className="foru-project-card-top">
                  <div>
                    <span className={`foru-project-status is-${project.status}`}>{getStatusLabel(project.status)}</span>
                    <h2>{project.name}</h2>
                  </div>
                  <div className="foru-project-menu">
                    <DSButtonSecondary
                      type="button"
                      aria-label={`Opciones de ${project.name}`}
                      onClick={() => setOpenMenuProjectId(isMenuOpen ? null : project.id)}
                    >
                      ...
                    </DSButtonSecondary>
                    {isMenuOpen ? (
                      <div>
                        <DSButtonSecondary type="button" onClick={() => editProject(project)}>Renombrar</DSButtonSecondary>
                        <DSButtonSecondary
                          type="button"
                          onClick={() => {
                            updateProjectStatus(project.id, project.status === 'paused' ? 'active' : 'paused');
                            setOpenMenuProjectId(null);
                          }}
                        >
                          {project.status === 'paused' ? 'Activar' : 'Pausar'}
                        </DSButtonSecondary>
                        <DSButtonSecondary type="button" onClick={() => deleteProject(project)}>Eliminar</DSButtonSecondary>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="foru-project-progress">
                  <div>
                    <strong>{metrics.progress}%</strong>
                    <span>progreso</span>
                  </div>
                  <div className="foru-project-progress-bar">
                    <span style={{ width: `${metrics.progress}%` }} />
                  </div>
                </div>

                <div className="foru-project-branches">
                  {baseBranches.map((branch) => (
                    <span key={branch.key} style={{ '--branch-color': branch.color } as CSSProperties}>
                      {branch.icon} {metrics.branchCounts[branch.key]} {branch.title}
                    </span>
                  ))}
                </div>

                <div className="foru-project-card-metrics">
                  <span>{metrics.pendingCount} pendientes</span>
                  <span>{metrics.completedCount} completadas</span>
                  <span>{metrics.coins} monedas</span>
                </div>

                <DSButtonSecondary type="button" className="foru-project-enter" onClick={() => onEnterProject(project.id)}>
                  Entrar
                </DSButtonSecondary>
              </DSCard>
            );
          })}
        </div>
      ) : (
        <div className="foru-project-empty">
          <strong>No hay proyectos activos</strong>
          <p>Crea uno para empezar tu archipiélago.</p>
          <DSButtonSecondary type="button" onClick={createProject}>+ Nuevo Proyecto</DSButtonSecondary>
        </div>
      )}
    </motion.section>
  );
}

function getProjectMetrics(project: ForUActiveProject): ProjectMetrics {
  const freeNodes = project.nodes.filter((node) => node.role === 'free');
  const completedNodes = freeNodes.filter((node) => node.completedAt);
  const pendingNodes = freeNodes.filter((node) => !node.completedAt);
  const branchCounts = Object.fromEntries(baseBranches.map((branch) => [branch.key, 0])) as Record<ForUBranchKey, number>;

  freeNodes.forEach((node) => {
    if (node.branchKey) branchCounts[node.branchKey] += 1;
  });

  return {
    progress: freeNodes.length ? Math.round((completedNodes.length / freeNodes.length) * 100) : 0,
    pendingCount: pendingNodes.length,
    completedCount: completedNodes.length,
    coins: freeNodes.reduce((sum, node) => sum + (node.rewardCoins ?? 0), 0),
    branchCounts,
  };
}

function getStatusLabel(status: ForUActiveProject['status']) {
  if (status === 'paused') return 'Pausado';
  if (status === 'blocked') return 'Bloqueado';
  if (status === 'completed') return 'Completado';
  return 'Activo';
}
