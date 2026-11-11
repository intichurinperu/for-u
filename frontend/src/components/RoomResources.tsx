import { ButtonSecondary as DSButtonSecondary } from './ui/DesignSystem';
import { Html } from '@react-three/drei';
import type { ForUProjectNode } from '../stores/useActiveProjectsStore';

type RoomResourcesProps = {
  resources: ForUProjectNode[];
};

export default function RoomResources({ resources }: RoomResourcesProps) {
  return (
    <group position={[5.4, 0, 2.6]}>
      <RoomBase color="#EAEAEA" />
      <mesh position={[0, 0.78, -0.7]} castShadow>
        <boxGeometry args={[2.2, 1.3, 0.18]} />
        <meshPhysicalMaterial color="#EAEAEA" roughness={0.78} metalness={0.03} clearcoat={0.16} />
      </mesh>
      {resources.slice(0, 10).map((resource, index) => (
        <group key={resource.id} position={[-0.92 + (index % 5) * 0.46, 0.45 + Math.floor(index / 5) * 0.54, -0.55]}>
          <mesh castShadow>
            <boxGeometry args={[0.22, 0.42, 0.14]} />
            <meshPhysicalMaterial color={index % 3 === 0 ? '#EAEAEA' : index % 3 === 1 ? '#EAEAEA' : '#FAFAFA'} roughness={0.72} metalness={0.03} />
          </mesh>
          <Html position={[0, 0.34, 0]} center distanceFactor={7}>
            <div className="foru-world-room-chip">{resource.title.slice(0, 18)}</div>
          </Html>
        </group>
      ))}
      <Html position={[0, 2.05, -0.8]} center distanceFactor={7}>
        <DSButtonSecondary type="button" className="foru-world-room-action" onClick={() => window.alert('Aquí agregaremos recursos pronto.')}>
          Agregar recurso
        </DSButtonSecondary>
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
