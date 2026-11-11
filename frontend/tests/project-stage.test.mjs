import test from 'node:test';
import assert from 'node:assert/strict';
import { businessRoutes } from '../src/workspace/contracts.ts';
import { projectStagePresentation } from '../src/experience/projectStagePresentation.ts';
import { buildQuestions, selectChoice } from '../src/experience/personalizationModel.ts';
import { suggestedStage } from '../src/experience/routePreparation.ts';

const canonical = ['Vengo a explorar', 'Estoy empezando', 'Ya tengo un negocio'];

test('stage presentation covers all six business routes without replacing diagnostic values', () => {
  assert.equal(businessRoutes.length, 6);
  assert.deepEqual(Object.keys(projectStagePresentation).sort(), [...businessRoutes].sort());
  for (const route of businessRoutes) {
    const presentation = projectStagePresentation[route];
    const stage = buildQuestions(route, {}).find(question => question.key === 'stage');
    assert.ok(presentation.label.trim());
    assert.equal(presentation.choices.length, 3);
    const values = presentation.choices.map(choice => choice.value);
    assert.deepEqual(values, canonical, route);
    assert.deepEqual(values, stage.options, route);
    assert.equal(new Set(values).size, 3, route);
    for (const choice of presentation.choices) {
      assert.ok(choice.label.trim());
      assert.ok(choice.hint.trim());
    }
  }
});

test('sector-specific choice labels retain single selection and existing route-stage semantics', () => {
  for (const route of businessRoutes) {
    const stage = buildQuestions(route, {}).find(question => question.key === 'stage');
    const expected = ['explore', 'shape', 'operate'];
    projectStagePresentation[route].choices.forEach((choice, index) => {
      const answer = selectChoice(stage, [canonical[(index + 1) % 3]], choice.value);
      assert.equal(answer, canonical[index], `${route}: ${choice.label}`);
      assert.equal(suggestedStage({ stage: answer }), expected[index], route);
    });
  }
});

test('business-specific wording preserves sales follow-up conditions for every stored stage', () => {
  for (const route of businessRoutes) {
    for (const choice of projectStagePresentation[route].choices) {
      const operating = choice.value === 'Ya tengo un negocio';
      const questions = buildQuestions(route, { stage: choice.value, sales: 'Vendo habitualmente' });
      assert.equal(questions.some(question => question.key === 'sales'), operating, route);
      assert.equal(questions.some(question => question.key === 'salesPeriod'), operating, route);
      const notSelling = buildQuestions(route, { stage: choice.value, sales: 'Todavía no vendo' });
      assert.equal(notSelling.some(question => question.key === 'salesPeriod'), false, route);
    }
  }
});
