import { ButtonSecondary as DSButtonSecondary } from '../../components/ui/DesignSystem';
import { lazy, Suspense, useState } from 'react';
import { ToolkitProvider } from '../../toolkit/ToolkitContext';
import type { Segment } from '../../toolkit/engine';
import type { ModuleProject } from '../moduleProjects';
import '../../toolkit/toolkit.css';
const Teleprompter = lazy(() => import('../../toolkit/Teleprompter'));
const VideoEditor = lazy(() => import('../../toolkit/VideoEditor'));
export default function CourseRecorder({ userId, project, script }: { userId: string; project: ModuleProject; script: string }) {
  const [clip, setClip] = useState<{ file: File; captions: Segment[] } | null>(null);
  return <ToolkitProvider key={`${userId}:${project.id}`} userId={userId} projectId={project.id} business={{ name: project.name, industry: 'courses', objective: 'Enseñar', audience: 'Mis alumnos', offer: 'Mis cursos', location: '' }}>
    <div className="foru-toolkit"><Suspense fallback={<p>Cargando estudio de grabación…</p>}>
      {clip ? <><DSButtonSecondary onClick={() => setClip(null)}>Volver al teleprompter</DSButtonSecondary><VideoEditor initialFile={clip.file} initialSubtitles={clip.captions} /></> : <Teleprompter initialScript={script} onEdit={(file, captions) => setClip({ file, captions })} />}
    </Suspense></div>
  </ToolkitProvider>;
}
