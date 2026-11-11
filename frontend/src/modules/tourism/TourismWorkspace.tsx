import ModuleWorkspace, { type ModuleConfiguration } from '../ModuleWorkspace';
import TourismDashboard from './TourismDashboard';
import TourismEditor from './TourismEditor';
import TourismPublishing from './TourismPublishing';
import { emptyTourism, type TourismData } from './model';
const config: ModuleConfiguration<TourismData> = {
  type: 'tourism', create: emptyTourism, Dashboard: TourismDashboard, Editor: TourismEditor, Publication: TourismPublishing,
  dashboardLabel: 'Salidas y reservas', editorLabel: 'Experiencias e itinerarios',
  parse(value) {
    const data = value as TourismData;
    if (!data || data.version !== 1 || !Array.isArray(data.tours) || !Array.isArray(data.guides) || !Array.isArray(data.departures) || !Array.isArray(data.bookings) || !data.settings) throw new Error('El documento tiene un formato incompatible. No se ha sobrescrito.');
    return data;
  },
};
export default function TourismWorkspace() { return <ModuleWorkspace config={config} />; }
