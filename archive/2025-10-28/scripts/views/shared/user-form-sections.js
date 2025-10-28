import { createInputField } from './form-fields.js';

const HTMLElementReference = typeof HTMLElement === 'undefined' ? null : HTMLElement;

function isHTMLElement(element) {
  if (!HTMLElementReference) {
    return Boolean(element) && typeof element === 'object' && 'ownerDocument' in element;
  }

  return element instanceof HTMLElementReference;
}

function applySectionIdentifier(element, sectionIdentifier) {
  if (!isHTMLElement(element)) {
    return;
  }

  element.setAttribute('data-form-section', sectionIdentifier);
}

export function createUserFormField(sectionIdentifier, fieldConfig = {}) {
  const field = createInputField(fieldConfig);
  applySectionIdentifier(field, sectionIdentifier);

  const input = field?.querySelector?.('input, select, textarea') ?? null;

  return { field, input };
}

export function createUserForm(sectionIdentifier, { id, className = 'form user-form', fieldConfigs = [], extras = [] } = {}) {
  const form = document.createElement('form');
  form.noValidate = true;
  form.className = className;
  if (id) {
    form.id = id;
  }

  applySectionIdentifier(form, sectionIdentifier);

  const fields = fieldConfigs.map((config) => {
    const { field, input } = createUserFormField(sectionIdentifier, config.input ?? config);

    if (config?.size && isHTMLElement(field)) {
      field.setAttribute('data-field-size', config.size);
    }

    if (isHTMLElement(field)) {
      form.append(field);
    }

    return { key: config?.key ?? config?.input?.id ?? null, field, input };
  });

  extras.forEach((extra) => {
    if (!isHTMLElement(extra)) {
      return;
    }

    applySectionIdentifier(extra, sectionIdentifier);
    form.append(extra);
  });

  return { form, fields };
}

export function tagFormElement(sectionIdentifier, element) {
  applySectionIdentifier(element, sectionIdentifier);
  return element;
}
