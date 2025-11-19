const fs = require('fs');
const path = require('path');

const BLOCK_PATTERNS = [
  { regex: /FLAG_SECURE/g, description: 'Uso do flag FLAG_SECURE do Android' },
  { regex: /isScreenCaptureDisabled/g, description: 'Bloqueio direto de captura no iOS' },
  { regex: /setSecure\s*\(/g, description: 'Invocação potencial de setSecure em containers nativos' },
  { regex: /setFlags\([^)]*FLAG_SECURE/g, description: 'Uso combinado de setFlags com FLAG_SECURE' },
];

const SCANNED_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.html',
  '.css',
  '.json',
]);

const IGNORED_DIRS = new Set(['node_modules', '.git', '.github']);
const IGNORED_FILES = new Set([path.join(__dirname, 'ensure-screen-capture.js')]);

function shouldScan(filePath) {
  const ext = path.extname(filePath);
  return SCANNED_EXTENSIONS.has(ext);
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (entry.isFile() && shouldScan(fullPath) && !IGNORED_FILES.has(fullPath)) {
      files.push(fullPath);
    }
  }
  return files;
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = [];
  for (const pattern of BLOCK_PATTERNS) {
    if (pattern.regex.test(content)) {
      matches.push(pattern.description);
    }
    pattern.regex.lastIndex = 0;
  }
  return matches;
}

function main() {
  const repoRoot = path.resolve(__dirname, '..');
  const files = walk(repoRoot);
  const violations = [];

  for (const file of files) {
    const matches = scanFile(file);
    if (matches.length > 0) {
      violations.push({ file, matches });
    }
  }

  if (violations.length > 0) {
    console.error('Bloqueios de captura de tela foram encontrados:\n');
    for (const violation of violations) {
      console.error(`- ${path.relative(repoRoot, violation.file)}: ${violation.matches.join(', ')}`);
    }
    console.error('\nRemova as referências acima para liberar o print screen.');
    process.exitCode = 1;
    return;
  }

  console.log('Nenhum bloqueio de captura foi encontrado nos arquivos analisados.');
}

main();
