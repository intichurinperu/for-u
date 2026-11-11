import TaskProp from './TaskProp';
import type { ForUBranchKey, ForUProjectNode } from '../stores/useActiveProjectsStore';

type BuildingInteriorProps = {
  branchKey: ForUBranchKey;
  tasks: ForUProjectNode[];
};

const roomMeta: Record<ForUBranchKey, { title: string; wall: string; accent: string }> = {
  finances: { title: 'Finanzas', wall: '#FAFAFA', accent: '#9A9A9A' },
  marketing: { title: 'Marketing', wall: '#EAEAEA', accent: '#EAEAEA' },
  ideas: { title: 'Ideas', wall: '#EAEAEA', accent: '#EAEAEA' },
  actions: { title: 'Operaciones', wall: '#EAEAEA', accent: '#9A9A9A' },
  resources: { title: 'Estrategia', wall: '#FAFAFA', accent: '#9A9A9A' },
};

const taskSlots: Array<[number, number, number]> = [
  [-1.15, 0.78, 0.45],
  [-0.35, 0.78, 0.45],
  [0.55, 0.78, 0.45],
  [1.25, 1.22, -0.72],
  [-1.35, 1.34, -0.75],
  [0.2, 1.58, -0.86],
];

export default function BuildingInterior({ branchKey, tasks }: BuildingInteriorProps) {
  const meta = roomMeta[branchKey];

  return (
    <group position={[0, -0.3, 0]}>
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[4.4, 0.18, 3.6]} />
        <meshPhysicalMaterial color="#FAFAFA" roughness={0.72} metalness={0.04} clearcoat={0.18} />
      </mesh>
      <mesh position={[0, 1.45, -1.82]} receiveShadow>
        <boxGeometry args={[4.4, 2.7, 0.16]} />
        <meshPhysicalMaterial color={meta.wall} roughness={0.76} metalness={0.04} clearcoat={0.14} />
      </mesh>
      <mesh position={[-2.22, 1.45, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[3.6, 2.7, 0.16]} />
        <meshPhysicalMaterial color="#FAFAFA" roughness={0.82} metalness={0.03} clearcoat={0.12} />
      </mesh>

      <InteriorByBranch branchKey={branchKey} accent={meta.accent} title={meta.title} />
      <Avatar />

      {tasks.slice(0, 6).map((task, index) => (
        <TaskProp
          key={task.id}
          node={task}
          index={index}
          viewLevel="interior"
          position={taskSlots[index] ?? [0, 0.8, 0]}
        />
      ))}
    </group>
  );
}

function InteriorByBranch({ branchKey, accent, title }: { branchKey: ForUBranchKey; accent: string; title: string }) {
  if (branchKey === 'finances') {
    return (
      <>
        <Desk accent={accent} />
        <Board position={[0.85, 1.55, -1.7]} label="123" />
        <mesh position={[-1.25, 0.48, -1.15]} castShadow>
          <boxGeometry args={[0.7, 0.62, 0.58]} />
          <meshPhysicalMaterial color="#EAEAEA" roughness={0.58} metalness={0.12} clearcoat={0.26} />
        </mesh>
      </>
    );
  }

  if (branchKey === 'marketing') {
    return (
      <>
        <mesh position={[0, 0.55, 0.55]} castShadow>
          <boxGeometry args={[2.3, 0.7, 0.48]} />
          <meshPhysicalMaterial color={accent} roughness={0.64} metalness={0.08} clearcoat={0.28} />
        </mesh>
        <Shelf position={[-1.35, 1.02, -1.35]} accent="#FAFAFA" />
        <Board position={[0.9, 1.65, -1.7]} label={title} />
      </>
    );
  }

  if (branchKey === 'ideas') {
    return (
      <>
        <Desk accent={accent} />
        <mesh position={[-1.35, 1.62, -1.35]} castShadow>
          <sphereGeometry args={[0.22, 18, 18]} />
          <meshPhysicalMaterial color="#FAFAFA" emissive="#EAEAEA" emissiveIntensity={0.7} roughness={0.38} />
        </mesh>
        <ToolRack />
      </>
    );
  }

  if (branchKey === 'actions') {
    return (
      <>
        <mesh position={[0, 0.58, 0.4]} castShadow>
          <boxGeometry args={[2.4, 0.24, 1.05]} />
          <meshPhysicalMaterial color="#FAFAFA" roughness={0.72} metalness={0.04} clearcoat={0.18} />
        </mesh>
        {[-0.9, 0, 0.9].map((x) => (
          <mesh key={x} position={[x, 0.34, -0.38]} castShadow>
            <boxGeometry args={[0.38, 0.52, 0.38]} />
            <meshPhysicalMaterial color={accent} roughness={0.76} metalness={0.04} />
          </mesh>
        ))}
        <mesh position={[1.45, 0.58, -1.2]} castShadow>
          <cylinderGeometry args={[0.28, 0.34, 0.62, 18]} />
          <meshPhysicalMaterial color="#EAEAEA" roughness={0.72} metalness={0.05} emissive="#EAEAEA" emissiveIntensity={0.12} />
        </mesh>
      </>
    );
  }

  return (
    <>
      <mesh position={[-1.2, 0.55, 0.25]} castShadow>
        <cylinderGeometry args={[0.52, 0.62, 0.95, 22]} />
        <meshPhysicalMaterial color="#FAFAFA" roughness={0.7} metalness={0.06} clearcoat={0.22} />
      </mesh>
      <mesh position={[-1.2, 1.22, 0.25]} castShadow>
        <cylinderGeometry args={[0.45, 0.52, 0.24, 22]} />
        <meshPhysicalMaterial color={accent} emissive={accent} emissiveIntensity={0.18} roughness={0.45} />
      </mesh>
      <Board position={[0.9, 1.55, -1.7]} label="Mapa" />
      <mesh position={[1.35, 0.9, 0.35]} rotation={[0.2, 0, -0.2]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 1.05, 16]} />
        <meshPhysicalMaterial color="#FAFAFA" roughness={0.62} metalness={0.12} />
      </mesh>
    </>
  );
}

function Desk({ accent }: { accent: string }) {
  return (
    <mesh position={[0, 0.58, 0.5]} castShadow>
      <boxGeometry args={[2, 0.28, 0.95]} />
      <meshPhysicalMaterial color={accent} roughness={0.68} metalness={0.06} clearcoat={0.2} />
    </mesh>
  );
}

function Shelf({ position, accent }: { position: [number, number, number]; accent: string }) {
  return (
    <group position={position}>
      {[0, 0.45, 0.9].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <boxGeometry args={[1.05, 0.1, 0.28]} />
          <meshPhysicalMaterial color={accent} roughness={0.75} metalness={0.04} />
        </mesh>
      ))}
    </group>
  );
}

function Board({ position, label }: { position: [number, number, number]; label: string }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[1.25, 0.72, 0.05]} />
        <meshPhysicalMaterial color="#FAFAFA" roughness={0.62} metalness={0.04} clearcoat={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.035]} castShadow>
        <boxGeometry args={[0.78, 0.1, 0.025]} />
        <meshPhysicalMaterial color="#9A9A9A" roughness={0.62} metalness={0.05} />
      </mesh>
      <mesh position={[0, -0.2, 0.035]} castShadow>
        <boxGeometry args={[0.52, 0.08, 0.025]} />
        <meshPhysicalMaterial color="#9A9A9A" roughness={0.62} metalness={0.05} />
      </mesh>
    </group>
  );
}

function ToolRack() {
  return (
    <group position={[1.25, 1.18, -1.5]}>
      {[0, 0.28, 0.56].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, 0.32]} castShadow>
          <boxGeometry args={[0.08, 0.55, 0.08]} />
          <meshPhysicalMaterial color="#9A9A9A" roughness={0.75} metalness={0.04} />
        </mesh>
      ))}
    </group>
  );
}

function Avatar() {
  return (
    <group position={[-1.55, 0.4, 0.95]}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <sphereGeometry args={[0.2, 18, 18]} />
        <meshPhysicalMaterial color="#EAEAEA" roughness={0.68} metalness={0.05} clearcoat={0.2} />
      </mesh>
      <mesh position={[0, 0.12, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.32, 8, 16]} />
        <meshPhysicalMaterial color="#9A9A9A" roughness={0.72} metalness={0.05} />
      </mesh>
    </group>
  );
}
