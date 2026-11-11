import { Textarea as DSTextarea } from './ui/DesignSystem';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useActiveProjectsStore, type ForUNextAction } from '../stores/useActiveProjectsStore';
import MagicButton from './ui/MagicButton';
import MagicCard from './ui/MagicCard';
import MagicBadge from './ui/MagicBadge';

type AutonomousOrganizerProps = {
  projectId: string | null;
};

export default function AutonomousOrganizer({ projectId }: AutonomousOrganizerProps) {
  const backgroundOrganizeText = useActiveProjectsStore((state) => state.backgroundOrganizeText);
  const [text, setText] = useState('');
  const [result, setResult] = useState<ForUNextAction | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  async function organize() {
    if (!projectId || !text.trim() || isWorking) return;
    setIsWorking(true);
    const nextAction = await backgroundOrganizeText(projectId, text);
    setResult(nextAction);
    setText('');
    setIsWorking(false);
  }

  return (
    <MagicCard className="foru-autonomous-organizer">
      <div className="foru-autonomous-top">
        <MagicBadge>Agente de fondo</MagicBadge>
        <span aria-hidden="true">🫙</span>
      </div>
      <h3>Soltar ideas sin orden</h3>
      <p>Pega todo como venga. For U lo sostiene un momento y te devuelve una próxima acción amable.</p>
      <DSTextarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Suelta aquí: taller de velas, comprar cera, campaña de navidad, buscar proveedores..."
      />
      <MagicButton type="button" disabled={!projectId || !text.trim() || isWorking} onClick={organize}>
        {isWorking ? (
          <span className="foru-thinking-label">
            For U está pensando
            <i /><i /><i />
          </span>
        ) : '✨ For U, organiza esto por mí'}
      </MagicButton>
      <AnimatePresence>
        {result ? (
          <motion.div
            className="foru-autonomous-result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <strong>Organicé tus ideas en áreas suaves.</strong>
            <span>Tu próxima acción es: {result.title}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </MagicCard>
  );
}
