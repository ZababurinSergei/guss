export const controller = (context) => {
    let eventListeners = [];
    let timerInterval;

    const addEventListener = (element, event, handler) => {
        element.addEventListener(event, handler);
        eventListeners.push({ element, event, handler });
    };

    const startTimer = () => {
        if (timerInterval) clearInterval(timerInterval);

        timerInterval = setInterval(async () => {
            if (context.state.timeLeft > 0) {
                context.state.timeLeft -= 1000;

                // Если время вышло, обновляем статус
                if (context.state.timeLeft <= 0) {
                    await context.loadRoundData();
                } else {
                    // Обновляем только таймер для оптимизации
                    await context.updateTimerDisplay();
                }
            }
        }, 1000);
    };

    return {
        async init() {
            addEventListener(context.shadowRoot, 'click', (e) => {
                if (e.target.classList.contains('goose-image') ||
                    e.target.closest('.goose-image')) {
                    context._actions.handleTap();
                }
                if (e.target.classList.contains('back-btn')) {
                    context._actions.handleBack();
                }
            });

            // Добавляем обработчик для клавиши пробела
            addEventListener(document, 'keydown', (e) => {
                if (e.code === 'Space' && context.state.roundStatus === 'active') {
                    e.preventDefault();
                    context._actions.handleTap();
                }
            });

            startTimer();
        },

        async destroy() {
            eventListeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
            eventListeners = [];

            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
        }
    };
};