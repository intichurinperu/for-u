import { Float, Html } from '@react-three/drei';
import type { ReactNode } from 'react';
import type { ForUActiveProject } from '../stores/useActiveProjectsStore';

type Island3DProps = {
  project: ForUActiveProject;
  position: [number, number, number];
  isSelected: boolean;
  children: ReactNode;
  onSelect: () => void;
  animated?: boolean;
  subtitle?: string;
};

export default function Island3D({ project, position, isSelected, children, onSelect, animated = true, subtitle }: Island3DProps) {
  const freeNodes = project.nodes.filter((node) => node.role === 'free');
  const completedNodes = freeNodes.filter((node) => node.completedAt || node.taskStatus === 'done');
  const progress = freeNodes.length ? Math.round((completedNodes.length / freeNodes.length) * 100) : 0;

  return (
    <group position={position}>
      <Float speed={animated ? 0.7 : 0} rotationIntensity={animated ? 0.02 : 0} floatIntensity={animated ? 0.12 : 0}>
        <group
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
        >
          <mesh position={[0, 0, 0]} receiveShadow castShadow>
            <cylinderGeometry args={[3.2, 3.75, 1, 34]} />
            <meshPhysicalMaterial color={isSelected ? '#b4d996' : '#cadfae'} roughness={0.9} metalness={0.04} clearcoat={0.18} />
          </mesh>
          <mesh position={[0, -0.58, 0]} receiveShadow>
            <cylinderGeometry args={[3.45, 3.95, 0.28, 34]} />
            <meshPhysicalMaterial color={isSelected ? '#EAEAEA' : '#FAFAFA'} roughness={0.95} metalness={0.02} clearcoat={0.1} />
          </mesh>
          <mesh position={[0, -0.84, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[5.35, 64]} />
            <meshPhysicalMaterial color="#9A9A9A" transparent opacity={0.48} transmission={0.48} roughness={0.1} metalness={0.02} thickness={0.2} clearcoat={0.5} />
          </mesh>
          <Html position={[0, subtitle ? 5.5 : 4.25, 0]} center distanceFactor={subtitle ? undefined : 12}>
            <div className={`foru-world3d-island-label ${isSelected ? 'is-selected' : ''}`}>
              <strong>{project.name}</strong>
              <span>{subtitle ?? `${freeNodes.length} nodos · ${progress}%`}</span>
            </div>
          </Html>
          {children}
        </group>
      </Float>
    </group>
  );
}
