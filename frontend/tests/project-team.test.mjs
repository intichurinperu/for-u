import test from 'node:test';
import assert from 'node:assert/strict';
import { businessRoutes, emptyDiagnostic, parseDiagnostic } from '../src/workspace/contracts.ts';
import { buildQuestions, normalizePriority, selectChoice } from '../src/experience/personalizationModel.ts';
import { projectTeamPresentation, projectTeamSizePresentation } from '../src/experience/projectTeamPresentation.ts';

const canonicalTeam = ['Por mi cuenta', 'Somos un equipo', 'Todavía lo estoy definiendo'];
const canonicalSize = ['Dos personas', 'Entre tres y cinco', 'Más de cinco', 'Lo definiré después'];
const project = '135fcc67-e2e5-4d2d-be7e-d290caf98605';

test('team and team-size copy covers six routes with the exact saved choices', () => {
  for (const mapping of [projectTeamPresentation, projectTeamSizePresentation]) {
    assert.deepEqual(Object.keys(mapping).sort(), [...businessRoutes].sort());
  }
  for (const route of businessRoutes) {
    const questions = buildQuestions(route, { team: 'Somos un equipo' });
    for (const [key, presentation, canonical] of [
      ['team', projectTeamPresentation[route], canonicalTeam],
      ['teamSize', projectTeamSizePresentation[route], canonicalSize],
    ]) {
      const question = questions.find(item => item.key === key);
      assert.ok(presentation.label.trim(), route);
      assert.ok(presentation.intro.trim(), route);
      const values = presentation.choices.map(choice => choice.value);
      assert.deepEqual(values, canonical, route);
      assert.deepEqual(values, question.options, route);
      assert.equal(new Set(values).size, canonical.length, route);
      for (const choice of presentation.choices) {
        assert.ok(choice.label.trim(), route);
        assert.ok(choice.hint.trim(), route);
        assert.equal(selectChoice(question, [canonical.find(value => value !== choice.value)], choice.value), choice.value, route);
      }
    }
  }
});

test('only an explicit team answer opens team size in every business route', () => {
  for (const route of businessRoutes) {
    for (const team of ['', ...canonicalTeam]) {
      const questions = buildQuestions(route, { team });
      assert.equal(questions.some(question => question.key === 'teamSize'), team === 'Somos un equipo', route);
    }
  }
});

test('changing how the project is run hides team size without deleting a previous reference', () => {
  for (const route of businessRoutes) {
    for (const teamSize of canonicalSize) {
      const initial = { ...emptyDiagnostic(project, route), answers: { team: 'Somos un equipo', teamSize, age: 'Menos de un año' } };
      const before = structuredClone(initial);
      const teamQuestion = buildQuestions(route, initial.answers).find(question => question.key === 'team');
      for (const alternate of ['Por mi cuenta', 'Todavía lo estoy definiendo']) {
        const answers = normalizePriority({ ...initial.answers, team: selectChoice(teamQuestion, ['Somos un equipo'], alternate) });
        const parsed = parseDiagnostic({ ...initial, answers }, project);
        assert.equal(parsed.answers.teamSize, teamSize, route);
        assert.equal(parsed.answers.age, 'Menos de un año', route);
        assert(!buildQuestions(route, parsed.answers).some(question => question.key === 'teamSize'), route);
        const restored = normalizePriority({ ...parsed.answers, team: selectChoice(teamQuestion, [alternate], 'Somos un equipo') });
        assert.equal(restored.teamSize, teamSize, route);
        assert(buildQuestions(route, restored).some(question => question.key === 'teamSize'), route);
      }
      assert.deepEqual(initial, before, route);
    }
  }
});
