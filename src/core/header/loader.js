const DEFAULT_OPTIONS = {
  containerSelector: "[data-global-header]",
  sourcePath: "/src/core/header/global-header.html",
};

const LOAD_CACHE = new Map();

function resolveSourcePath(pathname) {
  if (!pathname) return DEFAULT_OPTIONS.sourcePath;

  if (/^https?:\/\//.test(pathname) || pathname.startsWith("/")) {
    return pathname;
  }

  return `/${pathname.replace(/^\/+/, "")}`;
}

function cloneAttributes(from, to) {
  Array.from(from.attributes).forEach((attr) => {
    to.setAttribute(attr.name, attr.value);
  });
}

function ensureHeadAsset(node) {
  if (node.tagName === "LINK") {
    const href = node.getAttribute("href");
    const rel = node.getAttribute("rel") || "";

    if (!href) return Promise.resolve(null);

    const existing = document.head.querySelector(
      `link[rel="${rel}"][href="${href}"]`
    );

    if (existing) return Promise.resolve(existing);

    const link = node.cloneNode(true);
    document.head.appendChild(link);
    return Promise.resolve(link);
  }

  if (node.tagName === "SCRIPT") {
    const src = node.getAttribute("src");
    if (!src) return Promise.resolve(null);

    const existing = document.head.querySelector(`script[src="${src}"]`);

    if (existing) return Promise.resolve(existing);

    const script = document.createElement("script");
    cloneAttributes(node, script);

    return new Promise((resolve, reject) => {
      script.onload = () => resolve(script);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  return Promise.resolve(null);
}

function extractBodyContent(documentSource) {
  const fragment = document.createDocumentFragment();
  const inlineScripts = [];

  documentSource.body.childNodes.forEach((node) => {
    if (node.tagName === "SCRIPT") {
      inlineScripts.push(node);
    } else {
      fragment.appendChild(document.importNode(node, true));
    }
  });

  return { fragment, inlineScripts };
}

function executeInlineScripts(target, scripts) {
  scripts.forEach((scriptNode) => {
    const script = document.createElement("script");
    cloneAttributes(scriptNode, script);
    script.textContent = scriptNode.textContent;
    target.appendChild(script);
  });
}

export async function loadGlobalHeader(options = {}) {
  const { containerSelector, sourcePath } = { ...DEFAULT_OPTIONS, ...options };
  const resolvedSourcePath = resolveSourcePath(sourcePath);
  const target = document.querySelector(containerSelector);

  if (!target) return null;

  const cacheKey = `${resolvedSourcePath}::${containerSelector}`;
  if (LOAD_CACHE.has(cacheKey)) {
    return LOAD_CACHE.get(cacheKey);
  }

  const loadPromise = (async () => {
    const response = await fetch(resolvedSourcePath);

    if (!response.ok) {
      throw new Error(`Falha ao carregar header global: ${response.status}`);
    }

    const html = await response.text();
    const parsed = new DOMParser().parseFromString(html, "text/html");

    const headAssets = parsed.head.querySelectorAll("link[rel], script[src]");
    const assetPromises = Array.from(headAssets, (node) => ensureHeadAsset(node));

    const { fragment, inlineScripts } = extractBodyContent(parsed);
    target.replaceChildren(fragment);

    await Promise.all(assetPromises);
    executeInlineScripts(target, inlineScripts);

    return target;
  })();

  LOAD_CACHE.set(cacheKey, loadPromise);
  loadPromise.catch(() => {
    LOAD_CACHE.delete(cacheKey);
  });
  return loadPromise;
}
