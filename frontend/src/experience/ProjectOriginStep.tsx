import type { BusinessRoute } from '../workspace/contracts';
import ProjectMultipleChoiceStep, { type ProjectMultipleChoiceStepProps } from './ProjectMultipleChoiceStep';
import { projectOriginPresentation } from './projectOriginPresentation';

type Props = Omit<ProjectMultipleChoiceStepProps, 'presentation'> & { route: BusinessRoute };

export default function ProjectOriginStep({ route, ...props }: Props) {
  return <ProjectMultipleChoiceStep {...props} presentation={{
    ...projectOriginPresentation[route],
    key: 'origin',
    title: '¿Dónde nació tu idea?',
    fieldLabel: 'El origen',
    customLabel: 'Tu historia, con tus palabras',
  }} />;
}
