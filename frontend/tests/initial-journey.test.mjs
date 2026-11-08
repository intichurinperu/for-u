import test from 'node:test';
import assert from 'node:assert/strict';
import { buildQuestions } from '../src/experience/personalizationModel';
import { initialQuestions, missingRouteAnswers, personalizedRouteSuggestions, resumeInitialStep } from '../src/experience/initialJourney';
import { routeTaskWorkPath, taskWorkPath } from '../src/pages/dashboard/workspaceFocusModel';
import { projectStartPath } from '../src/workspace/navigation';
import { emptyJourney, parseJourney } from '../src/experience/journeyModel';

test('initial journey skips secondary settings and resumes a previous saved cursor in order', () => {
  const answers = { team: 'Somos un equipo', needs: ['Mostrar lo que ofrezco'] };
  const all = buildQuestions('restaurant', answers);
  const initial = initialQuestions(all, answers);
  assert.deepEqual(initial.map(question => question.key), [
    'stage', 'age', 'team', 'teamSize', 'origin', 'purpose', 'vision', 'audience', 'offering', 'needs',
  ]);
  assert.equal(resumeInitialStep('need', all, initial), 'needs');
  assert.equal(resumeInitialStep('sections', all, initial), 'review');
  assert.equal(resumeInitialStep('prepared', all, initial), 'prepared');
  assert.ok(all.some(question => question.key === 'sections'));
});

test('the selected priority drives the first step and the real project tool', () => {
  const answers = {
    needs: ['Mostrar lo que ofrezco', 'Preparar contenido para darme a conocer'],
    goal: 'Preparar contenido para darme a conocer',
    comfort: ['Usando mi voz'],
  };
  const steps = personalizedRouteSuggestions('tourism', answers);
  assert.deepEqual(steps.map(step => step.key), ['first-video', 'page', 'content']);
  assert.equal(taskWorkPath('project-1', { ...steps[0], id: 'route:project-1:first-video' }, 'tourism'), '/dashboard/tools/video?project=project-1');
  assert.equal(personalizedRouteSuggestions('tourism', { ...answers, avoid: ['Editar videos'] })[0].key, 'content');
  assert.equal(personalizedRouteSuggestions('restaurant', { needs: ['Explorar antes de decidir'] })[0].key, 'page');
});

test('skipped essentials stay visible on the route while audio responses count', () => {
  const missing = missingRouteAnswers({ offering: 'Lo definiré después', needs: ['Explorar antes de decidir'] }, new Set(['audience']));
  assert.deepEqual(missing.map(item => item.key), ['offering', 'needs']);
});

test('creative route tools retain the exact step on return without opening a task overlay in Kanban', () => {
  const id = 'route:project-1:first-video';
  const tool = new URL(routeTaskWorkPath('project-1', { id, tool: 'video' }, 'restaurant'), 'https://foru.invalid');
  assert.equal(tool.pathname, '/dashboard/tools/video');
  assert.equal(tool.searchParams.get('project'), 'project-1');
  const route = new URL(projectStartPath('project-1', tool.searchParams.get('task')), tool);
  assert.equal(route.searchParams.get('view'), 'start');
  assert.equal(route.searchParams.get('task'), id);
  assert.equal(routeTaskWorkPath('project-1', { id, tool: 'kanban' }, 'restaurant'), '/dashboard?project=project-1&view=kanban');
});

test('offer photos and audio responses can coexist with older project attachments', () => {
  const files = [
    { path: 'user/project/old.png', name: 'original.png' },
    { path: 'user/project/postre.jpg', name: 'postre.jpg', offerOption: 'Postres' },
    { path: 'user/project/audio.m4a', name: 'audio.m4a', question: 'offering' },
  ];
  assert.deepEqual(parseJourney({ ...emptyJourney(), files }).files, files);
  assert.throws(() => parseJourney({ ...emptyJourney(), files: [{ ...files[1], question: 'offering' }] }));
});
