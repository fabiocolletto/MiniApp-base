import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const outputPath = path.join(repoRoot, 'reports', 'pwa-cleanup-2025-10-28', 'inventory.json');

const EXCLUDED_DIRECTORIES = new Set(['archive', 'node_modules', '.git']);
const TEXT_EXTENSIONS = new Set(['.html', '.js', '.css', '.json', '.md', '.webmanifest', '.lock', '.ts']);

const REQUIRED_PATHS = new Set([
  'AGENTS.md',
  'CHANGELOG.md',
  'README.md',
  'index.html',
  'service-worker.js',
  'package.json',
  'package-lock.json',
  'manifest.webmanifest',
  'public/offline.html',
  'public/icons/miniapp-icon-192.svg',
  'public/icons/miniapp-icon-512.svg',
  'public/icons/shortcut-task-manager.svg',
  'public/icons/shortcut-exam-planner.svg',
  'public/env.example.js',
  'styles/tokens.css',
  'styles/main.css',
  'styles/auth.css',
  'scripts/events/event-bus.js',
  'scripts/pwa/register-service-worker.js',
  'scripts/views/register.js',
  'scripts/views/shared/form-fields.js',
  'scripts/views/shared/device-info.js',
  'scripts/views/shared/validation.js',
  'scripts/data/miniapp-store.js',
  'scripts/data/user-store.js',
  'scripts/data/session-store.js',
  'scripts/data/indexed-user-store.js',
  'scripts/data/system-release-source.js',
  'scripts/preferences/footer-indicators.js',
  'scripts/utils/system-release.js',
  'core/account-store.js',
  'sys/tools/log.js',
  'docs/pwa.md',
  'docs/migration-pre-to-post-pwa.md',
  'docs/miniapps/task-manager.md',
  'docs/miniapps/exam-planner.md',
  'reports/pwa-cleanup-2025-10-28/README.md',
]);

const REFERENCED_PATHS = new Set([
  'sys/tools/README.md',
  'sys/tools/cep.ts',
  'sys/tools/cep.log.md',
  'sys/tools/log.log.md',
  'sys/tools/log.ts',
  'docs/design-kit-tokens.md',
  'docs/miniapps-folder-audit.md',
  'docs/pwa-validation-report.md',
  'docs/wordpress-miniapps-integration.md',
]);

function toPosixRelative(filePath) {
  return filePath.split(path.sep).join('/');
}

function classifyType(relativePath) {
  if (relativePath === 'service-worker.js') {
    return 'service-worker';
  }

  if (relativePath.endsWith('.webmanifest')) {
    return 'manifest';
  }

  const ext = path.extname(relativePath).toLowerCase();

  switch (ext) {
    case '.html':
      return 'html';
    case '.css':
      return 'css';
    case '.js':
      return 'js';
    case '.md':
      return 'docs';
    case '.json':
      return 'config';
    case '.svg':
      return relativePath.startsWith('public/icons/') ? 'icon' : 'image';
    case '.png':
    case '.jpg':
    case '.jpeg':
    case '.gif':
    case '.webp':
      return 'image';
    case '.ts':
      return 'source';
    default:
      return 'other';
  }
}

async function walkDirectory(directory, base = '') {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryName = entry.name;
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRECTORIES.has(entryName)) {
        continue;
      }

      const nestedBase = base ? path.join(base, entryName) : entryName;
      const nestedPath = path.join(directory, entryName);
      const nestedFiles = await walkDirectory(nestedPath, nestedBase);
      files.push(...nestedFiles);
      continue;
    }

    if (entry.isFile()) {
      const relativePath = base ? path.join(base, entryName) : entryName;
      files.push(relativePath);
    }
  }

  return files;
}

async function buildInventory() {
  const relativeFiles = await walkDirectory(repoRoot);
  const posixFiles = relativeFiles.map(toPosixRelative);
  const fileStats = new Map();
  const textContents = new Map();

  await Promise.all(
    posixFiles.map(async (relativePath) => {
      const absolutePath = path.join(repoRoot, ...relativePath.split('/'));
      const stats = await fs.stat(absolutePath);
      fileStats.set(relativePath, stats);

      const ext = path.extname(relativePath).toLowerCase();
      if (TEXT_EXTENSIONS.has(ext) || REQUIRED_PATHS.has(relativePath) || REFERENCED_PATHS.has(relativePath)) {
        try {
          const content = await fs.readFile(absolutePath, 'utf8');
          textContents.set(relativePath, content);
        } catch (error) {
          // Ignore binary files or read errors.
        }
      }
    }),
  );

  const records = posixFiles.map((relativePath) => {
    const stats = fileStats.get(relativePath);
    const type = classifyType(relativePath);
    const referencedBy = [];

    for (const [otherPath, content] of textContents.entries()) {
      if (otherPath === relativePath) {
        continue;
      }

      const otherDir = path.posix.dirname(otherPath);
      const relativeFromOther = path.posix.relative(otherDir === '.' ? '' : otherDir, relativePath);
      const searchTokens = new Set([
        relativePath,
        `./${relativePath}`,
        `/${relativePath}`,
        relativeFromOther,
        relativeFromOther && !relativeFromOther.startsWith('./') ? `./${relativeFromOther}` : null,
      ].filter(Boolean));

      for (const token of searchTokens) {
        if (token && content.includes(token)) {
          referencedBy.push(otherPath);
          break;
        }
      }
    }

    let status = 'referenced';
    if (REQUIRED_PATHS.has(relativePath)) {
      status = 'required';
    }

    return {
      path: relativePath,
      type,
      size: stats.size,
      lastModified: stats.mtime.toISOString(),
      referencedBy: referencedBy.sort(),
      status,
    };
  });

  const summary = {
    generatedAt: new Date().toISOString(),
    fileCount: records.length,
    requiredCount: records.filter((record) => record.status === 'required').length,
    referencedCount: records.filter((record) => record.status === 'referenced').length,
    orphanCount: records.filter((record) => record.status === 'orphan').length,
  };

  const payload = {
    summary,
    files: records.sort((a, b) => a.path.localeCompare(b.path)),
  };

  await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

buildInventory().catch((error) => {
  console.error('Falha ao gerar inventário do repositório.', error);
  process.exitCode = 1;
});
