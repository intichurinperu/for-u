import { ButtonSecondary as DSButtonSecondary } from './ui/DesignSystem';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent, WheelEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MiniMapIsland from './MiniMapIsland';
import { Sailboat } from '../lib/icons';
import { type ForUActiveProject, useActiveProjectsStore } from '../stores/useActiveProjectsStore';

type ArchipelagoViewProps = {
  onEnterProject: (projectId: string) => void;
};

const ISLAND_WIDTH = 800;
const ISLAND_HEIGHT = 560;
const CELL_WIDTH = 860;
const CELL_HEIGHT = 660;
const COLUMNS = 3;

export default function ArchipelagoView({ onEnterProject }: ArchipelagoViewProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const [boatProjectId, setBoatProjectId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isMapMovementUnlocked, setIsMapMovementUnlocked] = useState(false);

  const activeProjectId = useActiveProjectsStore((state) => state.activeProjectId);
  const activeProjectIds = useActiveProjectsStore((state) => state.activeProjectIds);
  const projectsById = useActiveProjectsStore((state) => state.projectsById);
  const lastCreatedProjectId = useActiveProjectsStore((state) => state.lastCreatedProjectId);
  const archipelagoZoom = useActiveProjectsStore((state) => state.archipelagoZoom);
  const archipelagoOffset = useActiveProjectsStore((state) => state.archipelagoOffset);
  const openProject = useActiveProjectsStore((state) => state.openProject);
  const switchProject = useActiveProjectsStore((state) => state.switchProject);
  const setZoom = useActiveProjectsStore((state) => state.setZoom);
  const setArchipelagoOffset = useActiveProjectsStore((state) => state.setArchipelagoOffset);
  const panToIsland = useActiveProjectsStore((state) => state.panToIsland);
  const resetArchipelagoView = useActiveProjectsStore((state) => state.resetArchipelagoView);
  const clearLastCreatedProject = useActiveProjectsStore((state) => state.clearLastCreatedProject);
  const projects = useMemo(
    () => getVisibleActiveProjects(activeProjectIds, projectsById),
    [activeProjectIds, projectsById],
  );

  const selectedProjectId = boatProjectId ?? activeProjectId ?? projects[0]?.id ?? null;
  const selectedIndex = Math.max(0, projects.findIndex((project) => project.id === selectedProjectId));
  const boatPosition = getIslandPosition(selectedIndex);

  useEffect(() => {
    if (!lastCreatedProjectId) return;

    setBoatProjectId(lastCreatedProjectId);
    resetArchipelagoView();
    const timeoutId = window.setTimeout(() => {
      clearLastCreatedProject();
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [clearLastCreatedProject, lastCreatedProjectId, resetArchipelagoView]);

  function createIsland() {
    const name = window.prompt('Nombre de la nueva isla', `Proyecto ${projects.length + 1}`);
    if (!name) return;

    const projectId = openProject({ name });
    setBoatProjectId(projectId);
  }

  function zoomBy(delta: number) {
    setZoom(archipelagoZoom + delta);
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    if (!isMapMovementUnlocked) return;

    event.preventDefault();
    setZoom(archipelagoZoom + (event.deltaY > 0 ? -0.08 : 0.08));
  }

  function handlePanStart(event: PointerEvent<HTMLDivElement>) {
    if (!isMapMovementUnlocked) return;
    if ((event.target as HTMLElement).closest('button, .foru-mini-island')) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    setIsPanning(true);
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      offsetX: archipelagoOffset.x,
      offsetY: archipelagoOffset.y,
    };
  }

  function handlePanMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragStartRef.current) return;

    setArchipelagoOffset({
      x: dragStartRef.current.offsetX + event.clientX - dragStartRef.current.x,
      y: dragStartRef.current.offsetY + event.clientY - dragStartRef.current.y,
    });
  }

  function handlePanEnd(event: PointerEvent<HTMLDivElement>) {
    if (dragStartRef.current) event.currentTarget.releasePointerCapture(event.pointerId);
    dragStartRef.current = null;
    setIsPanning(false);
  }

  function zoomToIsland(projectId: string) {
    setBoatProjectId(projectId);
    panToIsland(projectId);
    switchProject(projectId);
    onEnterProject(projectId);
  }

  return (
    <section className="foru-archipelago-view" aria-label="Archipiélago de mapas mentales">
      <header className="foru-archipelago-header">
        <div>
          <span>Archipiélago · Vista Maestra</span>
          <h1>Todas tus islas en un solo mapa</h1>
          <p>Arrastra el mar para moverte, usa la rueda o los botones para hacer zoom, doble clic en una isla para acercarte.</p>
        </div>
        <DSButtonSecondary type="button" onClick={createIsland}>+ Nueva isla</DSButtonSecondary>
      </header>

      <div
        ref={viewportRef}
        className={`foru-archipelago-ocean ${isPanning ? 'is-panning' : ''}`}
        onWheel={handleWheel}
        onPointerDown={handlePanStart}
        onPointerMove={handlePanMove}
        onPointerUp={handlePanEnd}
        onPointerCancel={handlePanEnd}
      >
        <div className="foru-archipelago-controls" aria-label="Controles de zoom">
          <DSButtonSecondary type="button" onClick={() => zoomBy(0.15)}>+</DSButtonSecondary>
          <DSButtonSecondary type="button" onClick={() => zoomBy(-0.15)}>-</DSButtonSecondary>
          <DSButtonSecondary type="button" onClick={resetArchipelagoView}>Ver todo</DSButtonSecondary>
        </div>

        <DSButtonSecondary
          type="button"
          className={`foru-map-lock-toggle foru-archipelago-lock-toggle ${isMapMovementUnlocked ? 'is-unlocked' : 'is-locked'}`}
          onClick={() => setIsMapMovementUnlocked((current) => !current)}
        >
          {isMapMovementUnlocked ? '🔒 Bloquear Movimiento' : '🔓 Mover Mapa'}
        </DSButtonSecondary>

        <DSButtonSecondary type="button" className="foru-archipelago-nav is-prev" onClick={() => panToIsland(projects[Math.max(0, selectedIndex - 1)]?.id ?? activeProjectId ?? '')}>
          ← Isla Anterior
        </DSButtonSecondary>
        <DSButtonSecondary type="button" className="foru-archipelago-nav is-next" onClick={() => panToIsland(projects[Math.min(projects.length - 1, selectedIndex + 1)]?.id ?? activeProjectId ?? '')}>
          Isla Siguiente →
        </DSButtonSecondary>

        <div
          className="foru-archipelago-canvas"
          style={{
            transform: `translate(${archipelagoOffset.x}px, ${archipelagoOffset.y}px) scale(${archipelagoZoom})`,
          }}
        >
          <motion.div
            className="foru-archipelago-boat"
            drag
            dragMomentum={false}
            style={{
              left: boatPosition.x + ISLAND_WIDTH / 2,
              top: boatPosition.y + ISLAND_HEIGHT + 44,
            } as CSSProperties}
            onDragEnd={(_event, info) => {
              const viewportBounds = viewportRef.current?.getBoundingClientRect();
              const localPoint = {
                x: info.point.x - (viewportBounds?.left ?? 0),
                y: info.point.y - (viewportBounds?.top ?? 0),
              };
              const nearestProject = getNearestProject(projects, localPoint.x, localPoint.y, archipelagoOffset, archipelagoZoom);
              if (nearestProject) zoomToIsland(nearestProject.id);
            }}
          >
            <span className="foru-boat-trail" />
            <Sailboat size={28} />
          </motion.div>

          {projects.map((project, index) => {
            const position = getIslandPosition(index);

            return (
              <motion.div
                key={project.id}
                className="foru-archipelago-island-slot"
                style={{ left: position.x, top: position.y }}
                initial={project.id === lastCreatedProjectId ? { opacity: 0, scale: 0 } : { opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 190, damping: 18, delay: Math.min(index * 0.04, 0.3) }}
                onMouseEnter={() => setBoatProjectId(project.id)}
                onDoubleClick={() => zoomToIsland(project.id)}
              >
                <MiniMapIsland
                  project={project}
                  isNew={project.id === lastCreatedProjectId}
                  isActive={project.id === selectedProjectId}
                  isZoomed={archipelagoZoom >= 1.1 && project.id === activeProjectId}
                  onEnter={() => zoomToIsland(project.id)}
                />
                {project.id === lastCreatedProjectId ? <span className="foru-new-island-badge">¡🎉 Nueva Isla!</span> : null}
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {lastCreatedProjectId ? <IslandBirthAnimation key={lastCreatedProjectId} /> : null}
      </AnimatePresence>
    </section>
  );
}

function IslandBirthAnimation() {
  return (
    <motion.div
      className="foru-island-birth-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      aria-live="polite"
    >
      <motion.div
        className="foru-island-birth-card"
        initial={{ scale: 0.7, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 12 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      >
        <div className="foru-confetti" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, index) => (
            <i key={index} style={{ left: `${8 + index * 5}%`, animationDelay: `${index * -0.08}s` }} />
          ))}
        </div>
        <strong>¡🎉 Nueva isla creada!</strong>
        <span>La cámara volvió al mapa general para que puedas verla nacer.</span>
      </motion.div>
    </motion.div>
  );
}

function getIslandPosition(index: number) {
  return {
    x: (index % COLUMNS) * CELL_WIDTH,
    y: Math.floor(index / COLUMNS) * CELL_HEIGHT,
  };
}

function getVisibleActiveProjects(activeProjectIds: string[], projectsById: Record<string, ForUActiveProject>) {
  const orderedProjectIds = Array.from(new Set([...activeProjectIds, ...Object.keys(projectsById)]));

  return orderedProjectIds
    .map((projectId) => projectsById[projectId])
    .filter((project): project is ForUActiveProject => Boolean(project) && project.status === 'active');
}

function getNearestProject(projects: Array<{ id: string }>, screenX: number, screenY: number, offset: { x: number; y: number }, zoom: number) {
  const worldX = (screenX - offset.x) / zoom;
  const worldY = (screenY - offset.y) / zoom;

  const nearest = projects
    .map((project, index) => {
      const position = getIslandPosition(index);
      return {
        project,
        distance: Math.hypot(worldX - (position.x + ISLAND_WIDTH / 2), worldY - (position.y + ISLAND_HEIGHT / 2)),
      };
    })
    .sort((a, b) => a.distance - b.distance)[0];

  return nearest && nearest.distance < 420 ? nearest.project : null;
}
