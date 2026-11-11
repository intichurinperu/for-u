import { ButtonSecondary as DSButtonSecondary } from './ui/DesignSystem';
import type { CSSProperties } from 'react';
import { baseBranches, type ForUBranchKey, type ForUProjectNode, useActiveProjectsStore } from '../stores/useActiveProjectsStore';

type MiniMindMapProps = {
  centerLabel: string;
  nodes: ForUProjectNode[];
};

const miniBranchPositions: Record<ForUBranchKey, { x: number; y: number }> = {
  ideas: { x: 52, y: 42 },
  actions: { x: 148, y: 42 },
  finances: { x: 164, y: 100 },
  marketing: { x: 148, y: 158 },
  resources: { x: 52, y: 158 },
};

export default function MiniMindMap({ centerLabel, nodes }: MiniMindMapProps) {
  const selectNode = useActiveProjectsStore((state) => state.selectNode);

  return (
    <div className="foru-mini-mind-map" aria-label={`Mini mapa mental de ${centerLabel}`}>
      <div className="foru-mini-mind-core">
        <strong>{centerLabel}</strong>
      </div>

      {baseBranches.map((branch) => {
        const branchNodes = nodes.filter((node) => node.branchKey === branch.key);
        const position = miniBranchPositions[branch.key];

        return (
          <div
            key={branch.key}
            className="foru-mini-mind-branch"
            style={{
              '--branch-color': branch.color,
              left: position.x,
              top: position.y,
              opacity: branchNodes.length ? 1 : 0.28,
            } as CSSProperties}
            title={`${branch.title}: ${branchNodes.length}`}
          >
            {branch.icon}
          </div>
        );
      })}

      {nodes.map((node, index) => {
        const position = getMiniNodePosition(node, index);
        const branch = baseBranches.find((item) => item.key === node.branchKey);

        return (
          <DSButtonSecondary
            key={node.id}
            type="button"
            className={`foru-mini-mind-node is-${node.priority ?? 'low'}`}
            style={{
              '--branch-color': branch?.color ?? '#9A9A9A',
              left: position.x,
              top: position.y,
            } as CSSProperties}
            title={node.title}
            onClick={() => selectNode(node.id)}
          >
            <span>{node.icon ?? branch?.icon ?? '•'}</span>
            <strong>{node.title}</strong>
          </DSButtonSecondary>
        );
      })}
    </div>
  );
}

function getMiniNodePosition(node: ForUProjectNode, index: number) {
  const branchPosition = node.branchKey ? miniBranchPositions[node.branchKey] : { x: 100, y: 100 };
  const angle = index * 0.95;

  return {
    x: Math.max(24, Math.min(176, branchPosition.x + Math.cos(angle) * 24)),
    y: Math.max(24, Math.min(176, branchPosition.y + Math.sin(angle) * 22)),
  };
}
