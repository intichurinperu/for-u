import { useState } from 'react';
import { Float, Html } from '@react-three/drei';
import type { ForUProjectNode, ForUWorldViewLevel } from '../stores/useActiveProjectsStore';

type TaskPropProps = {
  node: ForUProjectNode;
  index: number;
  viewLevel: ForUWorldViewLevel;
  origin?: [number, number, number];
  position?: [number, number, number];
};

const priorityColor = {
  high: '#6B6B6B',
  medium: '#9A9A9A',
  low: '#EAEAEA',
};

export default function TaskProp({ node, index, viewLevel, origin = [0, 0, 0], position }: TaskPropProps) {
  const [isHovered, setIsHovered] = useState(false);
  const color = priorityColor[node.priority ?? 'low'];
  const exteriorPosition = getExteriorPosition(index, origin);
  const propPosition = position ?? exteriorPosition;

  const prop = (
    <group
      position={propPosition}
      onPointerOver={(event) => {
        event.stopPropagation();
        setIsHovered(true);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setIsHovered(false);
      }}
    >
      <mesh castShadow>
        {viewLevel === 'interior' ? <boxGeometry args={[0.34, 0.08, 0.46]} /> : <sphereGeometry args={[0.2, 18, 18]} />}
        <meshPhysicalMaterial color={color} roughness={0.62} metalness={0.08} clearcoat={0.28} />
      </mesh>
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[0.24, 0.03, 0.32]} />
        <meshPhysicalMaterial color="#FAFAFA" roughness={0.8} metalness={0.02} clearcoat={0.18} />
      </mesh>
      {isHovered ? (
        <Html position={[0, 0.42, 0]} center distanceFactor={6}>
          <div className="foru-world3d-tooltip">
            <strong>{node.title}</strong>
            <span>{node.priority ?? 'low'} priority</span>
          </div>
        </Html>
      ) : null}
    </group>
  );

  if (viewLevel === 'exterior') {
    return (
      <Float speed={1.2 + index * 0.12} rotationIntensity={0.16} floatIntensity={0.32}>
        {prop}
      </Float>
    );
  }

  return prop;
}

function getExteriorPosition(index: number, origin: [number, number, number]): [number, number, number] {
  const angle = index * 0.9;
  const radius = 1.45 + (index % 3) * 0.18;

  return [
    origin[0] + Math.cos(angle) * radius,
    origin[1] + 1.25 + (index % 2) * 0.26,
    origin[2] + Math.sin(angle) * radius,
  ];
}
