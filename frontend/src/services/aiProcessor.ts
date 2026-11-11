import type { ForUBranchKey, ForUNodePriority } from '../stores/useActiveProjectsStore';

export type AiNodeType = 'Idea' | 'Acción' | 'Recurso';

export interface ProcessedNode {
  id: string;
  label: string;
  type: AiNodeType;
  branchKey: ForUBranchKey;
  description?: string;
  priority?: ForUNodePriority;
  subtasks?: string[];
  reasoning?: string;
  lastActiveDate: string;
  position: { x: number; y: number };
}

export type DigitalRouteStep = {
  id: string;
  title: string;
  linkedNodeId: string;
};

export type AiProcessResponse = {
  nodos: ProcessedNode[];
  digitalRoute: DigitalRouteStep[];
  mensaje: string;
};

export const FOR_U_AI_SYSTEM_PROMPT = `Eres For U, un asistente empático y juguetón para emprendedores con TDAH. Usas analogías de mar y navegación. Recibes notas crudas y desordenadas. Tu tarea es priorizarlas, detectar rama, dividir tareas complejas en micro-subtareas de maximo 15 minutos y responder SOLO JSON:
{ "nodos": [ { "id": "string", "label": "string", "type": "Idea" | "Acción" | "Recurso", "branchKey": "ideas" | "actions" | "finances" | "marketing" | "resources", "description": "string", "priority": "high" | "medium" | "low", "subtasks": ["string"], "reasoning": "string", "lastActiveDate": "string ISO", "position": { "x": number, "y": number } } ], "digitalRoute": [ { "id": "string", "title": "string", "linkedNodeId": "string" } ], "mensaje": "string" }`;

export async function processRawNotes(rawNotes: string[], projectName: string): Promise<AiProcessResponse> {
  const usableNotes = rawNotes.map((note) => note.trim()).filter(Boolean);
  const notes = usableNotes.length > 0 ? usableNotes : ['Ordenar ideas del proyecto'];
  const branchCounts = createEmptyBranchCounts();

  const nodos = notes.slice(0, 10).map<ProcessedNode>((note, index) => {
    const type = inferNodeType(note, index);
    const branch = inferBranch(note, type, index);
    const priority = inferPriority(note);
    const subtasks = inferSubtasks(note, type, branch.key);
    const siblingIndex = branchCounts[branch.key]++;
    const branchOrigin = branchOrigins[branch.key];
    const angle = branchOrigin.angle + siblingIndex * 0.42;
    const radius = 180 + siblingIndex * 28;

    return {
      id: `ai-node-${Date.now()}-${index}`,
      label: toMicroTaskLabel(note, type, subtasks),
      type,
      branchKey: branch.key,
      description: [
        `Nota original: ${note}`,
        subtasks.length > 0 ? `Subtareas sugeridas: ${subtasks.join(', ')}` : '',
      ].filter(Boolean).join('\n'),
      priority,
      subtasks,
      reasoning: branch.reasoning,
      lastActiveDate: new Date().toISOString(),
      position: {
        x: Math.round(branchOrigin.x + Math.cos(angle) * radius),
        y: Math.round(branchOrigin.y + Math.sin(angle) * radius),
      },
    };
  });

  const highPriorityCount = nodos.filter((node) => node.priority === 'high').length;
  const digitalRoute = createDigitalRoute(projectName, notes, nodos);

  return {
    nodos,
    digitalRoute,
    mensaje: `⛵ Guía local: organicé ${nodos.length} ideas para "${projectName}"${highPriorityCount ? ` y marqué ${highPriorityCount} como prioridad alta` : ''}.`,
  };
}

function createEmptyBranchCounts(): Record<ForUBranchKey, number> {
  return {
    ideas: 0,
    actions: 0,
    finances: 0,
    marketing: 0,
    resources: 0,
  };
}

function inferPriority(note: string): ForUNodePriority {
  const text = note.toLowerCase();

  if (/(urgente|importante|hoy|ya|ahora|asap|inmediato|inmediata)/.test(text)) return 'high';
  if (/(pronto|esta semana|semana|mañana|manana|luego)/.test(text)) return 'medium';

  return 'low';
}

function inferNodeType(note: string, index: number): AiNodeType {
  const text = note.toLowerCase();

  if (/(link|canva|drive|recurso|archivo|plantilla|referencia|foto|video|documento|pdf)/.test(text)) return 'Recurso';
  if (/(hacer|llamar|enviar|publicar|comprar|crear|revisar|agenda|agendar|cotizar|escribir|diseñar|programar|preparar|terminar)/.test(text)) return 'Acción';
  if (index % 3 === 1) return 'Acción';
  if (index % 3 === 2) return 'Recurso';

  return 'Idea';
}

function inferBranch(note: string, type: AiNodeType, index: number): { key: ForUBranchKey; reasoning: string } {
  const text = note.toLowerCase();

  if (/(finanza|finanzas|precio|costo|costos|presupuesto|venta|ventas|pago|factura|dinero|cobrar|cotizar|ingreso|gasto)/.test(text)) {
    return { key: 'finances', reasoning: 'Te puse esto en Finanzas porque mencionaste presupuesto, pagos, precios o dinero.' };
  }

  if (/(marketing|instagram|tiktok|post|publicar|contenido|campaña|campana|marca|audiencia|redes|email|copy|reel)/.test(text)) {
    return { key: 'marketing', reasoning: 'Te puse esto en Marketing porque habla de contenido, redes, campaña, copy o audiencia.' };
  }

  if (/(canva|drive|link|enlace|archivo|plantilla|referencia|foto|video|recurso|documento|pdf)/.test(text)) {
    return { key: 'resources', reasoning: 'Te puse esto en Recursos porque parece un enlace, archivo, plantilla o referencia para consultar.' };
  }

  if (type === 'Acción' || /(hacer|llamar|enviar|crear|revisar|agendar|comprar|escribir|terminar)/.test(text)) {
    return { key: 'actions', reasoning: 'Te puse esto en Acciones porque suena a un siguiente paso concreto.' };
  }

  if (type === 'Recurso') {
    return { key: 'resources', reasoning: 'Te puse esto en Recursos porque puede servir como material de apoyo.' };
  }

  if (index % 5 === 2) return { key: 'finances', reasoning: 'Lo puse en Finanzas para balancear el mapa y revisar si tiene impacto económico.' };
  if (index % 5 === 3) return { key: 'marketing', reasoning: 'Lo puse en Marketing porque puede convertirse en comunicación o visibilidad.' };

  return { key: 'ideas', reasoning: 'Te puse esto en Ideas porque todavía parece una posibilidad abierta para explorar.' };
}

function inferSubtasks(note: string, type: AiNodeType, branchKey: ForUBranchKey) {
  const cleanNote = note.replace(/\s+/g, ' ').trim();
  const looksComplex = cleanNote.length > 50 || /(campaña|campana|lanzamiento|estrategia|plan|organizar|crear|preparar)/i.test(cleanNote);
  if (!looksComplex || type === 'Recurso') return [];

  if (branchKey === 'marketing') return ['Diseñar posts', 'Escribir copy', 'Programar publicación'];
  if (branchKey === 'finances') return ['Listar costos', 'Definir presupuesto', 'Revisar próximos pagos'];
  if (branchKey === 'actions') return ['Definir primer paso', 'Bloquear 15 minutos', 'Enviar o completar avance'];
  if (branchKey === 'resources') return ['Guardar enlace', 'Nombrar recurso', 'Adjuntarlo al proyecto'];

  return ['Aclarar la idea', 'Elegir siguiente paso', 'Convertirla en micro-acción'];
}

function toMicroTaskLabel(note: string, type: AiNodeType, subtasks: string[]) {
  if (subtasks.length > 0) return subtasks[0];

  const cleanNote = note.replace(/\s+/g, ' ').trim();
  const shortNote = cleanNote.length > 68 ? `${cleanNote.slice(0, 65)}...` : cleanNote;

  if (type === 'Acción') return `15 min: ${shortNote}`;
  if (type === 'Recurso') return `Recurso: ${shortNote}`;

  return `Idea: ${shortNote}`;
}

function createDigitalRoute(projectName: string, notes: string[], nodos: ProcessedNode[]): DigitalRouteStep[] {
  const text = `${projectName} ${notes.join(' ')}`.toLowerCase();
  const routeTitles = inferRouteTitles(text);
  const fallbackNode = nodos[0];

  return routeTitles
    .map((title, index) => {
      const preferredNode = findRouteNode(title, nodos) ?? nodos[index] ?? fallbackNode;
      if (!preferredNode) return null;

      return {
        id: `route-step-${Date.now()}-${index}`,
        title,
        linkedNodeId: preferredNode.id,
      };
    })
    .filter((step): step is DigitalRouteStep => Boolean(step));
}

function inferRouteTitles(text: string) {
  if (/(marketing|instagram|tiktok|contenido|campaña|campana|reel|redes|audiencia)/.test(text)) {
    return ['Estrategia', 'Contenido', 'Publicación', 'Medición'];
  }

  if (/(finanza|finanzas|presupuesto|precio|costos|ventas|dinero|pago)/.test(text)) {
    return ['Diagnóstico', 'Presupuesto', 'Oferta', 'Seguimiento'];
  }

  if (/(curso|clase|taller|ebook|aprendizaje|formación|formacion)/.test(text)) {
    return ['Investigación', 'Currículo', 'Producción', 'Lanzamiento'];
  }

  if (/(web|landing|sitio|app|plataforma|software)/.test(text)) {
    return ['Descubrimiento', 'Arquitectura', 'Construcción', 'Prueba', 'Lanzamiento'];
  }

  return ['Investigación', 'Planificación', 'Ejecución', 'Revisión'];
}

function findRouteNode(routeTitle: string, nodos: ProcessedNode[]) {
  const title = routeTitle.toLowerCase();

  if (/(estrategia|investigación|investigacion|descubrimiento|diagnóstico|diagnostico)/.test(title)) {
    return nodos.find((node) => node.branchKey === 'ideas') ?? nodos.find((node) => node.type === 'Idea');
  }

  if (/(contenido|producción|produccion|construcción|construccion|ejecución|ejecucion)/.test(title)) {
    return nodos.find((node) => node.branchKey === 'actions') ?? nodos.find((node) => node.type === 'Acción');
  }

  if (/(publicación|publicacion|lanzamiento|medición|medicion)/.test(title)) {
    return nodos.find((node) => node.branchKey === 'marketing') ?? nodos.find((node) => node.branchKey === 'actions');
  }

  if (/(presupuesto|oferta|seguimiento)/.test(title)) {
    return nodos.find((node) => node.branchKey === 'finances') ?? nodos.find((node) => node.branchKey === 'actions');
  }

  return nodos.find((node) => node.branchKey === 'actions') ?? nodos[0];
}

const branchOrigins: Record<ForUBranchKey, { x: number; y: number; angle: number }> = {
  ideas: { x: 240, y: 210, angle: -2.35 },
  actions: { x: 760, y: 210, angle: -0.8 },
  finances: { x: 830, y: 400, angle: 0 },
  marketing: { x: 760, y: 590, angle: 0.8 },
  resources: { x: 240, y: 590, angle: 2.35 },
};
