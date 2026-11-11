import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import { Vector3 } from 'three';
import Island3D from '../../components/Island3D';
import Sailboat from '../../components/Sailboat';
import MascotGuide from '../../components/MascotGuide';
import type { ForUActiveProject } from '../../stores/useActiveProjectsStore';
import { areaDefinitions, areaProgress, type AreaId } from './areaModel';
import type { AreaEntry } from './areaPersistence';
type Props = {
    projects: ForUActiveProject[];
    cache: Record<string, AreaEntry>;
    activeId: string;
    onSelect: (id: string) => void;
    onArea: (area: AreaId) => void;
    reduced: boolean;
    visible: boolean;
    onFailure: () => void;
    zoom: number;
    measure: number;
    onSample: (value: string) => void;
};
function FrameWatchdog({ visible, onFailure }: {
    visible: boolean;
    onFailure: () => void;
}) { const painted = useRef(false); useFrame(() => { painted.current = true; }); useEffect(() => { if (!visible || painted.current)
    return; const timer = setTimeout(() => { if (!painted.current)
    onFailure(); }, 5000); return () => clearTimeout(timer); }, [visible, onFailure]); return null; }
function CameraTravel({ x, reduced, zoom }: {
    x: number;
    reduced: boolean;
    zoom: number;
}) { const target = useRef(new Vector3()); const invalidate = useThree(s => s.invalidate); useEffect(() => { invalidate(); }, [x, zoom, reduced, invalidate]); useFrame(({ camera }, delta) => { target.current.set(x + 8, 16, 19); if (reduced)
    camera.position.copy(target.current);
else
    camera.position.lerp(target.current, 1 - Math.exp(-delta * 4)); camera.lookAt(camera.position.x - 8, 0, 0); if (camera.zoom !== zoom) {
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
} }); return null; }
function Sample({ run, visible, reduced, onSample }: {
    run: number;
    visible: boolean;
    reduced: boolean;
    onSample: (value: string) => void;
}) {
    const gl=useThree(s=>s.gl);
    const cancelled = useRef(0);
    const meter = useRef<{
        start: number;
        frames: number;
        pauses: number;
        max: number;
    } | null>(null);
    useEffect(() => { if(run && (!visible||reduced))cancelled.current=run; meter.current = run && run!==cancelled.current && visible && !reduced ? { start: performance.now(), frames: 0, pauses: 0, max: 0 } : null; if (run && (!visible || reduced))
        onSample('Medición cancelada: vuelve a medir con la pestaña visible y movimiento activo.'); }, [run, visible, reduced, onSample]);
    useFrame((_state, delta) => { const m = meter.current; if (!m)
        return; m.frames++; m.max = Math.max(m.max, delta * 1000); if (delta > .1)
        m.pauses++; const seconds = (performance.now() - m.start) / 1000; if (seconds >= 60) {
        onSample(`${(m.frames / seconds).toFixed(1)} FPS medios · ${seconds.toFixed(1)} s · ${m.pauses} cuadros >100 ms · máximo ${Math.round(m.max)} ms · viewport ${window.innerWidth}×${window.innerHeight} · DPR ${gl.getPixelRatio()}. ${navigator.userAgent}`);
        meter.current = null;
    } });
    return null;
}
export default function WorldScene({ projects, cache, activeId, onSelect, onArea, reduced, visible, onFailure, zoom, measure, onSample }: Props) {
    const alive=useRef(true);
    useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
    const index = Math.max(0, projects.findIndex(p => p.id === activeId));
    const [mobile,setMobile]=useState(()=>window.innerWidth<768);
    useEffect(()=>{const resize=()=>setMobile(window.innerWidth<768);window.addEventListener("resize",resize);return()=>window.removeEventListener("resize",resize);},[]);
    return <div className="world-canvas" role="group" aria-label="Archipiélago 3D. Los botones de islas y espacios ofrecen las mismas acciones con teclado."><Canvas orthographic camera={{ position: [8, 16, 19], zoom, near: .1, far: 400 }} dpr={mobile ? 1 : [1, 1.5]} frameloop={visible && !reduced ? 'always' : 'demand'} gl={{ antialias: false, powerPreference: 'low-power' }} onCreated={({ gl }) => { gl.domElement.addEventListener('webglcontextlost', event => { if(alive.current){event.preventDefault(); onFailure();} }, { once: true }); }} fallback={<p>No hay WebGL. Activa Vista ligera para continuar.</p>}>
 <FrameWatchdog visible={visible} onFailure={onFailure}/><Sample run={measure} visible={visible} reduced={reduced} onSample={onSample}/><color attach="background" args={['#d6eef1']}/><ambientLight intensity={1.8}/><directionalLight position={[6, 12, 8]} intensity={2}/><CameraTravel x={index * 12} reduced={reduced || !visible} zoom={zoom}/>
 <mesh position={[index * 12, -1.35, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[100, 70]}/><meshStandardMaterial color="#90d5dd" roughness={1}/></mesh>
 {projects.map((p, i) => Math.abs(i - index) <= 1 && <Island3D key={p.id} project={p} position={[i * 12, 0, 0]} isSelected={p.id === activeId} onSelect={() => onSelect(p.id)} animated={!reduced && visible} subtitle={cache[p.id]?.loaded ? `${cache[p.id].tasks.tasks.filter(t => t.done).length}/${cache[p.id].tasks.tasks.length} pasos${cache[p.id].taskDirty ? ' · provisional' : ''}` : 'Cargando tareas…'}>
 {areaDefinitions.map((a, j) => { const state = cache[p.id]?.world?.areas[a.id], progress = areaProgress(cache[p.id]?.tasks?.tasks ?? [], a.id); return <group key={a.id} position={[(j % 2 ? 1 : -1) * 1.35, .7, (j < 2 ? -1 : 1) * 1.3]} onClick={event => { event.stopPropagation(); if (p.id === activeId)
            onArea(a.id);
        else
            onSelect(p.id); }}><mesh position={[0, .55, 0]}><boxGeometry args={[1.25, 1.4, 1.15]}/><meshStandardMaterial color={a.color} roughness={.85}/></mesh><mesh position={[0, 1.45, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[1, .75, 4]}/><meshStandardMaterial color="#fff3da"/></mesh><mesh position={[.65, .35, .6]}><sphereGeometry args={[.22, 8, 6]}/><meshStandardMaterial color={state?.decoration === 1 ? '#f472b6' : state?.decoration === 2 ? '#fbbf24' : '#65a30d'}/></mesh>{p.id === activeId && <Html position={[0, 2.05, 0]} center><button type="button" className="world-tower-label" tabIndex={-1} onClick={() => onArea(a.id)}>{a.title} {progress.completed}/{progress.total} {['🌿', '🌸', '⭐'][state?.decoration ?? 0]}</button></Html>}<MascotGuide color={a.color} position={[-.3, .1, .9]} accessory={a.accessory} message="" animated={!reduced && visible}/></group>; })}
 </Island3D>)}<Sailboat destination={[index * 12, -.6, 5]} reduced={reduced || !visible}/>
 </Canvas></div>;
}
