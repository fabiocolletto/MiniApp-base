(function (global) {
    const { React: ReactLib = global.React, MaterialUI: Material } = global;
    if (!ReactLib || !Material) {
        console.warn('AppModalContext depende de React e Material UI carregados no escopo global.');
        return;
    }

    const { createContext, useCallback, useContext, useMemo, useState, Fragment } = ReactLib;
    const {
        Alert,
        Box,
        Dialog,
        DialogActions,
        DialogContent,
        DialogTitle,
        Drawer,
        Snackbar
    } = Material;

    const ModalContext = createContext(null);

    function AppModalProvider({ children }) {
        const [dialogConfig, setDialogConfig] = useState(null);
        const [drawerConfig, setDrawerConfig] = useState(null);
        const [snackbarConfig, setSnackbarConfig] = useState(null);

        const openDialog = useCallback((config) => {
            setDialogConfig(config ? { ...config } : null);
        }, []);

        const closeDialog = useCallback(() => {
            setDialogConfig(null);
        }, []);

        const openDrawer = useCallback((config) => {
            setDrawerConfig(config ? { ...config } : null);
        }, []);

        const closeDrawer = useCallback(() => {
            setDrawerConfig(null);
        }, []);

        const showSnackbar = useCallback((config) => {
            setSnackbarConfig(config ? { autoHideDuration: 4000, ...config, open: true } : null);
        }, []);

        const hideSnackbar = useCallback(() => {
            setSnackbarConfig(null);
        }, []);

        const contextValue = useMemo(
            () => ({ openDialog, closeDialog, openDrawer, closeDrawer, showSnackbar }),
            [openDialog, closeDialog, openDrawer, closeDrawer, showSnackbar]
        );

        const renderDialogContent = () => {
            if (!dialogConfig) return null;
            const { title, content, actions, maxWidth = 'sm', scroll = 'paper', dividers = true } = dialogConfig;
            return (
                ReactLib.createElement(
                    Dialog,
                    {
                        open: true,
                        onClose: closeDialog,
                        fullWidth: true,
                        maxWidth,
                        scroll,
                    },
                    title && ReactLib.createElement(DialogTitle, null, title),
                    ReactLib.createElement(
                        DialogContent,
                        { dividers },
                        typeof content === 'function' ? content({ closeDialog }) : content
                    ),
                    actions
                        ? ReactLib.createElement(
                            DialogActions,
                            null,
                            actions({ closeDialog })
                        )
                        : null
                )
            );
        };

        const renderDrawerContent = () => {
            if (!drawerConfig) return null;
            const { anchor = 'right', content, width = 360 } = drawerConfig;
            return (
                ReactLib.createElement(
                    Drawer,
                    {
                        open: true,
                        anchor,
                        onClose: closeDrawer,
                        ModalProps: { keepMounted: true },
                    },
                    ReactLib.createElement(
                        Box,
                        { sx: { width: width === 'auto' ? 'auto' : width, maxWidth: '100vw', padding: 3 } },
                        typeof content === 'function' ? content({ closeDrawer }) : content
                    )
                )
            );
        };

        const renderSnackbar = () => {
            if (!snackbarConfig) return null;
            const { message, severity, autoHideDuration = 4000, anchorOrigin = { vertical: 'bottom', horizontal: 'center' } } = snackbarConfig;
            return (
                ReactLib.createElement(
                    Snackbar,
                    {
                        open: true,
                        message: severity ? null : message,
                        autoHideDuration,
                        onClose: hideSnackbar,
                        anchorOrigin,
                    },
                    severity
                        ? ReactLib.createElement(
                            Alert,
                            { onClose: hideSnackbar, severity, sx: { width: '100%' } },
                            message
                        )
                        : null
                )
            );
        };

        return (
            ReactLib.createElement(
                Fragment,
                null,
                ReactLib.createElement(ModalContext.Provider, { value: contextValue }, children),
                renderDialogContent(),
                renderDrawerContent(),
                renderSnackbar()
            )
        );
    }

    function useAppModal() {
        const context = useContext(ModalContext);
        if (!context) {
            throw new Error('useAppModal deve ser utilizado dentro do AppModalProvider.');
        }
        return context;
    }

    global.AppModalContext = {
        AppModalProvider,
        useAppModal,
    };
})(window);
