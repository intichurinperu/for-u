import type { CSSProperties } from 'react';
import type { NodeProps } from 'reactflow';
import type { ForUBranchKey } from '../stores/useActiveProjectsStore';

export type BranchNodeData = {
  title: string;
  icon?: string;
  branchKey?: ForUBranchKey;
  color?: string;
  total: number;
  completed: number;
  pending: number;
  status: 'done' | 'doing' | 'todo';
};

export default function BranchNode({ data, selected }: NodeProps<BranchNodeData>) {
  return (
    <article
      className={selected ? 'foru-branch-node is-selected' : 'foru-branch-node'}
      style={{ '--branch-color': data.color ?? '#9A9A9A' } as CSSProperties}
    >
      <div className="foru-branch-node-icon">{data.icon}</div>
      <div>
        <h3>{data.title}</h3>
        <strong>{data.completed}/{data.total} completadas</strong>
        <span>{data.pending} tareas pendientes</span>
      </div>
      <em className={`foru-action-status is-${data.status}`}>
        {statusLabel[data.status]}
      </em>
    </article>
  );
}

const statusLabel = {
  done: '✓ Listo',
  doing: '◷ En progreso',
  todo: 'Pendiente',
};
