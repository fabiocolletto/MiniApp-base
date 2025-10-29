import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..', '..');
const TOKENS_PATH = path.join(ROOT_DIR, 'design', 'tokens.json');
const OUTPUT_PATH = path.join(ROOT_DIR, 'public', 'tokens.css');

function isTokenObject(value) {
  return Boolean(value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, 'value'));
}

function flattenTokens(source, prefix = []) {
  const entries = [];

  for (const [key, value] of Object.entries(source || {})) {
    if (key.startsWith('$')) {
      continue;
    }

    if (isTokenObject(value)) {
      const name = [...prefix, key].join('-').replace(/\s+/g, '-');
      entries.push({ name, value: value.value });
      continue;
    }

    if (value && typeof value === 'object') {
      entries.push(...flattenTokens(value, [...prefix, key]));
    }
  }

  return entries;
}

function createDeclaration({ name, value }) {
  const serializedValue = typeof value === 'string' ? value : String(value);
  return `  --${name}: ${serializedValue};`;
}

async function readTokens(filePath) {
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

async function writeCss(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf-8');
}

function buildCss(tokensJson) {
  const order = Array.isArray(tokensJson.tokenSetOrder)
    ? tokensJson.tokenSetOrder.filter((key) => typeof key === 'string')
    : Object.keys(tokensJson).filter((key) => !key.startsWith('$'));

  const blocks = [];

  order.forEach((setName) => {
    if (setName.startsWith('$')) {
      return;
    }

    const setValue = tokensJson[setName];
    if (!setValue || typeof setValue !== 'object') {
      return;
    }

    const declarations = flattenTokens(setValue, [setName])
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(createDeclaration)
      .join('\n');

    if (declarations) {
      blocks.push(`/* Token set: ${setName} */\n:root {\n${declarations}\n}`);
    }
  });

  const header = `/* Auto-generated from design/tokens.json. Do not edit manually. */`;
  return `${header}\n${blocks.join('\n\n')}\n`;
}

async function main() {
  try {
    const tokens = await readTokens(TOKENS_PATH);
    const css = buildCss(tokens);
    await writeCss(OUTPUT_PATH, css);
    console.log(`Generated ${path.relative(ROOT_DIR, OUTPUT_PATH)}`);
  } catch (error) {
    console.error('Failed to build tokens.css:', error);
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}` || import.meta.url === `file://${process.argv[1]}/`) {
  main();
}
