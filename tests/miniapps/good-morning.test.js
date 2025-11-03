import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createDomEnvironment } from '../helpers/dom-env.js';

import { mount } from '../../miniapps/good-morning/index.js';

test('renderiza saudação padrão e reutiliza estilo existente', async () => {
  const env = createDomEnvironment({
    html: '<!doctype html><html lang="pt-BR"><head></head><body><div id="host"></div></body></html>',
  });

  try {
    const host = env.document.getElementById('host');
    assert.ok(host);

    await mount(host);

    const style = env.document.getElementById('miniapp-good-morning-style');
    assert.ok(style);

    const article = host.querySelector('.good-morning-miniapp');
    assert.ok(article);
    assert.equal(article.dataset.miniappId, 'good-morning');

    const title = article.querySelector('.good-morning-miniapp__title');
    assert.ok(title);
    assert.equal(title.textContent.trim(), 'Bom dia!');

    const subtitle = article.querySelector('.good-morning-miniapp__subtitle');
    assert.ok(subtitle);
    assert.ok(subtitle.textContent.includes('MiniApp Base'));

    await mount(host);

    const styles = env.document.querySelectorAll('#miniapp-good-morning-style');
    assert.equal(styles.length, 1);
  } finally {
    env.restore();
  }
});

test('personaliza saudação, idioma e lista de destaques e emite callback', async () => {
  const env = createDomEnvironment({
    html: '<!doctype html><html lang="es"><head></head><body><div id="host"></div></body></html>',
  });

  try {
    const host = env.document.getElementById('host');
    assert.ok(host);

    const features = ['Verificar persistência', 'Trocar idioma', 'Abrir MiniApp principal'];
    let receivedPayload = null;

    await mount(host, {
      lang: 'en',
      name: 'Equipe QA',
      features,
      onReady(payload) {
        receivedPayload = payload;
      },
    });

    const article = host.querySelector('.good-morning-miniapp');
    assert.ok(article);

    const title = article.querySelector('.good-morning-miniapp__title');
    assert.ok(title);
    assert.equal(title.textContent.trim(), 'Good morning, Equipe QA!');

    const subtitle = article.querySelector('.good-morning-miniapp__subtitle');
    assert.ok(subtitle);
    assert.ok(subtitle.textContent.trim().startsWith('Start your day'));

    const listItems = Array.from(article.querySelectorAll('.good-morning-miniapp__features li'));
    assert.equal(listItems.length, features.length);
    assert.deepEqual(
      listItems.map((item) => item.textContent.trim()),
      features,
    );

    assert.deepEqual(receivedPayload, {
      language: 'en',
      name: 'Equipe QA',
      features,
    });
  } finally {
    env.restore();
  }
});

test('falha ao montar quando elemento de destino é inválido', async () => {
  await assert.rejects(() => mount(null), /Elemento de destino inválido/);
});
