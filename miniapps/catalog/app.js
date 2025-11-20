import { loadMiniAppData } from '../../js/miniapp-data-loader.js';
import { getAll, saveRecord, deleteRecord } from '../../js/indexeddb-store.js';

const FAVORITES_STORE = 'favorites';
const RECENTS_STORAGE_KEY = 'miniapp:recents';
const MAX_RECENTS = 12;

const SUPPORTED_LANGUAGES = ['pt-BR', 'en-US', 'es-ES'];
const DEFAULT_GLOBAL_PREFERENCES = Object.freeze({ theme: 'light', language: 'pt-BR' });
const GLOBAL_PREFERENCES_STORAGE_KEY = 'miniapp:settings:global-preferences';
const GLOBAL_PREFERENCES_MESSAGE_TYPE = 'miniapp:global-preferences';
const PREFERRED_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';
const FALLBACK_LANGUAGE = 'pt-BR';
const LOADING_LABELS = Object.freeze({
    'pt-BR': 'Carregando MiniApps…',
    'en-US': 'Loading MiniApps…',
    'es-ES': 'Cargando MiniApps…',
});

const BASE_COPY = Object.freeze({
    'pt-BR': Object.freeze({
        meta: Object.freeze({ pageTitle: 'MiniApp - Gestão de Catálogo' }),
        hero: Object.freeze({
            overline: 'MiniApps',
            title: 'MiniApps em destaque',
            description: 'Abra, consulte detalhes e marque favoritos para o shell principal.'
        }),
        sections: Object.freeze({
            activeTitle: 'MiniApps ativos',
            activeDescription: 'A lista reflete o estado atual do RodaPack.'
        }),
        status: Object.freeze({
            published: 'Publicado',
            draft: 'Em rascunho',
            review: 'Em revisão',
            maintenance: 'Manutenção'
        }),
        fields: Object.freeze({
            category: 'Categoria',
            contract: 'Contrato',
            owner: 'Responsável'
        }),
        buttons: Object.freeze({
            details: 'Detalhes',
            close: 'Fechar',
            openFullscreen: 'Abrir em tela cheia',
            closeFullscreen: 'Fechar MiniApp',
            favorite: 'Adicionar aos Favoritos',
            removeFavorite: 'Remover dos Favoritos'
        }),
        placeholders: Object.freeze({
            emptyTitle: 'Catálogo em criação',
            emptyDescription: 'Os MiniApps oficiais estão em desenvolvimento.'
        }),
        feedback: Object.freeze({
            favoriteAdded: (title) => `⭐ MiniApp "${title}" adicionado aos Favoritos!`,
            favoriteRemoved: (title) => `MiniApp "${title}" removido dos Favoritos.`,
            favoriteError: 'Não foi possível atualizar seus favoritos. Tente novamente.',
            load: 'Não foi possível carregar o catálogo.'
        })
    }),
    'en-US': Object.freeze({
        meta: Object.freeze({ pageTitle: 'MiniApp - Catalog Management' }),
        hero: Object.freeze({
            overline: 'MiniApps',
            title: 'Highlighted MiniApps',
            description: 'Open, check details, and mark favorites for the main shell.'
        }),
        sections: Object.freeze({
            activeTitle: 'Active MiniApps',
            activeDescription: 'The list reflects the current RodaPack state.'
        }),
        status: Object.freeze({
            published: 'Published',
            draft: 'Draft',
            review: 'In review',
            maintenance: 'Maintenance'
        }),
        fields: Object.freeze({
            category: 'Category',
            contract: 'Contract',
            owner: 'Owner'
        }),
        buttons: Object.freeze({
            details: 'Details',
            close: 'Close',
            openFullscreen: 'Open full screen',
            closeFullscreen: 'Close MiniApp',
            favorite: 'Add to Favorites',
            removeFavorite: 'Remove from Favorites'
        }),
        placeholders: Object.freeze({
            emptyTitle: 'Catalog in progress',
            emptyDescription: 'The official MiniApps are under development.'
        }),
        feedback: Object.freeze({
            favoriteAdded: (title) => `⭐ MiniApp "${title}" added to Favorites!`,
            favoriteRemoved: (title) => `MiniApp "${title}" removed from Favorites.`,
            favoriteError: 'Could not update your favorites. Please try again.',
            load: 'Could not load the catalog.'
        })
    }),
    'es-ES': Object.freeze({
        meta: Object.freeze({ pageTitle: 'MiniApp - Gestión de Catálogo' }),
        hero: Object.freeze({
            overline: 'MiniApps',
            title: 'MiniApps destacados',
            description: 'Abre, consulta detalles y marca favoritos para el shell principal.'
        }),
        sections: Object.freeze({
            activeTitle: 'MiniApps activos',
            activeDescription: 'La lista refleja el estado actual de RodaPack.'
        }),
        status: Object.freeze({
            published: 'Publicado',
            draft: 'En borrador',
            review: 'En revisión',
            maintenance: 'Mantenimiento'
        }),
        fields: Object.freeze({
            category: 'Categoría',
            contract: 'Contrato',
            owner: 'Responsable'
        }),
        buttons: Object.freeze({
            details: 'Detalles',
            close: 'Cerrar',
            openFullscreen: 'Abrir en pantalla completa',
            closeFullscreen: 'Cerrar MiniApp',
            favorite: 'Agregar a Favoritos',
            removeFavorite: 'Quitar de Favoritos'
        }),
        placeholders: Object.freeze({
            emptyTitle: 'Catálogo en creación',
            emptyDescription: 'Los MiniApps oficiales están en desarrollo.'
        }),
        feedback: Object.freeze({
            favoriteAdded: (title) => `⭐ MiniApp "${title}" agregado a Favoritos!`,
            favoriteRemoved: (title) => `MiniApp "${title}" removido de Favoritos.`,
            favoriteError: 'No se pudieron actualizar tus favoritos. Inténtalo de nuevo.',
            load: 'No se pudo cargar el catálogo.'
        })
    }),
});

const MODE_COPY_OVERRIDES = Object.freeze({
    catalog: {},
    favorites: {
        'pt-BR': {
            hero: { overline: 'MiniApps principais', title: 'Favoritos', description: 'Acompanhe o que foi marcado como favorito e mantenha o shell sincronizado.' },
            sections: { activeTitle: 'Favoritos persistidos', activeDescription: 'Somente os MiniApps marcados como favoritos aparecem aqui.' },
            placeholders: { emptyTitle: 'Nenhum favorito ainda', emptyDescription: 'Use o botão de favoritos dentro dos detalhes para começar.' },
        },
        'en-US': {
            hero: { overline: 'Key MiniApps', title: 'Favorites', description: 'Track everything marked as favorite and keep the shell in sync.' },
            sections: { activeTitle: 'Saved favorites', activeDescription: 'Only MiniApps marked as favorite appear here.' },
            placeholders: { emptyTitle: 'No favorites yet', emptyDescription: 'Use the favorite button inside the details to start.' },
        },
        'es-ES': {
            hero: { overline: 'MiniApps principales', title: 'Favoritos', description: 'Sigue lo que marcaste como favorito y mantén el shell sincronizado.' },
            sections: { activeTitle: 'Favoritos guardados', activeDescription: 'Solo aparecen los MiniApps marcados como favoritos.' },
            placeholders: { emptyTitle: 'Sin favoritos', emptyDescription: 'Usa el botón de favoritos en los detalles para empezar.' },
        },
    },
    recents: {
        'pt-BR': {
            hero: { overline: 'MiniApps principais', title: 'Recentes', description: 'Visualize rapidamente o que foi aberto recentemente no shell.' },
            sections: { activeTitle: 'Últimos acessos', activeDescription: 'A ordem acompanha o histórico local de abertura.' },
            placeholders: { emptyTitle: 'Nenhum acesso recente', emptyDescription: 'Abra qualquer MiniApp pelo ícone de expansão para registrar seu histórico.' },
        },
        'en-US': {
            hero: { overline: 'Key MiniApps', title: 'Recents', description: 'Quickly view what was opened recently in the shell.' },
            sections: { activeTitle: 'Latest entries', activeDescription: 'Ordering follows the local open history.' },
            placeholders: { emptyTitle: 'No recent access', emptyDescription: 'Open any MiniApp through the expand icon to record its history.' },
        },
        'es-ES': {
            hero: { overline: 'MiniApps principales', title: 'Recientes', description: 'Visualiza rápidamente lo abierto recientemente en el shell.' },
            sections: { activeTitle: 'Últimos accesos', activeDescription: 'El orden sigue el historial local de aperturas.' },
            placeholders: { emptyTitle: 'Sin accesos recientes', emptyDescription: 'Abre cualquier MiniApp con el ícono de expansión para registrar el historial.' },
        },
    },
});

const STATUS_VARIANTS = {
    published: { color: 'success', matchers: ['published', 'publicado'] },
    draft: { color: 'warning', matchers: ['draft', 'em rascunho', 'rascunho'] },
    review: { color: 'info', matchers: ['review', 'em revisao', 'revisao', 'em revisão'] },
    maintenance: { color: 'default', matchers: ['maintenance', 'manutencao', 'manutenção'] },
};

function normalizeLanguage(language) {
    return SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_GLOBAL_PREFERENCES.language;
}

function normalizeThemePreference(theme) {
    if (theme === 'dark') return 'dark';
    if (theme === 'system') return 'system';
    return 'light';
}

function resolveEffectiveTheme(preference, systemTheme) {
    if (preference === 'system') return systemTheme;
    return preference;
}

function readStoredPreferences() {
    if (typeof localStorage === 'undefined') {
        return DEFAULT_GLOBAL_PREFERENCES;
    }

    try {
        const stored = JSON.parse(localStorage.getItem(GLOBAL_PREFERENCES_STORAGE_KEY));
        if (!stored || typeof stored !== 'object') {
            return DEFAULT_GLOBAL_PREFERENCES;
        }
        const theme = normalizeThemePreference(stored.theme);
        const language = normalizeLanguage(stored.language);
        return { theme, language };
    } catch (error) {
        console.warn('Preferências globais corrompidas, usando padrão.', error);
        return DEFAULT_GLOBAL_PREFERENCES;
    }
}

function getSystemTheme() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return 'light';
    }
    return window.matchMedia(PREFERRED_COLOR_SCHEME_QUERY).matches ? 'dark' : 'light';
}

function getModeCopy(mode, language) {
    const base = BASE_COPY[language] || BASE_COPY[FALLBACK_LANGUAGE];
    const overrides = MODE_COPY_OVERRIDES[mode]?.[language] || {};
    const mergedHero = { ...base.hero, ...(overrides.hero || {}) };
    const mergedSections = { ...base.sections, ...(overrides.sections || {}) };
    const mergedPlaceholders = { ...base.placeholders, ...(overrides.placeholders || {}) };

    return {
        ...base,
        hero: mergedHero,
        sections: mergedSections,
        placeholders: mergedPlaceholders,
    };
}

function resolveStatusProps(app, copy) {
    const rawStatus = (app.status || '').toString().toLowerCase();
    const variantEntry = Object.entries(STATUS_VARIANTS).find(([_, value]) =>
        value.matchers.some((matcher) => rawStatus.includes(matcher))
    );
    if (!variantEntry) {
        return { label: app.status || copy.status.review, color: 'default' };
    }
    const [key, value] = variantEntry;
    return { label: copy.status[key] || app.status || key, color: value.color };
}

async function loadFavoritesMap() {
    try {
        const favorites = await getAll(FAVORITES_STORE);
        return new Map(
            (favorites || []).map((item) => [item.miniAppTitle, item])
        );
    } catch (error) {
        console.error('Erro ao carregar favoritos do IndexedDB', error);
        return new Map();
    }
}

function readRecentStorage() {
    if (typeof localStorage === 'undefined') {
        return [];
    }
    try {
        const stored = JSON.parse(localStorage.getItem(RECENTS_STORAGE_KEY));
        if (!Array.isArray(stored)) return [];
        return stored;
    } catch (error) {
        console.warn('Histórico recente corrompido. Reiniciando.', error);
        return [];
    }
}

function persistRecentStorage(list) {
    if (typeof localStorage === 'undefined') {
        return;
    }
    try {
        localStorage.setItem(RECENTS_STORAGE_KEY, JSON.stringify(list));
    } catch (error) {
        console.warn('Não foi possível persistir o histórico recente.', error);
    }
}

function mergeRecentsWithDataset(dataset, recents) {
    const normalizedDataset = Array.isArray(dataset) ? dataset : [];
    return recents
        .map((entry) => {
            const entryKey = entry.canonicalTitle || entry.title;
            const match = normalizedDataset.find((item) =>
                (entry.id && item.id && entry.id === item.id)
                || (entryKey && (item.canonicalTitle === entryKey || item.title === entryKey))
            );
            return match ? { ...match, lastAccess: entry.lastAccess } : entry;
        })
        .sort((a, b) => (b.lastAccess || '').localeCompare(a.lastAccess || ''));
}

function getFavoriteKey(app) {
    return app?.canonicalTitle || app?.title || '';
}

function normalizeDatasetItems(dataset, language) {
    return (Array.isArray(dataset) ? dataset : []).map((item) => {
        const localizedTitle = item.titles?.[language] || item.titles?.[FALLBACK_LANGUAGE] || item.title;
        const localizedCategory = item.categories?.[language] || item.categories?.[FALLBACK_LANGUAGE] || item.category;
        const localizedDescription = item.descriptions?.[language] || item.descriptions?.[FALLBACK_LANGUAGE] || item.description;

        return {
            ...item,
            title: localizedTitle,
            category: localizedCategory,
            description: localizedDescription,
            canonicalTitle: item.title || localizedTitle,
        };
    });
}

function dedupeFavorites(dataset, favoritesMap) {
    const normalizedDataset = Array.isArray(dataset) ? dataset : [];
    const entries = Array.from(favoritesMap.entries());
    return entries
        .map(([title, value]) => {
            const match = normalizedDataset.find((item) =>
                item.title === title
                || item.canonicalTitle === title
                || item.id === value?.data?.id
            );
            return match || value?.data || null;
        })
        .filter(Boolean);
}

function resolveItemsForMode(mode, dataset, favoritesMap, recents) {
    if (mode === 'favorites') {
        return dedupeFavorites(dataset, favoritesMap);
    }
    if (mode === 'recents') {
        return mergeRecentsWithDataset(dataset, recents);
    }
    return dataset;
}

function bootstrapMiniAppGrid({ rootId = 'catalog-root', mode = 'catalog' } = {}) {
    const ReactLib = window.React;
    const ReactDOMLib = window.ReactDOM;
    const Material = window.MaterialUI;
    const { AppCard, AppButton } = window.AppUI;
    const { AppModalProvider, useAppModal } = window.AppModalContext;

    if (!ReactLib || !ReactDOMLib || !Material || !AppCard || !AppModalProvider) {
        throw new Error('Dependências essenciais não foram carregadas para o template de MiniApps.');
    }

    const {
        useMemo,
        Fragment,
        useEffect,
        useState,
        useCallback,
    } = ReactLib;

    const {
        ThemeProvider,
        createTheme,
        CssBaseline,
        Box,
        Button,
        Chip,
        Container,
        Grid,
        Stack,
        Typography,
        Avatar,
        Divider,
        List,
        ListItem,
        ListItemText,
        Snackbar,
        Alert,
        IconButton,
        Dialog,
        AppBar,
        Toolbar,
        Tooltip,
    } = Material;

    const e = ReactLib.createElement;

    function usePreferences() {
        const [preferences, setPreferences] = useState(() => readStoredPreferences());
        const [systemTheme, setSystemTheme] = useState(() => getSystemTheme());

        useEffect(() => {
            if (typeof window === 'undefined') return undefined;

            const mediaQuery = window.matchMedia(PREFERRED_COLOR_SCHEME_QUERY);
            const handler = (event) => setSystemTheme(event.matches ? 'dark' : 'light');
            mediaQuery.addEventListener('change', handler);

            const handleMessage = (event) => {
                const { data } = event;
                if (data?.type === GLOBAL_PREFERENCES_MESSAGE_TYPE && data.payload) {
                    const next = {
                        theme: normalizeThemePreference(data.payload.theme),
                        language: normalizeLanguage(data.payload.language),
                    };
                    setPreferences(next);
                    if (typeof localStorage !== 'undefined') {
                        localStorage.setItem(GLOBAL_PREFERENCES_STORAGE_KEY, JSON.stringify(next));
                    }
                }
            };
            window.addEventListener('message', handleMessage);

            return () => {
                mediaQuery.removeEventListener('change', handler);
                window.removeEventListener('message', handleMessage);
            };
        }, []);

        const effectiveTheme = useMemo(
            () => resolveEffectiveTheme(preferences.theme, systemTheme),
            [preferences.theme, systemTheme]
        );

        return { preferences, effectiveTheme, setPreferences };
    }

    function useFavorites() {
        const [favoritesMap, setFavoritesMap] = useState(new Map());
        const [loadingFavorites, setLoadingFavorites] = useState(true);

        useEffect(() => {
            let isMounted = true;
            loadFavoritesMap().then((map) => {
                if (isMounted) {
                    setFavoritesMap(map);
                    setLoadingFavorites(false);
                }
            });
            return () => { isMounted = false; };
        }, []);

        const updateFavorite = useCallback(async (app, shouldFavorite, copy, showSnackbar) => {
            const favoriteKey = getFavoriteKey(app);
            if (!app || !favoriteKey) {
                return;
            }
            const now = new Date().toISOString();
            try {
                if (shouldFavorite) {
                    await saveRecord(FAVORITES_STORE, {
                        miniAppTitle: favoriteKey,
                        savedAt: now,
                        data: { ...app, canonicalTitle: favoriteKey },
                    });
                } else {
                    await deleteRecord(FAVORITES_STORE, favoriteKey);
                }
                setFavoritesMap((prev) => {
                    const next = new Map(prev);
                    if (shouldFavorite) {
                        next.set(favoriteKey, { miniAppTitle: favoriteKey, savedAt: now, data: { ...app, canonicalTitle: favoriteKey } });
                    } else {
                        next.delete(favoriteKey);
                    }
                    return next;
                });
                if (typeof showSnackbar === 'function') {
                    const displayTitle = app.title || favoriteKey;
                    const message = shouldFavorite
                        ? copy.feedback.favoriteAdded(displayTitle)
                        : copy.feedback.favoriteRemoved(displayTitle);
                    showSnackbar({ severity: shouldFavorite ? 'success' : 'info', message });
                }
            } catch (error) {
                console.error('Erro ao atualizar favorito', error);
                if (typeof showSnackbar === 'function') {
                    showSnackbar({ severity: 'error', message: copy.feedback.favoriteError });
                }
            }
        }, []);

        return { favoritesMap, loadingFavorites, updateFavorite };
    }

    function useRecents() {
        const [recentHistory, setRecentHistory] = useState(() => readRecentStorage());

        const recordRecent = useCallback((app) => {
            if (!app) return;
            const favoriteKey = getFavoriteKey(app);
            setRecentHistory((prev) => {
                const filtered = prev.filter((item) => {
                    const sameId = item.id && app.id && item.id === app.id;
                    const sameTitle = favoriteKey
                        ? (item.canonicalTitle === favoriteKey || item.title === favoriteKey)
                        : item.title === app.title;
                    return !(sameId || sameTitle);
                });
                const nextEntry = { ...app, canonicalTitle: favoriteKey || app.title, lastAccess: new Date().toISOString() };
                const nextList = [nextEntry, ...filtered].slice(0, MAX_RECENTS);
                persistRecentStorage(nextList);
                return nextList;
            });
        }, []);

        return { recentHistory, recordRecent };
    }

    function useMiniAppData(fallbackErrorMessage) {
        const [items, setItems] = useState([]);
        const [isLoading, setIsLoading] = useState(true);
        const [errorMessage, setErrorMessage] = useState('');
        const [usedFallbackMessage, setUsedFallbackMessage] = useState(false);

        useEffect(() => {
            let isMounted = true;

            async function fetchData() {
                setIsLoading(true);
                try {
                    const data = await loadMiniAppData();
                    if (!isMounted) {
                        return;
                    }
                    if (Array.isArray(data)) {
                        setItems(data);
                    } else {
                        setItems([]);
                    }
                    setErrorMessage('');
                    setUsedFallbackMessage(false);
                } catch (error) {
                    console.error('Falha ao carregar miniapp-data.js', error);
                    if (!isMounted) {
                        return;
                    }
                    const nextMessage = error?.message || fallbackErrorMessage || '';
                    setItems([]);
                    setErrorMessage(nextMessage);
                    setUsedFallbackMessage(!error?.message);
                } finally {
                    if (isMounted) {
                        setIsLoading(false);
                    }
                }
            }

            fetchData();

            return () => {
                isMounted = false;
            };
        }, []);

        useEffect(() => {
            if (usedFallbackMessage && errorMessage && fallbackErrorMessage) {
                setErrorMessage(fallbackErrorMessage);
            }
        }, [fallbackErrorMessage, usedFallbackMessage, errorMessage]);

        return { items, isLoading, errorMessage, setErrorMessage };
    }

    function useIframeHeightBridge(sourceId) {
        useEffect(() => {
            if (typeof window === 'undefined' || window.parent === window) {
                return undefined;
            }

            const target = document.querySelector('.miniapp-stage');
            if (!target) {
                return undefined;
            }

            let lastHeight = 0;
            let rafId = null;

            const postHeight = () => {
                rafId = null;
                const height = Math.ceil(target.scrollHeight);
                if (!height || height === lastHeight) {
                    return;
                }
                lastHeight = height;
                window.parent.postMessage({
                    type: `${sourceId}:height`,
                    sourceId,
                    height,
                }, '*');
            };

            const schedulePost = () => {
                if (rafId !== null) {
                    return;
                }
                rafId = window.requestAnimationFrame(postHeight);
            };

            const observer = typeof ResizeObserver !== 'undefined'
                ? new ResizeObserver(() => schedulePost())
                : null;

            if (observer) {
                observer.observe(target);
            }

            schedulePost();
            window.addEventListener('load', schedulePost);

            return () => {
                window.removeEventListener('load', schedulePost);
                if (observer) {
                    observer.disconnect();
                }
                if (rafId !== null) {
                    window.cancelAnimationFrame(rafId);
                }
            };
        }, [sourceId]);
    }

    function CatalogCard({ app, copy, onOpenDetails, onToggleExpand, isExpanded }) {
        const statusProps = resolveStatusProps(app, copy);
        return e(
            AppCard,
            {
                title: app.title,
                subtitle: app.category,
                helper: app.description,
                sx: { minHeight: 240 },
                actions: e(
                    Stack,
                    { direction: 'row', alignItems: 'center', justifyContent: 'space-between', spacing: 1 },
                    e(
                        Stack,
                        { direction: 'row', spacing: 1, alignItems: 'center' },
                        e(Chip, { label: statusProps.label, color: statusProps.color === 'default' ? undefined : statusProps.color, variant: 'outlined' }),
                        e(Button, { size: 'small', onClick: onOpenDetails, sx: { textTransform: 'none', fontWeight: 600 } }, copy.buttons.details)
                    ),
                    e(
                        Tooltip,
                        { title: isExpanded ? copy.buttons.closeFullscreen : copy.buttons.openFullscreen },
                        e(
                            IconButton,
                            { onClick: onToggleExpand, color: isExpanded ? 'primary' : 'default', size: 'small' },
                            e('span', { className: 'material-icons-sharp' }, isExpanded ? 'close_fullscreen' : 'open_in_full')
                        )
                    )
                ),
            },
            e(
                Stack,
                { spacing: 1.25 },
                e(Stack, { direction: 'row', spacing: 1.5, alignItems: 'center' },
                    e(Avatar, { children: app.title.slice(0, 1) }),
                    e('div', null,
                        e(Typography, { variant: 'body2', color: 'text.secondary' }, copy.fields.owner),
                        e(Typography, { variant: 'subtitle1' }, app.owner || '—')
                    )
                ),
                e(Divider, null),
                e(Typography, { variant: 'body2', color: 'text.secondary' }, copy.fields.category + ': ' + app.category)
            )
        );
    }

    function CatalogAppContent({ preferences }) {
        const { favoritesMap, loadingFavorites, updateFavorite } = useFavorites();
        const { recentHistory, recordRecent } = useRecents();
        const { openDialog, showSnackbar } = useAppModal();
        const { items, isLoading, errorMessage, setErrorMessage } = useMiniAppData(BASE_COPY[preferences.language]?.feedback?.load);
        const [activeApp, setActiveApp] = useState(null);

        const localizedItems = useMemo(
            () => normalizeDatasetItems(items, preferences.language),
            [items, preferences.language]
        );

        const copy = useMemo(
            () => getModeCopy(mode, preferences.language),
            [mode, preferences.language]
        );

        const resolvedItems = useMemo(
            () => resolveItemsForMode(mode, localizedItems, favoritesMap, recentHistory),
            [mode, localizedItems, favoritesMap, recentHistory]
        );

        const renderPlaceholder = useCallback((title, description) => (
            e('div', { className: 'miniapp-card empty-state', style: { maxWidth: 420, width: '100%' } },
                e('div', { className: 'placeholder-content' },
                    e('p', { className: 'placeholder-label' }, title),
                    e('p', { className: 'placeholder-description' }, description)
                )
            )
        ), []);

        useIframeHeightBridge(mode);

        const handleOpenDetails = useCallback((app) => {
            if (!app) return;
            const favoriteKey = getFavoriteKey(app);
            const isFavorited = favoritesMap.has(favoriteKey);

            openDialog({
                title: app.title,
                maxWidth: 'sm',
                content: () => e(
                    Stack,
                    { spacing: 2, sx: { pt: 1 } },
                    e(Typography, { variant: 'body2', color: 'text.secondary' }, app.description),
                    e(Divider, null),
                    e(List, { dense: true, disablePadding: true },
                        e(ListItem, { disableGutters: true },
                            e(ListItemText, { primary: copy.fields.category, secondary: app.category })
                        ),
                        e(ListItem, { disableGutters: true },
                            e(ListItemText, { primary: copy.fields.contract, secondary: app.contract || '—' })
                        ),
                        e(ListItem, { disableGutters: true },
                            e(ListItemText, { primary: copy.fields.owner, secondary: app.owner || '—' })
                        )
                    )
                ),
                actions: ({ closeDialog }) => e(Fragment, null,
                    e(AppButton, {
                        tone: isFavorited ? 'subtle' : 'primary',
                        onClick: async () => {
                            await updateFavorite(app, !isFavorited, copy, showSnackbar);
                        }
                    }, isFavorited ? copy.buttons.removeFavorite : copy.buttons.favorite),
                    e(Button, { onClick: closeDialog }, copy.buttons.close)
                ),
            });
        }, [copy, favoritesMap, openDialog, showSnackbar, updateFavorite]);

        const handleToggleExpand = useCallback((app) => {
            if (!app) return;
            const isSame = activeApp && ((activeApp.id && app.id && activeApp.id === app.id) || activeApp.title === app.title);
            if (isSame) {
                setActiveApp(null);
                return;
            }
            recordRecent(app);
            setActiveApp(app);
        }, [activeApp, recordRecent]);

        const sectionContent = useMemo(() => {
            const isBusy = isLoading || (mode === 'favorites' && loadingFavorites);
            if (isBusy) {
                const loadingTitle = LOADING_LABELS[preferences.language] || LOADING_LABELS[FALLBACK_LANGUAGE];
                return renderPlaceholder(loadingTitle, copy.sections.activeDescription);
            }

            if (!resolvedItems || resolvedItems.length === 0) {
                return renderPlaceholder(copy.placeholders.emptyTitle, copy.placeholders.emptyDescription);
            }

            return e(
                Grid,
                { container: true, spacing: 2 },
                resolvedItems.map((app) => e(Grid, { item: true, xs: 12, sm: 6, md: 4, key: app.id || app.title }, e(CatalogCard, {
                    app,
                    copy,
                    onOpenDetails: () => handleOpenDetails(app),
                    onToggleExpand: () => handleToggleExpand(app),
                    isExpanded: activeApp && (activeApp.id === app.id || activeApp.title === app.title),
                })))
            );
        }, [isLoading, mode, loadingFavorites, preferences.language, renderPlaceholder, resolvedItems, copy, handleOpenDetails, handleToggleExpand, activeApp]);

        const handleCloseError = (_, reason) => {
            if (reason === 'clickaway') {
                return;
            }
            setErrorMessage('');
        };

        const fullScreenDialog = e(
            Dialog,
            { fullScreen: true, open: Boolean(activeApp), onClose: () => setActiveApp(null) },
            activeApp ? e(Fragment, null,
                e(AppBar, { position: 'sticky', color: 'default', elevation: 1 },
                    e(Toolbar, { sx: { display: 'flex', justifyContent: 'space-between', gap: 1 } },
                        e(Stack, { direction: 'row', spacing: 1, alignItems: 'center' },
                            e(Avatar, { sx: { width: 36, height: 36 } }, activeApp.title.slice(0, 1)),
                            e('div', null,
                                e(Typography, { variant: 'subtitle1' }, activeApp.title),
                                e(Typography, { variant: 'caption', color: 'text.secondary' }, activeApp.category)
                            )
                        ),
                        e(Stack, { direction: 'row', spacing: 1, alignItems: 'center' },
                            e(Button, { component: 'a', href: activeApp.url, target: '_blank', rel: 'noreferrer', variant: 'outlined' }, copy.buttons.openFullscreen),
                            e(IconButton, { edge: 'end', color: 'inherit', onClick: () => setActiveApp(null) }, e('span', { className: 'material-icons-sharp' }, 'close'))
                        )
                    )
                ),
                e(Box, { sx: { flex: 1, height: 'calc(100vh - 64px)', backgroundColor: 'background.default' } },
                    e('iframe', {
                        src: activeApp.url,
                        title: activeApp.title,
                        style: { width: '100%', height: '100%', border: 'none' },
                        allow: 'fullscreen',
                    })
                )
            ) : null
        );

        return e(
            Fragment,
            null,
            e(
                Box,
                { className: 'miniapp-stage', sx: { flex: 1 } },
                e(
                    Box,
                    { className: 'miniapp-stage', sx: { flex: 1 } },
                    e(
                        Container,
                        { maxWidth: 'lg', sx: { py: { xs: 2, md: 3 }, px: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 3 } },
                        sectionContent
                    )
                ),
                fullScreenDialog
            ),
            fullScreenDialog,
            e(
                Snackbar,
                {
                    open: Boolean(errorMessage),
                    autoHideDuration: 6000,
                    onClose: handleCloseError,
                    anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
                },
                errorMessage
                    ? e(Alert, { severity: 'error', variant: 'filled', onClose: handleCloseError }, errorMessage)
                    : null
            )
        );
    }

    function CatalogApp() {
        const { preferences, effectiveTheme } = usePreferences();

        const theme = useMemo(() => {
            const modeValue = effectiveTheme;
            const isDark = modeValue === 'dark';
            return createTheme({
                palette: {
                    mode: modeValue,
                    primary: { main: '#f97316' },
                    secondary: { main: '#0ea5e9' },
                    background: {
                        default: isDark ? '#020617' : '#f3f4f6',
                        paper: isDark ? '#0f172a' : '#ffffff',
                    },
                    text: {
                        primary: isDark ? '#f8fafc' : '#0f172a',
                        secondary: isDark ? '#94a3b8' : '#475569',
                    },
                },
                typography: {
                    fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                },
                shape: { borderRadius: 24 },
            });
        }, [effectiveTheme]);

        return e(
            ThemeProvider,
            { theme },
            e(CssBaseline, null),
            e(
                AppModalProvider,
                null,
                e(CatalogAppContent, { preferences })
            )
        );
    }

    const rootElement = document.getElementById(rootId);
    if (!rootElement) {
        throw new Error(`Elemento raiz com id "${rootId}" não encontrado.`);
    }

    ReactDOMLib.createRoot(rootElement).render(e(CatalogApp));
}

export { bootstrapMiniAppGrid };
