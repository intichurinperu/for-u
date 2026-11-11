import { ButtonSecondary as DSButtonSecondary } from './ui/DesignSystem';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X } from '../lib/icons';
import { useActiveProjectsStore } from '../stores/useActiveProjectsStore';

export default function ProjectTabBar() {
  const activeProjectIds = useActiveProjectsStore((state) => state.activeProjectIds);
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const projectsById = useActiveProjectsStore((state) => state.projectsById);
  const openProject = useActiveProjectsStore((state) => state.openProject);
  const focusProject = useActiveProjectsStore((state) => state.focusProject);
  const closeProject = useActiveProjectsStore((state) => state.closeProject);

  return (
    <nav className="foru-tabbar" aria-label="Proyectos activos">
      <div className="foru-tabbar-scroll">
        <AnimatePresence initial={false}>
          {activeProjectIds.map((projectId) => {
            const project = projectsById[projectId];
            if (!project) return null;

            const isActive = activeProjectId === projectId;
            const completedTasks = project.tasks.filter((task) => task.status === 'done').length;

            return (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className={isActive ? 'foru-project-tab is-active' : 'foru-project-tab'}
              >
                <DSButtonSecondary
                  type="button"
                  className="foru-project-tab-main"
                  onClick={() => focusProject(project.id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="foru-project-tab-title">{project.name}</span>
                  <span className="foru-project-tab-meta">
                    {project.status} · {completedTasks}/{project.tasks.length} microacciones
                  </span>
                </DSButtonSecondary>

                <DSButtonSecondary
                  type="button"
                  className="foru-project-tab-close"
                  onClick={() => closeProject(project.id)}
                  aria-label={`Cerrar ${project.name}`}
                >
                  <X size={14} />
                </DSButtonSecondary>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <DSButtonSecondary
        type="button"
        className="foru-project-tab-add"
        onClick={() => openProject({ name: `Proyecto ${activeProjectIds.length + 1}` })}
      >
        <Plus size={16} />
        Nuevo
      </DSButtonSecondary>
    </nav>
  );
}
