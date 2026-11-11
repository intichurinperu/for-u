import test from 'node:test';
import assert from 'node:assert/strict';
import { businessRoutes, emptyDiagnostic, parseDiagnostic } from '../src/workspace/contracts.ts';
import { buildQuestions, selectChoice } from '../src/experience/personalizationModel.ts';
import { projectAgePresentation } from '../src/experience/projectAgePresentation.ts';

const canonical = ['Todavía es una idea', 'Menos de un año', 'Entre uno y tres años', 'Más de tres años'];
const stages = ['Vengo a explorar', 'Estoy empezando', 'Ya tengo un negocio'];
const project = '135fcc67-e2e5-4d2d-be7e-d290caf98605';
const otherProject = '35b2e8fa-b487-4d97-9767-ed58cd71a1c6';

test('age presentation covers six routes while retaining the canonical saved options', () => {
  assert.deepEqual(Object.keys(projectAgePresentation).sort(), [...businessRoutes].sort());
  for (const route of businessRoutes) {
    const presentation = projectAgePresentation[route];
    const age = buildQuestions(route, {}).find(question => question.key === 'age');
    assert.ok(presentation.label.trim());
    assert.ok(presentation.intro.trim());
    const values = presentation.choices.map(choice => choice.value);
    assert.deepEqual(values, canonical, route);
    assert.deepEqual(values, age.options, route);
    assert.equal(new Set(values).size, 4, route);
    for (const choice of presentation.choices) {
      assert.ok(choice.label.trim());
      assert.ok(choice.hint.trim());
    }
  }
});

test('age stays a single selection for every business route', () => {
  for (const route of businessRoutes) {
    const age = buildQuestions(route, {}).find(question => question.key === 'age');
    projectAgePresentation[route].choices.forEach((choice, index) => {
      const previous = canonical[(index + 1) % canonical.length];
      assert.equal(selectChoice(age, [previous], choice.value), choice.value, route);
    });
  }
});

test('diagnostics retain stage and age together without mutating answers or accepting another project', () => {
  for (const route of businessRoutes) {
    for (const stage of stages) {
      for (const age of canonical) {
        const diagnostic = { ...emptyDiagnostic(project, route), cursor: 'team', answers: { stage, age, offering: 'Mi oferta guardada' } };
        const before = structuredClone(diagnostic);
        const parsed = parseDiagnostic(diagnostic, project);
        assert.equal(parsed.answers.stage, stage);
        assert.equal(parsed.answers.age, age);
        assert.deepEqual(parsed, before);
        assert.deepEqual(diagnostic, before);
        assert.throws(() => parseDiagnostic(diagnostic, otherProject), /otro proyecto/);
      }
    }
  }
});
