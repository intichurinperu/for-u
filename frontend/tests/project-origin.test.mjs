import test from 'node:test';
import assert from 'node:assert/strict';
import { businessRoutes, emptyDiagnostic, parseDiagnostic } from '../src/workspace/contracts.ts';
import { buildQuestions, choiceValues, selectChoice } from '../src/experience/personalizationModel.ts';
import { prepareRoutePage } from '../src/experience/routePreparation.ts';
import { emptyProposal } from '../src/proposal/model.ts';
import { projectOriginPresentation } from '../src/experience/projectOriginPresentation.ts';

const canonical = ['Proyecto familiar', 'Iniciativa personal', 'Con socios', 'Por una necesidad', 'Por una oportunidad', 'Otra historia'];
const project = '135fcc67-e2e5-4d2d-be7e-d290caf98605';
const otherProject = '35b2e8fa-b487-4d97-9767-ed58cd71a1c6';

test('origin copy covers six routes and keeps the existing multi-select options', () => {
  assert.deepEqual(Object.keys(projectOriginPresentation).sort(), [...businessRoutes].sort());
  for (const route of businessRoutes) {
    const presentation = projectOriginPresentation[route];
    const question = buildQuestions(route, {}).find(item => item.key === 'origin');
    assert.ok(presentation.label.trim());
    assert.ok(presentation.intro.trim());
    assert.match(presentation.placeholder, /^Por ejemplo:/);
    assert.equal(question.multi, true, route);
    assert.deepEqual(question.options, canonical, route);
  }
});

test('origin choices add and remove independently and restore both saved answer shapes', () => {
  for (const route of businessRoutes) {
    const question = buildQuestions(route, {}).find(item => item.key === 'origin');
    let selected = [];
    for (const value of canonical) selected = selectChoice(question, selected, value);
    assert.deepEqual(selected, canonical, route);
    const before = [...selected];
    const withoutPartners = selectChoice(question, selected, 'Con socios');
    assert.deepEqual(withoutPartners, canonical.filter(value => value !== 'Con socios'), route);
    assert.deepEqual(selected, before, route);
    assert.deepEqual(choiceValues(question, ['Proyecto familiar', 'Otra historia']), ['Proyecto familiar', 'Otra historia'], route);
    assert.deepEqual(choiceValues(question, 'Proyecto familiar'), ['Proyecto familiar'], route);
    assert.deepEqual(choiceValues(question, 'Proyecto familiar · Por una necesidad'), ['Proyecto familiar', 'Por una necesidad'], route);
  }
});

test('diagnostics retain origin, optional prose and prior answers without crossing projects', () => {
  for (const route of businessRoutes) {
    for (const origin of ['Proyecto familiar', ['Iniciativa personal', 'Por una oportunidad']]) {
      const diagnostic = {
        ...emptyDiagnostic(project, route),
        cursor: 'purpose',
        answers: { stage: 'Estoy empezando', age: 'Menos de un año', team: 'Por mi cuenta', origin, originCustom: 'Esta es mi historia escrita.' },
      };
      const before = structuredClone(diagnostic);
      const parsed = parseDiagnostic(diagnostic, project);
      assert.deepEqual(parsed.answers, before.answers, route);
      assert.deepEqual(diagnostic, before, route);
      assert.throws(() => parseDiagnostic(diagnostic, otherProject), /otro proyecto/);
    }
  }
});

test('a public story uses only explicit origin prose, never the selected categories or example copy', () => {
  for (const route of businessRoutes) {
    const answers = { origin: ['Proyecto familiar', 'Por una oportunidad'], sections: ['Nuestra historia'] };
    const emptyStory = prepareRoutePage('Mi proyecto', route, answers, emptyProposal());
    assert.equal(emptyStory.blocks.find(block => block.title === 'Nuestra historia').body, '', route);
    const explicitStory = 'Mi historia confirmada, con mis propias palabras.';
    const page = prepareRoutePage('Mi proyecto', route, { ...answers, originCustom: explicitStory }, emptyProposal());
    assert.equal(page.blocks.find(block => block.title === 'Nuestra historia').body, explicitStory, route);
    assert(!JSON.stringify(page).includes(projectOriginPresentation[route].placeholder), route);
    assert(!JSON.stringify(emptyStory).includes('Proyecto familiar'), route);
  }
});
