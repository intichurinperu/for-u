import { Float, Html } from '@react-three/drei';
import type { ForUProjectNode } from '../stores/useActiveProjectsStore';

type RoomFinanceProps = {
  nodes: ForUProjectNode[];
  progress: number;
};

export default function RoomFinance({ nodes, progress }: RoomFinanceProps) {
  return (
    <group position={[5.4, 0, -2.4]}>
      <RoomBase color="#EAEAEA" />
      <mesh position={[0, 0.64, -0.35]} castShadow>
        <boxGeometry args={[1.15, 1, 0.72]} />
        <meshPhysicalMaterial color="#EAEAEA" roughness={0.65} metalness={0.16} clearcoat={0.32} />
      </mesh>
      <mesh position={[0, 0.72, 0.03]} castShadow>
        <torusGeometry args={[0.22, 0.035, 12, 24]} />
        <meshPhysicalMaterial color="#FAFAFA" roughness={0.42} metalness={0.22} clearcoat={0.4} />
      </mesh>
      {['$', `${progress}%`, `${nodes.length}`].map((label, index) => (
        <Float key={label} speed={1.2 + index * 0.2} rotationIntensity={0.25} floatIntensity={0.26}>
          <Html position={[-0.9 + index * 0.9, 1.72, 0.1]} center distanceFactor={7}>
            <div className="foru-world-number">{label}</div>
          </Html>
        </Float>
      ))}
    </group>
  );
}

function RoomBase({ color }: { color: string }) {
  return (
    <>
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[3.4, 0.08, 2.7]} />
        <meshPhysicalMaterial color={color} roughness={0.86} metalness={0.02} clearcoat={0.08} />
      </mesh>
      <mesh position={[0, 1.12, -1.36]} receiveShadow>
        <boxGeometry args={[3.4, 2.16, 0.08]} />
        <meshPhysicalMaterial color="#FAFAFA" roughness={0.9} metalness={0.02} />
      </mesh>
    </>
  );
}
