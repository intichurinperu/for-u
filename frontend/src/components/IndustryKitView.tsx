import { ButtonSecondary as DSButtonSecondary } from './ui/DesignSystem';
import { useMemo, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import type { ForUActiveProject, ForUBranchKey, ForUNodePriority } from '../stores/useActiveProjectsStore';
import { useActiveProjectsStore } from '../stores/useActiveProjectsStore';
import MagicBadge from './ui/MagicBadge';
import MagicButton from './ui/MagicButton';
import MagicCard from './ui/MagicCard';
import { getBusinessTemplate } from '../data/templates';
import { downloadBlob } from '../toolkit/api';

type IndustryKitViewProps = {
  project: ForUActiveProject | null;
  onStart: () => void;
  onOpenTasks: () => void;
};

type TourismProfile = {
  offerType?: string;
  location?: string;
  idealTraveler?: string;
  primaryChannel?: string;
  availableAssets?: string[];
  strategicAssets?: string[];
};

type KitTask = {
  title: string;
  branchKey: ForUBranchKey;
  priority: ForUNodePriority;
  description: string;
};

type KitBlock = {
  id: string;
  badge: string;
  title: string;
  body: ReactNode;
  tasks: KitTask[];
};

export default function IndustryKitView({ project, onStart, onOpenTasks }: IndustryKitViewProps) {
  const addFreeNodeToBranch = useActiveProjectsStore((state) => state.addFreeNodeToBranch);
  const existingTaskTitles = useMemo(
    () => new Set((project?.nodes ?? []).filter((node) => node.role === 'free').map((node) => normalizeTitle(node.title))),
    [project?.nodes],
  );

  if (!project || !project.industryKey) {
    return (
      <section className="foru-industry-kit-empty">
        <MagicCard as="div">
          <MagicBadge>Kit del rubro</MagicBadge>
          <h1>Este proyecto todavía no tiene kit estratégico.</h1>
          <p>Elige el rubro de tu negocio al crear el proyecto para preparar tu kit.</p>
        </MagicCard>
      </section>
    );
  }

  const template = getBusinessTemplate(project.industryKey);
  if (template) {
    return (
      <section className="foru-industry-kit-view">
        <MagicCard as="section">
          <MagicBadge>{template.name}</MagicBadge>
          <h1>Tu siguiente venta empieza aquí</h1>
          <p>{template.entry}</p>
          <MagicButton onClick={onStart}>Continuar mi ruta</MagicButton>
        </MagicCard>
        {template.steps.map((step, index) => (
          <MagicCard as="section" key={step.id}>
            <details>
              <summary>{index + 1}. {step.title}</summary>
              <ol>{step.tasks.map((task) => <li key={task}>{task}</li>)}</ol>
              <p><strong>Herramientas:</strong> {step.tools.join(' · ')}</p>
              <p>{step.tip}</p>
              <p><strong>Ejemplo:</strong> {step.example}</p>
              <MagicButton variant="soft" onClick={() => downloadBlob(
                new Blob([step.resource.content], { type: 'text/markdown;charset=utf-8' }),
                step.resource.name,
              )}>Descargar hoja de trabajo</MagicButton>
            </details>
          </MagicCard>
        ))}
      </section>
    );
  }

  const isGastronomy = project.industryKey === 'gastronomy';
  const profile = (project.strategyProfile ?? {}) as TourismProfile;
  const offerType = profile.offerType || (isGastronomy ? 'propuesta gastronómica' : 'experiencia turística');
  const location = profile.location || (isGastronomy ? 'tu zona de venta' : 'tu destino');
  const idealTraveler = profile.idealTraveler || (isGastronomy ? 'tu cliente ideal' : 'tu viajero ideal');
  const primaryChannel = profile.primaryChannel || 'WhatsApp';
  const availableAssets = profile.availableAssets ?? [];
  const routeStep = project.digitalRoute[project.currentRouteIndex] ?? project.digitalRoute[0];

  const kitLabel = isGastronomy ? 'Kit gastronómico' : 'Kit turístico';
  const kitTitle = isGastronomy ? 'Tu sistema estratégico para vender comida.' : 'Tu sistema estratégico para vender experiencias.';
  const kitDescription = isGastronomy
    ? 'Producto estrella, pedidos, precios, contenido y recompra en un solo lugar.'
    : 'Oferta, mensajes, landing, contenido y reservas en un solo lugar. Basado en el modelo INTI CHURIN.';
  const salesScripts = isGastronomy
    ? [
        `Hola, gracias por escribir. Te cuento sobre ${offerType} en ${location}: está pensado para ${idealTraveler}.`,
        'Para recomendarte bien, dime para cuántas personas es, fecha/hora y si prefieres recojo, delivery o reserva.',
        `Si quieres avanzar, te confirmo disponibilidad, total y siguiente paso por ${primaryChannel}.`,
      ]
    : [
        `Hola, gracias por escribir. Te cuento sobre nuestra ${offerType} en ${location}: es una experiencia pensada para ${idealTraveler}.`,
        'Para recomendarte bien, dime fecha tentativa, cantidad de personas y qué tipo de ritmo buscan: tranquilo, cultural o aventura.',
        `Si te gustaría reservar, puedo confirmarte disponibilidad y enviarte el siguiente paso por ${primaryChannel}.`,
      ];
  const contentIdeas = isGastronomy
    ? [
        `Post: 3 motivos para pedir ${offerType} esta semana.`,
        'Historia: preparación real, textura, empaque o detrás de escena.',
        `Reel: antojo visual, beneficio concreto y cierre con pedido por ${primaryChannel}.`,
      ]
    : [
        `Post: 3 razones para vivir una ${offerType} en ${location}.`,
        'Historia: detrás de escena del anfitrión preparando la experiencia.',
        `Reel: recorrido corto mostrando paisaje, detalle humano y cierre con invitación a escribir por ${primaryChannel}.`,
      ];
  const blocks: KitBlock[] = [
    {
      id: 'offer',
      badge: isGastronomy ? 'Producto estrella' : 'Oferta estrella',
      title: isGastronomy ? capitalize(offerType) : `${capitalize(offerType)} en ${location}`,
      body: (
        <>
          <p>
            {isGastronomy
              ? `Promesa sugerida: una opción clara, deseable y fácil de pedir para ${idealTraveler}.`
              : `Promesa sugerida: una experiencia clara, confiable y fácil de reservar para ${idealTraveler}.`}
          </p>
          <dl>
            <div><dt>Cliente ideal</dt><dd>{idealTraveler}</dd></div>
            <div><dt>Canal principal</dt><dd>{primaryChannel}</dd></div>
            <div><dt>Siguiente paso</dt><dd>{routeStep?.title ?? 'Definir experiencia estrella'}</dd></div>
          </dl>
        </>
      ),
      tasks: [
        {
          title: isGastronomy ? 'Nombrar el producto estrella' : 'Nombrar la experiencia estrella',
          branchKey: 'ideas',
          priority: 'high',
          description: `Define un nombre claro para vender ${offerType} en ${location}.`,
        },
        {
          title: 'Escribir la promesa principal en una frase',
          branchKey: 'marketing',
          priority: 'high',
          description: `Resume por qué ${idealTraveler} debería elegir esta oferta.`,
        },
        {
          title: isGastronomy ? 'Definir presentación, precio visible y forma de entrega' : 'Definir duración, punto de encuentro y resultado esperado',
          branchKey: 'actions',
          priority: 'medium',
          description: isGastronomy ? 'Convierte el producto en una oferta fácil de pedir.' : 'Convierte la experiencia en una oferta fácil de entender y reservar.',
        },
      ],
    },
    {
      id: 'sales-flow',
      badge: isGastronomy ? 'Pedidos' : 'WhatsApp',
      title: isGastronomy ? 'Flujo base de pedido' : 'Guion base de venta',
      body: (
        <ol>
          {salesScripts.map((script) => <li key={script}>{script}</li>)}
        </ol>
      ),
      tasks: [
        {
          title: isGastronomy ? 'Redactar mensaje de bienvenida para pedidos' : 'Redactar mensaje de bienvenida para consultas',
          branchKey: 'actions',
          priority: 'high',
          description: `Primer mensaje para responder sobre ${offerType} en ${location}.`,
        },
        {
          title: 'Redactar mensaje de seguimiento si no responden',
          branchKey: 'actions',
          priority: 'medium',
          description: 'Mensaje amable para recuperar conversaciones sin presionar.',
        },
        {
          title: isGastronomy ? 'Definir datos mínimos para confirmar pedido' : 'Definir datos mínimos para confirmar reserva',
          branchKey: 'finances',
          priority: 'medium',
          description: isGastronomy ? 'Nombre, hora, cantidad, entrega, pago y confirmación.' : 'Fecha, cantidad de personas, idioma, restricciones y señal de reserva.',
        },
      ],
    },
    {
      id: 'landing',
      badge: isGastronomy ? 'Menú' : 'Landing',
      title: isGastronomy ? 'Checklist de menú vendible' : 'Checklist de página',
      body: (
        <ul>
          {isGastronomy ? (
            <>
              <li>Producto estrella con nombre, foto, precio y beneficio.</li>
              <li>Combos simples para subir ticket promedio.</li>
              <li>Horario, zona de entrega, métodos de pago y pedido directo a {primaryChannel}.</li>
              <li>Fotos reales, reseñas y promociones semanales.</li>
            </>
          ) : (
            <>
              <li>Hero con promesa específica de la experiencia.</li>
              <li>3 beneficios concretos para el viajero.</li>
              <li>Itinerario simple por momentos del día.</li>
              <li>Fotos reales, testimonios y botón directo a {primaryChannel}.</li>
            </>
          )}
        </ul>
      ),
      tasks: [
        {
          title: isGastronomy ? 'Escribir descripción corta del producto estrella' : 'Escribir hero de la experiencia',
          branchKey: 'marketing',
          priority: 'high',
          description: isGastronomy ? 'Una descripción que abra el apetito y explique por qué pedirlo.' : 'Título, subtítulo y llamada a la acción para la landing.',
        },
        {
          title: isGastronomy ? 'Elegir 5 fotos reales del producto o local' : 'Elegir 5 fotos reales para la landing',
          branchKey: 'resources',
          priority: 'medium',
          description: isGastronomy ? 'Selecciona fotos de producto, empaque, mesa, cocina o cliente.' : 'Selecciona imágenes que muestren lugar, personas, detalle y confianza.',
        },
        {
          title: isGastronomy ? 'Definir combos y adicionales rentables' : 'Escribir itinerario simple por momentos del día',
          branchKey: 'resources',
          priority: 'medium',
          description: isGastronomy ? 'Crea 2 o 3 combinaciones fáciles de pedir.' : 'Describe inicio, experiencia principal, cierre y reserva.',
        },
      ],
    },
    {
      id: 'content',
      badge: 'Contenido',
      title: 'Ideas para publicar',
      body: (
        <ul>
          {contentIdeas.map((idea) => <li key={idea}>{idea}</li>)}
        </ul>
      ),
      tasks: [
        {
          title: 'Crear 3 ideas de posts para Instagram',
          branchKey: 'marketing',
          priority: 'medium',
          description: `Contenido para atraer a ${idealTraveler}.`,
        },
        {
          title: 'Escribir 3 historias con detrás de escena',
          branchKey: 'marketing',
          priority: 'medium',
          description: 'Historias simples para generar confianza y cercanía.',
        },
        {
          title: 'Definir 1 reel con paisaje, detalle humano y CTA',
          branchKey: 'marketing',
          priority: 'low',
          description: `Cierre con invitación directa a escribir por ${primaryChannel}.`,
        },
      ],
    },
    {
      id: 'booking',
      badge: isGastronomy ? 'Operación' : 'Reservas',
      title: 'Sistema mínimo',
      body: (
        <ul>
          {isGastronomy ? (
            <>
              <li>Datos a pedir: producto, cantidad, hora, entrega, pago y contacto.</li>
              <li>Estado de pedido: nuevo, confirmado, preparando, entregado.</li>
              <li>Pendiente: definir margen, stock, horarios y promoción semanal.</li>
            </>
          ) : (
            <>
              <li>Datos a pedir: fecha, personas, idioma, ritmo y restricciones.</li>
              <li>Estado de reserva: nueva, respondida, confirmada, completada.</li>
              <li>Pendiente: definir cupos, precio base y política de confirmación.</li>
            </>
          )}
        </ul>
      ),
      tasks: [
        {
          title: isGastronomy ? 'Calcular costo, precio y margen del producto estrella' : 'Definir cupos y precio base de la experiencia',
          branchKey: 'finances',
          priority: 'high',
          description: isGastronomy ? 'Confirma que la oferta vende sin comerse la ganancia.' : 'Precio, capacidad, costos mínimos y margen esperado.',
        },
        {
          title: isGastronomy ? 'Crear estados de pedido: nuevo, confirmado, preparando' : 'Crear estados de reserva: nueva, respondida, confirmada',
          branchKey: 'actions',
          priority: 'medium',
          description: isGastronomy ? 'Sistema simple para no perder pedidos ni tiempos de entrega.' : 'Sistema simple para no perder conversaciones ni reservas.',
        },
        {
          title: isGastronomy ? 'Escribir política simple de pago y entrega' : 'Escribir política simple de confirmación',
          branchKey: 'finances',
          priority: 'medium',
          description: isGastronomy ? 'Qué se paga, cuándo se confirma y cómo se coordina entrega o recojo.' : 'Qué se paga, cuándo se confirma y qué pasa si cambia la fecha.',
        },
      ],
    },
  ];

  function getBlockProgress(block: KitBlock) {
    const matchingNodes = project.nodes.filter((node) => block.tasks.some((task) => normalizeTitle(task.title) === normalizeTitle(node.title)));
    const total = block.tasks.length;
    const created = matchingNodes.length;
    const completed = matchingNodes.filter((node) => Boolean(node.completedAt) || node.taskStatus === 'done').length;
    return { created, completed, total };
  }

  function createBlockTasks(block: KitBlock) {
    const newTasks = block.tasks.filter((task) => !existingTaskTitles.has(normalizeTitle(task.title)));

    if (newTasks.length === 0) {
      toast('Este bloque ya tiene sus tareas creadas.');
      onOpenTasks();
      return;
    }

    newTasks.forEach((task, index) => {
      addFreeNodeToBranch(project.id, task.branchKey, {
        title: task.title,
        kind: 'task',
        icon: '✅',
        priority: task.priority,
        description: task.description,
        taskStatus: 'todo',
        rewardCoins: 20,
        x: 580 + (index * 32),
        y: 360 + (index * 28),
      });
    });

    toast.success(`Creé ${newTasks.length} tareas para ${block.title}.`);
    onOpenTasks();
  }

  return (
    <section className="foru-industry-kit-view" aria-label={`Kit estratégico del rubro ${isGastronomy ? 'gastronomía' : 'turismo'}`}>
      <header className="foru-view-header">
        <div>
          <span>{kitLabel}</span>
          <h1>{kitTitle}</h1>
          <p>{kitDescription}</p>
        </div>
        <MagicButton type="button" onClick={onStart}>
          Empezar próxima acción
        </MagicButton>
      </header>

      <div className="foru-industry-kit-grid">
        {blocks.map((block, index) => {
          const progress = getBlockProgress(block);
          const isCreated = progress.created === progress.total;
          const isDone = progress.completed === progress.total;
          return (
            <MagicCard
              key={block.id}
              as="article"
              className={index === 0 ? 'foru-industry-kit-hero-card' : 'foru-industry-kit-card'}
            >
              <div className="foru-kit-card-topline">
                <MagicBadge>{block.badge}</MagicBadge>
                <span className={`foru-kit-status ${isDone ? 'is-done' : isCreated ? 'is-active' : ''}`}>
                  {isDone ? 'Listo' : isCreated ? 'En proceso' : 'Pendiente'}
                </span>
              </div>
              <h2>{block.title}</h2>
              {block.body}
              <div className="foru-kit-progress-row">
                <span>{progress.created}/{progress.total} tareas creadas</span>
                <span>{progress.completed} completadas</span>
              </div>
              <div className="foru-kit-actions">
                <MagicButton type="button" onClick={() => createBlockTasks(block)}>
                  {isCreated ? 'Ver tareas' : 'Crear tareas'}
                </MagicButton>
                {isCreated ? (
                  <DSButtonSecondary type="button" className="foru-kit-secondary-action" onClick={onOpenTasks}>
                    Abrir Kanban
                  </DSButtonSecondary>
                ) : null}
              </div>
            </MagicCard>
          );
        })}

        <MagicCard as="article" className="foru-industry-kit-card">
          <MagicBadge>Activos disponibles</MagicBadge>
          <h2>Lo que ya tienes</h2>
          {availableAssets.length > 0 ? (
            <div className="foru-industry-assets-list">
              {availableAssets.map((asset) => <span key={asset}>{asset}</span>)}
            </div>
          ) : (
            <p>Marca fotos, testimonios, precios o calendario para priorizar mejor.</p>
          )}
        </MagicCard>
      </div>
    </section>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function normalizeTitle(value: string) {
  return value.trim().toLowerCase();
}
