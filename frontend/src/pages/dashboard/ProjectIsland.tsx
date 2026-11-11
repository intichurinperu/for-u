import { Link, useSearchParams } from 'react-router-dom';
import PearlButton from '../../components/ui/PearlButton';
import { projectRouteType } from '../../experience/GuidedProject';
import type { ModuleType } from '../../modules/moduleProjects';
import type { ForUActiveProject } from '../../stores/useActiveProjectsStore';
import { projectViewPath } from '../../workspace/navigation';
import ProjectIslandArea from './ProjectIslandArea';
import { areaDefinitions } from './areaModel';
import './projectIsland.css';

export default function ProjectIsland({ project, type }: { project: ForUActiveProject; type: ModuleType }) {
  const [params] = useSearchParams();
  const area = areaDefinitions.find(item => item.id === params.get('area'));
  const route = projectRouteType(project);
  const query = new URLSearchParams({ project: project.id });
  const island = `/dashboard?${query}&view=island`;
  const fromIsland = '&return=island';
  if (area) return <ProjectIslandArea projectId={project.id} type={type} route={route} area={area} />;

  return <section className="project-island" aria-labelledby="island-title">
    <header className="island-heading">
      <p>{project.name}</p>
      <h1 id="island-title">Mi isla</h1>
      <p>Elige el área en la que quieres avanzar.</p>
    </header>
    <div className="island-map-art">
      <img src="/brand/foru-workspace-archipelago.jpg" alt="" />
      <nav aria-label="Áreas de mi isla">
        {areaDefinitions.map(item => <PearlButton compact key={item.id} className={`island-pin island-pin-${item.id}`} to={`${island}&area=${item.id}`}>{item.title}</PearlButton>)}
      </nav>
    </div>
    <nav className="island-view-links" aria-label="Organización del proyecto">
      <Link to={projectViewPath(project.id, 'map') + fromIsland}>Mapa de trabajo</Link>
      <Link to={projectViewPath(project.id, 'kanban') + fromIsland}>Kanban</Link>
      <Link to={projectViewPath(project.id, 'calendar') + fromIsland}>Calendario</Link>
    </nav>
  </section>;
}
