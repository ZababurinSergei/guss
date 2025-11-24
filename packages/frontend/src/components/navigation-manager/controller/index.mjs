export const controller = (context) => {
    let eventListeners = [];

    const addEventListener = (element, event, handler) => {
        element.addEventListener(event, handler);
        eventListeners.push({ element, event, handler });
    };

    return {
        async init() {
            // Обработчик кликов для кнопки выхода
            addEventListener(context.shadowRoot, 'click', (e) => {
                if (e.target.classList.contains('logout-btn')) {
                    context._actions.handleLogout();
                }
            });

            // Обработчики для навигационных событий
            addEventListener(context.shadowRoot, 'component-navigate', (e) => {
                const { page } = e.detail;
                context.navigateTo(page);
            });

            addEventListener(context.shadowRoot, 'user-updated', (e) => {
                const { user } = e.detail;
                context.setUser(user);
            });

            // Обработчик для глобальных событий авторизации
            addEventListener(window, 'storage', (e) => {
                if (e.key === 'guss-user') {
                    context._actions.handleStorageChange(e);
                }
            });

            // Обработчик для сообщений от других компонентов
            addEventListener(context, 'post-message', (e) => {
                context._actions.handlePostMessage(e.detail);
            });

            // Обработчик клавиши Escape для выхода
            addEventListener(document, 'keydown', (e) => {
                if (e.key === 'Escape' && context.state.user) {
                    context._actions.handleLogout();
                }
            });

            // Обработчик для глобальных событий выхода
            addEventListener(window, 'global-logout', () => {
                context._actions.handleLogout();
            });
        },

        async destroy() {
            eventListeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
            eventListeners = [];
        }
    };
};