import type { BusinessRoute } from '../workspace/contracts';
import ProjectMultipleChoiceStep, { type ProjectMultipleChoiceStepProps } from './ProjectMultipleChoiceStep';
import { routeLabels } from './personalizationModel';

type Props = Omit<ProjectMultipleChoiceStepProps, 'presentation'> & { route: BusinessRoute };

const examples: Record<BusinessRoute, string> = {
  restaurant: 'Personas del barrio que buscan un lugar tranquilo para tomar café.',
  ecommerce: 'Personas que buscan regalos hechos a mano.',
  hospitality: 'Parejas que quieren pasar un fin de semana lejos del ruido.',
  tourism: 'Viajeros que quieren conocer la cocina local en grupos pequeños.',
  courses: 'Personas que quieren aprender fotografía desde cero.',
  services: 'Emprendimientos que necesitan ayuda para ordenar sus finanzas.',
};

export default function ProjectAudienceStep({ route, values, options, ...props }: Props) {
  const selectedOptions = values.filter(value => options.includes(value));

  return <ProjectMultipleChoiceStep {...props}
    values={selectedOptions}
    options={options}
    openTextInitially={values.length > selectedOptions.length}
    presentation={{
      key: 'audience',
      label: routeLabels[route],
      title: '¿A quién te gustaría llegar?',
      intro: 'Piensa en las personas que más disfrutarían lo que haces.',
      fieldLabel: 'A quién quieres llegar',
      customLabel: 'Tu público, con tus palabras',
      placeholder: `Por ejemplo: ${examples[route]}`,
    }}
  />;
}
