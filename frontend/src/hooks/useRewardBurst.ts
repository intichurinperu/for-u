import { useCallback, useRef, useState } from 'react';
import { useActiveProjectsStore } from '../stores/useActiveProjectsStore';
import { playUiTone } from '../lib/sound';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RewardTier = 'micro' | 'standard' | 'major' | 'milestone';

export interface RewardBurst {
  id: string;
  xp: number;
  coins: number;
  message: string;
  tier: RewardTier;
  x: number;
  y: number;
  timestamp: number;
}

export interface RewardConfig {
  xp: number;
  coins: number;
  message: string;
  tier?: RewardTier;
}

// ---------------------------------------------------------------------------
// Presets — every reward in the dopaminergic route
// ---------------------------------------------------------------------------

export const REWARDS = {
  // Punto A — Onboarding
  register:         { xp: 10, coins: 5,  message: '¡Bienvenida! Tu viaje empieza aquí 🌸' },
  chooseIndustry:   { xp: 10, coins: 5,  message: '¡Primer paso! Tu isla está naciendo 🏝️' },
  saveCompass:      { xp: 5,  coins: 3,  message: 'Tu brújula emocional está activa 🤍' },
  firstMission:     { xp: 15, coins: 8,  message: '¡Primera misión completada! 🎯' },

  // Estaciones de la Ruta Digital
  station1Complete: { xp: 20, coins: 10, message: 'Estación 1 lista — tu esencia está guardada ✨' },
  station2Complete: { xp: 30, coins: 15, message: 'Estación 2 lista — tu oferta toma forma 🛍️' },
  station3Complete: { xp: 25, coins: 12, message: 'Estación 3 lista — ¡tu página existe! 🎨' },
  station4Complete: { xp: 25, coins: 15, message: 'Canales conectados — tu negocio ya recibe 📱' },
  station5Complete: { xp: 50, coins: 25, message: '¡LANZAMIENTO! Tu sistema digital está vivo 🎉' },

  // Micro-recompensas dentro de estaciones
  addCatalogItem:   { xp: 3,  coins: 1,  message: '¡Producto agregado!' },
  addPhoto:         { xp: 5,  coins: 2,  message: '¡Foto lista!' },
  writeDescription: { xp: 5,  coins: 2,  message: '¡Texto guardado!' },
  chooseColors:     { xp: 5,  coins: 2,  message: '¡Tu estilo está tomando forma!' },
  previewComplete:  { xp: 10, coins: 5,  message: '¡Preview listo! Badge: Diseñadora Digital 🏅' },
  connectWhatsApp:  { xp: 15, coins: 8,  message: 'WhatsApp conectado. Tus clientes pueden escribirte 💬' },
  connectPayments:  { xp: 25, coins: 15, message: '¡Pagos activados! Badge: Negocios Activados 💰' },

  // Recurrentes
  dailyLogin:       { xp: 5,  coins: 0,  message: '¡Bienvenida de vuelta!' },
  pomodoroComplete: { xp: 10, coins: 5,  message: '¡Pomodoro completado! Buen enfoque 🍅' },
  moodLogged:       { xp: 5,  coins: 3,  message: 'Tu día fue registrado 🌙' },
  habitComplete:    { xp: 5,  coins: 2,  message: 'Micro-hábito cumplido 🌱' },
  taskComplete:     { xp: 8,  coins: 3,  message: '¡Tarea lista!' },
  ideaCaptured:     { xp: 3,  coins: 1,  message: 'Idea atrapada 🫙' },
} satisfies Record<string, RewardConfig>;

export type RewardKey = keyof typeof REWARDS;

// ---------------------------------------------------------------------------
// Tier classification
// ---------------------------------------------------------------------------

function classifyTier(xp: number): RewardTier {
  if (xp >= 40) return 'milestone';
  if (xp >= 20) return 'major';
  if (xp >= 8) return 'standard';
  return 'micro';
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useRewardBurst() {
  const [activeBurst, setActiveBurst] = useState<RewardBurst | null>(null);
  const [rewardHistory, setRewardHistory] = useState<RewardBurst[]>([]);
  const timeoutRef = useRef<number | null>(null);

  const addXP = useActiveProjectsStore((state) => state.addXP);
  const addCoins = useActiveProjectsStore((state) => state.addCoins);

  const trigger = useCallback(
    (key: RewardKey, position?: { x: number; y: number }) => {
      const config: RewardConfig = REWARDS[key];
      const tier = config.tier ?? classifyTier(config.xp);

      // Apply XP and coins to the store
      if (config.xp > 0) addXP(config.xp);
      if (config.coins > 0) addCoins(config.coins);

      // Sound feedback scaled by tier
      if (tier === 'milestone' || tier === 'major') {
        playUiTone('success');
      } else if (tier === 'standard') {
        playUiTone('next');
      } else {
        playUiTone('tap');
      }

      // Create burst for visual component
      const burst: RewardBurst = {
        id: `reward-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        xp: config.xp,
        coins: config.coins,
        message: config.message,
        tier,
        x: position?.x ?? window.innerWidth / 2,
        y: position?.y ?? window.innerHeight / 2 - 60,
        timestamp: Date.now(),
      };

      setActiveBurst(burst);
      setRewardHistory((prev) => [...prev.slice(-19), burst]);

      // Auto-dismiss based on tier
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      const duration = tier === 'milestone' ? 4000 : tier === 'major' ? 2500 : 1800;
      timeoutRef.current = window.setTimeout(() => setActiveBurst(null), duration);

      return burst;
    },
    [addXP, addCoins],
  );

  const triggerCustom = useCallback(
    (config: RewardConfig, position?: { x: number; y: number }) => {
      const tier = config.tier ?? classifyTier(config.xp);
      if (config.xp > 0) addXP(config.xp);
      if (config.coins > 0) addCoins(config.coins);

      if (tier === 'milestone' || tier === 'major') playUiTone('success');
      else playUiTone('tap');

      const burst: RewardBurst = {
        id: `reward-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        xp: config.xp,
        coins: config.coins,
        message: config.message,
        tier,
        x: position?.x ?? window.innerWidth / 2,
        y: position?.y ?? window.innerHeight / 2 - 60,
        timestamp: Date.now(),
      };

      setActiveBurst(burst);
      setRewardHistory((prev) => [...prev.slice(-19), burst]);

      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      const duration = tier === 'milestone' ? 4000 : tier === 'major' ? 2500 : 1800;
      timeoutRef.current = window.setTimeout(() => setActiveBurst(null), duration);

      return burst;
    },
    [addXP, addCoins],
  );

  const dismiss = useCallback(() => {
    setActiveBurst(null);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    activeBurst,
    rewardHistory,
    trigger,
    triggerCustom,
    dismiss,
  };
}
