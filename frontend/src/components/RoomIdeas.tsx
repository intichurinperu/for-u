import { ButtonSecondary as DSButtonSecondary } from './ui/DesignSystem';
import { Float, Html } from '@react-three/drei';
import type { ForUProjectNode, ForURawNote } from '../stores/useActiveProjectsStore';

type RoomIdeasProps = {
  ideas: ForUProjectNode[];
  rawNotes: ForURawNote[];
  onOpenJar: () => void;
  onSelectIdea: (title: string) => void;
};

export default function RoomIdeas({ ideas, rawNotes, onOpenJar, onSelectIdea }: RoomIdeasProps) {
  const bubbles = [...rawNotes.map((note) => note.content), ...ideas.map((idea) => idea.title)].slice(0, 8);

  return (
    <group position={[-5.4, 0, -2.4]}>
      <RoomBase color="#EAEAEA" />
      <GiantJar />
      {bubbles.map((label, index) => (
        <Float key={`${label}-${index}`} speed={1 + index * 0.08} rotationIntensity={0.16} floatIntensity={0.42}>
          <group
            position={[
              -0.95 + (index % 4) * 0.62,
              1.05 + Math.floor(index / 4) * 0.56,
              0.2 + (index % 2) * 0.25,
            ]}
            onClick={(event) => {
              event.stopPropagation();
              onSelectIdea(label);
            }}
          >
            <mesh castShadow>
              <sphereGeometry args={[0.18, 18, 12]} />
              <meshPhysicalMaterial color="#FAFAFA" transparent opacity={0.68} roughness={0.08} transmission={0.35} clearcoat={0.8} />
            </mesh>
            <Html position={[0, 0.34, 0]} center distanceFactor={6}>
              <DSButtonSecondary type="button" className="foru-world-room-chip">{label.slice(0, 26)}</DSButtonSecondary>
            </Html>
          </group>
        </Float>
      ))}
      <Html position={[0, 2.35, 0]} center distanceFactor={7}>
        <DSButtonSecondary type="button" className="foru-world-room-action" onClick={onOpenJar}>Agregar idea</DSButtonSecondary>
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

function GiantJar() {
  return (
    <group position={[0, 0.55, -0.15]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.48, 0.62, 0.92, 24]} />
        <meshPhysicalMaterial color="#FAFAFA" transparent opacity={0.32} roughness={0.04} transmission={0.55} clearcoat={0.9} />
      </mesh>
      <mesh position={[0, 0.56, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.38, 0.16, 24]} />
        <meshPhysicalMaterial color="#EAEAEA" roughness={0.5} metalness={0.05} clearcoat={0.25} />
      </mesh>
    </group>
  );
}
