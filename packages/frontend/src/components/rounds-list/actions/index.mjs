// /11/public/components/rounds-list/actions/index.mjs
export async function createActions(context) {
    return {
        handleCreateRound: handleCreateRound.bind(context),
        handleRoundClick: handleRoundClick.bind(context),
        updateRoundCard: updateRoundCard.bind(context),
        retryLoading: retryLoading.bind(context)
    };
}

async function handleCreateRound() {
    try {
        const [stateManager, navigationManager] = await Promise.all([
            this.getComponentAsync('state-manager', 'state-manager'),
            this.getComponentAsync('navigation-manager', 'navigation-manager')
        ]);

        if (!stateManager || !navigationManager) {
            throw new Error('Required components not found');
        }

        const round = await stateManager.createRound();

        // Обновляем список раундов после создания
        await this.loadData();

        // Навигация к созданному раунду
        await navigationManager.navigateTo('round-page');

        // Сообщаем странице раунда о новом раунде
        const roundPage = await this.getComponentAsync('round-page', 'round-page');
        if (roundPage) {
            await roundPage.setRound(round.id);
        }

        console.log('✅ Round created successfully:', round.id);

    } catch (error) {
        console.error('❌ Create round error:', error);

        await this.showModal({
            title: 'Ошибка создания раунда',
            content: `Не удалось создать раунд: ${error.message}`,
            buttons: [{ text: 'OK', type: 'primary' }]
        });

        // Добавляем ошибку в хранилище
        this.addError({
            componentName: this.constructor.name,
            source: 'handleCreateRound',
            message: 'Failed to create round',
            details: error
        });
    }
}

async function handleRoundClick(roundId, roundElement) {
    try {
        // Получаем статус раунда из data-атрибута элемента
        const roundStatus = roundElement?.getAttribute('data-status');
        const isFinished = roundElement?.getAttribute('data-is-finished') === 'true';

        // Если раунд завершен - ничего не делаем
        if (roundStatus === 'finished' || isFinished) {
            console.log(`ℹ️ Round ${roundId} is finished, navigation blocked`);
            return;
        }

        // Получаем navigation manager
        const navigationManager = await this.getComponentAsync('navigation-manager', 'navigation-manager');

        if (!navigationManager) {
            throw new Error('Navigation manager not found');
        }

        console.log('------------------- round-page --------------------------')
        // Переходим на страницу раунда
        await navigationManager.navigateTo('round-page');

        // Получаем компонент round-page после навигации
        const roundPage = await this.getComponentAsync('round-page', 'round-page');

        if (!roundPage) {
            throw new Error('Round page component not available');
        }

        // Устанавливаем раунд для страницы
        await roundPage.setRound(roundId);

        console.log(`✅ Navigated to round: ${roundId} (status: ${roundStatus})`);

    } catch (error) {
        console.error('❌ Navigation error:', error);

        // Показываем пользователю сообщение об ошибке
        await this.showModal({
            title: 'Ошибка навигации',
            content: `Не удалось перейти к раунду: ${error.message}`,
            buttons: [{ text: 'OK', type: 'primary' }]
        });

        // Логируем ошибку
        this.addError({
            componentName: this.constructor.name,
            source: 'handleRoundClick',
            message: `Failed to navigate to round ${roundId}`,
            details: {
                error: error.message,
                roundId: roundId,
                roundStatus: roundElement?.getAttribute('data-status')
            }
        });
    }
}

// Оптимизированное обновление карточки раунда
async function updateRoundCard(roundId, roundData) {
    const roundCard = this.shadowRoot.querySelector(`[data-round-id="${roundId}"]`);
    if (!roundCard) {
        console.warn(`Round card not found for ID: ${roundId}`);
        return false;
    }

    try {
        // Обновляем основные атрибуты
        await this.updateElement({
            selector: `[data-round-id="${roundId}"]`,
            value: roundData.status,
            property: 'data-status'
        });

        await this.updateElement({
            selector: `[data-round-id="${roundId}"]`,
            value: roundData.is_upcoming,
            property: 'data-is-upcoming'
        });

        await this.updateElement({
            selector: `[data-round-id="${roundId}"]`,
            value: roundData.is_active,
            property: 'data-is-active'
        });

        await this.updateElement({
            selector: `[data-round-id="${roundId}"]`,
            value: roundData.is_finished,
            property: 'data-is-finished'
        });

        await this.updateElement({
            selector: `[data-round-id="${roundId}"]`,
            value: roundData.start_timestamp,
            property: 'data-start-timestamp'
        });

        // Обновляем статус
        const statusClass = getStatusClass(roundData.status);
        const statusText = getStatusText(roundData.status);
        const statusIcon = getStatusIcon(roundData.status);

        await this.updateElement({
            selector: `[data-round-id="${roundId}"] .round-status`,
            value: `${statusIcon} ${statusText}`,
            property: 'textContent'
        });

        await this.updateElement({
            selector: `[data-round-id="${roundId}"] .round-status`,
            value: `round-status ${statusClass}`,
            property: 'className'
        });

        // Обновляем даты
        const startDate = new Date(roundData.start_date);
        const endDate = new Date(roundData.end_date);

        await this.updateElement({
            selector: `[data-round-id="${roundId}"] .start-date-value`,
            value: formatDateTime(startDate),
            property: 'textContent'
        });

        await this.updateElement({
            selector: `[data-round-id="${roundId}"] .end-date-value`,
            value: formatDateTime(endDate),
            property: 'textContent'
        });

        // Обновляем статистику
        await this.updateElement({
            selector: `[data-round-id="${roundId}"] .stat-value`,
            value: roundData.total_score || 0,
            property: 'textContent'
        });

        // Обновляем счетчик до начала
        if (roundData.time_until_start > 0) {
            const countdownElement = this.shadowRoot.querySelector(`[data-round-id="${roundId}"] .countdown`);
            if (countdownElement) {
                await this.updateElement({
                    selector: `[data-round-id="${roundId}"] .countdown`,
                    value: formatCountdown(roundData.time_until_start),
                    property: 'textContent'
                });
            }
        }

        // Обновляем длительность
        await this.updateElement({
            selector: `[data-round-id="${roundId}"] .round-duration`,
            value: `${roundData.duration} сек`,
            property: 'textContent'
        });

        console.log(`✅ Round card ${roundId} updated efficiently`);
        return true;

    } catch (error) {
        console.error(`❌ Error updating round card ${roundId}:`, error);

        this.addError({
            componentName: this.constructor.name,
            source: 'updateRoundCard',
            message: `Failed to update round card ${roundId}`,
            details: error
        });

        return false;
    }
}

async function retryLoading() {
    try {
        this.state.loading = true;
        this.state.error = null;
        await this.fullRender(this.state);

        await this.loadData();
        await this.fullRender(this.state);

        console.log('✅ Data reloaded successfully');

    } catch (error) {
        console.error('❌ Retry loading error:', error);

        this.state.error = error.message || 'Ошибка при повторной загрузке';
        await this.fullRender(this.state);

        this.addError({
            componentName: this.constructor.name,
            source: 'retryLoading',
            message: 'Failed to retry loading',
            details: error
        });
    }
}

// Вспомогательные функции
function getStatusText(status) {
    const statusMap = {
        'cooldown': 'Cooldown',
        'active': 'Активен',
        'finished': 'Завершен'
    };
    return statusMap[status] || status;
}

function getStatusClass(status) {
    const classMap = {
        'cooldown': 'status-cooldown',
        'active': 'status-active',
        'finished': 'status-finished'
    };
    return classMap[status] || '';
}

function getStatusIcon(status) {
    const iconMap = {
        'cooldown': '⏱️',
        'active': '🎯',
        'finished': '✅'
    };
    return iconMap[status] || '●';
}

function formatDateTime(date) {
    return date.toLocaleDateString('ru-RU') + ' ' +
        date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
}

function formatCountdown(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}ч ${minutes}м`;
    } else if (minutes > 0) {
        return `${minutes}м ${secs}с`;
    } else {
        return `${secs}с`;
    }
}