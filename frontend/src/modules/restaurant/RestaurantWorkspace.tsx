import ModuleWorkspace, { type ModuleConfiguration } from '../ModuleWorkspace';
import RestaurantDashboard from './RestaurantDashboard';
import RestaurantEditor from './RestaurantEditor';
import RestaurantPublishing from './RestaurantPublishing';
import { emptyRestaurant, type RestaurantData } from './model';
import { parseRestaurantDocument } from './restaurantDocument';

const config: ModuleConfiguration<RestaurantData> = {
  type: 'restaurant', create: emptyRestaurant, parse: parseRestaurantDocument,
  Dashboard: RestaurantDashboard, Editor: RestaurantEditor, Publication: RestaurantPublishing,
  dashboardLabel: 'Costos e inventario', editorLabel: 'Mi menú',
};

// The canonical workspace owns one persisted document for editing and publishing.
// Prototype screens remain available in source but must not supply customer data.
export default function RestaurantWorkspace() { return <ModuleWorkspace config={config} />; }
