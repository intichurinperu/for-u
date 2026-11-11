import { useState, useEffect } from 'react';
// Importamos el estado real si existe (por ahora lo simulamos o lo conectamos a una store global)
import { useAuth } from '../contexts/AuthContext';

export interface OnboardingProgress {
  marketing: boolean;
  finanzas: boolean;
  logistica: boolean;
  operaciones: boolean;
  porcentajeTotal: number;
}

export function useOnboardingProgress(): OnboardingProgress {
  const { user } = useAuth();
  
  // En un caso real, esto leería de Supabase (ej. tabla user_progress o leyendo la cantidad de mensajes en las pizarras)
  // Por ahora mantenemos un mock inteligente basado en localStorage para que el usuario pueda probar el flujo
  const [progress, setProgress] = useState<OnboardingProgress>({
    marketing: false,
    finanzas: false,
    logistica: false,
    operaciones: false,
    porcentajeTotal: 0
  });

  useEffect(() => {
    // Simulación: Leemos de localStorage si hay algún progreso guardado de las pizarras
    const checkProgress = () => {
      if (!user) return;
      
      const userId = user.id;
      // Esto asume que en PizarraAgent guardamos algo en localStorage cuando se responde
      // ej: localStorage.setItem(`pizarra_marketing_${userId}`, 'true')
      const marketingDone = localStorage.getItem(`pizarra_marketing_${userId}`) === 'true';
      const finanzasDone = localStorage.getItem(`pizarra_finanzas_${userId}`) === 'true';
      const logisticaDone = localStorage.getItem(`pizarra_logistica_${userId}`) === 'true';
      const operacionesDone = localStorage.getItem(`pizarra_operaciones_${userId}`) === 'true';

      let count = 0;
      if (marketingDone) count++;
      if (finanzasDone) count++;
      if (logisticaDone) count++;
      if (operacionesDone) count++;

      setProgress({
        marketing: marketingDone,
        finanzas: finanzasDone,
        logistica: logisticaDone,
        operaciones: operacionesDone,
        porcentajeTotal: (count / 4) * 100
      });
    };

    checkProgress();
    
    // Escuchar cambios en localStorage (opcional) para actualizar en tiempo real si estamos en otra pestaña
    window.addEventListener('storage', checkProgress);
    
    // Y un intervalo corto para actualizar si estamos en la misma pestaña (útil para demo rápida)
    const interval = setInterval(checkProgress, 2000);

    return () => {
      window.removeEventListener('storage', checkProgress);
      clearInterval(interval);
    };
  }, [user]);

  return progress;
}
