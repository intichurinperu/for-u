import type { BusinessRoute } from '../workspace/contracts';
import ProjectMultipleChoiceStep, { type ProjectMultipleChoiceStepProps } from './ProjectMultipleChoiceStep';
import { projectVisionPresentation } from './projectVisionPresentation';

type Props = Omit<ProjectMultipleChoiceStepProps, 'presentation'> & { route: BusinessRoute };

export default function ProjectVisionStep({ route, ...props }: Props) {
  return <ProjectMultipleChoiceStep {...props} presentation={{
    ...projectVisionPresentation[route],
    key: 'vision',
    title: '¿Qué horizonte te emociona?',
    fieldLabel: 'Tu horizonte',
    customLabel: 'Lo que imaginas para tu proyecto',
  }} />;
}
