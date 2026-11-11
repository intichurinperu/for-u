import { ButtonSecondary as DSButtonSecondary } from './ui/DesignSystem';
import { useMemo } from 'react';
import type { MouseEvent } from 'react';
import { motion } from 'framer-motion';
import RouteStepStation from './RouteStepStation';
import type { ForUActiveProject, ForUProjectNode } from '../stores/useActiveProjectsStore';

type DigitalRoutePathProps = {
  project: ForUActiveProject | null;
  onCompleteStep?: (event: MouseEvent<HTMLButtonElement>) => void;
};

export default function DigitalRoutePath({ project, onCompleteStep }: DigitalRoutePathProps) {
  const routeGroups = useMemo(() => {
    if (!project) return [];

    return project.digitalRoute.map((step) => {
      const linkedNode = project.nodes.find((node) => node.id === step.linkedNodeId);
      const childNodes = project.nodes.filter((node) => node.parentNodeId === step.linkedNodeId);
      const nodes = [linkedNode, ...childNodes].filter(Boolean) as ForUProjectNode[];

      return { step, nodes };
    });
  }, [project]);

  if (!project?.digitalRoute.length) {
    return (
      <section className="foru-route-path is-empty" aria-label="Ruta Digital visual">
        <strong>🗺️ Todavía no hay Ruta Digital</strong>
        <p>Procesa ideas desde el Frasco para que For U trace un camino físico con estaciones.</p>
      </section>
    );
  }

  return (
    <section className="foru-route-path" aria-label="Ruta Digital visual">
      <header className="foru-route-path-header">
        <div>
          <span>🗺️ Ruta Digital</span>
          <h2>Tu camino principal</h2>
          <p>Cada estación tiene su mini mapa mental. Lo demás queda como misiones secundarias.</p>
        </div>
        {onCompleteStep ? (
          <DSButtonSecondary
            type="button"
            onClick={onCompleteStep}
            disabled={!project.digitalRoute.length || project.currentRouteIndex >= project.digitalRoute.length}
          >
            Completar estación
          </DSButtonSecondary>
        ) : null}
      </header>

      <div className="foru-route-path-track">
        <svg className="foru-route-path-line" viewBox={`0 0 120 ${Math.max(1, routeGroups.length) * 285}`} preserveAspectRatio="none" aria-hidden="true">
          <motion.path
            d={`M 60 30 L 60 ${Math.max(30, routeGroups.length * 285 - 40)}`}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.15, ease: 'easeInOut' }}
          />
        </svg>

        {routeGroups.map(({ step, nodes }, index) => {
          const isDone = Boolean(step.completedAt) || index < project.currentRouteIndex;
          const isCurrent = index === project.currentRouteIndex && !isDone;

          return (
            <RouteStepStation
              key={step.id}
              step={step}
              stepNumber={index + 1}
              nodes={nodes}
              isDone={isDone}
              isCurrent={isCurrent}
            />
          );
        })}
      </div>
    </section>
  );
}
