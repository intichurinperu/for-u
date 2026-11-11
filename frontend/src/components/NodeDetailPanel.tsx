import { ButtonSecondary as DSButtonSecondary, Textarea as DSTextarea } from './ui/DesignSystem';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from '../lib/icons';
import SplitTaskModal from './SplitTaskModal';
import { type ForUNodeKind, type ForUNodePriority, type ForUProjectNode, useActiveProjectsStore } from '../stores/useActiveProjectsStore';

const nodeKindMeta: Record<ForUNodeKind, { label: string; icon: string; title: string }> = {
  center: { label: 'Proyecto', icon: '✨', title: 'Nucleo del proyecto' },
  branch: { label: 'Rama', icon: '✨', title: 'Rama base' },
  idea: { label: 'Idea', icon: '💡', title: 'Idea abierta' },
  task: { label: 'Accion', icon: '✅', title: 'Micro-accion' },
  resource: { label: 'Recurso', icon: '🔗', title: 'Recurso' },
  blocker: { label: 'Bloqueo', icon: '🧊', title: 'Bloqueo' },
  inspiration: { label: 'Inspiracion', icon: '✨', title: 'Inspiracion' },
};

function getActionButtons(node: ForUProjectNode) {
  if (node.role === 'branch') {
    return [
      {
        icon: '➕',
        label: 'Agregar nodo a esta rama',
        onClick: () => window.alert(`Agregando nodo a ${node.title}...`),
      },
      {
        icon: '👁️',
        label: 'Ver todos los nodos de esta rama',
        onClick: () => window.alert(`Mostrando nodos de ${node.title}...`),
      },
    ];
  }

  if (node.kind === 'task') {
    return [
      {
        icon: '🎨',
        label: 'Abrir plantilla en Canva',
        onClick: () => window.open('https://www.canva.com/', '_blank', 'noopener,noreferrer'),
      },
      {
        icon: '⏱️',
        label: 'Iniciar Pomodoro (20 min)',
        onClick: () => window.alert('Pomodoro iniciado ⏱️'),
      },
      {
        icon: '🤖',
        label: 'Consultar con IA',
        onClick: () => window.alert('IA pensando... 🧠'),
      },
    ];
  }

  if (node.kind === 'idea') {
    return [
      {
        icon: '💬',
        label: 'Desarrollar con IA',
        onClick: () => window.alert('IA desarrollando idea... 💡'),
      },
      {
        icon: '🔗',
        label: 'Convertir en Accion',
        onClick: () => window.alert('Convirtiendo idea en accion...'),
      },
    ];
  }

  if (node.kind === 'resource') {
    return [
      {
        icon: '🔗',
        label: 'Abrir enlace',
        onClick: () => window.alert('Abriendo recurso...'),
      },
      {
        icon: '📎',
        label: 'Agregar archivo',
        onClick: () => window.alert('Subiendo archivo...'),
      },
    ];
  }

  return [];
}

export default function NodeDetailPanel() {
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const projectsById = useActiveProjectsStore((state) => state.projectsById);
  const selectedNodeId = useActiveProjectsStore((state) => state.selectedNodeId);
  const updateNode = useActiveProjectsStore((state) => state.updateNode);
  const deselectNode = useActiveProjectsStore((state) => state.deselectNode);

  const activeProject = activeProjectId ? projectsById[activeProjectId] : null;
  const selectedNode = activeProject?.nodes.find((node) => node.id === selectedNodeId);
  const [draftDescription, setDraftDescription] = useState('');

  useEffect(() => {
    setDraftDescription(selectedNode?.description ?? '');
  }, [selectedNode?.description, selectedNode?.id]);

  useEffect(() => {
    if (!activeProjectId || !selectedNode || draftDescription === (selectedNode.description ?? '')) return;

    const timeoutId = window.setTimeout(() => {
      updateNode(activeProjectId, selectedNode.id, { description: draftDescription });
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [activeProjectId, draftDescription, selectedNode, updateNode]);

  if (!activeProjectId || !selectedNode) return null;

  const meta = selectedNode.role === 'branch'
    ? {
        label: selectedNode.title,
        icon: selectedNode.icon ?? nodeKindMeta.branch.icon,
        title: 'Rama base',
      }
    : nodeKindMeta[selectedNode.kind];
  const actionButtons = getActionButtons(selectedNode);
  const priority = selectedNode.priority ?? 'low';

  return (
    <>
      <motion.aside
        className="foru-node-panel"
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        aria-label="Detalles del nodo"
      >
        <header className="foru-node-panel-header">
          <div>
            <div className="foru-node-panel-icon" aria-hidden="true">{meta.icon}</div>
            <span className="foru-node-panel-badge">{meta.icon} {meta.label}</span>
            <span className={`foru-node-panel-priority is-${priority}`}>
              {priorityIcon[priority]} {priorityLabel[priority]}
            </span>
            <h2>{selectedNode.title}</h2>
            <p>{meta.title}</p>
          </div>
          <DSButtonSecondary type="button" onClick={deselectNode} aria-label="Cerrar panel de detalles">
            <X size={18} />
          </DSButtonSecondary>
        </header>

        {selectedNode.reasoning ? (
          <div className="foru-node-reasoning">
            <strong>Por qué está aquí</strong>
            <p>{selectedNode.reasoning}</p>
          </div>
        ) : null}

        {selectedNode.subtasks?.length ? (
          <div className="foru-node-subtasks">
            <strong>Subtareas sugeridas</strong>
            {selectedNode.subtasks.map((subtask) => (
              <span key={subtask}>{subtask}</span>
            ))}
          </div>
        ) : null}

        {selectedNode.role === 'free' ? (
          <section className="foru-node-guidance" aria-label="Guia de ejecucion">
            <div>
              <strong>Pasos para completar</strong>
              <ol>
                {getCompletionSteps(selectedNode).map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
            <div>
              <strong>Recomendación de IA</strong>
              <p>{getAiRecommendation(selectedNode)}</p>
            </div>
          </section>
        ) : null}

        <label className="foru-node-panel-field">
          <span>Descripcion / notas</span>
          <DSTextarea
            value={draftDescription}
            onChange={(event) => setDraftDescription(event.target.value)}
            onBlur={() => updateNode(activeProjectId, selectedNode.id, { description: draftDescription })}
            placeholder="Agrega más detalles..."
          />
        </label>

        <section className="foru-node-panel-actions" aria-label="Acciones rapidas del nodo">
          <span>Acciones rápidas</span>
          <div>
            {selectedNode.role === 'free' ? (
              <DSButtonSecondary type="button" onClick={() => setIsSplitModalOpen(true)}>
                <span aria-hidden="true">✂️</span>
                Dividir en subtareas
              </DSButtonSecondary>
            ) : null}
            {actionButtons.map((action) => (
              <DSButtonSecondary key={action.label} type="button" onClick={action.onClick}>
                <span aria-hidden="true">{action.icon}</span>
                {action.label}
              </DSButtonSecondary>
            ))}
          </div>
          {actionButtons.length === 0 && selectedNode.role !== 'free' ? (
            <p>Selecciona o conecta nodos libres para activar herramientas especificas.</p>
          ) : null}
        </section>
      </motion.aside>

      <AnimatePresence>
        {isSplitModalOpen ? (
          <SplitTaskModal
            nodeId={selectedNode.id}
            nodeTitle={selectedNode.title}
            onClose={() => setIsSplitModalOpen(false)}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

const priorityIcon: Record<ForUNodePriority, string> = {
  high: '🔴',
  medium: '🟠',
  low: '🟢',
};

const priorityLabel: Record<ForUNodePriority, string> = {
  high: 'Alta prioridad',
  medium: 'Prioridad media',
  low: 'Baja presión',
};

function getCompletionSteps(node: ForUProjectNode) {
  if (node.subtasks?.length) return node.subtasks;

  if (node.kind === 'resource') {
    return ['Abre el recurso.', 'Extrae una idea util.', 'Conviertela en una micro-accion.'];
  }

  if (node.kind === 'idea') {
    return ['Escribe la idea en una frase.', 'Elige el resultado deseado.', 'Crea una accion de 15 minutos.'];
  }

  return ['Prepara lo minimo necesario.', 'Haz una version simple.', 'Cierra con un envio, guardado o siguiente paso claro.'];
}

function getAiRecommendation(node: ForUProjectNode) {
  if (node.reasoning) return node.reasoning;
  if (node.priority === 'high') return 'Empieza por una version pequeña y visible. Hoy gana el avance, no la perfeccion.';
  if (node.kind === 'resource') return 'Usa este recurso solo como apoyo: rescata una pieza y vuelve a ejecutar.';
  return 'Trabaja en bloques de 15 minutos y deja una pista clara para retomarlo despues.';
}
