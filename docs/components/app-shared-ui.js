(function (global) {
    const { React: ReactLib = global.React, MaterialUI: Material } = global;
    if (!ReactLib || !Material) {
        console.warn('AppSharedUI depende de React e Material UI carregados no escopo global.');
        return;
    }

    const { forwardRef, Fragment } = ReactLib;
    const {
        Box,
        Button,
        Card,
        CardContent,
        Divider,
        Typography
    } = Material;

    const baseCardSx = (theme = {}) => {
        const palette = theme.palette || {};
        const isDark = palette.mode === 'dark';
        return {
            borderRadius: 0,
            border: `1px solid ${palette.divider || 'rgba(15, 23, 42, 0.12)'}`,
            boxShadow: isDark
                ? '0 30px 55px rgba(2, 6, 23, 0.65)'
                : '0 20px 45px rgba(15, 23, 42, 0.12)',
            backgroundImage: 'none',
            backgroundColor: palette.background?.paper || 'rgba(255, 255, 255, 0.98)',
            color: palette.text?.primary || 'inherit',
            minHeight: 0,
        };
    };

    const subtitleSx = {
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontSize: '0.75rem',
        color: 'text.secondary',
        fontWeight: 600,
    };

    const AppCard = forwardRef(function AppCard(
        { title, subtitle, helper, actions, children, sx = {}, contentProps = {}, headerProps = {}, divider = true, ...rest },
        ref
    ) {
        return (
            ReactLib.createElement(
                Card,
                {
                    ref,
                    elevation: 0,
                    sx: [
                        (themeArg) => baseCardSx(themeArg),
                        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
                    ],
                    ...rest,
                },
                (title || subtitle || helper || actions)
                    ? ReactLib.createElement(
                        Box,
                        {
                            sx: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.75,
                                padding: 3,
                                paddingBottom: divider ? 0 : 3,
                            },
                            ...headerProps,
                        },
                        subtitle && ReactLib.createElement(
                            Typography,
                            { component: 'p', sx: subtitleSx },
                            subtitle
                        ),
                        title && ReactLib.createElement(
                            Typography,
                            { component: 'h3', variant: 'h6', sx: { fontWeight: 600, marginBottom: helper ? 0.25 : 0 } },
                            title
                        ),
                        helper && ReactLib.createElement(
                            Typography,
                            { component: 'p', variant: 'body2', color: 'text.secondary' },
                            helper
                        ),
                        actions && ReactLib.createElement(
                            Box,
                            { sx: { marginTop: 1 } },
                            actions
                        ),
                        divider && ReactLib.createElement(Divider, { sx: { marginTop: 3 } })
                    )
                    : null,
                ReactLib.createElement(
                    CardContent,
                    {
                        sx: {
                            paddingTop: title || subtitle || helper ? 3 : 4,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5,
                        },
                        ...contentProps,
                    },
                    children
                )
            )
        );
    });

    const buttonToneMap = {
        primary: { variant: 'contained', color: 'primary' },
        secondary: { variant: 'contained', color: 'secondary' },
        subtle: { variant: 'outlined', color: 'primary' },
        ghost: { variant: 'text', color: 'primary' },
    };

    const AppButton = forwardRef(function AppButton({ tone = 'primary', sx = {}, children, ...rest }, ref) {
        const resolvedTone = buttonToneMap[tone] || buttonToneMap.primary;
        return ReactLib.createElement(
            Button,
            {
                ref,
                disableElevation: true,
                sx: {
                    borderRadius: 999,
                    paddingInline: 2.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    ...sx,
                },
                ...resolvedTone,
                ...rest,
            },
            children
        );
    });

    function AppSection({ title, description, children, sx = {}, ...rest }) {
        return ReactLib.createElement(
            Box,
            {
                component: 'section',
                sx: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    ...sx,
                },
                ...rest,
            },
            (title || description)
                ? ReactLib.createElement(
                    Fragment,
                    null,
                    title && ReactLib.createElement(
                        Typography,
                        { component: 'h2', variant: 'h5', sx: { fontWeight: 600 } },
                        title
                    ),
                    description && ReactLib.createElement(
                        Typography,
                        { component: 'p', color: 'text.secondary' },
                        description
                    )
                )
                : null,
            children
        );
    }

    global.AppUI = {
        AppCard,
        AppButton,
        AppSection,
    };
})(window);
