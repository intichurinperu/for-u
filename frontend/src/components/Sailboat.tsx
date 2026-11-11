import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { Shape, type Group, type Mesh } from 'three';

const clayMaterial = {
  roughness: 0.9,
  metalness: 0.05,
};

export default function Sailboat({ destination, reduced = false }: { destination?: [number, number, number]; reduced?: boolean }) {
  const boatRef = useRef<Group>(null);
  const wakeRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!boatRef.current) return;
    if (destination) {
      const boat = boatRef.current;
      const dx = destination[0] - boat.position.x;
      boat.position.x += reduced ? dx : dx * (1 - Math.exp(-delta * 3));
      boat.position.y = destination[1];
      boat.position.z = destination[2];
      if (Math.abs(dx) > 0.02) boat.rotation.y = dx > 0 ? 0 : Math.PI;
      return;
    }

    const time = state.clock.elapsedTime * 0.22;
    const radius = 4.15;
    const x = Math.cos(time) * radius;
    const z = Math.sin(time) * radius;

    boatRef.current.position.set(x, -0.5, z);
    boatRef.current.rotation.y = -time + Math.PI / 2;

    wakeRef.current?.children.forEach((child, index) => {
      const mesh = child as Mesh;
      const pulse = 0.72 + Math.sin(state.clock.elapsedTime * 2.4 + index * 0.8) * 0.16;
      mesh.scale.setScalar(pulse);
    });
  });

  return (
    <group ref={boatRef}>
      <Float speed={reduced ? 0 : 1.4} rotationIntensity={reduced ? 0 : 0.04} floatIntensity={reduced ? 0 : 0.18}>
        <group>
          <mesh position={[0, 0, 0]} scale={[1, 0.72, 1]} castShadow>
            <sphereGeometry args={[0.58, 24, 16]} />
            <meshPhysicalMaterial color={destination ? "#bd784d" : "#FAFAFA"} roughness={0.76} metalness={0.04} clearcoat={0.25} />
          </mesh>
          <mesh position={[0, -0.08, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.18, 0.32, 1.1, 16]} />
            <meshPhysicalMaterial color="#FAFAFA" {...clayMaterial} clearcoat={0.18} />
          </mesh>
          <mesh position={[0, 0.52, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 1.2, 12]} />
            <meshPhysicalMaterial color="#FAFAFA" {...clayMaterial} />
          </mesh>
          <mesh position={[0.24, 0.72, 0.03]} rotation={[0, 0, -0.18]} castShadow>
            <shapeGeometry args={[createTriangularSailShape()]} />
            <meshPhysicalMaterial color={destination ? "#fff4cb" : "#FAFAFA"} side={2} roughness={0.7} metalness={0.05} clearcoat={0.22} />
          </mesh>
          <mesh position={[0.22, 1.25, 0]} castShadow>
            <boxGeometry args={[0.28, 0.18, 0.035]} />
            <meshPhysicalMaterial color="#EAEAEA" roughness={0.78} metalness={0.04} clearcoat={0.2} />
          </mesh>
          <mesh position={[0.12, 1.25, 0.03]} castShadow>
            <sphereGeometry args={[0.025, 8, 6]} />
            <meshStandardMaterial color="#0A0A0A" />
          </mesh>
          <mesh position={[0.26, 1.25, 0.03]} castShadow>
            <sphereGeometry args={[0.025, 8, 6]} />
            <meshStandardMaterial color="#0A0A0A" />
          </mesh>
          <group ref={wakeRef} position={[-0.66, -0.04, 0]}>
            {[
              [-0.1, 0, -0.18],
              [-0.32, 0, 0.03],
              [-0.54, 0, 0.22],
              [-0.76, 0, -0.05],
            ].map((position, index) => (
              <mesh key={`${position.join('-')}-${index}`} position={position as [number, number, number]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.11 + index * 0.018, 18]} />
                <meshPhysicalMaterial color="#FAFAFA" transparent opacity={0.58 - index * 0.08} roughness={0.25} metalness={0.02} />
              </mesh>
            ))}
          </group>
        </group>
      </Float>
    </group>
  );
}

function createTriangularSailShape() {
  const shape = new Shape();
  shape.moveTo(-0.23, -0.28);
  shape.lineTo(-0.23, 0.33);
  shape.lineTo(0.34, -0.2);
  shape.lineTo(-0.23, -0.28);

  return shape;
}
