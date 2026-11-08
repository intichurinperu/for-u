import type { BusinessRoute } from '../workspace/contracts';
import { list, meaningful, type Answers, type Question } from './personalizationModel';
import { routeSuggestions, type RouteSuggestion } from './routePreparation';

const initialKeys = new Set([
  'stage', 'age', 'team', 'teamSize', 'origin', 'purpose', 'vision',
  'audience', 'offering', 'needs', 'goal', 'comfort',
]);

export function initialQuestions(questions: Question[], answers: Answers) {
  const needs = list(answers.needs);
  return questions.filter(question => initialKeys.has(question.key) &&
    (question.key !== 'comfort' || !needs.length || needs.includes('Preparar contenido para darme a conocer')));
}

/** Resume old cursors at the next relevant initial question, without rewriting saved answers. */
export function resumeInitialStep(cursor: string | null, all: Question[], initial: Question[]) {
  if (cursor === 'prepared' || cursor === 'review' || initial.some(question => question.key === cursor)) return cursor;
  const position = all.findIndex(question => question.key === cursor);
  if (position < 0) return initial[0]?.key ?? 'review';
  return initial.find(question => all.indexOf(question) > position)?.key ?? 'review';
}

export const missingRouteQuestions = [
  { key: 'offering', label: 'Qué ofreces' },
  { key: 'audience', label: 'A quién quieres llegar' },
  { key: 'needs', label: 'Por dónde quieres empezar' },
] as const;

export function missingRouteAnswers(answers: Answers, audioQuestions: ReadonlySet<string>) {
  return missingRouteQuestions.filter(({ key }) =>
    !list(answers[key]).some(value => meaningful(value) && value !== 'Explorar antes de decidir') && !audioQuestions.has(key));
}

export function personalizedRouteSuggestions(route: BusinessRoute, answers: Answers): RouteSuggestion[] {
  const saved = routeSuggestions(route, answers);
  const defaults = routeSuggestions(route, { ...answers, needs: [] });
  const page: RouteSuggestion = {
    ...defaults.find(step => step.key === 'page')!,
    title: 'Diseña tu página',
    reason: list(answers.offering).some(meaningful)
      ? 'Usa tu oferta como punto de partida para presentar tu proyecto.'
      : 'Empieza con la estructura de tu rubro y añade tu oferta cuando la tengas.',
  };
  const content: RouteSuggestion = {
    key: 'content', area: 'marketing', title: 'Crea tu primera publicación', tool: 'studio',
    reason: 'Elige qué quieres contar y dale forma en Creator Studio.',
  };
  const video: RouteSuggestion = {
    key: 'first-video', area: 'marketing', title: 'Crea tu primer video', tool: 'video',
    reason: 'Abre el editor y arma un video corto con tus clips, fotos o texto.',
  };
  const comfort = list(answers.comfort), avoid = list(answers.avoid);
  const wantsContent = list(answers.needs).includes('Preparar contenido para darme a conocer') ||
    ['Preparar contenido para darme a conocer', 'Crear contenido'].includes(String(answers.goal));
  const prefersVideo = answers.marketingStart !== 'Más adelante' && !avoid.includes('Editar videos') &&
    ((comfort.includes('Hablando a cámara') && !avoid.includes('Mostrar mi cara')) ||
     (comfort.includes('Usando mi voz') && !avoid.includes('Grabar mi voz')) ||
     list(answers.resources).includes('Videos'));
  const creative = prefersVideo ? video : content;
  const prioritized = saved.map(step => step.key === 'page' ? page : step.key === 'content' ? creative : step);
  const proposed = [
    ...prioritized,
    ...(wantsContent && answers.marketingStart !== 'Más adelante' ? [creative] : []),
    page,
    ...(answers.marketingStart === 'Más adelante' ? [] : [content]),
  ];
  return [...new Map(proposed.map(step => [step.key, step])).values()];
}
