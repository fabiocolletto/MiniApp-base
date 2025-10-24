import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_BRANDING_LOGOS,
  getBrandingSnapshot,
  subscribeBranding,
  updateBranding,
} from '../../scripts/data/branding-store.js';

test('branding store publishes updates and preserves defaults', async () => {
  const initial = getBrandingSnapshot();

  assert.equal(initial.mode, 'individual');
  assert.equal(initial.logos.light, DEFAULT_BRANDING_LOGOS.light);
  assert.equal(initial.logos.dark, DEFAULT_BRANDING_LOGOS.dark);

  let notifications = 0;
  let lastMode = initial.mode;

  const unsubscribe = subscribeBranding((snapshot) => {
    notifications += 1;
    lastMode = snapshot.mode;
  });

  assert.ok(notifications >= 1, 'subscriber should receive current snapshot immediately');
  assert.equal(lastMode, initial.mode, 'initial notification should use current mode');

  const sharedLogo = 'data:image/png;base64,ZmFrZQ==';
  updateBranding({ mode: 'shared', logos: { shared: sharedLogo } });

  const sharedState = getBrandingSnapshot();
  assert.equal(sharedState.mode, 'shared');
  assert.equal(sharedState.logos.shared, sharedLogo);
  assert.ok(notifications >= 2, 'subscriber should be notified after update');
  assert.equal(lastMode, 'shared');

  updateBranding({
    mode: 'individual',
    logos: {
      light: DEFAULT_BRANDING_LOGOS.light,
      dark: DEFAULT_BRANDING_LOGOS.dark,
      shared: DEFAULT_BRANDING_LOGOS.light,
    },
  });

  const restored = getBrandingSnapshot();
  assert.equal(restored.mode, 'individual');
  assert.equal(restored.logos.light, DEFAULT_BRANDING_LOGOS.light);
  assert.equal(restored.logos.dark, DEFAULT_BRANDING_LOGOS.dark);

  unsubscribe();
});
