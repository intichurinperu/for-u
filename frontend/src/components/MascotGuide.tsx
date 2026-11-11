import { Float, Html } from '@react-three/drei';

type MascotGuideProps = {
  message: string;
  color?: string;
  position?: [number,number,number];
  accessory?: string;
  animated?: boolean;
  fixedLabel?: boolean;
};

export default function MascotGuide({ message, animated = true, fixedLabel = false, color = '#EAEAEA', position = [-1.6,0.24,1.2], accessory }: MascotGuideProps) {
  return (
    <Float speed={animated ? 1.4 : 0} rotationIntensity={animated ? 0.08 : 0} floatIntensity={animated ? 0.18 : 0}>
      <group position={position}>
        {accessory && <Html position={[0,.8,0]} center><span aria-hidden="true">{accessory}</span></Html>}
        <mesh position={[0, 0.36, 0]} castShadow>
          <sphereGeometry args={[0.32, 24, 18]} />
          <meshPhysicalMaterial color={color} roughness={0.82} metalness={0.04} clearcoat={0.2} />
        </mesh>
        <mesh position={[-0.13, 0.5, 0.26]} castShadow>
          <sphereGeometry args={[0.045, 12, 8]} />
          <meshStandardMaterial color="#0A0A0A" />
        </mesh>
        <mesh position={[0.13, 0.5, 0.26]} castShadow>
          <sphereGeometry args={[0.045, 12, 8]} />
          <meshStandardMaterial color="#0A0A0A" />
        </mesh>
        <mesh position={[0, 0.24, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.28, 0.34, 20]} />
          <meshPhysicalMaterial color={color} roughness={0.86} metalness={0.03} clearcoat={0.12} />
        </mesh>
        {message && <Html position={[0.1, 1.1, 0]} center distanceFactor={fixedLabel ? undefined : 6}>
          <div className="foru-world-speech">
            {message}
          </div>
        </Html>}
      </group>
    </Float>
  );
}
