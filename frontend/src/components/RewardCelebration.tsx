import { AnimatePresence, motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import type { RewardBurst } from '../hooks/useRewardBurst';

// ---------------------------------------------------------------------------
// RewardCelebration — Visual feedback for every reward tier
// ---------------------------------------------------------------------------

type RewardCelebrationProps = {
  burst: RewardBurst | null;
};

export default function RewardCelebration({ burst }: RewardCelebrationProps) {
  return (
    <AnimatePresence>
      {burst ? (
        <motion.div
          key={burst.id}
          className={`foru-reward-celebration is-${burst.tier}`}
          style={{ left: burst.x, top: burst.y }}
          initial={{ opacity: 0, y: 12, scale: 0.8 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [12, -20, -44, -68],
            scale: [0.8, 1.1, 1.05, 0.95],
          }}
          exit={{ opacity: 0, y: -80, scale: 0.9 }}
          transition={{
            duration: burst.tier === 'milestone' ? 3.5 : burst.tier === 'major' ? 2.2 : 1.6,
            times: [0, 0.15, 0.65, 1],
            ease: 'easeOut',
          }}
        >
          {/* Particles */}
          {burst.tier !== 'micro' && (
            <div className="foru-reward-particles" aria-hidden="true">
              {Array.from({ length: burst.tier === 'milestone' ? 24 : burst.tier === 'major' ? 16 : 8 }).map((_, i) => (
                <i key={i} style={{ '--particle-index': i } as CSSProperties} />
              ))}
            </div>
          )}

          {/* Coin rain for milestones */}
          {burst.tier === 'milestone' && (
            <div className="foru-reward-coin-rain" aria-hidden="true">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: -40, rotate: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    y: [- 40, 120 + (i % 4) * 20],
                    rotate: 360 + i * 30,
                  }}
                  transition={{
                    duration: 1.2,
                    delay: i * 0.03,
                    ease: 'easeOut',
                  }}
                  style={{ left: `${5 + (i * 5) % 90}%` }}
                >
                  🪙
                </motion.span>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="foru-reward-content">
            {burst.xp > 0 && <strong>+{burst.xp} XP</strong>}
            {burst.coins > 0 && <span>+{burst.coins} 🪙</span>}
            <em>{burst.message}</em>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// MilestoneCelebration — Full-screen celebration for Point B
// ---------------------------------------------------------------------------

type MilestoneCelebrationProps = {
  isOpen: boolean;
  title: string;
  subtitle: string;
  aiMessage: string;
  badges?: string[];
  onClose: () => void;
};

export function MilestoneCelebration({
  isOpen,
  title,
  subtitle,
  aiMessage,
  badges = [],
  onClose,
}: MilestoneCelebrationProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="foru-milestone-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Background particles */}
          <div className="foru-milestone-particles" aria-hidden="true">
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.i
                key={i}
                initial={{
                  opacity: 0,
                  x: 0,
                  y: 0,
                  scale: 0,
                }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  x: (Math.random() - 0.5) * 600,
                  y: (Math.random() - 0.5) * 600,
                  scale: [0, 1.2, 0.8, 0],
                }}
                transition={{
                  duration: 2.5 + Math.random() * 1.5,
                  delay: Math.random() * 0.6,
                  ease: 'easeOut',
                }}
                style={{
                  '--hue': `${Math.random() * 360}`,
                  left: '50%',
                  top: '50%',
                } as CSSProperties}
              />
            ))}
          </div>

          {/* Coin rain */}
          <div className="foru-milestone-coin-rain" aria-hidden="true">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: -60, rotate: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: [-60, 300 + (i % 5) * 20],
                  rotate: 420,
                }}
                transition={{
                  duration: 1.4,
                  delay: 0.3 + i * 0.025,
                  ease: 'easeOut',
                }}
                style={{ left: `${4 + (i * 7) % 92}%` }}
              >
                🪙
              </motion.span>
            ))}
          </div>

          {/* Central card */}
          <motion.section
            className="foru-milestone-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="milestone-title"
            initial={{ opacity: 0, y: 40, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20, delay: 0.3 }}
          >
            <motion.span
              className="foru-milestone-emoji"
              aria-hidden="true"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.4, 1] }}
              transition={{ delay: 0.6, duration: 0.5, ease: 'easeOut' }}
            >
              🎉
            </motion.span>

            <h1 id="milestone-title">{title}</h1>
            <p className="foru-milestone-subtitle">{subtitle}</p>

            <motion.blockquote
              className="foru-milestone-ai-message"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <span className="foru-milestone-ai-avatar">U</span>
              <p>{aiMessage}</p>
            </motion.blockquote>

            {badges.length > 0 && (
              <div className="foru-milestone-badges">
                {badges.map((badge, i) => (
                  <motion.span
                    key={badge}
                    className="foru-milestone-badge"
                    initial={{ opacity: 0, scale: 0.6, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 1.4 + i * 0.2, type: 'spring', stiffness: 300, damping: 18 }}
                  >
                    {badge}
                  </motion.span>
                ))}
              </div>
            )}

            <motion.button
              type="button"
              className="foru-milestone-continue"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              Continuar mi aventura →
            </motion.button>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
