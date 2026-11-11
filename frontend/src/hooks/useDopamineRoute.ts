import { useMemo } from 'react';
import { useActiveProjectsStore } from '../stores/useActiveProjectsStore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RouteStationId =
  | 'register'
  | 'industry'
  | 'compass'
  | 'station1'
  | 'station2'
  | 'station3'
  | 'station4'
  | 'station5';

export type RouteStationStatus = 'locked' | 'active' | 'complete';

export interface RouteStation {
  id: RouteStationId;
  label: string;
  shortLabel: string;
  status: RouteStationStatus;
  emoji: string;
  minutesEstimate: number;
}

export type EnergyLevel = 'high' | 'normal' | 'low';

export interface DopamineRouteState {
  /** All stations in order */
  stations: RouteStation[];
  /** The currently active station (first non-complete) */
  currentStation: RouteStation | null;
  /** Index of the current station (0-based) */
  currentIndex: number;
  /** Overall % progress (0–100) */
  progress: number;
  /** How many stations are complete */
  completedCount: number;
  /** Total station count */
  totalStations: number;
  /** Whether the user has completed the onboarding (first 3 steps) */
  onboardingComplete: boolean;
  /** Whether the full route is complete (all 8 stations) */
  routeComplete: boolean;
  /** Whether the user is returning after >48h absence */
  isReturningUser: boolean;
  /** Which sidebar links should be visible based on progress */
  unlockedSidebarLinks: string[];
}

// ---------------------------------------------------------------------------
// LocalStorage keys for dopamine-route specific state
// ---------------------------------------------------------------------------

const ONBOARDING_KEY = 'foru:dopamine-onboarding';
const ENERGY_KEY = 'foru:energy-check';

export interface OnboardingState {
  registerComplete: boolean;
  industryComplete: boolean;
  compassComplete: boolean;
  completedAt?: string;
}

function loadOnboardingState(): OnboardingState {
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    if (!raw) return { registerComplete: false, industryComplete: false, compassComplete: false };
    return JSON.parse(raw) as OnboardingState;
  } catch {
    return { registerComplete: false, industryComplete: false, compassComplete: false };
  }
}

export function saveOnboardingState(state: OnboardingState) {
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
}

export function markOnboardingStep(step: 'register' | 'industry' | 'compass') {
  const current = loadOnboardingState();
  if (step === 'register') current.registerComplete = true;
  if (step === 'industry') current.industryComplete = true;
  if (step === 'compass') {
    current.compassComplete = true;
    current.completedAt = new Date().toISOString();
  }
  saveOnboardingState(current);
}

// ---------------------------------------------------------------------------
// Energy check persistence
// ---------------------------------------------------------------------------

export function getLastEnergyCheck(): { level: EnergyLevel; date: string } | null {
  try {
    const raw = localStorage.getItem(ENERGY_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveEnergyCheck(level: EnergyLevel) {
  localStorage.setItem(ENERGY_KEY, JSON.stringify({
    level,
    date: new Date().toISOString().slice(0, 10),
  }));
}

export function needsEnergyCheck(): boolean {
  const last = getLastEnergyCheck();
  if (!last) return true;
  return last.date !== new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Sidebar progressive unlock
// ---------------------------------------------------------------------------

function getSidebarUnlocks(completedStations: number, hasProject: boolean): string[] {
  // Always visible when there's a project
  const base = hasProject ? ['Mi tablero', 'Creator Studio'] : [];

  if (completedStations < 1) return base;

  // After station 1: proposal
  if (completedStations >= 1) base.push('Mi propuesta');
  // After station 2: industry editor
  if (completedStations >= 2) base.push('Mi menú', 'Mi tienda', 'Mi hospedaje', 'Mis experiencias', 'Mis cursos');
  // After station 3: uploads, profile
  if (completedStations >= 3) base.push('Uploads', 'Mi perfil');
  // After station 4: orders, settings
  if (completedStations >= 4) base.push('Pedidos internos', 'Compras y cotizaciones', 'Configuración');
  // After station 5: everything
  if (completedStations >= 5) base.push('Calendario', 'Estadísticas');

  return base;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useDopamineRoute(): DopamineRouteState {
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const projectsById = useActiveProjectsStore((state) => state.projectsById);
  const getDigitalRouteSteps = useActiveProjectsStore((state) => state.getDigitalRouteSteps);
  const lastLoginDate = useActiveProjectsStore((state) => state.lastLoginDate);

  return useMemo(() => {
    const onboarding = loadOnboardingState();
    const project = activeProjectId ? projectsById[activeProjectId] : null;

    // Get digital route steps from the store (if project exists)
    const digitalSteps = project ? getDigitalRouteSteps(project.id) : [];
    const digitalComplete = digitalSteps.filter((s) => s.status === 'ready').length;

    // Build station list
    const stations: RouteStation[] = [
      {
        id: 'register',
        label: 'Crear tu cuenta',
        shortLabel: 'Registro',
        status: onboarding.registerComplete ? 'complete' : 'active',
        emoji: '📝',
        minutesEstimate: 2,
      },
      {
        id: 'industry',
        label: 'Elegir tu rubro',
        shortLabel: 'Rubro',
        status: onboarding.industryComplete
          ? 'complete'
          : onboarding.registerComplete
            ? 'active'
            : 'locked',
        emoji: '🏝️',
        minutesEstimate: 2,
      },
      {
        id: 'compass',
        label: 'Conectar con tu porqué',
        shortLabel: 'Brújula',
        status: onboarding.compassComplete
          ? 'complete'
          : onboarding.industryComplete
            ? 'active'
            : 'locked',
        emoji: '🤍',
        minutesEstimate: 3,
      },
      {
        id: 'station1',
        label: 'Define tu esencia',
        shortLabel: 'Esencia',
        status: digitalComplete >= 1
          ? 'complete'
          : onboarding.compassComplete
            ? 'active'
            : 'locked',
        emoji: '🔵',
        minutesEstimate: 15,
      },
      {
        id: 'station2',
        label: 'Arma tu oferta',
        shortLabel: 'Oferta',
        status: digitalComplete >= 2
          ? 'complete'
          : digitalComplete >= 1
            ? 'active'
            : 'locked',
        emoji: '🟢',
        minutesEstimate: 20,
      },
      {
        id: 'station3',
        label: 'Diseña tu presencia',
        shortLabel: 'Presencia',
        status: digitalComplete >= 3
          ? 'complete'
          : digitalComplete >= 2
            ? 'active'
            : 'locked',
        emoji: '🟡',
        minutesEstimate: 25,
      },
      {
        id: 'station4',
        label: 'Conecta tus canales',
        shortLabel: 'Canales',
        status: digitalComplete >= 4
          ? 'complete'
          : digitalComplete >= 3
            ? 'active'
            : 'locked',
        emoji: '🟠',
        minutesEstimate: 15,
      },
      {
        id: 'station5',
        label: 'Lanza y comparte',
        shortLabel: 'Lanzar',
        status: digitalComplete >= 5
          ? 'complete'
          : digitalComplete >= 4
            ? 'active'
            : 'locked',
        emoji: '🔴',
        minutesEstimate: 10,
      },
    ];

    const completedCount = stations.filter((s) => s.status === 'complete').length;
    const currentStation = stations.find((s) => s.status === 'active') ?? null;
    const currentIndex = currentStation ? stations.indexOf(currentStation) : stations.length;
    const progress = Math.round((completedCount / stations.length) * 100);
    const onboardingComplete = onboarding.registerComplete && onboarding.industryComplete && onboarding.compassComplete;
    const routeComplete = completedCount === stations.length;

    // Check if returning after >48h
    const isReturningUser = (() => {
      if (!lastLoginDate) return false;
      const lastDate = new Date(lastLoginDate).getTime();
      return Number.isFinite(lastDate) && Date.now() - lastDate > 48 * 60 * 60 * 1000;
    })();

    // Digital-route-based sidebar unlock (only stations after onboarding)
    const unlockedSidebarLinks = getSidebarUnlocks(digitalComplete, Boolean(project));

    return {
      stations,
      currentStation,
      currentIndex,
      progress,
      completedCount,
      totalStations: stations.length,
      onboardingComplete,
      routeComplete,
      isReturningUser,
      unlockedSidebarLinks,
    };
  }, [activeProjectId, projectsById, getDigitalRouteSteps, lastLoginDate]);
}
