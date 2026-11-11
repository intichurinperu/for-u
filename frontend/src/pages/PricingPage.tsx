import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import MagicBadge from '../components/ui/MagicBadge';
import MagicButton from '../components/ui/MagicButton';
import MagicCard from '../components/ui/MagicCard';
import GradientText from '../components/ui/GradientText';
import { planConfigs, type ForUUserPlan, useActiveProjectsStore } from '../stores/useActiveProjectsStore';

const pricingCards: Array<{
  plan: ForUUserPlan;
  price: string;
  description: string;
  features: string[];
}> = [
  {
    plan: 'free',
    price: '$0',
    description: 'Para probar For U con una sola prioridad clara.',
    features: [
      '1 proyecto activo',
      '5 acciones al mes',
      'Tablero personal',
      'Mi mundo · islas y mascotas',
      'Estadísticas básicas',
      'Acción del momento',
    ],
  },
  {
    plan: 'pro',
    price: '$12',
    description: 'Para trabajar sin fricción con todos tus proyectos.',
    features: [
      'Proyectos ilimitados',
      'Acciones ilimitadas',
      'IA avanzada',
      'Kanban y mapa mental',
      'Estadísticas de progreso',
    ],
  },
  {
    plan: 'premium',
    price: '$24',
    description: 'Para crecer For U con equipo, plantillas e integraciones.',
    features: [
      'Todo lo de Pro',
      'Equipos y colaboración',
      'Plantillas personalizadas',
      'Integraciones externas',
      'Soporte prioritario',
    ],
  },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const userPlan = useActiveProjectsStore((state) => state.userPlan);


  return (
    <main className="foru-pricing-page">
      <header className="foru-pricing-header">
        <Link to="/dashboard" className="foru-shell-logo" aria-label="FOR U">
          <Logo />
        </Link>
        <div>
          <MagicBadge>Planes For U</MagicBadge>
          <h1><GradientText>Elige cuánto apoyo quieres hoy.</GradientText></h1>
          <p>Tablero, Mi mundo y estadísticas básicas están disponibles gratis. Modo Pro es un logro de tu proyecto, no una suscripción.</p>
        </div>
      </header>

      <p>La contratación comercial y las cuotas de almacenamiento están pendientes de habilitación. Esta pantalla no activa planes ni realiza cobros.</p><section className="foru-pricing-grid">
        {pricingCards.map((card) => (
          <MagicCard key={card.plan} className={card.plan === 'pro' ? 'foru-pricing-card is-featured' : 'foru-pricing-card'}>
            {card.plan === userPlan ? <MagicBadge className="foru-pricing-current">Selección anterior</MagicBadge> : null}
            {card.plan !== 'free' ? <MagicBadge>En preparación</MagicBadge> : null}
            <h2>{planConfigs[card.plan].label}</h2>
            <strong>{card.plan==='free'?card.price:'Por definir'}<small>{card.plan==='free'?'/mes':''}</small></strong>
            <p>{card.description}</p>
            <ul>
              {card.features.map((feature) => <li key={feature}>✓ {feature}</li>)}
            </ul>
            <MagicButton type="button" disabled={card.plan!=='free'} onClick={() => navigate('/dashboard')}>{card.plan==='free'?'Abrir mi espacio':'Contratación pendiente'}</MagicButton>
          </MagicCard>
        ))}
      </section>
    </main>
  );
}
