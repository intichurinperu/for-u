import type { BusinessRoute } from '../workspace/contracts';
import ProjectQuestionStep, { type ProjectQuestionStepProps } from './ProjectQuestionStep';
import { projectStagePresentation } from './projectStagePresentation';

type Props = Omit<ProjectQuestionStepProps, 'presentation'> & { route: BusinessRoute };

export default function ProjectStageStep({ route, ...props }: Props) {
  return <ProjectQuestionStep {...props} presentation={{
    ...projectStagePresentation[route],
    key: 'stage',
    title: '¿En qué momento estás?',
    intro: 'Tu ruta se adapta a lo que necesitas ahora.',
    fieldLabel: 'Tu momento',
    placeholder: 'Elige tu punto de partida',
    hint: 'Puedes elegir ahora o dejarlo para después.',
  }} />;
}
