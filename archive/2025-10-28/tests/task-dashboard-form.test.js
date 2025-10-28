import test from 'node:test';
import assert from 'node:assert/strict';

import { setupFakeDom } from './helpers/fake-dom.js';
import { renderTaskDashboard } from '../scripts/views/tasks.js';
import { runViewCleanup } from '../scripts/view-cleanup.js';

function createClickEvent() {
  return {
    type: 'click',
    preventDefault() {},
    stopPropagation() {},
  };
}

async function waitForTasksToLoad() {
  await new Promise((resolve) => setImmediate(resolve));
}

async function waitForElement(root, selector, attempts = 10) {
  for (let index = 0; index < attempts; index += 1) {
    const element = root.querySelector(selector);
    if (element) {
      return element;
    }
    await waitForTasksToLoad();
  }
  return null;
}

test('task dashboard form toggles visibility with the add button', async (t) => {
  const restoreDom = setupFakeDom();
  const root = document.createElement('div');
  document.body.append(root);

  t.after(async () => {
    runViewCleanup(root);
    await waitForTasksToLoad();
    restoreDom();
  });

  renderTaskDashboard(root);
  await waitForTasksToLoad();

  const form = root.querySelector('form.task-dashboard__form');
  const addButton = root.querySelector('.task-dashboard__add-button');

  assert.ok(form, 'form should be created');
  assert.ok(addButton, 'add button should be created');
  assert.equal(form.hidden, true, 'form should start hidden');
  assert.equal(addButton.getAttribute('aria-expanded'), 'false');

  addButton.dispatchEvent(createClickEvent());

  assert.equal(form.hidden, false, 'form should become visible');
  assert.equal(addButton.getAttribute('aria-expanded'), 'true');
  assert.equal(form.dataset.mode, 'create');

  addButton.dispatchEvent(createClickEvent());

  assert.equal(form.hidden, true, 'form should hide when toggled again');
  assert.equal(addButton.getAttribute('aria-expanded'), 'false');
  assert.equal(form.dataset.mode, 'create');
});

test('task dashboard edit action fills and shows the form', async (t) => {
  const restoreDom = setupFakeDom();
  const root = document.createElement('div');
  document.body.append(root);

  t.after(async () => {
    runViewCleanup(root);
    await waitForTasksToLoad();
    restoreDom();
  });

  renderTaskDashboard(root);
  const editButton = await waitForElement(root, '.task-dashboard__task-action--edit');
  assert.ok(editButton, 'edit button should be available after tasks load');

  editButton.dispatchEvent(createClickEvent());

  const form = root.querySelector('form.task-dashboard__form');
  assert.ok(form, 'form should exist after edit action');
  assert.equal(form.hidden, false, 'form should be visible after edit');
  assert.equal(form.dataset.mode, 'edit');

  const formTitle = form.querySelector('h4');
  assert.equal(formTitle?.textContent, 'Editar tarefa');

  const inputs = form.querySelectorAll('input');
  assert.ok(Array.isArray(inputs) && inputs.length > 0, 'form should expose inputs');
  assert.notEqual(inputs[0].value, '', 'title input should be populated');

  const addButton = root.querySelector('.task-dashboard__add-button');
  assert.equal(addButton.getAttribute('aria-expanded'), 'true');

  const cancelButton = form.querySelector('.task-dashboard__form-cancel');
  assert.ok(cancelButton, 'cancel button should exist');

  cancelButton.dispatchEvent(createClickEvent());

  assert.equal(form.hidden, true, 'form should hide after cancel');
  assert.equal(addButton.getAttribute('aria-expanded'), 'false');
  assert.equal(form.dataset.mode, 'create');
});
