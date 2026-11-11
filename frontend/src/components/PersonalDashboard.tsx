import { getBusinessTemplate } from '../data/templates';
import { motion } from 'framer-motion';
import {
  type ForUActiveProject,
  useActiveProjectsStore,
} from '../stores/useActiveProjectsStore';
import MagicBadge from './ui/MagicBadge';
import MagicButton from './ui/MagicButton';
import MagicCard from './ui/MagicCard';

type PersonalDashboardItem = {
  project: ForUActiveProject;
  pendingCount: number;
};

type PersonalDashboardProps = {
  name?: string;
  planLabel: string;
  projects: PersonalDashboardItem[];
  onViewProject: (projectId: string) => void;
  onCreateIndustryProject: () => void;
};

export default function PersonalDashboard({
  name = 'emprendedora',
  projects,
  onViewProject,
  onCreateIndustryProject,
}: PersonalDashboardProps) {
  const getCurrentDigitalRouteStep = useActiveProjectsStore((state) => state.getCurrentDigitalRouteStep);
  const getDigitalRouteSteps = useActiveProjectsStore((state) => state.getDigitalRouteSteps);
  const featuredProject = projects[0] ?? null;

  return (
    <section className="foru-personal-dashboard" aria-label="Tablero de Control Personal">
      <motion.div
        className="foru-personal-dashboard-hero"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
      >
        <div>
          <h1>{name}, sigamos tu Ruta Digital</h1>
          <p>Tu próxima estación te espera.</p>
        </div>
      </motion.div>

      {featuredProject ? (
        <MagicCard as="section" className="foru-next-route-card">
          <div>
            <MagicBadge>Acción principal</MagicBadge>
            <h2>{featuredProject.project.name}</h2>
            <p>{getRouteCardTitle(featuredProject.project.id, getCurrentDigitalRouteStep)}</p>
            <small>{getRouteCardSubtitle(featuredProject.project.id, getDigitalRouteSteps)}</small>
          </div>
          <MagicButton type="button" onClick={() => onViewProject(featuredProject.project.id)}>
            Continuar ruta
          </MagicButton>
        </MagicCard>
      ) : null}

      <div className="foru-personal-project-list" aria-label="Proyectos">
        {projects.slice(1).map(({ project, pendingCount }, index) => (
          <MagicCard
            as="article"
            key={project.id}
            className={pendingCount > 0 ? 'foru-personal-project-card has-pending' : 'foru-personal-project-card'}
          >
            <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: index * 0.04 }}
          >
            <div className="foru-personal-project-main">
              <div>
                <span className="foru-personal-project-status">{pendingCount > 0 ? `${pendingCount} acciones` : 'Sin pendientes'}</span>
                <h2>{project.name}</h2>
                <p>{project.industryKey ? getIndustryLabel(project.industryKey) : 'Ruta digital'}</p>
              </div>
            </div>

            <div className="foru-personal-project-actions">
              <MagicButton type="button" variant="soft" onClick={() => onViewProject(project.id)}>
                Ver ruta
              </MagicButton>
            </div>
            </motion.div>
          </MagicCard>
        ))}
      </div>

      <MagicCard as="section" className="foru-industry-starter-card">
        <div>
          <h2>Crear otra Ruta Digital</h2>
          <p>Elige un rubro y For U prepara oferta, landing, WhatsApp, contenido, Google y métricas.</p>
        </div>
        <MagicButton type="button" variant="soft" onClick={onCreateIndustryProject}>
          Elegir rubro
        </MagicButton>
      </MagicCard>
    </section>
  );
}

function getIndustryLabel(industryKey: NonNullable<ForUActiveProject['industryKey']>) {
  const template = getBusinessTemplate(industryKey);
  if (template) return template.name;
  return 'Turismo';
}

function getRouteCardTitle(
  projectId: string,
  getCurrentDigitalRouteStep: ReturnType<typeof useActiveProjectsStore.getState>['getCurrentDigitalRouteStep'],
) {
  const step = getCurrentDigitalRouteStep(projectId);
  return step ? `Siguiente estación: ${step.title}` : 'Crear Ruta Digital';
}

function getRouteCardSubtitle(
  projectId: string,
  getDigitalRouteSteps: ReturnType<typeof useActiveProjectsStore.getState>['getDigitalRouteSteps'],
) {
  const steps = getDigitalRouteSteps(projectId);
  if (steps.length === 0) return 'For U preparará el primer paso.';
  const ready = steps.filter((step) => step.status === 'ready').length;
  return `${ready}/${steps.length} estaciones listas.`;
}
