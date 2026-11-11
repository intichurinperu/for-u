import ModuleWorkspace, { type ModuleConfiguration } from '../ModuleWorkspace';
import EcommerceDashboard from './EcommerceDashboard';
import EcommerceEditor from './EcommerceEditor';
import { emptyEcommerce, type EcommerceData } from './model';
const config: ModuleConfiguration<EcommerceData> = {
  type: 'ecommerce', create: emptyEcommerce, Dashboard: EcommerceDashboard, Editor: EcommerceEditor,
  dashboardLabel: 'Pedidos y ventas', editorLabel: 'Catálogo y tienda',
  parse(value) {
    const data = value as EcommerceData;
    if (!data || data.version !== 1 || !Array.isArray(data.products) || !Array.isArray(data.orders) || !data.settings) throw new Error('El documento tiene un formato incompatible. No se ha sobrescrito.');
    return data;
  },
};
export default function EcommerceWorkspace() { return <ModuleWorkspace config={config} />; }
