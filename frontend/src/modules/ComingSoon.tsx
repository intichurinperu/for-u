import { Link } from 'react-router-dom';
import './moduleWorkspace.css';
export default function ComingSoon() {
  return <main className="module-workspace"><h1>Muy pronto</h1><p>Por ahora puedes crear tu Ruta Digital con Restaurante. Los demás módulos estarán disponibles más adelante.</p><Link to="/dashboard">Volver a mi Ruta Digital</Link></main>;
}
