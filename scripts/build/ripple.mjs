import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..');

async function bundleRipple() {
  const entry = path.join(ROOT, 'miniapps/education/ripple/index.tsx');
  const outfile = path.join(ROOT, 'miniapps/education/ripple/index.js');

  await build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: ['es2020'],
    sourcemap: true,
    jsx: 'automatic',
    loader: {
      '.ts': 'ts',
      '.tsx': 'tsx',
      '.css': 'text',
    },
    logLevel: 'info',
  });
}

bundleRipple().catch((error) => {
  console.error('Falha ao gerar bundle do Ripple:', error);
  process.exitCode = 1;
});
