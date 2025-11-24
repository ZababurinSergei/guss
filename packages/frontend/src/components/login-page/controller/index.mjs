export const controller = (context) => {
    let eventListeners = [];

    const addEventListener = (element, event, handler) => {
        element.addEventListener(event, handler);
        eventListeners.push({ element, event, handler });
    };

    return {
        async init() {
            const form = context.shadowRoot.querySelector('form');
            if (form) {
                addEventListener(form, 'submit', (e) => {
                    e.preventDefault();
                    context._actions.handleSubmit(new FormData(form));
                });
            }
        },

        async destroy() {
            eventListeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
            eventListeners = [];
        }
    };
};