import { clearSessionCaches } from '../lib/sessionPrivacy';
import { create, type StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabaseClient';
import { explorationProjectsAreUnlimited } from '../modules/validationLaunch';
import { projectModuleType } from '../modules/moduleProjects';
import { getDigitalRouteTemplate, getStepCompletionStatus } from '../templates/digitalRouteTemplates';
import { industryTemplates, type ForUIndustryKey } from '../templates/industryTemplates';
import type { ForUDigitalRouteStepStatus, ForUDigitalRouteStepTemplate } from '../templates/digitalRouteTemplates';

export type ForUProjectStatus = 'active' | 'paused' | 'blocked' | 'completed';
export type ForUTaskStatus = 'todo' | 'doing' | 'done';
export type ForUNodeKind = 'center' | 'branch' | 'idea' | 'task' | 'resource' | 'blocker' | 'inspiration';
export type ForUNodeRole = 'center' | 'branch' | 'free';
export type ForUBranchKey = 'ideas' | 'actions' | 'finances' | 'marketing' | 'resources';
export type ForUNodePriority = 'high' | 'medium' | 'low';
export type ForURawNoteKind = 'text' | 'audio' | 'photo';
export type ForUWorldViewLevel = 'archipelago' | 'exterior' | 'interior';
export type ForUWorkspaceView = 'map' | 'kanban' | 'gantt' | 'archipelago' | 'dashboard';
export type ForUProjectGuideState = 'empty' | 'raw' | 'organized' | 'planned' | 'active' | 'completed';
export type ForUUserPlan = 'free' | 'pro' | 'premium';
export type ForUFeelingType = 'freedom' | 'peace' | 'pride' | 'creativity' | 'abundance' | 'connection' | 'confidence' | 'joy';
export type ForUMoodType = 'creative' | 'calm' | 'proud' | 'overwhelmed' | 'tired' | 'hopeful' | 'anxious' | 'grateful';
export type ForUPlanFeatures = {
  world3D: boolean;
  aiAdvanced: boolean;
  kanban: boolean;
  stats: boolean;
  teams?: boolean;
  templates?: boolean;
  integrations?: boolean;
};
export type ForUPlanLimitNotice = {
  title: string;
  message: string;
  feature: keyof ForUPlanFeatures | 'projects' | 'actions';
} | null;

export type ForUArchipelagoOffset = {
  x: number;
  y: number;
};

export type ForUTask = {
  id: string;
  title: string;
  status: ForUTaskStatus;
  createdAt: string;
  completedAt?: string;
};

export type ForUProjectNode = {
  id: string;
  title: string;
  kind: ForUNodeKind;
  role?: ForUNodeRole;
  branchKey?: ForUBranchKey;
  x: number;
  y: number;
  icon?: string;
  description?: string;
  priority?: ForUNodePriority;
  feelingType?: ForUFeelingType;
  subtasks?: string[];
  reasoning?: string;
  parentNodeId?: string;
  completedAt?: string;
  rewardCoins?: number;
  taskStatus?: ForUTaskStatus;
  locked?: boolean;
  linkedTaskId?: string;
  externalUrl?: string;
  lastActiveDate: string;
  createdAt: string;
};

export type ForUProjectEdge = {
  id: string;
  source: string;
  target: string;
  createdAt: string;
};

export type ForURouteStep = {
  id: string;
  title: string;
  linkedNodeId: string;
  completedAt?: string;
};

export type ForUActiveProject = {
  cloudPending?: boolean;
  id: string;
  name: string;
  tangibleGoal?: string;
  targetFeelings: ForUFeelingType[];
  industryKey?: ForUIndustryKey;
  strategyProfile?: Record<string, unknown>;
  templateSource?: string;
  status: ForUProjectStatus;
  tasks: ForUTask[];
  nodes: ForUProjectNode[];
  edges: ForUProjectEdge[];
  digitalRoute: ForURouteStep[];
  currentRouteIndex: number;
  createdAt: string;
  updatedAt: string;
};

export type ForUDailyMood = {
  id: string;
  userId: string | null;
  date: string;
  mood: ForUMoodType;
  notes?: string;
  createdAt: string;
};

export type ForURewiringHabit = {
  id: string;
  userId: string | null;
  date: string;
  habit: string;
  completed: boolean;
  createdAt: string;
};

export type ForUDigitalRouteStepState = ForUDigitalRouteStepTemplate & {
  status: ForUDigitalRouteStepStatus;
  createdTasks: number;
  completedTasks: number;
  totalTasks: number;
};

export type ForURawNote = {
  id: string;
  projectId: string | null;
  kind: ForURawNoteKind;
  content: string;
  previewUrl?: string;
  createdAt: string;
  processedAt?: string;
};

type CreateProjectInput = {
  name: string;
  status?: ForUProjectStatus;
  tangibleGoal?: string;
  targetFeelings?: ForUFeelingType[];
  industryKey?: ForUIndustryKey;
  strategyProfile?: Record<string, unknown>;
  templateSource?: string;
};

type CreateRawNoteInput = {
  projectId?: string | null;
  kind: ForURawNoteKind;
  content: string;
  previewUrl?: string;
};

export type CreateFreeNodeForBranchInput = Omit<ForUProjectNode, 'id' | 'createdAt' | 'lastActiveDate' | 'role'> & {
  branchKey: ForUBranchKey;
};

export type WeeklyMilestoneResult = {
  milestoneAchieved: boolean;
};

export type DailyRewardStatus = {
  shouldShow: boolean;
  currentDay: number;
  reward: number;
};

export type ForUNextAction = {
  id: string;
  projectId: string;
  sourceNodeId?: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  rewardCoins: number;
  priority: ForUNodePriority;
  isFallback: boolean;
};

type ActiveProjectsState = {
  activeProjectIds: string[];
  activeProjectId: string | null;
  currentProjectId: string | null;
  lastCreatedProjectId: string | null;
  projectsById: Record<string, ForUActiveProject>;
  rawNotes: ForURawNote[];
  isJarOpen: boolean;
  selectedNodeId: string | null;
  focusedBranch: ForUBranchKey | null;
  viewLevel: ForUWorldViewLevel;
  currentView: ForUWorkspaceView;
  archipelagoZoom: number;
  archipelagoOffset: ForUArchipelagoOffset;
  userLevel: number;
  userXP: number;
  xpToNextLevel: number;
  coins: number;
  weeklyMilestoneProgress: number;
  userPlan: ForUUserPlan;
  maxProjects: number;
  maxActionsPerMonth: number;
  actionsThisMonth: number;
  actionsMonthStamp: string;
  dailyMoods: ForUDailyMood[];
  rewiringHabits: Record<string, ForURewiringHabit>;
  features: ForUPlanFeatures;
  planLimitNotice: ForUPlanLimitNotice;
  lastLoginDate: string | null;
  dailyStreak: number;
  claimedDays: number[];
  whatsappNumber: string;
  whatsappEnabled: boolean;
  cloudUserId: string | null;
  isCloudSyncing: boolean;
  projectLoadError: string;
  hydrateFromSupabase: (userId: string) => Promise<void>;
  clearCloudUser: () => void;
  updateWhatsappSettings: (input: { whatsappNumber: string; whatsappEnabled: boolean }) => Promise<boolean>;
  setUserPlan: (plan: ForUUserPlan) => void;
  canUseFeature: (feature: keyof ForUPlanFeatures) => boolean;
  clearPlanLimitNotice: () => void;
  getAllProjects: () => ForUActiveProject[];
  getActiveProjects: () => ForUActiveProject[];
  getProjectById: (projectId: string) => ForUActiveProject | null;
  getProjectState: (projectId: string) => ForUProjectGuideState;
  getGuidedExecutionTasks: (projectId: string) => ForUProjectNode[];
  getGuidedExecutionCompletedCount: (projectId: string) => number;
  completeGuidedExecutionTask: (projectId: string, nodeId: string) => boolean;
  getNextAction: (projectId: string) => ForUNextAction | null;
  getPersonalDashboardProjects: () => Array<{ project: ForUActiveProject; nextAction: ForUNextAction | null; pendingCount: number }>;
  generateNextAction: (projectId: string) => ForUNextAction | null;
  completeNextAction: (projectId: string, actionId: string) => boolean;
  setProjectEmotionalOnboarding: (projectId: string, input: { tangibleGoal: string; targetFeelings: ForUFeelingType[] }) => Promise<boolean>;
  getProjectPrimaryFeeling: (projectId: string) => ForUFeelingType | null;
  getFeelingProgress: (projectId: string, feeling: ForUFeelingType) => number;
  addDailyMood: (input: { mood: ForUMoodType; notes?: string }) => Promise<boolean>;
  getMoodPatternSummary: () => string;
  getTodayHabit: (projectId?: string | null) => ForURewiringHabit;
  completeTodayHabit: () => Promise<boolean>;
  backgroundOrganizeText: (projectId: string, text: string) => Promise<ForUNextAction | null>;
  getProjectProgress: (projectId: string) => number;
  getDigitalRouteSteps: (projectId: string) => ForUDigitalRouteStepState[];
  getCurrentDigitalRouteStep: (projectId: string) => ForUDigitalRouteStepState | null;
  createTasksForDigitalRouteStep: (projectId: string, stepId: string) => string[];
  completeDigitalRouteStep: (projectId: string, stepId: string) => boolean;
  getDustyNodes: () => ForUProjectNode[];
  clearLastCreatedProject: () => void;
  switchProject: (projectId: string) => void;
  setView: (view: ForUWorkspaceView) => void;
  setZoom: (level: number) => void;
  setArchipelagoOffset: (offset: ForUArchipelagoOffset) => void;
  panToIsland: (projectId: string) => void;
  resetArchipelagoView: () => void;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  checkWeeklyMilestone: () => WeeklyMilestoneResult;
  checkDailyReward: () => DailyRewardStatus;
  claimDailyReward: (day?: number) => boolean;
  openProject: (input: CreateProjectInput) => string;
  focusProject: (projectId: string) => void;
  closeProject: (projectId: string) => void;
  renameProject: (projectId: string, name: string) => void;
  updateProjectStatus: (projectId: string, status: ForUProjectStatus) => void;
  addTask: (projectId: string, title: string) => string | null;
  updateTaskStatus: (projectId: string, taskId: string, status: ForUTaskStatus) => void;
  addNode: (projectId: string, node: Omit<ForUProjectNode, 'id' | 'createdAt' | 'lastActiveDate'>) => string | null;
  addFreeNodeToBranch: (projectId: string, branchKey: ForUBranchKey, node: Omit<ForUProjectNode, 'id' | 'createdAt' | 'lastActiveDate' | 'role'>) => string | null;
  addFreeNodesToBranches: (projectId: string, nodes: CreateFreeNodeForBranchInput[]) => string[];
  updateNode: (projectId: string, nodeId: string, patch: Partial<Omit<ForUProjectNode, 'id'>>) => void;
  reassignNodeBranch: (projectId: string, nodeId: string, branchKey: ForUBranchKey) => void;
  splitNodeIntoSubtasks: (projectId: string, nodeId: string, subtasks: string[]) => string[];
  setDigitalRoute: (projectId: string, route: ForURouteStep[]) => void;
  completeRouteStep: (projectId: string) => boolean;
  moveNode: (projectId: string, nodeId: string, position: { x: number; y: number }) => void;
  connectNodes: (projectId: string, source: string, target: string) => string | null;
  removeEdge: (projectId: string, edgeId: string) => void;
  selectNode: (nodeId: string) => void;
  deselectNode: () => void;
  setFocusBranch: (branchKey: ForUBranchKey) => void;
  clearFocus: () => void;
  setViewLevel: (level: ForUWorldViewLevel) => void;
  toggleView: () => void;
  openIdeaJar: () => void;
  closeIdeaJar: () => void;
  toggleIdeaJar: () => void;
  addRawNote: (input: CreateRawNoteInput) => string;
  markRawNoteProcessed: (noteId: string) => void;
  clearRawNotes: () => void;
  resetWorkspace: () => void;
};

function createId(prefix: string) {
  // Production stores project IDs as UUID, without the UI-only "project-" prefix.
  if (prefix === 'project') {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function now() {
  return new Date().toISOString();
}

function clampZoom(level: number) {
  return Math.min(2, Math.max(0.3, Number.isFinite(level) ? level : 0.45));
}

const DUST_THRESHOLD_MS = 48 * 60 * 60 * 1000;
const WEEKLY_MILESTONE_GOAL = 5;
export const dailyRewards = [10, 20, 50, 50, 100] as const;

export const feelingLabels: Record<ForUFeelingType, { label: string; icon: string }> = {
  freedom: { label: 'Libertad creativa', icon: '🕊️' },
  peace: { label: 'Paz', icon: '💚' },
  pride: { label: 'Orgullo', icon: '🏛️' },
  creativity: { label: 'Creatividad', icon: '🎨' },
  abundance: { label: 'Abundancia', icon: '💰' },
  connection: { label: 'Conexión', icon: '🤝' },
  confidence: { label: 'Confianza', icon: '🧭' },
  joy: { label: 'Alegría', icon: '✨' },
};

export const moodLabels: Record<ForUMoodType, { label: string; icon: string }> = {
  creative: { label: 'Creativa', icon: '🎨' },
  calm: { label: 'Tranquila', icon: '💚' },
  proud: { label: 'Orgullosa', icon: '🏛️' },
  overwhelmed: { label: 'Abrumada', icon: '🌊' },
  tired: { label: 'Cansada', icon: '🌙' },
  hopeful: { label: 'Esperanzada', icon: '🌤️' },
  anxious: { label: 'Ansiosa', icon: '🫧' },
  grateful: { label: 'Agradecida', icon: '🤍' },
};

const rewiringHabitTemplates: Record<ForUFeelingType, string[]> = {
  freedom: [
    'Antes de empezar, respira 3 veces y di: "Estoy eligiendo crear".',
    'Elige una sola acción que te dé más espacio mental hoy.',
  ],
  peace: [
    'Pon una mano en el pecho, respira lento y baja el ritmo antes de abrir tareas.',
    'Cierra una pestaña física o mental antes de avanzar.',
  ],
  pride: [
    'Anota una victoria pequeña antes de empezar. Tu cerebro necesita evidencia.',
    'Al terminar, di en voz alta: "Esto cuenta".',
  ],
  creativity: [
    'Haz un boceto feo de 2 minutos antes de buscar perfección.',
    'Escribe 3 posibilidades sin juzgar antes de elegir.',
  ],
  abundance: [
    'Antes de trabajar, nombra una oportunidad que ya existe.',
    'Anota un número simple: costo, precio o siguiente venta posible.',
  ],
  connection: [
    'Piensa en una persona real que se beneficia si avanzas esto.',
    'Envía un mensaje amable o pide una cosa concreta.',
  ],
  confidence: [
    'Divide la tarea en el primer movimiento visible. Solo ese.',
    'Recuerda una vez en la que sí resolviste algo difícil.',
  ],
  joy: [
    'Pon una canción suave y celebra empezar, no solo terminar.',
    'Elige una micro-recompensa antes de hacer la tarea.',
  ],
};

type SupabaseProjectRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  tangible_goal: string | null;
  industry_key?: ForUIndustryKey | null;
  strategy_profile?: Record<string, unknown> | null;
  template_source?: string | null;
  status: ForUProjectStatus;
  created_at: string;
};

type SupabaseProfileRow = {
  id: string;
  email: string;
  display_name: string | null;
  plan: ForUUserPlan;
  streak: number;
  coins: number;
  whatsapp_number: string | null;
  whatsapp_enabled: boolean | null;
  created_at: string;
};

type SupabaseTaskRow = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: ForUTaskStatus;
  priority: ForUNodePriority;
  estimated_time: number | null;
  feeling_type?: ForUFeelingType | null;
  completed_at: string | null;
  created_at?: string;
};

type SupabaseIdeaRow = {
  id: string;
  project_id: string;
  content: string;
  created_at: string;
};

type SupabaseProjectFeelingRow = {
  project_id: string;
  feeling_type: ForUFeelingType;
  created_at: string;
};

type SupabaseDailyMoodRow = {
  id: string;
  user_id: string;
  date: string;
  mood: ForUMoodType;
  notes: string | null;
  created_at: string;
};

type SupabaseRewiringHabitRow = {
  id: string;
  user_id: string;
  date: string;
  habit: string;
  completed: boolean;
  created_at: string;
};

export const planConfigs: Record<ForUUserPlan, {
  label: string;
  maxProjects: number;
  maxActionsPerMonth: number;
  features: ForUPlanFeatures;
}> = {
  free: {
    label: 'Gratis',
    maxProjects: 1,
    maxActionsPerMonth: 5,
    features: {
      world3D: false,
      aiAdvanced: false,
      kanban: false,
      stats: false,
    },
  },
  pro: {
    label: 'Pro',
    maxProjects: Number.POSITIVE_INFINITY,
    maxActionsPerMonth: Number.POSITIVE_INFINITY,
    features: {
      world3D: true,
      aiAdvanced: true,
      kanban: true,
      stats: true,
    },
  },
  premium: {
    label: 'Premium',
    maxProjects: Number.POSITIVE_INFINITY,
    maxActionsPerMonth: Number.POSITIVE_INFINITY,
    features: {
      world3D: true,
      aiAdvanced: true,
      kanban: true,
      stats: true,
      teams: true,
      templates: true,
      integrations: true,
    },
  },
};

function getProjectOrder(state: Pick<ActiveProjectsState, 'activeProjectIds' | 'projectsById'>) {
  return Array.from(new Set([...(state.activeProjectIds ?? []), ...Object.keys(state.projectsById ?? {})]));
}

function canSyncCloud(userId?: string | null) {
  return Boolean(supabase && userId);
}

function getBranchPosition(branchKey: ForUBranchKey, index: number) {
  const branch = baseBranches.find((item) => item.key === branchKey) ?? baseBranches[0];
  const ring = Math.floor(index / 3);
  const slot = index % 3;

  return {
    x: branch.x + 190 + slot * 54,
    y: branch.y + (slot - 1) * 74 + ring * 96,
  };
}

async function upsertCloudProject(userId: string | null, project: ForUActiveProject) {
  if (!canSyncCloud(userId) || !supabase) return;

  const basePayload = {
    id: project.id,
    user_id: userId,
    name: project.name,
    business_type: projectModuleType(project) ?? 'restaurant',
    tangible_goal: project.tangibleGoal ?? '',
    status: project.status,
    created_at: project.createdAt,
  };
  const payloads = [
    { ...basePayload, description: '', industry_key: project.industryKey ?? null, strategy_profile: project.strategyProfile ?? {}, template_source: project.templateSource ?? null },
    { ...basePayload, industry_key: project.industryKey ?? null, strategy_profile: project.strategyProfile ?? {}, template_source: project.templateSource ?? null },
  ];

  let lastError = '';
  for (const payload of payloads) {
    const { error } = await supabase.from('projects').upsert(payload);
    if (!error) {
      if (useActiveProjectsStore.getState().cloudUserId === userId) useActiveProjectsStore.setState(state => ({ projectsById: { ...state.projectsById, [project.id]: { ...(state.projectsById[project.id] ?? project), cloudPending: false } } }));
      return;
    }
    lastError = error.message;
  }

  console.warn('No se pudo guardar el proyecto en Supabase:', lastError);
}

async function deleteCloudProject(userId: string | null, projectId: string) {
  if (!canSyncCloud(userId) || !supabase) return;

  await supabase.from('projects').delete().eq('id', projectId).eq('user_id', userId);
}

async function updateCloudProfile(
  userId: string | null,
  patch: Partial<Pick<SupabaseProfileRow, 'plan' | 'streak' | 'coins' | 'whatsapp_number' | 'whatsapp_enabled'>>,
) {
  if (!canSyncCloud(userId) || !supabase) return;

  await supabase.from('profiles').update(patch).eq('id', userId);
}

function nodeToCloudTask(projectId: string, node: ForUProjectNode): SupabaseTaskRow | null {
  if (node.role !== 'free' || node.branchKey === 'ideas' || node.branchKey === 'resources') return null;

  return {
    id: node.id,
    project_id: projectId,
    title: node.title,
    description: node.description ?? null,
    status: node.taskStatus ?? (node.completedAt ? 'done' : 'todo'),
    priority: node.priority ?? 'medium',
    estimated_time: estimateActionMinutes(node),
    feeling_type: node.feelingType ?? null,
    completed_at: node.completedAt ?? null,
    created_at: node.createdAt,
  };
}

async function upsertCloudTask(userId: string | null, projectId: string, node: ForUProjectNode) {
  if (!canSyncCloud(userId) || !supabase) return;
  const task = nodeToCloudTask(projectId, node);
  if (!task) return;

  await supabase.from('tasks').upsert(task);
}

async function upsertCloudIdea(userId: string | null, note: ForURawNote) {
  if (!canSyncCloud(userId) || !supabase || !note.projectId) return;

  await supabase.from('ideas').upsert({
    id: note.id,
    project_id: note.projectId,
    content: note.content,
    created_at: note.createdAt,
  });
}

function getDayStamp(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getMonthStamp(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

function getPlanConfig(plan: ForUUserPlan) {
  return planConfigs[plan] ?? planConfigs.free;
}

function getPreviousDayStamp(date = new Date()) {
  const previous = new Date(date);
  previous.setDate(previous.getDate() - 1);
  return getDayStamp(previous);
}

function getConcreteActionTitle(node: Pick<ForUProjectNode, 'title' | 'description' | 'branchKey'>) {
  const title = node.title.trim();
  const lowerTitle = title.toLowerCase();
  const abstractWords = ['aclarar', 'idea', 'definir', 'pensar', 'concepto', 'estrategia', 'planear'];
  const isAbstract = abstractWords.some((word) => lowerTitle.includes(word));

  if (!isAbstract) return title;

  if (node.branchKey === 'marketing') return 'Escribe 3 ideas de contenido para publicar esta semana';
  if (node.branchKey === 'finances') return 'Anota 3 numeros clave: costo, precio y presupuesto disponible';
  if (node.branchKey === 'resources') return 'Guarda 2 enlaces o archivos que te ayuden a avanzar';
  if (node.branchKey === 'actions') return 'Escribe en 1 frase el resultado que quieres lograr hoy';

  return 'Escribe en 1 frase que quieres lograr con esta idea';
}

function estimateActionMinutes(node?: Pick<ForUProjectNode, 'priority' | 'title' | 'subtasks'>) {
  if (!node) return 5;
  if (node.subtasks && node.subtasks.length > 0) return 15;
  if (node.priority === 'high') return 15;
  if (node.title.length > 72) return 20;
  return 15;
}

function getPriorityWeight(priority?: ForUNodePriority) {
  if (priority === 'high') return 0;
  if (priority === 'medium') return 1;
  return 2;
}

function getRawIdeaText(project: ForUActiveProject, rawNotes: ForURawNote[] = []) {
  const rawText = rawNotes
    .filter((note) => !note.processedAt && (note.projectId === project.id || note.projectId === null))
    .map((note) => note.content)
    .join(' ');
  const ideaText = project.nodes
    .filter((node) => node.role === 'free' && node.branchKey === 'ideas' && !node.completedAt)
    .map((node) => `${node.title} ${node.description ?? ''}`)
    .join(' ');

  return `${rawText} ${ideaText}`.trim();
}

function inferConcreteActionFromText(text: string, projectName: string) {
  const cleanText = text.toLowerCase();
  const cleanProjectName = projectName.toLowerCase();
  const source = `${cleanProjectName} ${cleanText}`;

  if (!cleanText.trim()) return null;
  if (source.includes('vela') || source.includes('cera') || source.includes('aroma')) return 'Investigar 3 proveedores de cera de soja';
  if (source.includes('kiosco') || source.includes('golosina') || source.includes('dulce')) return 'Llamar a 2 proveedores de golosinas y anotar precios';
  if (source.includes('cafeter') || source.includes('cafe') || source.includes('café')) return 'Comparar 3 opciones de menú rentable para la cafetería';
  if (source.includes('marketing') || source.includes('instagram') || source.includes('contenido')) return 'Escribir 5 ideas de posts para Instagram';
  if (source.includes('presupuesto') || source.includes('precio') || source.includes('finanza')) return 'Anotar costos, precio esperado y margen ideal';
  if (source.includes('web') || source.includes('site') || source.includes('pagina') || source.includes('página')) return 'Definir el objetivo principal de la página en una frase';
  if (source.includes('marca') || source.includes('logo') || source.includes('identidad')) return 'Buscar 3 referencias visuales para la identidad de marca';

  return `Elegir 1 resultado concreto para ${projectName} y escribir el primer paso`;
}

function inferTourismAction(project: ForUActiveProject, text: string) {
  const source = `${project.name} ${project.tangibleGoal ?? ''} ${text}`.toLowerCase();

  if (source.includes('whatsapp') || source.includes('consulta') || source.includes('reserva')) {
    return 'Redactar el mensaje de respuesta para una consulta por WhatsApp';
  }
  if (source.includes('precio') || source.includes('cupo') || source.includes('disponibilidad') || source.includes('calendario')) {
    return 'Definir cupos, precio base y fechas disponibles de la experiencia';
  }
  if (source.includes('foto') || source.includes('galería') || source.includes('galeria') || source.includes('imagen')) {
    return 'Elegir 5 fotos que transmitan confianza y deseo de viajar';
  }
  if (source.includes('historia') || source.includes('anfitri') || source.includes('guía') || source.includes('guia')) {
    return 'Escribir una historia breve del anfitrión y por qué esta experiencia existe';
  }
  if (source.includes('landing') || source.includes('web') || source.includes('página') || source.includes('pagina')) {
    return 'Armar el texto base de la landing: promesa, beneficios, itinerario y CTA';
  }

  return 'Definir la experiencia estrella con nombre, promesa, duración y próximo paso de reserva';
}

function inferGastronomyAction(project: ForUActiveProject, text: string) {
  const source = `${project.name} ${project.tangibleGoal ?? ''} ${text}`.toLowerCase();

  if (source.includes('whatsapp') || source.includes('pedido') || source.includes('delivery') || source.includes('reserva')) {
    return 'Redactar el mensaje de bienvenida para recibir pedidos por WhatsApp';
  }
  if (source.includes('precio') || source.includes('costo') || source.includes('margen') || source.includes('combo')) {
    return 'Calcular costo, precio y margen del producto estrella';
  }
  if (source.includes('foto') || source.includes('reel') || source.includes('instagram') || source.includes('contenido')) {
    return 'Crear 3 ideas de contenido de antojo para Instagram';
  }
  if (source.includes('menú') || source.includes('menu') || source.includes('plato') || source.includes('producto')) {
    return 'Elegir el producto estrella y escribir una descripción vendible';
  }
  if (source.includes('cliente') || source.includes('oficina') || source.includes('familia') || source.includes('evento')) {
    return 'Definir el cliente ideal y el momento de consumo principal';
  }

  return 'Definir el producto estrella con nombre, precio, canal de pedido y siguiente paso';
}

function buildNextAction(project: ForUActiveProject, rawNotes: ForURawNote[] = []): ForUNextAction | null {
  const normalizedProject = normalizeProject(project);
  const pendingNodes = normalizedProject.nodes
    .filter((node) => node.role === 'free' && !node.completedAt && node.taskStatus !== 'done')
    .sort((a, b) => {
      const priorityDifference = getPriorityWeight(a.priority) - getPriorityWeight(b.priority);
      if (priorityDifference !== 0) return priorityDifference;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  const nextNode = pendingNodes[0];

  if (nextNode) {
    return {
      id: `action-${nextNode.id}`,
      projectId: normalizedProject.id,
      sourceNodeId: nextNode.id,
      title: getConcreteActionTitle(nextNode),
      description: nextNode.description?.trim() || 'Dedica un bloque corto a esto. Sin abrir diez cosas a la vez.',
      estimatedMinutes: estimateActionMinutes(nextNode),
      rewardCoins: nextNode.priority === 'high' ? 30 : 20,
      priority: nextNode.priority ?? 'medium',
      isFallback: false,
    };
  }

  const ideaText = getRawIdeaText(normalizedProject, rawNotes);
  if (normalizedProject.industryKey === 'tourism') {
    return {
      id: `tourism-suggested-${normalizedProject.id}`,
      projectId: normalizedProject.id,
      title: inferTourismAction(normalizedProject, ideaText),
      description: 'Sugerencia especializada para turismo: convertir la experiencia en una acción que acerque reservas reales.',
      estimatedMinutes: 15,
      rewardCoins: 20,
      priority: 'medium',
      isFallback: true,
    };
  }

  if (normalizedProject.industryKey === 'gastronomy') {
    return {
      id: `gastronomy-suggested-${normalizedProject.id}`,
      projectId: normalizedProject.id,
      title: inferGastronomyAction(normalizedProject, ideaText),
      description: 'Sugerencia especializada para gastronomía: convertir la oferta en una acción que acerque pedidos reales.',
      estimatedMinutes: 15,
      rewardCoins: 20,
      priority: 'medium',
      isFallback: true,
    };
  }

  const suggestedTitle = inferConcreteActionFromText(ideaText, normalizedProject.name);
  if (suggestedTitle) {
    return {
      id: `suggested-${normalizedProject.id}`,
      projectId: normalizedProject.id,
      title: suggestedTitle,
      description: 'Sugerencia de For U basada en tus ideas del frasco. Si te sirve, dale Empezar y vamos juntas.',
      estimatedMinutes: 15,
      rewardCoins: 20,
      priority: 'medium',
      isFallback: true,
    };
  }

  return {
    id: `fallback-${normalizedProject.id}`,
    projectId: normalizedProject.id,
    title: 'Agrega más ideas al frasco para que pueda sugerirte una acción concreta',
    description: 'For U necesita un poquito más de contexto para ayudarte bien. Una frase suelta ya sirve.',
    estimatedMinutes: 5,
    rewardCoins: 0,
    priority: 'low',
    isFallback: true,
  };
}

function chooseFeelingForNode(project: ForUActiveProject, node?: Pick<ForUProjectNode, 'branchKey' | 'priority'>): ForUFeelingType | undefined {
  const feelings = project.targetFeelings ?? [];
  if (feelings.length === 0) return undefined;
  if (node?.branchKey === 'finances' && feelings.includes('abundance')) return 'abundance';
  if (node?.branchKey === 'marketing' && feelings.includes('connection')) return 'connection';
  if (node?.branchKey === 'ideas' && feelings.includes('creativity')) return 'creativity';
  if (node?.priority === 'high' && feelings.includes('peace')) return 'peace';
  return feelings[0];
}

function getFeelingProgressFromProject(project: ForUActiveProject, feeling: ForUFeelingType) {
  const freeNodes = normalizeProject(project).nodes.filter((node) => node.role === 'free');
  if (freeNodes.length === 0) return 0;

  const relevantNodes = freeNodes.filter((node) => (node.feelingType ?? chooseFeelingForNode(project, node)) === feeling);
  if (relevantNodes.length === 0) return 0;

  const completed = relevantNodes.filter((node) => node.completedAt || node.taskStatus === 'done').length;
  return Math.round((completed / relevantNodes.length) * 100);
}

function createHabitForFeeling(feeling: ForUFeelingType | null, date = getDayStamp()): ForURewiringHabit {
  const targetFeeling = feeling ?? 'confidence';
  const habits = rewiringHabitTemplates[targetFeeling] ?? rewiringHabitTemplates.confidence;
  const dayNumber = new Date(date).getDate();

  return {
    id: createId('habit'),
    userId: null,
    date,
    habit: habits[dayNumber % habits.length],
    completed: false,
    createdAt: now(),
  };
}

function summarizeMoodPattern(moods: ForUDailyMood[]) {
  if (moods.length === 0) return 'Todavía estamos aprendiendo tus ritmos emocionales.';

  const counts = moods.reduce<Record<ForUMoodType, number>>((acc, mood) => {
    acc[mood.mood] = (acc[mood.mood] ?? 0) + 1;
    return acc;
  }, {} as Record<ForUMoodType, number>);
  const dominantMood = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as ForUMoodType | undefined;
  if (!dominantMood) return 'Todavía estamos aprendiendo tus ritmos emocionales.';

  return `Últimamente aparece más ${moodLabels[dominantMood].label.toLowerCase()}. For U va a ajustar tus pasos a ese ritmo.`;
}

function applyIndustryTemplate(project: ForUActiveProject, timestamp: string): ForUActiveProject {
  if (!project.industryKey) return project;

  const template = industryTemplates[project.industryKey];
  if (!template) return project;

  const existingNodeIds = new Set((project.nodes ?? []).map((node) => node.id));
  const existingTaskIds = new Set((project.tasks ?? []).map((task) => task.id));
  const templateNodes: ForUProjectNode[] = template.nodes.map((node): ForUProjectNode => {
    const nodeId = `${project.id}-${node.idSuffix}`;

    return {
      id: nodeId,
      title: node.title,
      kind: node.branchKey === 'resources' ? 'resource' : node.branchKey === 'ideas' ? 'idea' : 'task',
      role: 'free',
      branchKey: node.branchKey,
      icon: node.icon,
      description: node.description,
      priority: node.priority,
      feelingType: node.feelingType,
      taskStatus: node.branchKey === 'ideas' || node.branchKey === 'resources' ? undefined : 'todo',
      x: node.x,
      y: node.y,
      lastActiveDate: timestamp,
      createdAt: timestamp,
    };
  }).filter((node) => !existingNodeIds.has(node.id));
  const templateEdges: ForUProjectEdge[] = templateNodes.map((node) => ({
    id: `${project.id}-edge-template-${node.id}`,
    source: getBranchNodeId(project.id, node.branchKey ?? 'actions'),
    target: node.id,
    createdAt: timestamp,
  }));
  const route: ForURouteStep[] = template.route.map((step) => ({
    id: `${project.id}-route-${step.idSuffix}`,
    title: step.title,
    linkedNodeId: `${project.id}-${step.linkedNodeSuffix}`,
  }));

  return {
    ...project,
    tangibleGoal: project.tangibleGoal || template.tangibleGoal,
    targetFeelings: project.targetFeelings.length ? project.targetFeelings : template.targetFeelings,
    strategyProfile: {
      ...template.strategyProfile,
      ...(project.strategyProfile ?? {}),
    },
    templateSource: project.templateSource ?? template.source,
    tasks: [
      ...project.tasks,
      ...templateNodes
        .filter((node) => node.taskStatus)
        .filter((node) => !existingTaskIds.has(node.id))
        .map((node) => ({
          id: node.id,
          title: node.title,
          status: node.taskStatus ?? 'todo',
          createdAt: node.createdAt,
          completedAt: node.completedAt,
        })),
    ],
    nodes: [...project.nodes, ...templateNodes],
    edges: [...project.edges, ...templateEdges],
    digitalRoute: project.digitalRoute.length ? project.digitalRoute : route,
  };
}

function createProject(input: CreateProjectInput): ForUActiveProject {
  const timestamp = now();
  const projectId = createId('project');
  const template = input.industryKey ? industryTemplates[input.industryKey] : null;
  const name = input.name.trim() || template?.defaultProjectName || 'Proyecto sin nombre';
  const base = createBaseMap(projectId, name, timestamp);

  const project: ForUActiveProject = {
    id: projectId,
    cloudPending: true,
    name,
    tangibleGoal: input.tangibleGoal?.trim() || template?.tangibleGoal,
    targetFeelings: input.targetFeelings ?? template?.targetFeelings ?? [],
    industryKey: input.industryKey,
    strategyProfile: {
      ...(template?.strategyProfile ?? {}),
      ...(input.strategyProfile ?? {}),
    },
    templateSource: input.templateSource ?? template?.source,
    status: input.status ?? 'active',
    tasks: [],
    nodes: base.nodes,
    edges: base.edges,
    digitalRoute: [],
    currentRouteIndex: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return applyIndustryTemplate(project, timestamp);
}

function touch(project: ForUActiveProject): ForUActiveProject {
  return { ...project, updatedAt: now() };
}

function normalizeProject(project: ForUActiveProject): ForUActiveProject {
  const timestamp = now();
  const base = createBaseMap(project.id, project.name, timestamp);
  const nodes = (project.nodes ?? []).map((node) => ({
    ...node,
    lastActiveDate: node.lastActiveDate ?? node.createdAt ?? project.updatedAt ?? timestamp,
  }));
  const edges = project.edges ?? [];
  const missingBaseNodes = base.nodes.filter((baseNode) => !nodes.some((node) => node.id === baseNode.id));
  const missingBaseEdges = base.edges.filter((baseEdge) => !edges.some((edge) => edge.id === baseEdge.id));

  return {
    ...project,
    tangibleGoal: project.tangibleGoal ?? '',
    targetFeelings: project.targetFeelings ?? [],
    industryKey: project.industryKey,
    strategyProfile: project.strategyProfile ?? {},
    templateSource: project.templateSource,
    tasks: project.tasks ?? [],
    nodes: [...missingBaseNodes, ...nodes],
    edges: [...missingBaseEdges, ...edges],
    digitalRoute: project.digitalRoute ?? [],
    currentRouteIndex: project.currentRouteIndex ?? 0,
  };
}

function normalizeTitle(value: string) {
  return value.trim().toLowerCase();
}

function getDigitalRouteOutputs(project: ForUActiveProject): Record<string, Record<string, string>> {
  const profile = project.strategyProfile ?? {};
  const routeSystem = profile.digitalRouteSystem;

  if (!routeSystem || typeof routeSystem !== 'object' || Array.isArray(routeSystem)) return {};
  const outputs = (routeSystem as { outputs?: unknown }).outputs;

  if (!outputs || typeof outputs !== 'object' || Array.isArray(outputs)) return {};
  return outputs as Record<string, Record<string, string>>;
}

function getDigitalRouteCompletedStepIds(project: ForUActiveProject): string[] {
  const profile = project.strategyProfile ?? {};
  const routeSystem = profile.digitalRouteSystem;

  if (!routeSystem || typeof routeSystem !== 'object' || Array.isArray(routeSystem)) return [];
  const completedStepIds = (routeSystem as { completedStepIds?: unknown }).completedStepIds;

  return Array.isArray(completedStepIds)
    ? completedStepIds.filter((item): item is string => typeof item === 'string')
    : [];
}

function getDigitalRouteCurrentStepId(project: ForUActiveProject) {
  const profile = project.strategyProfile ?? {};
  const routeSystem = profile.digitalRouteSystem;

  if (!routeSystem || typeof routeSystem !== 'object' || Array.isArray(routeSystem)) return undefined;
  const currentStepId = (routeSystem as { currentStepId?: unknown }).currentStepId;

  return typeof currentStepId === 'string' ? currentStepId : undefined;
}

function getRouteTaskMatches(project: ForUActiveProject, step: ForUDigitalRouteStepTemplate) {
  const freeNodes = normalizeProject(project).nodes.filter((node) => node.role === 'free');
  const taskTitles = new Set(step.tasks.map((task) => normalizeTitle(task.title)));
  const matchingNodes = freeNodes.filter((node) => taskTitles.has(normalizeTitle(node.title)));
  const completed = matchingNodes.filter((node) => Boolean(node.completedAt) || node.taskStatus === 'done').length;

  return {
    matchingNodes,
    created: matchingNodes.length,
    completed,
    total: step.tasks.length,
  };
}

function buildDigitalRouteStepStates(project: ForUActiveProject): ForUDigitalRouteStepState[] {
  const normalizedProject = normalizeProject(project);
  const template = getDigitalRouteTemplate(normalizedProject.industryKey);
  const completedStepIds = new Set(getDigitalRouteCompletedStepIds(normalizedProject));

  return template.steps.map((step) => {
    const matches = getRouteTaskMatches(normalizedProject, step);
    const status = completedStepIds.has(step.id)
      ? 'ready'
      : getStepCompletionStatus(matches.completed, matches.total);

    return {
      ...step,
      status,
      createdTasks: matches.created,
      completedTasks: matches.completed,
      totalTasks: matches.total,
    };
  });
}

export const baseBranches: Array<{
  key: ForUBranchKey;
  title: string;
  icon: string;
  x: number;
  y: number;
  color: string;
}> = [
  { key: 'ideas', title: 'Ideas', icon: '💡', x: 240, y: 210, color: '#EAEAEA' },
  { key: 'actions', title: 'Acciones', icon: '✅', x: 760, y: 210, color: '#9A9A9A' },
  { key: 'finances', title: 'Finanzas', icon: '💰', x: 830, y: 400, color: '#6B6B6B' },
  { key: 'marketing', title: 'Marketing', icon: '📱', x: 760, y: 590, color: '#9A9A9A' },
  { key: 'resources', title: 'Recursos', icon: '📚', x: 240, y: 590, color: '#9A9A9A' },
];

export function getCenterNodeId(projectId: string) {
  return `${projectId}-center`;
}

export function getBranchNodeId(projectId: string, branchKey: ForUBranchKey) {
  return `${projectId}-branch-${branchKey}`;
}

function createBaseMap(projectId: string, projectName: string, timestamp: string) {
  const centerNode: ForUProjectNode = {
    id: getCenterNodeId(projectId),
    title: projectName,
    kind: 'center',
    role: 'center',
    x: 500,
    y: 400,
    icon: '✨',
    locked: true,
    lastActiveDate: timestamp,
    createdAt: timestamp,
  };

  const branchNodes: ForUProjectNode[] = baseBranches.map((branch) => ({
    id: getBranchNodeId(projectId, branch.key),
    title: branch.title,
    kind: 'branch',
    role: 'branch',
    branchKey: branch.key,
    x: branch.x,
    y: branch.y,
    icon: branch.icon,
    locked: true,
    lastActiveDate: timestamp,
    createdAt: timestamp,
  }));

  const branchEdges: ForUProjectEdge[] = baseBranches.map((branch) => ({
    id: `${projectId}-edge-center-${branch.key}`,
    source: centerNode.id,
    target: getBranchNodeId(projectId, branch.key),
    createdAt: timestamp,
  }));

  return {
    nodes: [centerNode, ...branchNodes],
    edges: branchEdges,
  };
}

const starterProject = createProject({ name: 'Mi primer proyecto' });

const createActiveProjectsState = (set: any, get: any): ActiveProjectsState => ({
      activeProjectIds: [starterProject.id],
      activeProjectId: starterProject.id,
      currentProjectId: starterProject.id,
      lastCreatedProjectId: null,
      projectsById: {
        [starterProject.id]: starterProject,
      },
      rawNotes: [],
      isJarOpen: false,
      selectedNodeId: null,
      focusedBranch: null,
      viewLevel: 'archipelago',
      currentView: 'archipelago',
      archipelagoZoom: 0.45,
      archipelagoOffset: { x: 80, y: 80 },
      userLevel: 1,
      userXP: 0,
      xpToNextLevel: 100,
      coins: 0,
      weeklyMilestoneProgress: 0,
      userPlan: 'free',
      maxProjects: planConfigs.free.maxProjects,
      maxActionsPerMonth: planConfigs.free.maxActionsPerMonth,
      actionsThisMonth: 0,
      actionsMonthStamp: getMonthStamp(),
      dailyMoods: [],
      rewiringHabits: {},
      features: planConfigs.free.features,
      planLimitNotice: null,
      lastLoginDate: null,
      dailyStreak: 0,
      claimedDays: [],
      whatsappNumber: '',
      whatsappEnabled: false,
      cloudUserId: null,
      isCloudSyncing: false,
      projectLoadError: '',

      hydrateFromSupabase: async (userId) => {
        // Never import a previous account's persisted workspace into another tenant.
        if (get().cloudUserId !== userId) {
          get().resetWorkspace();
        }
        if (!supabase) {
          set({ cloudUserId: userId, isCloudSyncing: false, projectLoadError: 'Supabase no está configurado. No se pudieron consultar tus proyectos.' });
          return;
        }

        set({ cloudUserId: userId, isCloudSyncing: true, projectLoadError: '' });

        const [{ data: profileRow }, { data: projectRows, error: projectsError }] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
          supabase
            .from('projects')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true }),
        ]);

        if (get().cloudUserId !== userId) return;

        if (projectsError) {
          console.warn('No se pudieron cargar los proyectos:', projectsError.message);
          set({ isCloudSyncing: false, projectLoadError: `No se pudieron cargar tus proyectos: ${projectsError.message}` });
          return;
        }

        const cleanProjects = (projectRows ?? []) as SupabaseProjectRow[];
        const profile = profileRow as SupabaseProfileRow | null;
        const profilePlan = profile?.plan ?? get().userPlan ?? 'free';
        const profilePlanConfig = getPlanConfig(profilePlan);

        if (cleanProjects.length === 0) {
          const state = get();
          const localProjects = state.getAllProjects();
          await Promise.all(localProjects.map((project) => upsertCloudProject(userId, normalizeProject(project))));
          if (get().cloudUserId !== userId) return;
          set({
            cloudUserId: userId,
            isCloudSyncing: false,
          projectLoadError: '',
            userPlan: profilePlan,
            maxProjects: profilePlanConfig.maxProjects,
            maxActionsPerMonth: profilePlanConfig.maxActionsPerMonth,
            features: profilePlanConfig.features,
            coins: profile?.coins ?? state.coins,
            dailyStreak: profile?.streak ?? state.dailyStreak,
            whatsappNumber: profile?.whatsapp_number ?? state.whatsappNumber ?? '',
            whatsappEnabled: profile?.whatsapp_enabled ?? state.whatsappEnabled ?? false,
          });
          return;
        }

        const projectIds = cleanProjects.map((project) => project.id);
        const [{ data: taskRows }, { data: ideaRows }, { data: feelingRows }, { data: moodRows }, { data: habitRows }] = await Promise.all([
          supabase.from('tasks').select('*, projects!inner(user_id)').eq('projects.user_id', userId).in('project_id', projectIds),
          supabase.from('ideas').select('*, projects!inner(user_id)').eq('projects.user_id', userId).in('project_id', projectIds),
          supabase.from('project_feelings').select('*, projects!inner(user_id)').eq('projects.user_id', userId).in('project_id', projectIds),
          supabase.from('daily_mood').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(30),
          supabase.from('rewiring_habits').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(14),
        ]);

        const tasksByProject = ((taskRows ?? []) as SupabaseTaskRow[]).reduce<Record<string, SupabaseTaskRow[]>>((acc, task) => {
          acc[task.project_id] = [...(acc[task.project_id] ?? []), task];
          return acc;
        }, {});
        const ideasByProject = ((ideaRows ?? []) as SupabaseIdeaRow[]).reduce<Record<string, SupabaseIdeaRow[]>>((acc, idea) => {
          acc[idea.project_id] = [...(acc[idea.project_id] ?? []), idea];
          return acc;
        }, {});
        const feelingsByProject = ((feelingRows ?? []) as SupabaseProjectFeelingRow[]).reduce<Record<string, ForUFeelingType[]>>((acc, feeling) => {
          acc[feeling.project_id] = [...(acc[feeling.project_id] ?? []), feeling.feeling_type];
          return acc;
        }, {});

        const nextProjects = Object.fromEntries(cleanProjects.map((row) => {
          const timestamp = row.created_at ?? now();
          const base = createBaseMap(row.id, row.name, timestamp);
          const rowFeelings = feelingsByProject[row.id] ?? [];
          const taskNodes = (tasksByProject[row.id] ?? []).map((task, index): ForUProjectNode => ({
            id: task.id,
            title: task.title,
            kind: 'task',
            role: 'free',
            branchKey: 'actions',
            icon: '✅',
            description: task.description ?? undefined,
            priority: task.priority ?? 'medium',
            feelingType: task.feeling_type ?? rowFeelings[0],
            taskStatus: task.status ?? 'todo',
            completedAt: task.completed_at ?? undefined,
            ...getBranchPosition('actions', index),
            lastActiveDate: task.completed_at ?? task.created_at ?? timestamp,
            createdAt: task.created_at ?? timestamp,
          }));
          const ideaNodes = (ideasByProject[row.id] ?? []).map((idea, index): ForUProjectNode => ({
            id: idea.id,
            title: idea.content.slice(0, 76) || 'Idea',
            kind: 'idea',
            role: 'free',
            branchKey: 'ideas',
            icon: '💡',
            description: idea.content,
            priority: 'low',
            ...getBranchPosition('ideas', index),
            lastActiveDate: idea.created_at ?? timestamp,
            createdAt: idea.created_at ?? timestamp,
          }));
          const cloudEdges: ForUProjectEdge[] = [...taskNodes, ...ideaNodes].map((node) => ({
            id: `edge-${row.id}-${node.id}`,
            source: getBranchNodeId(row.id, node.branchKey ?? 'actions'),
            target: node.id,
            createdAt: node.createdAt,
          }));
          const project: ForUActiveProject = normalizeProject({
            id: row.id,
            cloudPending: false,
            name: row.name,
            tangibleGoal: row.tangible_goal ?? '',
            targetFeelings: rowFeelings,
            industryKey: row.industry_key ?? undefined,
            strategyProfile: row.strategy_profile ?? {},
            templateSource: row.template_source ?? undefined,
            status: row.status ?? 'active',
            tasks: taskNodes.map((node) => ({
              id: node.id,
              title: node.title,
              status: node.taskStatus ?? 'todo',
              createdAt: node.createdAt,
              completedAt: node.completedAt,
            })),
            nodes: [...base.nodes, ...taskNodes, ...ideaNodes],
            edges: [...base.edges, ...cloudEdges],
            digitalRoute: [],
            currentRouteIndex: 0,
            createdAt: timestamp,
            updatedAt: timestamp,
          });

          return [project.id, applyIndustryTemplate(project, timestamp)];
        }));

        const previousId = get().activeProjectId;
        const firstProjectId = previousId && nextProjects[previousId] ? previousId : cleanProjects[0]?.id ?? null;

        if (get().cloudUserId !== userId) return;

        const pendingProjects = Object.fromEntries(Object.entries(get().projectsById as Record<string, ForUActiveProject>)
          .filter(([id]) => !nextProjects[id])
          .map(([id, project]) => [id, { ...project, cloudPending: true }]));

        set({
          activeProjectIds: projectIds,
          activeProjectId: firstProjectId,
          currentProjectId: firstProjectId,
          projectsById: { ...pendingProjects, ...nextProjects },
          rawNotes: [],
          selectedNodeId: null,
          focusedBranch: null,
          cloudUserId: userId,
          isCloudSyncing: false,
          projectLoadError: '',
          userPlan: profilePlan,
          maxProjects: profilePlanConfig.maxProjects,
          maxActionsPerMonth: profilePlanConfig.maxActionsPerMonth,
          features: profilePlanConfig.features,
          coins: profile?.coins ?? get().coins,
          dailyStreak: profile?.streak ?? get().dailyStreak,
          whatsappNumber: profile?.whatsapp_number ?? '',
          whatsappEnabled: profile?.whatsapp_enabled ?? false,
          dailyMoods: ((moodRows ?? []) as SupabaseDailyMoodRow[]).map((mood) => ({
            id: mood.id,
            userId: mood.user_id,
            date: mood.date,
            mood: mood.mood,
            notes: mood.notes ?? undefined,
            createdAt: mood.created_at,
          })),
          rewiringHabits: Object.fromEntries(((habitRows ?? []) as SupabaseRewiringHabitRow[]).map((habit) => [
            habit.date,
            {
              id: habit.id,
              userId: habit.user_id,
              date: habit.date,
              habit: habit.habit,
              completed: habit.completed,
              createdAt: habit.created_at,
            },
          ])),
        });
      },

      clearCloudUser: () => { get().resetWorkspace(); clearSessionCaches(); },

      updateWhatsappSettings: async ({ whatsappNumber, whatsappEnabled }) => {
        const cleanNumber = whatsappNumber.trim().replace(/[^\d+]/g, '');
        const normalizedNumber = cleanNumber && !cleanNumber.startsWith('+') ? `+${cleanNumber}` : cleanNumber;

        set({
          whatsappNumber: normalizedNumber,
          whatsappEnabled: Boolean(whatsappEnabled && normalizedNumber),
        });

        if (!canSyncCloud(get().cloudUserId) || !supabase) return true;

        const { error } = await supabase
          .from('profiles')
          .update({
            whatsapp_number: normalizedNumber || null,
            whatsapp_enabled: Boolean(whatsappEnabled && normalizedNumber),
          })
          .eq('id', get().cloudUserId);

        if (error) {
          console.warn('No se pudo guardar WhatsApp:', error.message);
          return false;
        }

        return true;
      },

      setUserPlan: (plan) => {
        const config = getPlanConfig(plan);
        set({
          userPlan: plan,
          maxProjects: config.maxProjects,
          maxActionsPerMonth: config.maxActionsPerMonth,
          features: config.features,
          planLimitNotice: null,
        });
        void updateCloudProfile(get().cloudUserId, { plan });
      },

      canUseFeature: (feature) => {
        const state = get();
        return Boolean((state.features ?? getPlanConfig(state.userPlan ?? 'free').features)[feature]);
      },

      clearPlanLimitNotice: () => set({ planLimitNotice: null }),

      getAllProjects: () => {
        const state = get();
        const projectIds = getProjectOrder(state);

        return projectIds
          .map((projectId) => state.projectsById[projectId])
          .filter(Boolean)
          .map((project) => normalizeProject(project));
      },

      getActiveProjects: () => {
        const state = get();
        const projectIds = getProjectOrder(state);

        return projectIds
          .map((projectId) => state.projectsById[projectId])
          .filter((project): project is ForUActiveProject => Boolean(project) && project.status === 'active')
          .map((project) => normalizeProject(project));
      },

      getProjectById: (projectId) => {
        const project = get().projectsById[projectId];
        return project ? normalizeProject(project) : null;
      },

      getProjectState: (projectId) => {
        const state = get();
        const storedProject = state.projectsById[projectId];
        if (!storedProject) return 'empty';

        const project = normalizeProject(storedProject);
        const rawNotesForProject = state.rawNotes.filter((note) =>
          !note.processedAt && (note.projectId === projectId || (!note.projectId && projectId === state.activeProjectId)),
        );
        const freeNodes = project.nodes.filter((node) => node.role === 'free');
        const completedNodes = freeNodes.filter((node) => node.completedAt || node.taskStatus === 'done');
        const routeIsComplete = project.digitalRoute.length > 0
          && project.digitalRoute.every((step) => Boolean(step.completedAt))
          && project.currentRouteIndex >= project.digitalRoute.length;

        if (routeIsComplete) return 'completed';
        if (rawNotesForProject.length > 0) return 'raw';
        if (freeNodes.length === 0) return 'empty';
        if (project.digitalRoute.length === 0) return 'organized';
        if (completedNodes.length === 0) return 'planned';

        return 'active';
      },

      getGuidedExecutionTasks: (projectId) => {
        const project = get().projectsById[projectId];
        if (!project) return [];

        const normalizedProject = normalizeProject(project);
        const routeNodeIds = normalizedProject.digitalRoute.map((step) => step.linkedNodeId);
        const routeTasks = routeNodeIds
          .map((nodeId) => normalizedProject.nodes.find((node) => node.id === nodeId))
          .filter((node): node is ForUProjectNode => Boolean(node) && node.role === 'free');
        const otherTasks = normalizedProject.nodes.filter((node) =>
          node.role === 'free' && !routeNodeIds.includes(node.id),
        );

        return [...routeTasks, ...otherTasks].filter((node) => !node.completedAt && node.taskStatus !== 'done');
      },

      getGuidedExecutionCompletedCount: (projectId) => {
        const project = get().projectsById[projectId];
        if (!project) return 0;

        return normalizeProject(project).nodes.filter((node) =>
          node.role === 'free' && (node.completedAt || node.taskStatus === 'done'),
        ).length;
      },

      completeGuidedExecutionTask: (projectId, nodeId) => {
        const storedProject = get().projectsById[projectId];
        if (!storedProject) return false;

        const project = normalizeProject(storedProject);
        const node = project.nodes.find((item) => item.id === nodeId);
        if (!node || node.completedAt || node.taskStatus === 'done') return false;

        get().updateNode(projectId, nodeId, {
          taskStatus: 'done',
          completedAt: now(),
          rewardCoins: (node.rewardCoins ?? 0) + 20,
        });
        get().addCoins(20);
        get().addXP(20);

        return true;
      },

      getNextAction: (projectId) => {
        const state = get();
        const project = state.projectsById[projectId];
        return project ? buildNextAction(project, state.rawNotes) : null;
      },

      getPersonalDashboardProjects: () => {
        const state = get();
        const projects = state.getActiveProjects();

        return projects
          .map((project) => {
            const pendingCount = project.nodes.filter((node) =>
              node.role === 'free' && !node.completedAt && node.taskStatus !== 'done',
            ).length;

            return {
              project,
              nextAction: buildNextAction(project, state.rawNotes),
              pendingCount,
            };
          })
          .sort((a, b) => {
            if (a.pendingCount > 0 && b.pendingCount === 0) return -1;
            if (a.pendingCount === 0 && b.pendingCount > 0) return 1;
            const priorityDifference = getPriorityWeight(a.nextAction?.priority) - getPriorityWeight(b.nextAction?.priority);
            if (priorityDifference !== 0) return priorityDifference;
            return b.pendingCount - a.pendingCount;
          });
      },

      generateNextAction: (projectId) => {
        const state = get();
        const storedProject = state.projectsById[projectId];
        if (!storedProject) return null;

        const project = normalizeProject(storedProject);
        const pendingAction = buildNextAction(project, state.rawNotes);
        if (pendingAction?.sourceNodeId) return pendingAction;

        const ideaText = getRawIdeaText(project, state.rawNotes);
        const title = inferConcreteActionFromText(ideaText, project.name);
        if (!title) return pendingAction;

        const nodeId = get().addFreeNodeToBranch(projectId, 'actions', {
          title,
          kind: 'task',
          icon: '✅',
          priority: 'medium',
          description: 'Sugerido por For U a partir de tus ideas del frasco.',
          x: 690,
          y: 250,
        });

        if (!nodeId) return pendingAction;

        return get().getNextAction(projectId);
      },

      completeNextAction: (projectId, actionId) => {
        const state = get();
        const storedProject = state.projectsById[projectId];
        if (!storedProject) return false;
        const monthStamp = getMonthStamp();
        const actionsThisMonth = state.actionsMonthStamp === monthStamp ? state.actionsThisMonth : 0;
        const config = getPlanConfig(state.userPlan ?? 'free');

        if (actionsThisMonth >= config.maxActionsPerMonth) {
          set({
            actionsThisMonth,
            actionsMonthStamp: monthStamp,
            planLimitNotice: {
              title: 'Upgrade a Pro para acciones ilimitadas',
              message: 'Ya usaste tus acciones gratis de este mes. Pro mantiene el impulso sin cortar el flujo.',
              feature: 'actions',
            },
          });
          return false;
        }

        const action = buildNextAction(storedProject, state.rawNotes);
        if (!action || action.id !== actionId) return false;

        if (action.sourceNodeId) {
          get().updateNode(projectId, action.sourceNodeId, {
            taskStatus: 'done',
            completedAt: now(),
            rewardCoins: (storedProject.nodes.find((node) => node.id === action.sourceNodeId)?.rewardCoins ?? 0) + action.rewardCoins,
          });
        } else {
          get().addCoins(action.rewardCoins);
        }

        get().addXP(action.isFallback ? 5 : 20);
        set((latestState) => {
          const latestMonthStamp = getMonthStamp();
          const latestActions = latestState.actionsMonthStamp === latestMonthStamp ? latestState.actionsThisMonth : 0;
          const nextActions = latestActions + 1;

          return {
            actionsThisMonth: nextActions,
            actionsMonthStamp: latestMonthStamp,
            planLimitNotice: latestState.userPlan === 'free' && nextActions >= planConfigs.free.maxActionsPerMonth
              ? {
                  title: 'Upgrade a Pro para acciones ilimitadas',
                  message: 'Llegaste al límite gratis de acciones mensuales. Pro te deja seguir sin fricción.',
                  feature: 'actions',
                }
              : latestState.planLimitNotice,
          };
        });
        return true;
      },

      setProjectEmotionalOnboarding: async (projectId, input) => {
        const targetFeelings = Array.from(new Set(input.targetFeelings)).slice(0, 4);
        const tangibleGoal = input.tangibleGoal.trim();

        set((state) => {
          const project = state.projectsById[projectId];
          if (!project) return state;

          const normalizedProject = normalizeProject(project);
          const nextProject = touch({
            ...normalizedProject,
            tangibleGoal,
            targetFeelings,
            nodes: normalizedProject.nodes.map((node) =>
              node.role === 'free' && !node.feelingType
                ? { ...node, feelingType: chooseFeelingForNode({ ...normalizedProject, targetFeelings }, node) }
                : node,
            ),
          });

          return {
            projectsById: {
              ...state.projectsById,
              [projectId]: nextProject,
            },
          };
        });

        const project = get().projectsById[projectId];
        if (project) void upsertCloudProject(get().cloudUserId, normalizeProject(project));

        if (canSyncCloud(get().cloudUserId) && supabase) {
          await supabase.from('project_feelings').delete().eq('project_id', projectId);
          if (targetFeelings.length > 0) {
            const { error } = await supabase.from('project_feelings').insert(
              targetFeelings.map((feeling) => ({
                project_id: projectId,
                feeling_type: feeling,
              })),
            );
            if (error) return false;
          }
        }

        return true;
      },

      getProjectPrimaryFeeling: (projectId) => {
        const project = get().projectsById[projectId];
        if (!project) return null;
        return normalizeProject(project).targetFeelings[0] ?? null;
      },

      getFeelingProgress: (projectId, feeling) => {
        const project = get().projectsById[projectId];
        return project ? getFeelingProgressFromProject(normalizeProject(project), feeling) : 0;
      },

      addDailyMood: async ({ mood, notes }) => {
        const date = getDayStamp();
        const moodEntry: ForUDailyMood = {
          id: createId('mood'),
          userId: get().cloudUserId,
          date,
          mood,
          notes: notes?.trim() || undefined,
          createdAt: now(),
        };

        set((state) => ({
          dailyMoods: [moodEntry, ...state.dailyMoods.filter((entry) => !(entry.date === date && entry.mood === mood))].slice(0, 60),
        }));

        if (canSyncCloud(get().cloudUserId) && supabase) {
          const { error } = await supabase.from('daily_mood').upsert({
            user_id: get().cloudUserId,
            date,
            mood,
            notes: notes?.trim() || null,
          }, { onConflict: 'user_id,date,mood' });

          return !error;
        }

        return true;
      },

      getMoodPatternSummary: () => summarizeMoodPattern(get().dailyMoods),

      getTodayHabit: (projectId) => {
        const date = getDayStamp();
        const existingHabit = get().rewiringHabits[date];
        if (existingHabit) return existingHabit;

        const primaryFeeling = projectId ? get().getProjectPrimaryFeeling(projectId) : null;
        const habit = createHabitForFeeling(primaryFeeling, date);

        set((state) => ({
          rewiringHabits: {
            ...state.rewiringHabits,
            [date]: { ...habit, userId: state.cloudUserId },
          },
        }));

        if (canSyncCloud(get().cloudUserId) && supabase) {
          void supabase.from('rewiring_habits').upsert({
            user_id: get().cloudUserId,
            date,
            habit: habit.habit,
            completed: false,
          }, { onConflict: 'user_id,date' });
        }

        return { ...habit, userId: get().cloudUserId };
      },

      completeTodayHabit: async () => {
        const date = getDayStamp();
        const habit = get().rewiringHabits[date] ?? get().getTodayHabit(get().activeProjectId);

        set((state) => ({
          rewiringHabits: {
            ...state.rewiringHabits,
            [date]: { ...habit, completed: true },
          },
        }));

        if (canSyncCloud(get().cloudUserId) && supabase) {
          const { error } = await supabase.from('rewiring_habits').upsert({
            user_id: get().cloudUserId,
            date,
            habit: habit.habit,
            completed: true,
          }, { onConflict: 'user_id,date' });
          return !error;
        }

        return true;
      },

      backgroundOrganizeText: async (projectId, text) => {
        const cleanText = text.trim();
        if (!cleanText) return get().getNextAction(projectId);

        const notes = cleanText
          .split(/\n+/)
          .map((line) => line.trim())
          .filter(Boolean);
        const rawNotes = notes.length > 0 ? notes : [cleanText];

        rawNotes.forEach((content) => {
          get().addRawNote({ projectId, kind: 'text', content });
        });

        const action = get().generateNextAction(projectId);
        return action;
      },

      getProjectProgress: (projectId) => {
        const project = get().projectsById[projectId];
        if (!project) return 0;

        const nodes = normalizeProject(project).nodes.filter((node) => node.role === 'free');
        if (nodes.length === 0) return 0;

        const completed = nodes.filter((node) => node.completedAt || node.taskStatus === 'done').length;
        return Math.round((completed / nodes.length) * 100);
      },

      getDigitalRouteSteps: (projectId) => {
        const project = get().projectsById[projectId];
        return project ? buildDigitalRouteStepStates(normalizeProject(project)) : [];
      },

      getCurrentDigitalRouteStep: (projectId) => {
        const project = get().projectsById[projectId];
        if (!project) return null;

        const normalizedProject = normalizeProject(project);
        const steps = buildDigitalRouteStepStates(normalizedProject);
        const explicitCurrentStepId = getDigitalRouteCurrentStepId(normalizedProject);
        const explicitStep = explicitCurrentStepId ? steps.find((step) => step.id === explicitCurrentStepId) : null;

        return explicitStep ?? steps.find((step) => step.status !== 'ready') ?? steps[steps.length - 1] ?? null;
      },

      createTasksForDigitalRouteStep: (projectId, stepId) => {
        const storedProject = get().projectsById[projectId];
        if (!storedProject) return [];

        const project = normalizeProject(storedProject);
        const template = getDigitalRouteTemplate(project.industryKey);
        const step = template.steps.find((item) => item.id === stepId);
        if (!step) return [];

        const existingTitles = new Set(project.nodes.filter((node) => node.role === 'free').map((node) => normalizeTitle(node.title)));
        const missingTasks = step.tasks.filter((task) => !existingTitles.has(normalizeTitle(task.title)));
        const createdIds = missingTasks.map((task, index) => {
          const guidedDescription = [
            task.description,
            task.time ? `Tiempo sugerido: ${task.time}.` : null,
            task.tools?.length ? `Herramientas: ${task.tools.join(', ')}.` : null,
            task.tip ? `Tip For U: ${task.tip}` : null,
            task.example ? `Ejemplo: ${task.example}` : null,
          ].filter(Boolean).join('\n\n');

          return get().addFreeNodeToBranch(projectId, task.branchKey, {
            title: task.title,
            kind: 'task',
            icon: '✅',
            priority: task.priority,
            description: guidedDescription,
            taskStatus: 'todo',
            rewardCoins: 20,
            x: 620 + index * 38,
            y: 280 + index * 42,
          });
        }).filter((id): id is string => Boolean(id));

        set((state) => {
          const latestProject = state.projectsById[projectId];
          if (!latestProject) return state;
          const normalizedLatestProject = normalizeProject(latestProject);
          const outputs = getDigitalRouteOutputs(normalizedLatestProject);

          return {
            projectsById: {
              ...state.projectsById,
              [projectId]: touch({
                ...normalizedLatestProject,
                strategyProfile: {
                  ...(normalizedLatestProject.strategyProfile ?? {}),
                  digitalRouteSystem: {
                    ...((normalizedLatestProject.strategyProfile?.digitalRouteSystem as Record<string, unknown> | undefined) ?? {}),
                    currentStepId: step.id,
                    outputs: {
                      ...outputs,
                      [step.outputKey]: outputs[step.outputKey] ?? step.defaultOutputs,
                    },
                  },
                },
              }),
            },
          };
        });

        const updatedProject = get().projectsById[projectId];
        if (updatedProject) void upsertCloudProject(get().cloudUserId, normalizeProject(updatedProject));
        return createdIds;
      },

      completeDigitalRouteStep: (projectId, stepId) => {
        const storedProject = get().projectsById[projectId];
        if (!storedProject) return false;

        const project = normalizeProject(storedProject);
        const steps = buildDigitalRouteStepStates(project);
        const step = steps.find((item) => item.id === stepId);
        if (!step) return false;

        set((state) => {
          const latestProject = state.projectsById[projectId];
          if (!latestProject) return state;
          const normalizedLatestProject = normalizeProject(latestProject);
          const completedStepIds = Array.from(new Set([...getDigitalRouteCompletedStepIds(normalizedLatestProject), stepId]));
          const template = getDigitalRouteTemplate(normalizedLatestProject.industryKey);
          const nextStep = template.steps.find((item) => !completedStepIds.includes(item.id));
          const outputs = getDigitalRouteOutputs(normalizedLatestProject);

          return {
            projectsById: {
              ...state.projectsById,
              [projectId]: touch({
                ...normalizedLatestProject,
                strategyProfile: {
                  ...(normalizedLatestProject.strategyProfile ?? {}),
                  digitalRouteSystem: {
                    ...((normalizedLatestProject.strategyProfile?.digitalRouteSystem as Record<string, unknown> | undefined) ?? {}),
                    completedStepIds,
                    currentStepId: nextStep?.id ?? stepId,
                    outputs: {
                      ...outputs,
                      [step.outputKey]: outputs[step.outputKey] ?? step.defaultOutputs,
                    },
                  },
                },
              }),
            },
          };
        });

        get().addCoins(20);
        get().addXP(35);
        const updatedProject = get().projectsById[projectId];
        if (updatedProject) void upsertCloudProject(get().cloudUserId, normalizeProject(updatedProject));
        return true;
      },

      getDustyNodes: () => {
        const state = get();
        const cutoff = Date.now() - DUST_THRESHOLD_MS;

        return getProjectOrder(state)
          .flatMap((projectId) => {
            const project = state.projectsById[projectId];
            return project ? normalizeProject(project).nodes : [];
          })
          .filter((node) => {
            if (node.locked || node.completedAt) return false;
            return new Date(node.lastActiveDate).getTime() < cutoff;
          });
      },

      switchProject: (projectId) => {
        if (!get().projectsById[projectId]) return;
        set({
          activeProjectId: projectId,
          currentProjectId: projectId,
          selectedNodeId: null,
          focusedBranch: null,
          viewLevel: 'archipelago',
        });
      },

      clearLastCreatedProject: () => set({ lastCreatedProjectId: null }),

      setView: (view) => set({ currentView: view, selectedNodeId: null }),

      setZoom: (level) => set({ archipelagoZoom: clampZoom(level) }),

      setArchipelagoOffset: (offset) => set({ archipelagoOffset: offset }),

      panToIsland: (projectId) => {
        const state = get();
        const index = Math.max(0, getProjectOrder(state).indexOf(projectId));
        const columns = 3;
        const column = index % columns;
        const row = Math.floor(index / columns);

        set({
          activeProjectId: projectId,
          currentProjectId: projectId,
          currentView: 'archipelago',
          selectedNodeId: null,
          focusedBranch: null,
          archipelagoZoom: 1.45,
          archipelagoOffset: {
            x: 150 - column * 860,
            y: 110 - row * 660,
          },
        });
      },

      resetArchipelagoView: () => set({
        currentView: 'archipelago',
        archipelagoZoom: 0.45,
        archipelagoOffset: { x: 80, y: 80 },
        selectedNodeId: null,
        focusedBranch: null,
      }),

      addXP: (amount) => {
        const cleanAmount = Math.max(0, Math.floor(amount));
        if (cleanAmount === 0) return;

        set((state) => {
          let nextLevel = state.userLevel;
          let nextXP = state.userXP + cleanAmount;
          const xpToNextLevel = state.xpToNextLevel || 100;

          while (nextXP >= xpToNextLevel) {
            nextLevel += 1;
            nextXP -= xpToNextLevel;
          }

          return {
            userLevel: nextLevel,
            userXP: nextXP,
            xpToNextLevel,
          };
        });
      },

      addCoins: (amount) => {
        const cleanAmount = Math.max(0, Math.floor(amount));
        if (cleanAmount === 0) return;

        set((state) => ({
          coins: state.coins + cleanAmount,
        }));
        const nextCoins = get().coins;
        void updateCloudProfile(get().cloudUserId, { coins: nextCoins });
      },

      checkWeeklyMilestone: () => {
        const progress = get().weeklyMilestoneProgress;
        const milestoneAchieved = progress >= WEEKLY_MILESTONE_GOAL;

        if (milestoneAchieved) {
          set({ weeklyMilestoneProgress: 0 });
        }

        return { milestoneAchieved };
      },

      checkDailyReward: () => {
        const state = get();
        const today = getDayStamp();
        const alreadyClaimedToday = state.lastLoginDate === today;
        const cleanStreak = state.lastLoginDate === getPreviousDayStamp() || alreadyClaimedToday ? state.dailyStreak : 0;
        const currentDay = alreadyClaimedToday
          ? Math.max(1, Math.min(cleanStreak, dailyRewards.length))
          : cleanStreak >= dailyRewards.length
            ? 1
            : cleanStreak + 1;

        return {
          shouldShow: !alreadyClaimedToday,
          currentDay,
          reward: dailyRewards[currentDay - 1] ?? dailyRewards[dailyRewards.length - 1],
        };
      },

      claimDailyReward: (day) => {
        const rewardStatus = get().checkDailyReward();
        const rewardDay = day ?? rewardStatus.currentDay;
        const reward = dailyRewards[rewardDay - 1];
        if (!reward) return false;

        const today = getDayStamp();
        const state = get();
        const continuedStreak = state.lastLoginDate === getPreviousDayStamp();
        const cycleFinished = continuedStreak && state.dailyStreak >= dailyRewards.length;
        if (state.lastLoginDate === today || (!cycleFinished && state.claimedDays.includes(rewardDay))) return false;
        const nextStreak = continuedStreak && !cycleFinished ? state.dailyStreak + 1 : 1;
        const cleanDay = Math.min(rewardDay, dailyRewards.length);

        set({
          coins: state.coins + reward,
          lastLoginDate: today,
          dailyStreak: nextStreak,
          claimedDays: Array.from(new Set([...(continuedStreak && !cycleFinished ? state.claimedDays : []), cleanDay])).slice(0, dailyRewards.length),
        });
        void updateCloudProfile(get().cloudUserId, { coins: get().coins, streak: nextStreak });

        return true;
      },

      openProject: (input) => {
        const state = get();
        const config = getPlanConfig(state.userPlan ?? 'free');
        if (!explorationProjectsAreUnlimited && state.getActiveProjects().length >= config.maxProjects) {
          set({
            planLimitNotice: {
              title: 'Upgrade a Pro para proyectos ilimitados',
              message: 'Gratis incluye 1 proyecto activo. Pro te deja abrir todos los proyectos que necesites sin cerrar ninguno.',
              feature: 'projects',
            },
          });
          return state.activeProjectId ?? '';
        }

        const project = createProject(input);

        set((state) => ({
          activeProjectIds: [...state.activeProjectIds, project.id],
          activeProjectId: project.id,
          currentProjectId: project.id,
          lastCreatedProjectId: project.id,
          selectedNodeId: null,
          focusedBranch: null,
          viewLevel: 'archipelago',
          currentView: 'archipelago',
          archipelagoZoom: 0.45,
          archipelagoOffset: { x: 80, y: 80 },
          projectsById: {
            ...state.projectsById,
            [project.id]: project,
          },
        }));

        void upsertCloudProject(get().cloudUserId, project);
        void Promise.all(project.nodes.map((node) => upsertCloudTask(get().cloudUserId, project.id, node)));
        return project.id;
      },

      focusProject: (projectId) => {
        if (!get().projectsById[projectId]) return;
        set({ activeProjectId: projectId, currentProjectId: projectId, selectedNodeId: null, focusedBranch: null, viewLevel: 'archipelago' });
      },

      closeProject: (projectId) => {
        const cloudUserId = get().cloudUserId;
        set((state) => {
          const nextActiveIds = state.activeProjectIds.filter((id) => id !== projectId);
          const { [projectId]: _closedProject, ...nextProjects } = state.projectsById;
          const nextFocusedId =
            state.activeProjectId === projectId
              ? nextActiveIds[nextActiveIds.length - 1] ?? null
              : state.activeProjectId;

          return {
          activeProjectIds: nextActiveIds,
          activeProjectId: nextFocusedId,
          currentProjectId: nextFocusedId,
          lastCreatedProjectId: state.lastCreatedProjectId === projectId ? null : state.lastCreatedProjectId,
          selectedNodeId: state.activeProjectId === projectId ? null : state.selectedNodeId,
            focusedBranch: state.activeProjectId === projectId ? null : state.focusedBranch,
            viewLevel: state.activeProjectId === projectId ? 'archipelago' : state.viewLevel,
            projectsById: nextProjects,
          };
        });
        void deleteCloudProject(cloudUserId, projectId);
      },

      renameProject: (projectId, name) => {
        set((state) => {
          const storedProject = state.projectsById[projectId];
          if (!storedProject) return state;
          const project = normalizeProject(storedProject);
          const nextName = name.trim() || project.name;

          return {
            projectsById: {
              ...state.projectsById,
              [projectId]: touch({
                ...project,
                name: nextName,
                nodes: project.nodes.map((node) =>
                  node.role === 'center' ? { ...node, title: nextName } : node,
                ),
              }),
            },
          };
        });
        const project = get().projectsById[projectId];
        if (project) void upsertCloudProject(get().cloudUserId, normalizeProject(project));
      },

      updateProjectStatus: (projectId, status) => {
        set((state) => {
          const project = state.projectsById[projectId];
          if (!project) return state;

          return {
            projectsById: {
              ...state.projectsById,
              [projectId]: touch({ ...project, status }),
            },
          };
        });
        const project = get().projectsById[projectId];
        if (project) void upsertCloudProject(get().cloudUserId, normalizeProject(project));
      },

      addTask: (projectId, title) => {
        const storedProject = get().projectsById[projectId];
        const project = storedProject ? normalizeProject(storedProject) : null;
        if (!project) return null;

        const task: ForUTask = {
          id: createId('task'),
          title: title.trim() || 'Microaccion sin titulo',
          status: 'todo',
          createdAt: now(),
        };

        set((state) => ({
          projectsById: {
            ...state.projectsById,
            [projectId]: touch({
              ...project,
              tasks: [...project.tasks, task],
            }),
          },
        }));

        if (canSyncCloud(get().cloudUserId)) {
          void supabase?.from('tasks').upsert({
            id: task.id,
            project_id: projectId,
            title: task.title,
            description: null,
            status: task.status,
            priority: 'medium',
            estimated_time: 15,
            completed_at: null,
          });
        }
        return task.id;
      },

      updateTaskStatus: (projectId, taskId, status) => {
        set((state) => {
          const storedProject = state.projectsById[projectId];
          if (!storedProject) return state;
          const project = normalizeProject(storedProject);

          return {
            projectsById: {
              ...state.projectsById,
              [projectId]: touch({
                ...project,
                tasks: project.tasks.map((task) =>
                  task.id === taskId
                    ? { ...task, status, completedAt: status === 'done' ? now() : undefined }
                    : task,
                ),
              }),
            },
          };
        });
        const project = get().projectsById[projectId];
        const task = project?.tasks.find((item) => item.id === taskId);
        if (task && canSyncCloud(get().cloudUserId)) {
          void supabase?.from('tasks').upsert({
            id: task.id,
            project_id: projectId,
            title: task.title,
            description: null,
            status: task.status,
            priority: 'medium',
            estimated_time: 15,
            completed_at: task.completedAt ?? null,
          });
        }
      },

      addNode: (projectId, node) => {
        const storedProject = get().projectsById[projectId];
        const project = storedProject ? normalizeProject(storedProject) : null;
        if (!project) return null;

        const projectNode: ForUProjectNode = {
          ...node,
          role: node.role ?? 'free',
          id: createId('node'),
          lastActiveDate: now(),
          createdAt: now(),
        };

        set((state) => ({
          projectsById: {
            ...state.projectsById,
            [projectId]: touch({
              ...project,
              nodes: [...project.nodes, projectNode],
            }),
          },
        }));

        void upsertCloudTask(get().cloudUserId, projectId, projectNode);
        return projectNode.id;
      },

      addFreeNodeToBranch: (projectId, branchKey, node) => {
        const storedProject = get().projectsById[projectId];
        const project = storedProject ? normalizeProject(storedProject) : null;
        if (!project) return null;

        const branchNode = project.nodes.find((projectNode) => projectNode.branchKey === branchKey);
        if (!branchNode) return null;

        const projectNode: ForUProjectNode = {
          ...node,
          role: 'free',
          branchKey,
          id: createId('node'),
          lastActiveDate: now(),
          createdAt: now(),
        };

        const edge: ForUProjectEdge = {
          id: createId('edge'),
          source: branchNode.id,
          target: projectNode.id,
          createdAt: now(),
        };

        set((state) => ({
          projectsById: {
            ...state.projectsById,
            [projectId]: touch({
              ...project,
              nodes: [...project.nodes, projectNode],
              edges: [...project.edges, edge],
            }),
          },
        }));

        void upsertCloudTask(get().cloudUserId, projectId, projectNode);
        return projectNode.id;
      },

      addFreeNodesToBranches: (projectId, nodes) => {
        const storedProject = get().projectsById[projectId];
        const project = storedProject ? normalizeProject(storedProject) : null;
        if (!project || nodes.length === 0) return [];

        const timestamp = now();
        const createdNodes: ForUProjectNode[] = [];
        const createdEdges: ForUProjectEdge[] = [];

        nodes.forEach((node) => {
          const branchNode = project.nodes.find((projectNode) => projectNode.branchKey === node.branchKey);
          if (!branchNode) return;

          const projectNode: ForUProjectNode = {
            ...node,
            role: 'free',
            id: createId('node'),
            lastActiveDate: timestamp,
            createdAt: timestamp,
          };

          createdNodes.push(projectNode);
          createdEdges.push({
            id: createId('edge'),
            source: branchNode.id,
            target: projectNode.id,
            createdAt: timestamp,
          });
        });

        if (createdNodes.length === 0) return [];

        set((state) => ({
          projectsById: {
            ...state.projectsById,
            [projectId]: touch({
              ...project,
              nodes: [...project.nodes, ...createdNodes],
              edges: [...project.edges, ...createdEdges],
            }),
          },
        }));

        void Promise.all(createdNodes.map((node) => upsertCloudTask(get().cloudUserId, projectId, node)));
        return createdNodes.map((node) => node.id);
      },

      updateNode: (projectId, nodeId, patch) => {
        set((state) => {
          const storedProject = state.projectsById[projectId];
          if (!storedProject) return state;
          const project = normalizeProject(storedProject);
          const currentNode = project.nodes.find((node) => node.id === nodeId);
          const rewardDelta = currentNode
            ? Math.max(0, (patch.rewardCoins ?? currentNode.rewardCoins ?? 0) - (currentNode.rewardCoins ?? 0))
            : 0;
          const completedNow = Boolean(currentNode && !currentNode.completedAt && patch.completedAt);

          return {
            coins: state.coins + rewardDelta,
            weeklyMilestoneProgress: completedNow ? state.weeklyMilestoneProgress + 1 : state.weeklyMilestoneProgress,
            projectsById: {
              ...state.projectsById,
              [projectId]: touch({
                ...project,
                nodes: project.nodes.map((node) =>
                  node.id === nodeId ? { ...node, ...patch, lastActiveDate: patch.lastActiveDate ?? now() } : node,
                ),
              }),
            },
          };
        });
        const project = get().projectsById[projectId];
        const node = project?.nodes.find((item) => item.id === nodeId);
        if (node) void upsertCloudTask(get().cloudUserId, projectId, node);
      },

      reassignNodeBranch: (projectId, nodeId, branchKey) => {
        set((state) => {
          const storedProject = state.projectsById[projectId];
          if (!storedProject) return state;
          const project = normalizeProject(storedProject);
          const nodeToMove = project.nodes.find((node) => node.id === nodeId);
          const targetBranch = project.nodes.find((node) => node.role === 'branch' && node.branchKey === branchKey);
          if (!nodeToMove || !targetBranch || nodeToMove.locked || nodeToMove.branchKey === branchKey) return state;

          const nextEdges = project.edges
            .filter((edge) => edge.target !== nodeId || !project.nodes.some((node) => node.id === edge.source && node.role === 'branch'))
            .concat({
              id: createId('edge'),
              source: targetBranch.id,
              target: nodeId,
              createdAt: now(),
            });

          return {
            projectsById: {
              ...state.projectsById,
              [projectId]: touch({
                ...project,
                nodes: project.nodes.map((node) =>
                  node.id === nodeId ? { ...node, branchKey, lastActiveDate: now() } : node,
                ),
                edges: nextEdges,
              }),
            },
          };
        });
        const project = get().projectsById[projectId];
        const node = project?.nodes.find((item) => item.id === nodeId);
        if (node) void upsertCloudTask(get().cloudUserId, projectId, node);
      },

      splitNodeIntoSubtasks: (projectId, nodeId, subtasks) => {
        const storedProject = get().projectsById[projectId];
        const project = storedProject ? normalizeProject(storedProject) : null;
        const parentNode = project?.nodes.find((node) => node.id === nodeId);
        if (!project || !parentNode || parentNode.locked || !parentNode.branchKey) return [];

        const cleanSubtasks = subtasks.map((subtask) => subtask.trim()).filter(Boolean).slice(0, 3);
        if (cleanSubtasks.length === 0) return [];

        const timestamp = now();
        const createdNodes: ForUProjectNode[] = cleanSubtasks.map((subtask, index) => ({
          id: createId('node'),
          title: subtask,
          kind: 'task',
          role: 'free',
          branchKey: parentNode.branchKey,
          parentNodeId: parentNode.id,
          priority: parentNode.priority ?? 'medium',
          icon: '✅',
          description: `Subtarea creada desde: ${parentNode.title}`,
          x: parentNode.x + 190 + index * 36,
          y: parentNode.y + (index - (cleanSubtasks.length - 1) / 2) * 92,
          lastActiveDate: timestamp,
          createdAt: timestamp,
        }));

        const createdEdges: ForUProjectEdge[] = createdNodes.map((node) => ({
          id: createId('edge'),
          source: parentNode.id,
          target: node.id,
          createdAt: timestamp,
        }));

        set((state) => {
          const currentProject = normalizeProject(state.projectsById[projectId]);

          return {
            projectsById: {
              ...state.projectsById,
              [projectId]: touch({
                ...currentProject,
                nodes: currentProject.nodes
                  .map((node) =>
                    node.id === parentNode.id
                      ? { ...node, subtasks: cleanSubtasks, kind: 'task' as const, icon: node.icon ?? '✅', lastActiveDate: timestamp }
                      : node,
                  )
                  .concat(createdNodes),
                edges: currentProject.edges.concat(createdEdges),
              }),
            },
          };
        });

        void Promise.all(createdNodes.map((node) => upsertCloudTask(get().cloudUserId, projectId, node)));
        return createdNodes.map((node) => node.id);
      },

      setDigitalRoute: (projectId, route) => {
        set((state) => {
          const storedProject = state.projectsById[projectId];
          if (!storedProject) return state;
          const project = normalizeProject(storedProject);
          const nodeIds = new Set(project.nodes.map((node) => node.id));
          const cleanRoute = route.filter((step) => nodeIds.has(step.linkedNodeId)).slice(0, 5);

          return {
            projectsById: {
              ...state.projectsById,
              [projectId]: touch({
                ...project,
                digitalRoute: cleanRoute,
                currentRouteIndex: 0,
              }),
            },
          };
        });
      },

      completeRouteStep: (projectId) => {
        const storedProject = get().projectsById[projectId];
        const project = storedProject ? normalizeProject(storedProject) : null;
        if (!project || project.digitalRoute.length === 0) return false;

        const currentIndex = Math.min(project.currentRouteIndex, project.digitalRoute.length - 1);
        const currentStep = project.digitalRoute[currentIndex];
        if (!currentStep || currentStep.completedAt) return false;

        const timestamp = now();
        const currentNode = project.nodes.find((node) => node.id === currentStep.linkedNodeId);
        const isDustyRouteNode = currentNode
          ? !currentNode.locked
            && !currentNode.completedAt
            && new Date(currentNode.lastActiveDate).getTime() < Date.now() - DUST_THRESHOLD_MS
          : false;
        const coinReward = isDustyRouteNode ? 60 : 20;

        set((state) => {
          const currentProject = normalizeProject(state.projectsById[projectId]);
          const nextRoute = currentProject.digitalRoute.map((step, index) =>
            index === currentIndex ? { ...step, completedAt: timestamp } : step,
          );

          return {
            userXP: state.userXP,
            coins: state.coins + coinReward,
            projectsById: {
              ...state.projectsById,
              [projectId]: touch({
                ...currentProject,
                digitalRoute: nextRoute,
                currentRouteIndex: Math.min(currentIndex + 1, nextRoute.length),
                nodes: currentProject.nodes.map((node) =>
                  node.id === currentStep.linkedNodeId
                    ? { ...node, taskStatus: 'done' as const, completedAt: node.completedAt ?? timestamp, rewardCoins: (node.rewardCoins ?? 0) + 20, lastActiveDate: timestamp }
                    : node,
                ),
              }),
            },
          };
        });

        get().addXP(50);
        const updatedProject = get().projectsById[projectId];
        const updatedNode = updatedProject?.nodes.find((node) => node.id === currentStep.linkedNodeId);
        if (updatedNode) void upsertCloudTask(get().cloudUserId, projectId, updatedNode);
        return true;
      },

      moveNode: (projectId, nodeId, position) => {
        set((state) => {
          const storedProject = state.projectsById[projectId];
          if (!storedProject) return state;
          const project = normalizeProject(storedProject);

          return {
            projectsById: {
              ...state.projectsById,
              [projectId]: touch({
                ...project,
                nodes: project.nodes.map((node) => {
                  if (node.id !== nodeId || node.locked) return node;
                  return { ...node, x: position.x, y: position.y, lastActiveDate: now() };
                }),
              }),
            },
          };
        });
        const project = get().projectsById[projectId];
        const node = project?.nodes.find((item) => item.id === nodeId);
        if (node) void upsertCloudTask(get().cloudUserId, projectId, node);
      },

      connectNodes: (projectId, source, target) => {
        if (!source || !target || source === target) return null;

        const storedProject = get().projectsById[projectId];
        const project = storedProject ? normalizeProject(storedProject) : null;
        if (!project) return null;

        const existingEdge = project.edges.find((edge) => edge.source === source && edge.target === target);
        if (existingEdge) return existingEdge.id;

        const edge: ForUProjectEdge = {
          id: createId('edge'),
          source,
          target,
          createdAt: now(),
        };

        set((state) => ({
          projectsById: {
            ...state.projectsById,
            [projectId]: touch({
              ...project,
              edges: [...project.edges, edge],
            }),
          },
        }));

        return edge.id;
      },

      removeEdge: (projectId, edgeId) => {
        set((state) => {
          const storedProject = state.projectsById[projectId];
          if (!storedProject) return state;
          const project = normalizeProject(storedProject);

          return {
            projectsById: {
              ...state.projectsById,
              [projectId]: touch({
                ...project,
                edges: project.edges.filter((edge) => edge.id !== edgeId),
              }),
            },
          };
        });
      },

      selectNode: (nodeId) => {
        const activeProjectId = get().activeProjectId;

        if (!activeProjectId) {
          set({ selectedNodeId: nodeId });
          return;
        }

        set((state) => {
          const storedProject = state.projectsById[activeProjectId];
          if (!storedProject) return { selectedNodeId: nodeId };
          const project = normalizeProject(storedProject);

          return {
            selectedNodeId: nodeId,
            projectsById: {
              ...state.projectsById,
              [activeProjectId]: touch({
                ...project,
                nodes: project.nodes.map((node) =>
                  node.id === nodeId ? { ...node, lastActiveDate: now() } : node,
                ),
              }),
            },
          };
        });
      },

      deselectNode: () => set({ selectedNodeId: null }),

      setFocusBranch: (branchKey) => set({ focusedBranch: branchKey }),

      clearFocus: () => set({ focusedBranch: null }),

      setViewLevel: (level) => set({ viewLevel: level }),

      toggleView: () => set((state) => ({
        viewLevel:
          state.viewLevel === 'archipelago'
            ? 'exterior'
            : state.viewLevel === 'exterior'
              ? 'interior'
              : 'exterior',
      })),

      openIdeaJar: () => set({ isJarOpen: true }),

      closeIdeaJar: () => set({ isJarOpen: false }),

      toggleIdeaJar: () => set((state) => ({ isJarOpen: !state.isJarOpen })),

      addRawNote: (input) => {
        const note: ForURawNote = {
          id: createId('raw-note'),
          projectId: input.projectId ?? get().activeProjectId,
          kind: input.kind,
          content: input.content.trim() || 'Nota cruda sin texto',
          previewUrl: input.previewUrl,
          createdAt: now(),
        };

        set((state) => ({
          rawNotes: [note, ...state.rawNotes],
          isJarOpen: false,
        }));

        void upsertCloudIdea(get().cloudUserId, note);
        return note.id;
      },

      markRawNoteProcessed: (noteId) => {
        set((state) => ({
          rawNotes: state.rawNotes.map((note) =>
            note.id === noteId ? { ...note, processedAt: now() } : note,
          ),
        }));
      },

      clearRawNotes: () => {
        const state = get();
        const activeProjectId = state.activeProjectId;
        set({ rawNotes: [] });

        if (canSyncCloud(state.cloudUserId) && activeProjectId) {
          void supabase?.from('ideas').delete().eq('project_id', activeProjectId);
        }
      },

      resetWorkspace: () => {
        const project = createProject({ name: 'Mi primer proyecto' });

        set({
          activeProjectIds: [project.id],
          activeProjectId: project.id,
          currentProjectId: project.id,
          lastCreatedProjectId: null,
          projectsById: {
            [project.id]: project,
          },
          rawNotes: [],
          isJarOpen: false,
          selectedNodeId: null,
          focusedBranch: null,
          viewLevel: 'archipelago',
          currentView: 'archipelago',
          archipelagoZoom: 0.45,
          archipelagoOffset: { x: 80, y: 80 },
          userLevel: 1,
          userXP: 0,
          xpToNextLevel: 100,
          coins: 0,
          weeklyMilestoneProgress: 0,
          userPlan: 'free',
          maxProjects: planConfigs.free.maxProjects,
          maxActionsPerMonth: planConfigs.free.maxActionsPerMonth,
          actionsThisMonth: 0,
          actionsMonthStamp: getMonthStamp(),
          dailyMoods: [],
          rewiringHabits: {},
          features: planConfigs.free.features,
          planLimitNotice: null,
          lastLoginDate: null,
          dailyStreak: 0,
          claimedDays: [],
          whatsappNumber: '',
          whatsappEnabled: false,
          cloudUserId: null,
          isCloudSyncing: false,
          projectLoadError: '',
        });
      },
});

export const useActiveProjectsStore = create<ActiveProjectsState>()(
  persist(
    createActiveProjectsState,
    {
      name: 'foru-active-projects',
      version: 13,
      migrate: (persistedState) => {
        const state = persistedState as ActiveProjectsState | undefined;
        if (!state) return state;
        const userPlan = state.userPlan ?? 'free';
        const planConfig = getPlanConfig(userPlan);

        return {
          ...state,
          projectsById: Object.fromEntries(
            Object.entries(state.projectsById ?? {}).map(([projectId, project]) => [
              projectId,
              normalizeProject(project),
            ]),
          ),
          activeProjectIds: getProjectOrder({
            activeProjectIds: state.activeProjectIds ?? [],
            projectsById: state.projectsById ?? {},
          }),
          activeProjectId: state.activeProjectId ?? null,
          currentProjectId: state.currentProjectId ?? state.activeProjectId ?? null,
          lastCreatedProjectId: state.lastCreatedProjectId ?? null,
          rawNotes: state.rawNotes ?? [],
          isJarOpen: state.isJarOpen ?? false,
          selectedNodeId: state.selectedNodeId ?? null,
          focusedBranch: state.focusedBranch ?? null,
          viewLevel: state.viewLevel ?? 'archipelago',
          currentView: state.currentView ?? 'archipelago',
          archipelagoZoom: state.archipelagoZoom ?? 0.45,
          archipelagoOffset: state.archipelagoOffset ?? { x: 80, y: 80 },
          userLevel: state.userLevel ?? 1,
          userXP: state.userXP ?? 0,
          xpToNextLevel: state.xpToNextLevel ?? 100,
          coins: state.coins ?? 0,
          weeklyMilestoneProgress: state.weeklyMilestoneProgress ?? 0,
          userPlan,
          maxProjects: state.maxProjects ?? planConfig.maxProjects,
          maxActionsPerMonth: state.maxActionsPerMonth ?? planConfig.maxActionsPerMonth,
          actionsThisMonth: state.actionsThisMonth ?? 0,
          actionsMonthStamp: state.actionsMonthStamp ?? getMonthStamp(),
          dailyMoods: state.dailyMoods ?? [],
          rewiringHabits: state.rewiringHabits ?? {},
          features: state.features ?? planConfig.features,
          planLimitNotice: null,
          lastLoginDate: state.lastLoginDate ?? null,
          dailyStreak: state.dailyStreak ?? 0,
          claimedDays: state.claimedDays ?? [],
          whatsappNumber: state.whatsappNumber ?? '',
          whatsappEnabled: state.whatsappEnabled ?? false,
          cloudUserId: state.cloudUserId ?? null,
          isCloudSyncing: false,
          projectLoadError: '',
        };
      },
    },
  ) as unknown as StateCreator<ActiveProjectsState>,
);
