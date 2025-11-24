export async function createActions(context) {
    return {
        handleTap: handleTap.bind(context),
        handleBack: handleBack.bind(context),
        handleKeyPress: handleKeyPress.bind(context)
    };
}

async function handleTap() {
    if (this.state.roundStatus !== 'active' || this.state.isTapping) return;

    this.state.isTapping = true;

    try {
        const stateManager = await this.getComponentAsync('state-manager', 'state-manager');
        if (stateManager && this.state.user) {
            const result = await stateManager.tapRound(this.state.roundId, this.state.user.id);

            // Обновляем статистику
            this.state.userStats = {
                tap_count: result.tap_count,
                score: result.score
            };

            // Обновляем общий счет раунда
            if (this.state.round) {
                this.state.round.total_score = result.total_score;
            }

            // Визуальная обратная связь
            await this.showTapFeedback();

            // Обновляем отображение счета
            await this.updateElement({
                selector: '.user-score',
                value: `Мои очки - ${this.state.userStats.score}`,
                property: 'textContent'
            });

            // Если был специальный тап, показываем уведомление
            if (result.is_special_tap) {
                await this.showSpecialTapNotification();
            }
        }
    } catch (error) {
        console.error('Ошибка тапа:', error);

        // Если раунд завершился, обновляем данные
        if (error.message.includes('not active')) {
            await this.loadRoundData();
        } else {
            await this.showModal({
                title: 'Ошибка',
                content: `Не удалось обработать тап: ${error.message}`,
                buttons: [{ text: 'OK', type: 'primary' }]
            });
        }
    } finally {
        this.state.isTapping = false;
    }
}

async function handleBack() {
    const navigationManager = await this.getComponentAsync('navigation-manager', 'navigation-manager');
    if (navigationManager) {
        await navigationManager.navigateTo('rounds-list');
    }
}

async function handleKeyPress(event) {
    // Обработка нажатия пробела для тапов
    if (event.code === 'Space' && this.state.roundStatus === 'active') {
        event.preventDefault();
        await this.handleTap();
    }

    // Обработка Escape для возврата назад
    if (event.code === 'Escape') {
        await this.handleBack();
    }
}