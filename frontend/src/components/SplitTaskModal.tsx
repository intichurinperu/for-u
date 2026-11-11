import { ButtonSecondary as DSButtonSecondary, Textarea as DSTextarea } from './ui/DesignSystem';
import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { X } from '../lib/icons';
import { useActiveProjectsStore } from '../stores/useActiveProjectsStore';

type SplitTaskModalProps = {
  nodeId: string;
  nodeTitle: string;
  onClose: () => void;
};

export default function SplitTaskModal({ nodeId, nodeTitle, onClose }: SplitTaskModalProps) {
  const [draft, setDraft] = useState('');
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const splitNodeIntoSubtasks = useActiveProjectsStore((state) => state.splitNodeIntoSubtasks);

  function saveSubtasks() {
    if (!activeProjectId) return;

    const subtasks = draft
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3);

    if (subtasks.length < 2) {
      toast.error('Agrega al menos 2 subtareas pequeñitas.');
      return;
    }

    const createdIds = splitNodeIntoSubtasks(activeProjectId, nodeId, subtasks);
    if (createdIds.length > 0) {
      toast.success(`Creé ${createdIds.length} subtareas conectadas`);
      onClose();
      return;
    }

    toast.error('No pude dividir este nodo. Prueba con un nodo libre.');
  }

  return (
    <motion.div
      className="foru-split-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.section
        className="foru-split-modal"
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        role="dialog"
        aria-modal="true"
        aria-label="Dividir tarea"
      >
        <header>
          <div>
            <span className="foru-step-kicker">Dividir tarea</span>
            <h2>{nodeTitle}</h2>
          </div>
          <DSButtonSecondary type="button" onClick={onClose} aria-label="Cerrar modal">
            <X size={18} />
          </DSButtonSecondary>
        </header>

        <label>
          <span>Subtareas separadas por coma o salto de línea</span>
          <DSTextarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={'Diseñar posts\nEscribir copy\nProgramar publicación'}
          />
        </label>

        <footer>
          <DSButtonSecondary type="button" onClick={onClose}>
            Cancelar
          </DSButtonSecondary>
          <DSButtonSecondary type="button" onClick={saveSubtasks}>
            Crear subtareas
          </DSButtonSecondary>
        </footer>
      </motion.section>
    </motion.div>
  );
}
