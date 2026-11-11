import type { BusinessRoute } from '../workspace/contracts';
import ProjectMultipleChoiceStep, { type ProjectMultipleChoiceStepProps } from './ProjectMultipleChoiceStep';
import { projectPurposePresentation } from './projectPurposePresentation';

type Props = Omit<ProjectMultipleChoiceStepProps, 'presentation'> & { route: BusinessRoute };

export default function ProjectPurposeStep({ route, ...props }: Props) {
  return <ProjectMultipleChoiceStep {...props} presentation={{
    ...projectPurposePresentation[route],
    key: 'purpose',
    title: '¿Qué te gustaría aportar?',
    fieldLabel: 'Tu aporte',
    customLabel: 'Lo que quieres aportar',
  }} />;
}
