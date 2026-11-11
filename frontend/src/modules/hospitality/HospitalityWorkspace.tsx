import ModuleWorkspace, { type ModuleConfiguration } from '../ModuleWorkspace';
import HospitalityDashboard from './HospitalityDashboard';
import HospitalityEditor from './HospitalityEditor';
import { emptyHospitality, type HospitalityData } from './model';
const config: ModuleConfiguration<HospitalityData> = {
  type: 'hospitality', create: emptyHospitality, Dashboard: HospitalityDashboard, Editor: HospitalityEditor,
  dashboardLabel: 'Administrar hospedaje', editorLabel: 'Editar web',
  parse(value) {
    const data = value as HospitalityData;
    if (!data || data.version !== 1 || !Array.isArray(data.rooms) || !Array.isArray(data.bookings) || !Array.isArray(data.finances) || !Array.isArray(data.sections) || !data.settings || !Array.isArray(data.settings.faqs) || !Array.isArray(data.settings.promotions)) throw new Error('El documento tiene un formato incompatible. No se ha sobrescrito.');
    return data;
  },
};
export default function HospitalityWorkspace() { return <ModuleWorkspace config={config} />; }
