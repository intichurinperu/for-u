import test from 'node:test';
import assert from 'node:assert/strict';
import { readWorkspaceFocus } from '../src/services/workspaceFocusRepository.ts';
import { writeRevisionDocument } from '../src/services/revisionDocuments.ts';
import { rememberDestination, emptyFocus } from '../src/pages/dashboard/workspaceFocusModel.ts';

// Exercise the production query boundary with controlled transport and revision failures.
function database() {
  const rows = []; let failure = null;
  return {
    rows, fail(error) { failure = error; },
    from(table) {
      assert.equal(table, 'toolkit_documents');
      let operation = 'read', values, filters = {};
      const query = {
        select() { return query; }, eq(key, value) { filters[key] = value; return query; },
        insert(value) { operation = 'insert'; values = value; return query; },
        update(value) { operation = 'update'; values = value; return query; },
        single() { return execute(true); }, maybeSingle() { return execute(true); },
        then(resolve, reject) { return execute(false).then(resolve, reject); },
      };
      async function execute(single) {
        if (failure) return { data: null, error: failure };
        const matches = rows.filter(row => Object.entries(filters).every(([key, value]) => row[key] === value));
        if (operation === 'insert') {
          if (rows.some(row => ['user_id', 'project_id', 'kind'].every(key => row[key] === values[key]))) return { data: null, error: { code: '23505' } };
          rows.push(structuredClone(values)); return { data: rows.at(-1), error: null };
        }
        if (operation === 'update' && matches[0]) Object.assign(matches[0], structuredClone(values));
        return { data: single ? matches[0] ?? null : structuredClone(matches), error: null };
      }
      return query;
    },
  };
}
test('failed reads and writes retain local focus; retry stores it and isolates owners/projects', async () => {
  const db = database(), a = crypto.randomUUID(), b = crypto.randomUUID();
  const local = rememberDestination(emptyFocus(), { projectId: a, tool: 'calendar' });
  db.fail({ message: 'offline' });
  await assert.rejects(readWorkspaceFocus(db, 'owner-a'), /cargar Hoy/);
  await assert.rejects(writeRevisionDocument(db, 'owner-a', a, 'module-workspace-focus', local, null), /No se guardó/);
  assert.equal(db.rows.length, 0);
  assert.equal(local.destinations[a].tool, 'calendar');
  db.fail(null);
  const revision = await writeRevisionDocument(db, 'owner-a', a, 'module-workspace-focus', local, null);
  assert.deepEqual((await readWorkspaceFocus(db, 'owner-a')).payload, local);
  assert.equal(await readWorkspaceFocus(db, 'owner-b'), null);
  await writeRevisionDocument(db, 'owner-b', b, 'module-area-tasks', { marker: 'other' }, null);
  await assert.rejects(writeRevisionDocument(db, 'owner-a', b, 'module-area-tasks', { marker: 'wrong' }, revision), /otra ventana/);
  assert.deepEqual(db.rows[1].payload, { marker: 'other' });
});
test('stale retries cannot overwrite another tab; duplicate initial writes are conflicts', async () => {
  const db = database(), project = crypto.randomUUID();
  const revision = await writeRevisionDocument(db, 'owner', project, 'module-area-tasks', { title: 'initial' }, null);
  db.rows[0].updated_at = 'newer-revision'; db.rows[0].payload = { title: 'other tab' };
  const local = { title: 'visible unsaved changes' };
  for (let retry = 0; retry < 2; retry++) await assert.rejects(writeRevisionDocument(db, 'owner', project, 'module-area-tasks', local, revision), /otra ventana/);
  assert.deepEqual(local, { title: 'visible unsaved changes' });
  assert.deepEqual(db.rows[0].payload, { title: 'other tab' });
  await assert.rejects(writeRevisionDocument(db, 'owner', project, 'module-area-tasks', local, null), /otra ventana/);
});
