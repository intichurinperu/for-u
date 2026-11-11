import test from 'node:test';
import assert from 'node:assert/strict';
import { businessRoutes, emptyDiagnostic, parseDiagnostic } from '../src/workspace/contracts.ts';
import { buildQuestions, choiceValues, routeOptions, selectChoice } from '../src/experience/personalizationModel.ts';
import { projectPurposePresentation } from '../src/experience/projectPurposePresentation.ts';

const project = '135fcc67-e2e5-4d2d-be7e-d290caf98605';
const otherProject = '35b2e8fa-b487-4d97-9767-ed58cd71a1c6';

test('purpose presentation covers all six routes without duplicating or replacing their choices', () => {
  assert.deepEqual(Object.keys(projectPurposePresentation).sort(), [...businessRoutes].sort());
  for (const route of businessRoutes) {
    const presentation = projectPurposePresentation[route];
    const question = buildQuestions(route, {}).find(item => item.key === 'purpose');
    assert.ok(presentation.label.trim(), route);
    assert.ok(presentation.intro.trim(), route);
    assert.match(presentation.placeholder, /^Por ejemplo:/, route);
    assert.equal(question.multi, true, route);
    assert.deepEqual(question.options, [...routeOptions[route].purpose, 'Lo definiré después'], route);
  }
});

test('several contributions can be selected while deciding later remains an exclusive choice', () => {
  for (const route of businessRoutes) {
    const question = buildQuestions(route, {}).find(item => item.key === 'purpose');
    const choices = routeOptions[route].purpose;
    let selected = [];
    for (const value of choices) selected = selectChoice(question, selected, value);
    assert.deepEqual(selected, choices, route);
    const before = [...selected];
    assert.deepEqual(selectChoice(question, selected, choices[1]), choices.filter(value => value !== choices[1]), route);
    assert.deepEqual(selected, before, route);
    const later = selectChoice(question, selected, 'Lo definiré después');
    assert.deepEqual(later, ['Lo definiré después'], route);
    assert.deepEqual(selectChoice(question, later, choices[0]), [choices[0]], route);
    assert.deepEqual(selectChoice(question, later, 'Lo definiré después'), [], route);
  }
});

test('purpose restores existing single, combined-text and array answer shapes', () => {
  for (const route of businessRoutes) {
    const question = buildQuestions(route, {}).find(item => item.key === 'purpose');
    const [first, second] = routeOptions[route].purpose;
    assert.deepEqual(choiceValues(question, first), [first], route);
    assert.deepEqual(choiceValues(question, `${first} · ${second}`), [first, second], route);
    assert.deepEqual(choiceValues(question, [first, second]), [first, second], route);
    assert.deepEqual(choiceValues(question, undefined), [], route);
  }
});

test('diagnostics preserve purpose prose, origin history and prior responses within their project', () => {
  for (const route of businessRoutes) {
    const [first, second] = routeOptions[route].purpose;
    for (const purpose of [first, [first, second]]) {
      const diagnostic = {
        ...emptyDiagnostic(project, route),
        cursor: 'vision',
        answers: {
          stage: 'Estoy empezando', age: 'Menos de un año', team: 'Por mi cuenta',
          origin: ['Iniciativa personal', 'Por una oportunidad'],
          originCustom: 'Esta es mi historia escrita.',
          purpose, purposeCustom: 'Esta es mi contribución, con mis propias palabras.',
        },
      };
      const before = structuredClone(diagnostic);
      const parsed = parseDiagnostic(diagnostic, project);
      assert.deepEqual(parsed.answers, before.answers, route);
      assert.deepEqual(diagnostic, before, route);
      assert.throws(() => parseDiagnostic(diagnostic, otherProject), /otro proyecto/);
      assert(!JSON.stringify(parsed).includes(projectPurposePresentation[route].placeholder), route);
    }
  }
});
