import type { BusinessRoute } from '../workspace/contracts';
import ProjectQuestionStep, { type ProjectQuestionStepProps } from './ProjectQuestionStep';
import { projectAgePresentation } from './projectAgePresentation';

type Props = Omit<ProjectQuestionStepProps, 'presentation'> & { route: BusinessRoute };

export default function ProjectAgeStep({ route, ...props }: Props) {
  return <ProjectQuestionStep {...props} presentation={{
    ...projectAgePresentation[route],
    key: 'age',
    title: '¿Hace cuánto comenzó tu proyecto?',
    fieldLabel: 'Tu recorrido',
    placeholder: 'Elige una referencia de tiempo',
    hint: 'Puede seguir siendo una idea. No necesitas una fecha exacta.',
  }} />;
}
