import { Card as DSCard } from './ui/DesignSystem';
import { ButtonSecondary as DSButtonSecondary } from './ui/DesignSystem';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { MouseEvent } from 'react';
import toast from 'react-hot-toast';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
  type NodeDragHandler,
  type NodeMouseHandler,
  type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import BranchNode, { type BranchNodeData } from './BranchNode';
import CenterNode, { type CenterNodeData } from './CenterNode';
import DigitalRoutePath from './DigitalRoutePath';
import FloatingReward, { type FloatingRewardBurst } from './FloatingReward';
import IdeaNode, { type IdeaNodeData } from './IdeaNode';
import { Plus } from '../lib/icons';
import {
  baseBranches,
  getCenterNodeId,
  type ForUNodeKind,
  type ForUBranchKey,
  type ForUProjectNode,
  type ForURouteStep,
  useActiveProjectsStore,
} from '../stores/useActiveProjectsStore';

const nodeTypes: NodeTypes = {
  centerNode: CenterNode,
  branchNode: BranchNode,
  ideaNode: IdeaNode,
};

const addOptions: Array<{ kind: ForUNodeKind; label: string; title: string }> = [
  { kind: 'idea', label: '💡 Idea', title: 'Nueva idea' },
  { kind: 'task', label: '✅ Acción', title: 'Nueva microaccion' },
  { kind: 'resource', label: '🔗 Recurso', title: 'Nuevo recurso' },
];

type ForUCanvasNodeData = IdeaNodeData | BranchNodeData | CenterNodeData;

const DUST_THRESHOLD_MS = 48 * 60 * 60 * 1000;

function isDustyNode(node: ForUProjectNode) {
  if (node.locked || node.completedAt || node.taskStatus === 'done') return false;
  const lastActiveTime = new Date(node.lastActiveDate).getTime();
  return Number.isFinite(lastActiveTime) && lastActiveTime < Date.now() - DUST_THRESHOLD_MS;
}

type BranchStat = {
  total: number;
  completed: number;
  pending: number;
  status: 'done' | 'doing' | 'todo';
};

function getFocusOpacity(node: ForUProjectNode, focusedBranch: ForUBranchKey | null, focusedStepNodeIds: Set<string> | null, focusedRouteNodeIds: Set<string> | null, branchFocus: ForUBranchKey | null) {
  if (branchFocus) {
    if (node.role === 'center') return 0.3;
    return node.branchKey === branchFocus ? 1 : 0.3;
  }

  if (focusedRouteNodeIds) {
    if (node.role === 'free' && focusedRouteNodeIds.has(node.id)) return 1;
    return 0.2;
  }

  if (focusedStepNodeIds) {
    if (node.role === 'free' && focusedStepNodeIds.has(node.id)) return 1;
    return 0.2;
  }

  if (!focusedBranch) return 1;
  if (node.branchKey === focusedBranch) return 1;

  return 0.2;
}

function getNodeStatus(node: ForUProjectNode): 'done' | 'doing' | 'todo' {
  if (node.completedAt || node.taskStatus === 'done') return 'done';
  if (node.taskStatus === 'doing') return 'doing';
  return 'todo';
}

function toFlowNode(node: ForUProjectNode, focusedBranch: ForUBranchKey | null, focusedStepNodeIds: Set<string> | null, focusedRouteNodeIds: Set<string> | null, branchFocus: ForUBranchKey | null, nextActionIds: Set<string>, routeStepByNodeId: Map<string, number>, branchStats: Record<ForUBranchKey, BranchStat>, projectProgress: number, nextMilestone: string): Node<ForUCanvasNodeData> {
  const opacity = getFocusOpacity(node, focusedBranch, focusedStepNodeIds, focusedRouteNodeIds, branchFocus);
  const style: CSSProperties = {
    opacity,
    transition: 'opacity 0.3s ease',
    pointerEvents: opacity < 1 ? 'none' : 'auto',
  };

  if (node.role === 'center') {
    return {
      id: node.id,
      type: 'centerNode',
      position: { x: node.x, y: node.y },
      draggable: false,
      deletable: false,
      style,
      data: {
        title: node.title,
        icon: node.icon,
        progress: projectProgress,
        nextMilestone,
        reward: '🪙 50 monedas al completar',
      },
    };
  }

  if (node.role === 'branch') {
    const branch = baseBranches.find((item) => item.key === node.branchKey);

    return {
      id: node.id,
      type: 'branchNode',
      position: { x: node.x, y: node.y },
      draggable: false,
      deletable: false,
      style,
      data: {
        title: node.title,
        icon: node.icon,
        branchKey: node.branchKey,
        color: branch?.color,
        total: node.branchKey ? branchStats[node.branchKey].total : 0,
        completed: node.branchKey ? branchStats[node.branchKey].completed : 0,
        pending: node.branchKey ? branchStats[node.branchKey].pending : 0,
        status: node.branchKey ? branchStats[node.branchKey].status : 'todo',
      },
    };
  }

  return {
    id: node.id,
    type: 'ideaNode',
    position: { x: node.x, y: node.y },
    draggable: true,
    style,
    data: {
      title: node.title,
      kind: node.kind,
      icon: node.icon,
      priority: node.priority,
      isNextAction: nextActionIds.has(node.id),
      routeStepNumber: routeStepByNodeId.get(node.id),
      isDusty: isDustyNode(node),
      status: getNodeStatus(node),
      statusText: statusTextByState[getNodeStatus(node)],
    },
  };
}

export default function ProjectCanvas() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<{ kind: ForUNodeKind; title: string } | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isRouteViewOpen, setIsRouteViewOpen] = useState(false);
  const [isStepFocusOpen, setIsStepFocusOpen] = useState(false);
  const [isRouteFocusOpen, setIsRouteFocusOpen] = useState(false);
  const [isFocusMenuOpen, setIsFocusMenuOpen] = useState(false);
  const [isMapMovementUnlocked, setIsMapMovementUnlocked] = useState(false);
  const [branchFocus, setBranchFocus] = useState<ForUBranchKey | null>(null);
  const [rewardBurst, setRewardBurst] = useState<FloatingRewardBurst | null>(null);
  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const projectsById = useActiveProjectsStore((state) => state.projectsById);
  const addFreeNodeToBranch = useActiveProjectsStore((state) => state.addFreeNodeToBranch);
  const moveNode = useActiveProjectsStore((state) => state.moveNode);
  const connectNodes = useActiveProjectsStore((state) => state.connectNodes);
  const removeEdge = useActiveProjectsStore((state) => state.removeEdge);
  const selectNode = useActiveProjectsStore((state) => state.selectNode);
  const deselectNode = useActiveProjectsStore((state) => state.deselectNode);
  const focusedBranch = useActiveProjectsStore((state) => state.focusedBranch);
  const reassignNodeBranch = useActiveProjectsStore((state) => state.reassignNodeBranch);
  const completeRouteStep = useActiveProjectsStore((state) => state.completeRouteStep);
  const openIdeaJar = useActiveProjectsStore((state) => state.openIdeaJar);
  const activeProject = activeProjectId ? projectsById[activeProjectId] : null;
  const routeStepByNodeId = useMemo(() => {
    return new Map((activeProject?.digitalRoute ?? []).map((step, index) => [step.linkedNodeId, index + 1]));
  }, [activeProject?.digitalRoute]);
  const nextActionIds = useMemo(() => {
    return getNextActionIds(activeProject?.nodes ?? []);
  }, [activeProject?.nodes]);
  const focusedStepNodeIds = useMemo(() => {
    if (!isStepFocusOpen || !activeProject?.digitalRoute.length) return null;

    const currentStep = activeProject.digitalRoute[activeProject.currentRouteIndex];
    if (!currentStep) return null;

    return getStepNodeIds(activeProject.nodes, currentStep.linkedNodeId);
  }, [activeProject?.currentRouteIndex, activeProject?.digitalRoute, activeProject?.nodes, isStepFocusOpen]);
  const focusedRouteNodeIds = useMemo(() => {
    if (!isRouteFocusOpen || !activeProject?.digitalRoute.length) return null;
    return new Set(activeProject.digitalRoute.map((step) => step.linkedNodeId));
  }, [activeProject?.digitalRoute, isRouteFocusOpen]);

  const branchCounts = useMemo(() => {
    return Object.fromEntries(baseBranches.map((branch) => [
      branch.key,
      activeProject?.nodes.filter((node) => node.role === 'free' && node.branchKey === branch.key).length ?? 0,
    ])) as Record<ForUBranchKey, number>;
  }, [activeProject?.nodes]);
  const branchStats = useMemo(() => {
    return Object.fromEntries(baseBranches.map((branch) => {
      const branchNodes = activeProject?.nodes.filter((node) => node.role === 'free' && node.branchKey === branch.key) ?? [];
      const completed = branchNodes.filter((node) => getNodeStatus(node) === 'done').length;
      const doing = branchNodes.some((node) => getNodeStatus(node) === 'doing');
      const status = branchNodes.length > 0 && completed === branchNodes.length ? 'done' : doing || completed > 0 ? 'doing' : 'todo';

      return [branch.key, {
        total: branchNodes.length,
        completed,
        pending: Math.max(0, branchNodes.length - completed),
        status,
      }];
    })) as Record<ForUBranchKey, BranchStat>;
  }, [activeProject?.nodes]);
  const freeNodes = useMemo(() => {
    return activeProject?.nodes.filter((node) => node.role === 'free') ?? [];
  }, [activeProject?.nodes]);
  const isProjectEmpty = freeNodes.length === 0;
  const completedCount = freeNodes.filter((node) => getNodeStatus(node) === 'done').length;
  const projectProgress = freeNodes.length ? Math.round((completedCount / freeNodes.length) * 100) : 0;
  const nextMilestone = Math.max(0, Math.min(2, freeNodes.length - completedCount)) === 0
    ? 'Siguiente hito desbloqueado'
    : `Completa ${Math.min(2, freeNodes.length - completedCount)} tareas más`;

  useEffect(() => {
    setSelectedOption(null);
  }, [activeProjectId]);

  useEffect(() => {
    if (!activeProjectId) return;

    const guideKey = `foru-project-guide-seen-${activeProjectId}`;
    if (window.localStorage.getItem(guideKey)) return;

    setIsGuideOpen(true);
    window.localStorage.setItem(guideKey, 'true');
  }, [activeProjectId]);

  const nodes = useMemo<Node<ForUCanvasNodeData>[]>(() => {
    return activeProject?.nodes?.map((node) => toFlowNode(node, focusedBranch, focusedStepNodeIds, focusedRouteNodeIds, branchFocus, nextActionIds, routeStepByNodeId, branchStats, projectProgress, nextMilestone)) ?? [];
  }, [activeProject?.nodes, branchFocus, branchStats, focusedBranch, focusedRouteNodeIds, focusedStepNodeIds, nextActionIds, nextMilestone, projectProgress, routeStepByNodeId]);

  const edges = useMemo<Edge[]>(() => {
    const centerNodeId = activeProject ? getCenterNodeId(activeProject.id) : '';

    const projectEdges = (activeProject?.edges ?? [])
      .filter((edge) => edge.source !== centerNodeId)
      .map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      animated: false,
      markerEnd: { type: MarkerType.ArrowClosed, color: getEdgeColor(edge.source, edge.target, activeProject?.nodes ?? []) },
      style: {
        stroke: getEdgeColor(edge.source, edge.target, activeProject?.nodes ?? []),
        strokeWidth: 2,
        opacity: getEdgeOpacity(edge.source, edge.target, activeProject?.nodes ?? [], focusedBranch, focusedStepNodeIds, focusedRouteNodeIds),
        transition: 'opacity 0.3s ease',
      },
    }));

    const routeEdges = getRouteEdges(activeProject?.digitalRoute ?? [], activeProject?.currentRouteIndex ?? 0, isRouteFocusOpen);
    return [...projectEdges, ...routeEdges];
  }, [activeProject, focusedBranch, focusedRouteNodeIds, focusedStepNodeIds, isRouteFocusOpen]);

  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    if (!activeProjectId) return;

    changes.forEach((change) => {
      if (change.type === 'position' && change.position) {
        moveNode(activeProjectId, change.id, change.position);
      }
    });
  }, [activeProjectId, moveNode]);

  const handleConnect = useCallback((connection: Connection) => {
    if (!activeProjectId || !connection.source || !connection.target) return;
    connectNodes(activeProjectId, connection.source, connection.target);
  }, [activeProjectId, connectNodes]);

  const handleEdgesDelete = useCallback((deletedEdges: Edge[]) => {
    if (!activeProjectId) return;
    deletedEdges.forEach((edge) => removeEdge(activeProjectId, edge.id));
  }, [activeProjectId, removeEdge]);

  const handleNodeClick = useCallback<NodeMouseHandler>((_event, node) => {
    if (node.type === 'branchNode') {
      const branchKey = (node.data as BranchNodeData).branchKey;
      if (branchKey) setBranchFocus(branchKey);
    }
    selectNode(node.id);
  }, [selectNode]);

  const handleNodeDragStop = useCallback<NodeDragHandler>((_event, node) => {
    if (!activeProjectId || !activeProject) return;

    const projectNode = activeProject.nodes.find((item) => item.id === node.id);
    if (!projectNode || projectNode.locked || projectNode.role !== 'free') return;

    const nearestBranch = getNearestBranch(node.position.x, node.position.y);
    if (!nearestBranch || nearestBranch.key === projectNode.branchKey) return;

    reassignNodeBranch(activeProjectId, projectNode.id, nearestBranch.key);
    toast.success(`Movido a ${nearestBranch.title}`);
  }, [activeProject, activeProjectId, reassignNodeBranch]);

  function createNode(branchKey: typeof baseBranches[number]['key']) {
    if (!activeProjectId || !selectedOption) return;

    const branch = baseBranches.find((item) => item.key === branchKey);
    const freeNodeCount = activeProject?.nodes?.filter((node) => node.role === 'free' && node.branchKey === branchKey).length ?? 0;
    const angle = freeNodeCount * 0.45;
    const direction = branch ? Math.atan2(branch.y - 400, branch.x - 500) : 0;
    const distance = 210 + freeNodeCount * 26;

    addFreeNodeToBranch(activeProjectId, branchKey, {
      title: selectedOption.title,
      kind: selectedOption.kind,
      icon: selectedOption.kind === 'idea' ? '💡' : selectedOption.kind === 'task' ? '✅' : '🔗',
      x: Math.round(500 + Math.cos(direction + angle) * distance),
      y: Math.round(400 + Math.sin(direction + angle) * distance),
    });

    setSelectedOption(null);
    setIsMenuOpen(false);
  }

  function createManualStarterTask() {
    if (!activeProjectId) return;

    addFreeNodeToBranch(activeProjectId, 'actions', {
      title: 'Mi primera tarea',
      kind: 'task',
      icon: '✅',
      priority: 'low',
      x: 690,
      y: 250,
    });
    toast.success('Tarea agregada en Acciones');
  }

  function askAiToStart() {
    openIdeaJar();
    toast('Escribe 2 o 3 ideas crudas y toca “Organizar mi Cerebro con IA”.');
  }

  function showRewardBurst(x: number, y: number, coins = 20, xp = 50) {
    setRewardBurst({ id: `${Date.now()}-${Math.random()}`, x, y, coins, xp });
    window.setTimeout(() => setRewardBurst(null), 1600);
  }

  function completeCurrentRouteStep(event: MouseEvent<HTMLButtonElement>) {
    if (!activeProjectId) return;

    const didAdvance = completeRouteStep(activeProjectId);
    if (didAdvance) {
      const currentStep = activeProject?.digitalRoute[activeProject.currentRouteIndex];
      const routeNode = activeProject?.nodes.find((node) => node.id === currentStep?.linkedNodeId);
      const wasDusty = routeNode ? isDustyNode(routeNode) : false;
      toast.success('¡Ruta Avanzada! +50 XP');
      showRewardBurst(event.clientX, event.clientY, wasDusty ? 60 : 20, 50);
      if (wasDusty) toast.success('¡Limpieza Profunda! +40 monedas extra');
    } else {
      toast('La Ruta Digital ya está completa.');
    }
  }

  return (
    <section className="foru-canvas-shell" aria-label="Lienzo radial del proyecto">
      {isProjectEmpty ? (
        <div className="foru-empty-project-guide">
          <span className="foru-empty-project-orb">✨</span>
          <h2>¡Hola! Este proyecto está vacío.</h2>
          <p>Empecemos suave. Puedes soltar ideas desordenadas, crear una primera tarea o pedirle a la IA que arme el punto de partida.</p>
          <div className="foru-empty-project-actions">
            <DSButtonSecondary type="button" onClick={openIdeaJar}>✨ Echar ideas al frasco</DSButtonSecondary>
            <DSButtonSecondary type="button" onClick={createManualStarterTask}>Agregar tarea manualmente</DSButtonSecondary>
            <DSButtonSecondary type="button" onClick={askAiToStart}>🤖 Que la IA me ayude a empezar</DSButtonSecondary>
          </div>
        </div>
      ) : (
        <div className={`foru-canvas-flow-layer ${isRouteViewOpen ? 'is-route-muted' : ''}`}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={handleNodesChange}
            onNodeClick={handleNodeClick}
            onNodeDragStop={handleNodeDragStop}
            onPaneClick={deselectNode}
            onConnect={handleConnect}
            onEdgesDelete={handleEdgesDelete}
            fitView
            fitViewOptions={{ padding: 0.28 }}
            panOnDrag={isMapMovementUnlocked}
            panOnScroll={false}
            zoomOnScroll={isMapMovementUnlocked}
            zoomOnPinch={isMapMovementUnlocked}
            zoomOnDoubleClick={isMapMovementUnlocked}
            preventScrolling={isMapMovementUnlocked}
            nodesConnectable={false}
            deleteKeyCode={['Backspace', 'Delete']}
            defaultEdgeOptions={{ type: 'smoothstep' }}
          >
            <Background variant={BackgroundVariant.Dots} gap={28} size={1.2} color="#EAEAEA" />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      )}

      {isRouteViewOpen && !isProjectEmpty ? (
        <div className="foru-canvas-route-overlay">
          <DigitalRoutePath project={activeProject} onCompleteStep={completeCurrentRouteStep} />
        </div>
      ) : null}

      <div className="foru-canvas-legend" aria-label="Leyenda de areas del proyecto">
        {baseBranches.map((branch) => (
          <span key={branch.key} style={{ '--branch-color': branch.color } as CSSProperties}>
            {branch.icon} {branch.title} · {branchCounts[branch.key]}
          </span>
        ))}
      </div>

      {branchFocus ? (
        <aside className="foru-branch-focus-panel">
          <DSButtonSecondary type="button" onClick={() => setBranchFocus(null)}>Volver al mapa completo</DSButtonSecondary>
          <h2>{baseBranches.find((branch) => branch.key === branchFocus)?.icon} {baseBranches.find((branch) => branch.key === branchFocus)?.title}</h2>
          <p>{branchStats[branchFocus].pending} pendientes · {branchStats[branchFocus].completed}/{branchStats[branchFocus].total} completadas</p>
          <div>
            {freeNodes.filter((node) => node.branchKey === branchFocus).map((node) => (
              <article key={node.id} className={`is-${getNodeStatus(node)}`}>
                <span>{node.icon ?? '✅'}</span>
                <strong>{node.title}</strong>
                <em>{statusTextByState[getNodeStatus(node)]}</em>
              </article>
            ))}
            {branchStats[branchFocus].total === 0 ? <small>No hay tareas en esta rama todavía.</small> : null}
          </div>
        </aside>
      ) : null}

      <DSButtonSecondary type="button" className="foru-canvas-help" onClick={() => setIsGuideOpen(true)} aria-label="Mostrar guia del mapa">
        ?
      </DSButtonSecondary>

      <DSButtonSecondary
        type="button"
        className={`foru-map-lock-toggle ${isMapMovementUnlocked ? 'is-unlocked' : 'is-locked'}`}
        onClick={() => setIsMapMovementUnlocked((current) => !current)}
      >
        {isMapMovementUnlocked ? '🔒 Bloquear Movimiento' : '🔓 Mover Mapa'}
      </DSButtonSecondary>

      <DSButtonSecondary type="button" className="foru-canvas-route-toggle" onClick={() => setIsRouteViewOpen((current) => !current)}>
        {isRouteViewOpen ? 'Volver al mapa' : '🗺️ Ver Ruta'}
      </DSButtonSecondary>

      <div className="foru-focus-popover">
        <DSButtonSecondary
          type="button"
          className={`foru-focus-menu-toggle ${isStepFocusOpen || isRouteFocusOpen ? 'is-active' : ''}`}
          onClick={() => {
            if (isStepFocusOpen || isRouteFocusOpen) {
              setIsStepFocusOpen(false);
              setIsRouteFocusOpen(false);
              setIsFocusMenuOpen(false);
              return;
            }

            setIsFocusMenuOpen((current) => !current);
          }}
          disabled={!activeProject?.digitalRoute.length}
        >
          {isStepFocusOpen || isRouteFocusOpen ? 'Salir del Enfoque' : '🔍 Enfoque'}
        </DSButtonSecondary>
        {isFocusMenuOpen ? (
          <DSCard as="div" className="foru-focus-menu-card">
            <DSButtonSecondary
              type="button"
              onClick={() => {
                setIsStepFocusOpen((current) => !current);
                setIsRouteFocusOpen(false);
                setIsFocusMenuOpen(false);
              }}
            >
              Paso actual
            </DSButtonSecondary>
            <DSButtonSecondary
              type="button"
              onClick={() => {
                setIsRouteFocusOpen((current) => !current);
                setIsStepFocusOpen(false);
                setIsFocusMenuOpen(false);
              }}
            >
              Ruta completa
            </DSButtonSecondary>
          </DSCard>
        ) : null}
      </div>

      {isGuideOpen ? (
        <div className="foru-project-guide" role="dialog" aria-modal="true" aria-label="Guia del mapa mental">
          <DSCard as="div" className="foru-project-guide-card">
            <span>Guía rápida</span>
            <h2>Así se ordena tu proyecto</h2>
            <div className="foru-project-guide-grid">
              <p><strong>💡 Ideas</strong> Aquí van tus ideas sueltas, chispazos y posibilidades.</p>
              <p><strong>✅ Acciones</strong> Aquí aterrizan las tareas concretas para ejecutar.</p>
              <p><strong>💰 Finanzas</strong> Finanzas, presupuesto, precios y números.</p>
              <p><strong>📱 Marketing</strong> Contenido, campañas, redes y promoción.</p>
              <p><strong>📚 Recursos</strong> Links, archivos, plantillas y material útil.</p>
            </div>
            <DSButtonSecondary type="button" onClick={() => setIsGuideOpen(false)}>
              Entendido, comenzar
            </DSButtonSecondary>
          </DSCard>
        </div>
      ) : null}

      <div className="foru-canvas-add">
        {selectedOption ? (
          <div className="foru-canvas-add-menu foru-canvas-branch-picker">
            <strong>¿Conectar a qué rama?</strong>
            {baseBranches.map((branch) => (
              <DSButtonSecondary
                key={branch.key}
                type="button"
                onClick={() => createNode(branch.key)}
              >
                {branch.icon} {branch.title}
              </DSButtonSecondary>
            ))}
            <DSButtonSecondary type="button" onClick={() => setSelectedOption(null)}>
              Cancelar
            </DSButtonSecondary>
          </div>
        ) : isMenuOpen ? (
          <div className="foru-canvas-add-menu">
            {addOptions.map((option) => (
              <DSButtonSecondary
                key={option.kind}
                type="button"
                onClick={() => setSelectedOption({ kind: option.kind, title: option.title })}
              >
                {option.label}
              </DSButtonSecondary>
            ))}
          </div>
        ) : null}
        <DSButtonSecondary
          type="button"
          className="foru-canvas-add-button"
          onClick={() => {
            setSelectedOption(null);
            setIsMenuOpen((current) => !current);
          }}
          aria-label="Agregar nodo al canvas"
        >
          <Plus size={22} />
        </DSButtonSecondary>
      </div>
      <FloatingReward burst={rewardBurst} />
    </section>
  );
}

function getNearestBranch(x: number, y: number) {
  const nearest = baseBranches
    .map((branch) => ({
      ...branch,
      distance: Math.hypot(branch.x - x, branch.y - y),
    }))
    .sort((a, b) => a.distance - b.distance)[0];

  return nearest && nearest.distance < 260 ? nearest : null;
}

function getEdgeOpacity(source: string, target: string, nodes: ForUProjectNode[], focusedBranch: ForUBranchKey | null, focusedStepNodeIds: Set<string> | null, focusedRouteNodeIds: Set<string> | null) {
  if (focusedRouteNodeIds) {
    return focusedRouteNodeIds.has(source) && focusedRouteNodeIds.has(target) ? 1 : 0;
  }

  if (focusedStepNodeIds) {
    return focusedStepNodeIds.has(source) || focusedStepNodeIds.has(target) ? 0.75 : 0.1;
  }

  if (!focusedBranch) return 0.4;

  const sourceNode = nodes.find((node) => node.id === source);
  const targetNode = nodes.find((node) => node.id === target);

  return sourceNode?.branchKey === focusedBranch || targetNode?.branchKey === focusedBranch ? 0.55 : 0.1;
}

function getEdgeColor(source: string, target: string, nodes: ForUProjectNode[]) {
  const sourceNode = nodes.find((node) => node.id === source);
  const targetNode = nodes.find((node) => node.id === target);
  const branchKey = targetNode?.branchKey ?? sourceNode?.branchKey;
  const branch = baseBranches.find((item) => item.key === branchKey);

  return branch?.color ?? '#6B6B6B';
}

function getStepNodeIds(nodes: ForUProjectNode[], linkedNodeId: string) {
  const ids = new Set<string>([linkedNodeId]);
  nodes
    .filter((node) => node.parentNodeId === linkedNodeId)
    .forEach((node) => ids.add(node.id));

  return ids;
}

function getNextActionIds(nodes: ForUProjectNode[]) {
  const priorityScore = { high: 0, medium: 1, low: 2 } as const;
  const ids = new Set<string>();

  baseBranches.forEach((branch) => {
    nodes
      .filter((node) => node.role === 'free' && node.branchKey === branch.key && !node.completedAt)
      .sort((a, b) => {
        const priorityDelta = priorityScore[a.priority ?? 'low'] - priorityScore[b.priority ?? 'low'];
        if (priorityDelta !== 0) return priorityDelta;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      })
      .slice(0, 3)
      .forEach((node) => ids.add(node.id));
  });

  return ids;
}

function getRouteEdges(route: ForURouteStep[], currentRouteIndex: number, isRouteFocusOpen: boolean): Edge[] {
  return route.slice(0, -1).map((step, index) => {
    const nextStep = route[index + 1];
    const isCompleted = Boolean(step.completedAt) || index < currentRouteIndex;
    const isCurrent = index === currentRouteIndex;
    const color = isCompleted ? '#9A9A9A' : isCurrent ? '#9A9A9A' : '#6B6B6B';

    return {
      id: `digital-route-${step.id}-${nextStep.id}`,
      source: step.linkedNodeId,
      target: nextStep.linkedNodeId,
      type: 'smoothstep',
      animated: true,
      selectable: false,
      deletable: false,
      markerEnd: { type: MarkerType.ArrowClosed, color },
      style: {
        stroke: color,
        strokeWidth: isCurrent ? 6 : isRouteFocusOpen ? 5 : 3,
        opacity: 1,
        filter: isRouteFocusOpen
          ? 'drop-shadow(0 0 14px rgba(0, 0, 0, 0.08))'
          : 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.06))',
      },
    };
  });
}

const statusTextByState = {
  done: '✓ Completado',
  doing: '◷ En progreso',
  todo: 'Pendiente',
};
