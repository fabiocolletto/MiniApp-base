(function () {
    const STORAGE_KEY = 'theme';
    const root = document.documentElement;

    const storage = {
        async get() {
            if (window.localforage && typeof window.localforage.getItem === 'function') {
                const stored = await window.localforage.getItem(STORAGE_KEY);
                if (stored) return stored;
            }
            return localStorage.getItem(STORAGE_KEY);
        },
        async set(value) {
            localStorage.setItem(STORAGE_KEY, value);
            if (window.localforage && typeof window.localforage.setItem === 'function') {
                await window.localforage.setItem(STORAGE_KEY, value);
            }
        },
    };

    const applyTheme = (theme) => {
        root.setAttribute('data-theme', theme);
        const iconValue = theme === 'dark' ? 'light_mode' : 'dark_mode';
        const labelValue = theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro';
        const chipIcon = theme === 'dark' ? 'dark_mode' : 'light_mode';
        const chipLabel = theme === 'dark' ? 'Tema escuro' : 'Tema claro';

        document.querySelectorAll('[data-theme-icon]').forEach((el) => {
            el.textContent = iconValue;
        });

        document.querySelectorAll('[data-theme-label]').forEach((el) => {
            el.textContent = labelValue;
        });

        const chip = document.querySelector('[data-theme-chip]');
        if (chip) {
            const iconEl = chip.querySelector('[data-theme-chip-icon]');
            const labelEl = chip.querySelector('[data-theme-chip-label]');
            if (iconEl) iconEl.textContent = chipIcon;
            if (labelEl) labelEl.textContent = chipLabel;
        }
    };

    const registerToggles = () => {
        document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
            if (button.dataset.themeBound === 'true') return;
            button.dataset.themeBound = 'true';
            button.addEventListener('click', async () => {
                const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                applyTheme(nextTheme);
                await storage.set(nextTheme);
            });
        });
    };

    const init = async () => {
        const storedTheme = await storage.get();
        const prefersDark =
            window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');

        applyTheme(initialTheme);
        registerToggles();
    };

    const observer = new MutationObserver(() => {
        registerToggles();
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });

    window.MiniappTheme = {
        applyTheme,
        registerToggles,
        init,
    };

    init();
})();
