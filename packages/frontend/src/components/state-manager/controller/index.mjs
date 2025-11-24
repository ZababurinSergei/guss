export const controller = (context) => {
    let eventListeners = [];

    const addEventListener = (element, event, handler) => {
        element.addEventListener(event, handler);
        eventListeners.push({ element, event, handler });
    };

    return {
        async init() {
            // StateManager не требует обработчиков событий UI
            // так как он работает через API вызовы от других компонентов
            log(`StateManager controller инициализирован`);
        },

        async destroy() {
            eventListeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
            eventListeners = [];
            log(`StateManager controller уничтожен`);
        }
    };
};