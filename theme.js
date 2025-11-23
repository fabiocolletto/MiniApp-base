(function () {
    const root = document.documentElement;
    const storedTheme = localStorage.getItem('miniapp-theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');

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

    applyTheme(initialTheme);

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
        button.addEventListener('click', () => {
            const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            applyTheme(nextTheme);
            localStorage.setItem('miniapp-theme', nextTheme);
        });
    });
})();
