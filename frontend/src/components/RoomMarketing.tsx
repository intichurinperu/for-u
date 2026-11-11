import { Html } from '@react-three/drei';
import type { ForUProjectNode } from '../stores/useActiveProjectsStore';

type RoomMarketingProps = {
  references: ForUProjectNode[];
};

export default function RoomMarketing({ references }: RoomMarketingProps) {
  return (
    <group position={[-5.4, 0, 2.6]}>
      <RoomBase color="#EAEAEA" />
      {references.slice(0, 8).map((reference, index) => (
        <group key={reference.id} position={[-1.15 + (index % 4) * 0.76, 1.1 + Math.floor(index / 4) * 0.48, -0.9]}>
          <mesh castShadow>
            <boxGeometry args={[0.56, 0.38, 0.04]} />
            <meshPhysicalMaterial color={index % 2 ? '#EAEAEA' : '#EAEAEA'} roughness={0.76} metalness={0.02} clearcoat={0.1} />
          </mesh>
          <Html position={[0, 0.3, 0]} center distanceFactor={7}>
            <div className="foru-world-room-chip">{reference.title.slice(0, 20)}</div>
          </Html>
        </group>
      ))}
      <Html position={[0, 2.05, -0.9]} center distanceFactor={7}>
        <div className="foru-world-room-title">Muro de inspiración</div>
      </Html>
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
