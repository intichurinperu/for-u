import { ButtonSecondary as DSButtonSecondary } from './ui/DesignSystem';
import type { CSSProperties } from 'react';
import { baseBranches, type ForUActiveProject, type ForUBranchKey, type ForUProjectNode } from '../stores/useActiveProjectsStore';

type MiniMapIslandProps = {
  project: ForUActiveProject;
  isActive?: boolean;
  isNew?: boolean;
  isZoomed?: boolean;
  onEnter: () => void;
};

export default function MiniMapIsland({ project, isActive = false, isNew = false, isZoomed = false, onEnter }: MiniMapIslandProps) {
  const freeNodes = project.nodes.filter((node) => node.role === 'free');
  const completedCount = freeNodes.filter((node) => node.completedAt || node.taskStatus === 'done').length;
  const pendingCount = Math.max(0, freeNodes.length - completedCount);
  const progress = freeNodes.length ? Math.round((completedCount / freeNodes.length) * 100) : 0;

  return (
    <article
      className={`foru-mini-island ${isActive ? 'is-active' : ''} ${isNew ? 'is-new' : ''} ${isZoomed ? 'is-zoomed' : ''}`}
      aria-label={`Isla de proyecto ${project.name}`}
    >
      <header className="foru-mini-island-header">
        <span className={`foru-mini-island-status is-${project.status}`}>
          {project.status === 'active' ? '🟢 Activo' : '⏸️ Pausado'}
        </span>
        <strong>{project.name}</strong>
        <small>{pendingCount} pendientes · {completedCount} completas · {progress}% avance</small>
      </header>

      <div className="foru-mini-island-map" aria-hidden="true">
        <div className="foru-mini-island-core">
          <span>✨</span>
          <strong>{project.name}</strong>
        </div>

        {project.digitalRoute.slice(0, -1).map((step, index) => {
          const sourceNode = project.nodes.find((node) => node.id === step.linkedNodeId);
          const targetNode = project.nodes.find((node) => node.id === project.digitalRoute[index + 1]?.linkedNodeId);
          if (!sourceNode || !targetNode) return null;
          const source = getMiniNodePosition(sourceNode);
          const target = getMiniNodePosition(targetNode);

          return (
            <svg key={step.id} className="foru-mini-route-line" viewBox="0 0 760 460">
              <path
                d={`M ${source.x} ${source.y} C ${(source.x + target.x) / 2} ${source.y - 30}, ${(source.x + target.x) / 2} ${target.y + 30}, ${target.x} ${target.y}`}
              />
            </svg>
          );
        })}

        {baseBranches.map((branch) => {
          const branchNodes = project.nodes.filter((node) => node.role === 'free' && node.branchKey === branch.key);
          const position = branchPositions[branch.key];

          return (
            <div
              key={branch.key}
              className="foru-mini-island-branch"
              style={{
                '--branch-color': branch.color,
                left: `${position.x}px`,
                top: `${position.y}px`,
              } as CSSProperties}
            >
              <span>{branch.icon}</span>
              <strong>{branch.title}</strong>
              <small>{branchNodes.length}</small>
            </div>
          );
        })}

        {freeNodes.map((node, index) => {
          const position = getMiniNodePosition(node, index);
          const routeIndex = project.digitalRoute.findIndex((step) => step.linkedNodeId === node.id);

          return (
            <div
              key={node.id}
              className={`foru-mini-map-node is-${node.priority ?? 'low'} ${node.completedAt || node.taskStatus === 'done' ? 'is-done' : ''} ${routeIndex >= 0 ? 'is-route' : ''}`}
              style={{ left: position.x, top: position.y } as CSSProperties}
              title={node.title}
            >
              {routeIndex >= 0 ? <em>{routeIndex + 1}</em> : null}
              <span>{node.icon ?? getBranchIcon(node.branchKey)}</span>
              <strong>{node.title}</strong>
            </div>
          );
        })}
      </div>

      <div className="foru-mini-island-footer">
        <div>
          {baseBranches.map((branch) => (
            <span key={branch.key} style={{ '--branch-color': branch.color } as CSSProperties}>
              {branch.icon} {freeNodes.filter((node) => node.branchKey === branch.key).length}
            </span>
          ))}
        </div>
        <DSButtonSecondary type="button" className="foru-mini-island-enter" onClick={onEnter}>
          Zoom a esta isla
        </DSButtonSecondary>
      </div>
    </article>
  );
}

function getMiniNodePosition(node: ForUProjectNode, fallbackIndex = 0) {
  const branch = node.branchKey ? branchPositions[node.branchKey] : { x: 380, y: 230 };
  const angle = fallbackIndex * 0.85;
  const x = branch.x + Math.cos(angle) * (68 + (fallbackIndex % 3) * 16);
  const y = branch.y + Math.sin(angle) * (58 + (fallbackIndex % 4) * 12);

  return {
    x: Math.max(40, Math.min(710, x)),
    y: Math.max(40, Math.min(420, y)),
  };
}

function getBranchIcon(branchKey?: ForUBranchKey) {
  return baseBranches.find((branch) => branch.key === branchKey)?.icon ?? '•';
}

const branchPositions: Record<ForUBranchKey, { x: number; y: number }> = {
  ideas: { x: 190, y: 105 },
  actions: { x: 570, y: 105 },
  finances: { x: 635, y: 235 },
  marketing: { x: 555, y: 365 },
  resources: { x: 190, y: 365 },
};
