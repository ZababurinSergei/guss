// /11/public/components/rounds-list/controller/index.mjs
export const controller = (context) => {
    let eventListeners = [];
    let refreshInterval = null;
    let countdownIntervals = new Map();

    const addEventListener = (element, event, handler) => {
        element.addEventListener(event, handler);
        eventListeners.push({ element, event, handler });
    };

    // Функция для обновления обратного отсчета
    const updateCountdowns = () => {
        const now = Date.now();
        const countdownElements = context.shadowRoot.querySelectorAll('.countdown');

        countdownElements.forEach(element => {
            const roundCard = element.closest('.round-card');
            if (!roundCard) return;

            const startTimestamp = parseInt(roundCard.getAttribute('data-start-timestamp'));
            const timeUntilStart = Math.max(0, startTimestamp - now);

            if (timeUntilStart > 0) {
                const seconds = Math.floor(timeUntilStart / 1000);
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                const secs = seconds % 60;

                let countdownText = '';
                if (hours > 0) {
                    countdownText = `${hours}ч ${minutes.toString().padStart(2, '0')}м`;
                } else if (minutes > 0) {
                    countdownText = `${minutes}м ${secs.toString().padStart(2, '0')}с`;
                } else {
                    countdownText = `${secs}с`;
                }

                element.textContent = countdownText;

                // Добавляем анимацию для последних 10 секунд
                if (seconds <= 10) {
                    element.classList.add('countdown-critical');
                } else {
                    element.classList.remove('countdown-critical');
                }
            } else {
                element.textContent = 'Начался!';
                element.classList.add('countdown-finished');

                // Обновляем статус карточки
                roundCard.setAttribute('data-is-upcoming', 'false');
                roundCard.setAttribute('data-is-active', 'true');

                const statusElement = roundCard.querySelector('.round-status');
                if (statusElement) {
                    statusElement.className = 'round-status status-active';
                    statusElement.innerHTML = '🎯 Активен';
                }
            }
        });
    };

    // Запуск обновления обратных отсчетов
    const startCountdownUpdates = () => {
        // Очищаем предыдущие интервалы
        countdownIntervals.forEach(interval => clearInterval(interval));
        countdownIntervals.clear();

        // Запускаем обновление каждую секунду
        const intervalId = setInterval(updateCountdowns, 1000);
        countdownIntervals.set('main', intervalId);

        // Первоначальное обновление
        updateCountdowns();
    };

    // Обработчик для создания раунда
    const handleCreateRound = async (e) => {
        e.stopPropagation();

        try {
            await context._actions.handleCreateRound();

            // Показываем уведомление об успешном создании
            const notification = document.createElement('div');
            notification.className = 'create-round-notification';
            notification.innerHTML = `
                <div class="notification-content">
                    <span class="notification-icon">✅</span>
                    <span class="notification-text">Новый раунд создан успешно!</span>
                </div>
            `;

            context.shadowRoot.appendChild(notification);

            // Автоматически скрываем уведомление через 3 секунды
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);

        } catch (error) {
            console.error('Error creating round:', error);
        }
    };

    // Обработчик для клика по карточке раунда
    const handleRoundCardClick = async (e) => {
        const roundCard = e.target.closest('.round-card');
        if (!roundCard) return;

        const roundId = roundCard.getAttribute('data-round-id');
        if (!roundId) return;

        // Добавляем визуальную обратную связь
        roundCard.classList.add('round-card-clicked');
        setTimeout(() => {
            roundCard.classList.remove('round-card-clicked');
        }, 200);

        try {
            await context._actions.handleRoundClick(roundId);
        } catch (error) {
            console.error('Error navigating to round:', error);
        }
    };

    // Обработчик для кнопки повторной попытки
    const handleRetryClick = async (e) => {
        if (e.target.classList.contains('retry-btn')) {
            e.stopPropagation();

            // Показываем состояние загрузки
            const errorState = e.target.closest('.error-state');
            if (errorState) {
                errorState.innerHTML = `
                    <div class="loading-state">
                        <div class="spinner"></div>
                        <span>Повторная попытка...</span>
                    </div>
                `;
            }

            try {
                await context.loadData();
            } catch (error) {
                console.error('Retry failed:', error);
            }
        }
    };

    // Обработчик для обновления по видимости страницы
    const handleVisibilityChange = () => {
        if (document.hidden) {
            // Страница не видна - приостанавливаем обновления
            if (refreshInterval) {
                clearInterval(refreshInterval);
                refreshInterval = null;
            }
            countdownIntervals.forEach(interval => clearInterval(interval));
            countdownIntervals.clear();
        } else {
            // Страница снова видна - возобновляем обновления
            if (context.state.pollingEnabled) {
                context.startPolling();
            }
            startCountdownUpdates();
        }
    };

    // Обработчик для клавиатуры
    const handleKeyPress = (e) => {
        // Escape для возврата к списку раундов (если реализовано где-то еще)
        if (e.key === 'Escape') {
            // Можно добавить логику возврата
        }

        // Enter для выбора активной карточки
        if (e.key === 'Enter') {
            const activeElement = context.shadowRoot.activeElement;
            if (activeElement && activeElement.classList.contains('round-card')) {
                handleRoundCardClick({ target: activeElement });
            }
        }
    };

    return {
        async init() {
            // Обработчики для кнопок и карточек
            addEventListener(context.shadowRoot, 'click', (e) => {
                if (e.target.classList.contains('create-round-btn') ||
                    e.target.closest('.create-round-btn')) {
                    handleCreateRound(e);
                }
                else if (e.target.classList.contains('round-card') ||
                    e.target.closest('.round-card')) {
                    handleRoundCardClick(e);
                }
                else if (e.target.classList.contains('retry-btn')) {
                    handleRetryClick(e);
                }
            });

            // Обработчик для клавиатуры
            addEventListener(document, 'keydown', handleKeyPress);

            // Обработчик изменения видимости страницы
            addEventListener(document, 'visibilitychange', handleVisibilityChange);

            // Обработчик онлайн/офлайн статуса
            addEventListener(window, 'online', () => {
                console.log('🟢 Online - resuming updates');
                if (context.state.pollingEnabled) {
                    context.startPolling();
                }
            });

            addEventListener(window, 'offline', () => {
                console.log('🔴 Offline - pausing updates');
                context.stopPolling();
            });

            // Запускаем обновление обратных отсчетов
            startCountdownUpdates();

            // Добавляем стили для уведомлений
            const style = document.createElement('style');
            style.textContent = `
                .create-round-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--success);
                    color: white;
                    padding: var(--space) var(--space-lg);
                    border-radius: var(--radius);
                    box-shadow: var(--shadow-lg);
                    z-index: 1000;
                    animation: slideInRight 0.3s ease-out;
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                }
                
                .notification-icon {
                    font-size: 1.2em;
                }
                
                .notification-text {
                    font-weight: 500;
                }
                
                .round-card-clicked {
                    transform: scale(0.98) !important;
                    box-shadow: var(--shadow-sm) !important;
                }
                
                .countdown-critical {
                    color: var(--danger) !important;
                    font-weight: 700;
                    animation: pulse 0.5s infinite alternate;
                }
                
                .countdown-finished {
                    color: var(--success) !important;
                    font-weight: 700;
                }
                
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes pulse {
                    from { opacity: 1; }
                    to { opacity: 0.5; }
                }
                
                /* Улучшенные стили для состояний */
                .round-card[data-is-active="true"] {
                    border-left: 4px solid var(--success);
                    background: linear-gradient(90deg, var(--success-10) 0%, transparent 100%);
                }
                
                .round-card[data-is-upcoming="true"] {
                    border-left: 4px solid var(--warning);
                    background: linear-gradient(90deg, var(--warning-10) 0%, transparent 100%);
                }
                
                .round-card[data-is-finished="true"] {
                    border-left: 4px solid var(--surface-300);
                    background: linear-gradient(90deg, var(--surface-100) 0%, transparent 100%);
                }
            `;

            if (!context.shadowRoot.querySelector('#dynamic-styles')) {
                style.id = 'dynamic-styles';
                context.shadowRoot.appendChild(style);
            }

            console.log('✅ RoundsList controller initialized');
        },

        async destroy() {
            // Очищаем все обработчики событий
            eventListeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
            eventListeners = [];

            // Останавливаем интервалы
            if (refreshInterval) {
                clearInterval(refreshInterval);
                refreshInterval = null;
            }

            countdownIntervals.forEach(interval => clearInterval(interval));
            countdownIntervals.clear();

            // Удаляем динамические стили
            const dynamicStyles = context.shadowRoot.querySelector('#dynamic-styles');
            if (dynamicStyles) {
                dynamicStyles.remove();
            }

            // Удаляем обработчики видимости
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('online', handleVisibilityChange);
            window.removeEventListener('offline', handleVisibilityChange);
            document.removeEventListener('keydown', handleKeyPress);

            console.log('✅ RoundsList controller destroyed');
        }
    };
};