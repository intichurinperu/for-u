import type { BusinessRoute } from '../workspace/contracts';
import ProjectQuestionStep, { type ProjectQuestionStepProps } from './ProjectQuestionStep';
import { projectTeamPresentation, projectTeamSizePresentation } from './projectTeamPresentation';

type Props = Omit<ProjectQuestionStepProps, 'presentation'> & { route: BusinessRoute };

export default function ProjectTeamStep({ route, ...props }: Props) {
  return <ProjectQuestionStep {...props} presentation={{
    ...projectTeamPresentation[route],
    key: 'team',
    title: '¿Cómo lo estás llevando?',
    fieldLabel: 'Tu equipo',
    placeholder: 'Elige cómo trabajas',
    hint: 'Puedes empezar por tu cuenta o acompañado. También puedes decidirlo después.',
  }} />;
}

export function ProjectTeamSizeStep({ route, ...props }: Props) {
  return <ProjectQuestionStep {...props} presentation={{
    ...projectTeamSizePresentation[route],
    key: 'teamSize',
    title: '¿Cuántas personas son?',
    fieldLabel: 'Personas en el equipo',
    placeholder: 'Elige una referencia de tamaño',
    hint: 'Solo nos ayuda a entender cómo se organizan. No añade personas a tu cuenta.',
  }} />;
}
