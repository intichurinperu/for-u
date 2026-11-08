import { useState } from 'react';
import { CalendarDays, Check, Circle, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import PizarraAgent from '../../components/PizarraAgent';
import PearlButton from '../../components/ui/PearlButton';
import { useAuth } from '../../contexts/AuthContext';
import { routeNames } from '../../experience/GuidedProject';
import { usePrivateDocument } from '../../experience/usePrivateDocument';
import { emptyProposal, nativeOffers, offerPrice, parseProposal, type Offer } from '../../proposal/model';
import type { ModuleType } from '../../modules/moduleProjects';
import type { BusinessRoute } from '../../workspace/contracts';
import { destinationPath, type ProjectDestination } from '../../workspace/navigation';
import { useAreaDocuments } from './AreaDocuments';
import AreaPanel from './AreaPanel';
import type { areaDefinitions } from './areaModel';
import { islandAreaContent } from './islandAreaContent';

type Props = {
  projectId: string;
  type: ModuleType;
  route: BusinessRoute;
  area: typeof areaDefinitions[number];
};

export default function ProjectIslandArea({ projectId, type, route, area }: Props) {
  const { user } = useAuth();
  const { entry } = useAreaDocuments(projectId, type);
  const [showTasks, setShowTasks] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const { title, description, primary, links } = islandAreaContent[route][area.id];
  const operations = area.id === 'operations';
  const tasks = entry?.taskRevision && !entry.error
    ? entry.tasks.tasks.filter(task => task.area === area.id).sort((a, b) => Number(a.done) - Number(b.done)).slice(0, 3)
    : [];

  function to(action: ProjectDestination) {
    return destinationPath(projectId, {
      path: action.path,
      params: { ...action.params, return: 'island', [action.path === '/dashboard' ? 'from' : 'area']: area.id },
    });
  }

  return <section className={`project-island island-area island-area-${area.id}`} aria-labelledby="island-title">
    <header className="island-heading">
      <span className="island-rubro">{route === 'courses' ? 'Clases y cursos' : routeNames[route]}</span>
      <h1 id="island-title">{area.title}</h1>
    </header>
    <div className="island-area-card">
      <div className="island-area-art">
        <img src={`/brand/island-areas/${route}-${area.id}.jpg`} alt="" width={374} height={300} />
      </div>
      <div className="island-area-content">
        <h2>{title}</h2>
        <p>{description}</p>
        {user && (area.id === 'marketing' || area.id === 'finance') &&
          <IslandOfferPreview userId={user.id} projectId={projectId} type={type} showPrices={area.id === 'finance'} />}
        {operations && !showTasks && tasks.length > 0 && <ul className="island-task-preview" aria-label="Tareas de operaciones">
          {tasks.map(task => <li key={task.id}>
            {task.done ? <Check size={16} aria-hidden="true" /> : <Circle size={16} aria-hidden="true" />}
            <span>{task.title}</span><small>{task.done ? 'Hecha' : 'Pendiente'}</small>
          </li>)}
        </ul>}
        <div className="island-area-actions">
          {primary && <PearlButton to={to(primary)}>{primary.label}</PearlButton>}
          <PearlButton compact={Boolean(primary)} tone={primary ? 'neutral' : undefined} aria-expanded={showTasks} aria-controls="island-area-tasks" onClick={() => setShowTasks(open => !open)}>
            {showTasks ? 'Ocultar tareas' : 'Ver tareas'}
          </PearlButton>
        </div>
        {(links || operations) && <nav className="island-area-links" aria-label={`Más opciones de ${area.title}`}>
          {links?.map(link => <Link key={link.label} to={to(link)}>
            {link.path === '/dashboard' ? <CalendarDays size={16} aria-hidden="true" /> : <ClipboardList size={16} aria-hidden="true" />}
            {link.label}
          </Link>)}
          {operations && <button type="button" onClick={() => setAssistantOpen(true)}>Hablar con FOR U</button>}
        </nav>}
      </div>
    </div>
    {assistantOpen && <PizarraAgent area="operaciones" userName={user?.user_metadata?.display_name || 'qué bueno verte'} isOpen onClose={() => setAssistantOpen(false)} />}
    <div id="island-area-tasks" hidden={!showTasks}>
      {showTasks && <AreaPanel projectId={projectId} type={type} area={area.id} showHeading={false} />}
    </div>
  </section>;
}

function IslandOfferPreview({ userId, projectId, type, showPrices }: {
  userId: string;
  projectId: string;
  type: ModuleType;
  showPrices: boolean;
}) {
  const proposal = usePrivateDocument(userId, projectId, 'proposal', emptyProposal, parseProposal);
  const catalog = usePrivateDocument(userId, projectId, type, () => null, value => value);
  if (proposal.error || catalog.error) return <p className="island-offer-state">No pudimos cargar tus ofertas aquí. Puedes revisarlas en su herramienta.</p>;
  if (!proposal.loaded || !catalog.loaded) return <p className="island-offer-state" role="status">Cargando ofertas…</p>;

  let native: Offer[];
  try {
    native = nativeOffers(type, catalog.data);
  } catch {
    return <p className="island-offer-state">El catálogo necesita revisión antes de mostrar sus ofertas.</p>;
  }
  const offers = [...proposal.data.offers, ...native].slice(0, 3);
  if (!offers.length) return <p className="island-offer-state">Tus ofertas aparecerán aquí cuando las guardes.</p>;

  return <ul className="island-task-preview" aria-label={showPrices ? 'Precios de tus ofertas' : 'Ofertas del proyecto'}>
    {offers.map(offer => <li key={offer.id}><span>{offer.name}</span>{showPrices && <small>{offerPrice(offer)}</small>}</li>)}
  </ul>;
}
