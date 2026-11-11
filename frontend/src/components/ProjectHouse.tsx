import { ButtonSecondary as DSButtonSecondary } from './ui/DesignSystem';
import { Float, Html } from '@react-three/drei';
import type { ForUActiveProject, ForUNextAction, ForUBranchKey, ForUProjectNode, ForURawNote } from '../stores/useActiveProjectsStore';
import MascotGuide from './MascotGuide';
import RoomActions from './RoomActions';
import RoomFinance from './RoomFinance';
import RoomIdeas from './RoomIdeas';
import RoomMarketing from './RoomMarketing';
import RoomResources from './RoomResources';

type ProjectHouseProps = {
  project: ForUActiveProject;
  nextAction: ForUNextAction | null;
  progress: number;
  rawNotes: ForURawNote[];
  selectedRoom: ForUBranchKey | 'hall';
  onSelectRoom: (room: ForUBranchKey | 'hall') => void;
  onOpenJar: () => void;
  onCompleteTask: (nodeId: string) => void;
};

const rooms: Array<{ key: ForUBranchKey; label: string; icon: string; position: [number, number, number] }> = [
  { key: 'ideas', label: 'Ideas', icon: '💡', position: [-2.4, 0.5, -1.2] },
  { key: 'actions', label: 'Acciones', icon: '✅', position: [0, 0.5, -2] },
  { key: 'finances', label: 'Finanzas', icon: '💰', position: [2.4, 0.5, -1.2] },
  { key: 'marketing', label: 'Marketing', icon: '📱', position: [-2.4, 0.5, 1.3] },
  { key: 'resources', label: 'Recursos', icon: '📚', position: [2.4, 0.5, 1.3] },
];

export default function ProjectHouse({
  project,
  nextAction,
  progress,
  rawNotes,
  selectedRoom,
  onSelectRoom,
  onOpenJar,
  onCompleteTask,
}: ProjectHouseProps) {
  const nodes = project.nodes.filter((node) => node.role === 'free');
  const isDusty = isProjectDusty(project);

  return (
    <group>
      <HouseShell progress={progress} isDusty={isDusty} />
      <HallBoard project={project} nextAction={nextAction} progress={progress} />
      <MascotGuide message={getMascotMessage(project, nextAction, isDusty)} />
      {rooms.map((room) => (
        <Door
          key={room.key}
          room={room}
          isActive={selectedRoom === room.key}
          onClick={() => onSelectRoom(room.key)}
        />
      ))}
      <Html position={[0, 2.65, 1.7]} center distanceFactor={7}>
        <DSButtonSecondary type="button" className="foru-world-room-action" onClick={() => onSelectRoom('hall')}>
          Ir al hall principal
        </DSButtonSecondary>
      </Html>

      <RoomIdeas
        ideas={nodes.filter((node) => node.branchKey === 'ideas')}
        rawNotes={rawNotes}
        onOpenJar={onOpenJar}
        onSelectIdea={(title) => window.alert(title)}
      />
      <RoomActions
        tasks={nodes.filter((node) => node.branchKey === 'actions' && !node.completedAt && node.taskStatus !== 'done')}
        onCompleteTask={onCompleteTask}
      />
      <RoomFinance nodes={nodes.filter((node) => node.branchKey === 'finances')} progress={progress} />
      <RoomMarketing references={nodes.filter((node) => node.branchKey === 'marketing')} />
      <RoomResources resources={nodes.filter((node) => node.branchKey === 'resources')} />
      <MagicDust isDusty={isDusty} />
      {progress >= 25 ? <Decorations progress={progress} /> : null}
    </group>
  );
}

function HouseShell({ progress, isDusty }: { progress: number; isDusty: boolean }) {
  const wallColor = progress >= 75 ? '#FAFAFA' : progress >= 50 ? '#FAFAFA' : '#FAFAFA';
  const floorColor = isDusty ? '#EAEAEA' : progress >= 50 ? '#EAEAEA' : '#EAEAEA';

  return (
    <>
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[10.8, 0.12, 8.6]} />
        <meshPhysicalMaterial color={floorColor} roughness={0.82} metalness={0.02} clearcoat={0.08} />
      </mesh>
      <mesh position={[0, 1.35, -4.35]} receiveShadow>
        <boxGeometry args={[10.8, 2.7, 0.12]} />
        <meshPhysicalMaterial color={wallColor} roughness={0.9} metalness={0.02} />
      </mesh>
      <mesh position={[-5.45, 1.35, 0]} receiveShadow>
        <boxGeometry args={[0.12, 2.7, 8.6]} />
        <meshPhysicalMaterial color={wallColor} roughness={0.9} metalness={0.02} />
      </mesh>
      <mesh position={[5.45, 1.35, 0]} receiveShadow>
        <boxGeometry args={[0.12, 2.7, 8.6]} />
        <meshPhysicalMaterial color={wallColor} roughness={0.9} metalness={0.02} />
      </mesh>
      <mesh position={[0, 2.82, 0]} receiveShadow>
        <boxGeometry args={[11.2, 0.12, 8.9]} />
        <meshPhysicalMaterial color="#FAFAFA" roughness={0.95} metalness={0.02} transparent opacity={0.32} />
      </mesh>
      <mesh position={[0, 0.03, 4.32]} receiveShadow>
        <boxGeometry args={[10.8, 0.08, 0.12]} />
        <meshPhysicalMaterial color="#EAEAEA" roughness={0.78} metalness={0.03} />
      </mesh>
    </>
  );
}

function HallBoard({ project, nextAction, progress }: { project: ForUActiveProject; nextAction: ForUNextAction | null; progress: number }) {
  return (
    <group position={[0, 1.42, 0.4]}>
      <mesh castShadow>
        <boxGeometry args={[2.9, 1.55, 0.08]} />
        <meshPhysicalMaterial color="#0A0A0A" roughness={0.7} metalness={0.06} clearcoat={0.18} />
      </mesh>
      <Html position={[0, 0.03, 0.08]} center distanceFactor={5.8}>
        <div className="foru-world-board">
          <strong>{project.name}</strong>
          <span>{nextAction?.title ?? 'Elegir una acción pequeña'}</span>
          <small>{progress}% completado</small>
        </div>
      </Html>
    </group>
  );
}

function Door({
  room,
  isActive,
  onClick,
}: {
  room: { key: ForUBranchKey; label: string; icon: string; position: [number, number, number] };
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <group
      position={room.position}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      <mesh castShadow>
        <boxGeometry args={[0.78, 1.05, 0.12]} />
        <meshPhysicalMaterial color={isActive ? '#EAEAEA' : '#EAEAEA'} roughness={0.74} metalness={0.04} clearcoat={0.18} />
      </mesh>
      <Html position={[0, 0.82, 0.12]} center distanceFactor={7}>
        <DSButtonSecondary type="button" className={isActive ? 'foru-world-door is-active' : 'foru-world-door'}>
          {room.icon} {room.label}
        </DSButtonSecondary>
      </Html>
    </group>
  );
}

function Decorations({ progress }: { progress: number }) {
  return (
    <>
      <mesh position={[-3.8, 0.46, 3.1]} castShadow>
        <cylinderGeometry args={[0.18, 0.26, 0.55, 16]} />
        <meshPhysicalMaterial color="#EAEAEA" roughness={0.8} metalness={0.03} />
      </mesh>
      <mesh position={[-3.8, 0.96, 3.1]} castShadow>
        <sphereGeometry args={[0.36, 18, 12]} />
        <meshPhysicalMaterial color="#EAEAEA" roughness={0.86} metalness={0.03} />
      </mesh>
      {progress >= 50 ? (
        <mesh position={[3.8, 1.3, 3.4]} castShadow>
          <boxGeometry args={[1.1, 0.72, 0.06]} />
          <meshPhysicalMaterial color="#EAEAEA" roughness={0.78} metalness={0.03} clearcoat={0.12} />
        </mesh>
      ) : null}
      {progress >= 75 ? <pointLight position={[0, 2.55, 0]} color="#EAEAEA" distance={6} intensity={1.1} /> : null}
    </>
  );
}

function MagicDust({ isDusty }: { isDusty: boolean }) {
  const particles = Array.from({ length: isDusty ? 24 : 14 });

  return (
    <>
      {particles.map((_, index) => (
        <Float key={index} speed={0.55 + index * 0.02} rotationIntensity={0.3} floatIntensity={0.28}>
          <mesh position={[-4.5 + (index % 8) * 1.25, 1.05 + (index % 3) * 0.35, -3 + Math.floor(index / 8) * 2.4]}>
            <sphereGeometry args={[isDusty ? 0.045 : 0.035, 8, 6]} />
            <meshBasicMaterial color={isDusty ? '#9A9A9A' : '#FAFAFA'} transparent opacity={isDusty ? 0.34 : 0.52} />
          </mesh>
        </Float>
      ))}
    </>
  );
}

function isProjectDusty(project: ForUActiveProject) {
  const updated = new Date(project.updatedAt).getTime();
  return Number.isFinite(updated) && Date.now() - updated > 48 * 60 * 60 * 1000;
}

function getMascotMessage(project: ForUActiveProject, nextAction: ForUNextAction | null, isDusty: boolean) {
  if (isDusty) return `${project.name} te extraña. ¿Le regalamos 10 minutos?`;
  if (!nextAction) return 'Podemos explorar o volver al tablero cuando quieras.';
  return `Hola. Yo cuidé la casa. Siguiente: ${nextAction.title}`;
}
