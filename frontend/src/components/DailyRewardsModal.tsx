import { ButtonSecondary as DSButtonSecondary } from './ui/DesignSystem';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { dailyRewards, useActiveProjectsStore } from '../stores/useActiveProjectsStore';
import { useRewardBurst } from '../hooks/useRewardBurst';

type DailyRewardsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function DailyRewardsModal({ isOpen, onClose }: DailyRewardsModalProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const coins = useActiveProjectsStore((state) => state.coins);
  const lastLoginDate = useActiveProjectsStore((state) => state.lastLoginDate);
  const dailyStreak = useActiveProjectsStore((state) => state.dailyStreak);
  const claimedDays = useActiveProjectsStore((state) => state.claimedDays);
  const checkDailyReward = useActiveProjectsStore((state) => state.checkDailyReward);
  const claimDailyReward = useActiveProjectsStore((state) => state.claimDailyReward);
  const rewardStatus = useMemo(() => checkDailyReward(), [checkDailyReward, dailyStreak, claimedDays, lastLoginDate]);
  const reward = useRewardBurst();

  useEffect(() => {
    if (!isOpen) setIsClaiming(false);
  }, [isOpen]);

  function claim() {
    if (isClaiming) return;

    const claimed = claimDailyReward();
    if (!claimed) {
      onClose();
      return;
    }

    setIsClaiming(true);
    playDing();
    reward.trigger('dailyLogin');
    window.setTimeout(onClose, 1500);
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="foru-daily-reward-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.section
            className="foru-daily-reward-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="daily-reward-title"
            initial={{ opacity: 0, y: 26, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          >
            {isClaiming ? <CoinRain /> : null}
            <header>
              <span>🔥 Racha diaria · {coins} monedas</span>
              <h2 id="daily-reward-title">Tu regalo de hoy está listo</h2>
              <p>Vuelve cada día para mantener tu racha y desbloquear más monedas.</p>
            </header>

            <div className="foru-daily-reward-days">
              {dailyRewards.map((reward, index) => {
                const day = index + 1;
                const isPast = claimedDays.includes(day);
                const isCurrent = day === rewardStatus.currentDay && !isPast;
                const isFuture = day > rewardStatus.currentDay;

                return (
                  <article key={day} className={`${isPast ? 'is-claimed' : ''} ${isCurrent ? 'is-current' : ''} ${isFuture ? 'is-future' : ''}`}>
                    <small>Día {day}</small>
                    <strong>{isPast ? '✓' : '🪙'}</strong>
                    <span>{reward} 🪙{day === 5 ? ' + 🎁' : ''}</span>
                  </article>
                );
              })}
            </div>

            <DSButtonSecondary type="button" onClick={claim} disabled={isClaiming || !rewardStatus.shouldShow}>
              {isClaiming ? 'Reclamando...' : rewardStatus.shouldShow ? `Reclamar ${rewardStatus.reward} monedas` : 'Ya reclamaste hoy ✓'}
            </DSButtonSecondary>
            <DSButtonSecondary type="button" className="foru-daily-reward-close" onClick={onClose}>
              Cerrar
            </DSButtonSecondary>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function CoinRain() {
  return (
    <div className="foru-coin-rain" aria-hidden="true">
      {Array.from({ length: 28 }).map((_, index) => (
        <motion.i
          key={index}
          initial={{ opacity: 0, y: -60, rotate: 0 }}
          animate={{ opacity: [0, 1, 1, 0], y: 260 + (index % 5) * 18, rotate: 420 }}
          transition={{ duration: 1.05, delay: index * 0.025, ease: 'easeOut' }}
          style={{ left: `${6 + (index * 7) % 88}%` }}
        />
      ))}
    </div>
  );
}

function playDing() {
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  const audio = new AudioContextClass();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(740, audio.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(1180, audio.currentTime + 0.12);
  gain.gain.setValueAtTime(0.0001, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, audio.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.28);

  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start();
  oscillator.stop(audio.currentTime + 0.3);
}
