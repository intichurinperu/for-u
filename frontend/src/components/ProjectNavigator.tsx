import { ButtonSecondary as DSButtonSecondary } from './ui/DesignSystem';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useActiveProjectsStore } from '../stores/useActiveProjectsStore';

type ProjectNavigatorProps = {
  onOpenProject: (projectId: string) => void;
  onOpenDashboard: () => void;
};

export default function ProjectNavigator({ onOpenProject, onOpenDashboard }: ProjectNavigatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const activeProjectIds = useActiveProjectsStore((state) => state.activeProjectIds);
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const projectsById = useActiveProjectsStore((state) => state.projectsById);
  const openProject = useActiveProjectsStore((state) => state.openProject);

  const projects = useMemo(() => {
    return activeProjectIds.map((projectId) => projectsById[projectId]).filter(Boolean);
  }, [activeProjectIds, projectsById]);
  const activeProject = activeProjectId ? projectsById[activeProjectId] : null;

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        setIsOpen((current) => !current);
      }
    }

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  function createProject() {
    const name = window.prompt('Nombre del nuevo proyecto', `Proyecto ${projects.length + 1}`);
    if (!name) return;

    const projectId = openProject({ name });
    setIsOpen(false);
    onOpenProject(projectId);
  }

  return (
    <div className="foru-project-navigator">
      <DSButtonSecondary type="button" onClick={() => setIsOpen((current) => !current)}>
        📁 {activeProject?.name ?? 'Mis Proyectos'}
      </DSButtonSecondary>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className="foru-project-navigator-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16 }}
          >
            <DSButtonSecondary
              type="button"
              className="foru-project-navigator-dashboard"
              onClick={() => {
                setIsOpen(false);
                onOpenDashboard();
              }}
            >
              Ver todos los proyectos
            </DSButtonSecondary>
            {projects.map((project) => (
              <DSButtonSecondary
                key={project.id}
                type="button"
                className={project.id === activeProjectId ? 'is-active' : ''}
                onClick={() => {
                  setIsOpen(false);
                  onOpenProject(project.id);
                }}
              >
                <span>{project.name}</span>
                <small>{project.status}</small>
              </DSButtonSecondary>
            ))}
            <DSButtonSecondary type="button" className="foru-project-navigator-new" onClick={createProject}>
              + Nuevo Proyecto
            </DSButtonSecondary>
            <p>Atajo: Cmd+Shift+P</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
