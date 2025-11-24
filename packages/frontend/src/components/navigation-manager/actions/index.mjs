export async function createActions(context) {
    return {
        handleNavigation: handleNavigation.bind(context),
        handleUserUpdate: handleUserUpdate.bind(context),
        handleLogout: handleLogout.bind(context),
        handleStorageChange: handleStorageChange.bind(context),
        handlePostMessage: handlePostMessage.bind(context),
        stopAllComponents: stopAllComponents.bind(context)
    };
}

async function handleNavigation(page) {
    this.state.currentPage = page;
    await this.fullRender(this.state);
}

async function handleUserUpdate(user) {
    this.state.user = user;
    await this.fullRender(this.state);
}

async function handleLogout() {
    try {
        console.log('🔄 Initiating logout process...');
        let confirmed = false;

        // Показываем подтверждение выхода
        await this.showModal({
            title: 'Подтверждение выхода',
            content: 'Вы уверены, что хотите выйти из системы?',
            buttons: [
                {
                    text: 'Отмена',
                    type: 'secondary',
                    action: () => console.log('Logout cancelled')
                },
                {
                    text: 'Выйти',
                    type: 'primary',
                    action: () => (console.log('Logout confirmed'), confirmed = true)
                }
            ]
        });

        console.log('--------------------------------', confirmed);
        if (!confirmed) {
            console.log('❌ Logout cancelled by user');
            return;
        }

        // Останавливаем все обновления перед выходом
        await this.stopAllComponents();

        const stateManager = await this.getComponentAsync('state-manager', 'state-manager');
        if (stateManager) {
            console.log('🔐 Calling state manager logout...');
            await stateManager.logout();

            // Сбрасываем состояние
            this.state.user = null;
            this.state.currentPage = 'login';

            // Обновляем интерфейс
            await this.fullRender(this.state);

            console.log('✅ Logout completed successfully');

            // Показываем уведомление об успешном выходе
            // await this.showModal({
            //     title: 'Выход выполнен',
            //     content: 'Вы успешно вышли из системы.',
            //     buttons: [{
            //         text: 'OK',
            //         type: 'primary'
            //     }]
            // });
        } else {
            console.error('❌ State manager not found during logout');
            throw new Error('State manager not available');
        }
    } catch (error) {
        console.error('❌ Logout error:', error);

        // Показываем ошибку пользователю
        await this.showModal({
            title: 'Ошибка выхода',
            content: `Не удалось выйти из системы: ${error.message}`,
            buttons: [{
                text: 'OK',
                type: 'primary'
            }]
        });
    }
}

async function handleStorageChange(event) {
    if (event.key === 'guss-user' && !event.newValue) {
        // Пользователь удален из localStorage - выполняем выход
        console.log('🔄 Storage change detected - logging out');
        await this.handleLogout();
    }
}

async function handlePostMessage(message) {
    console.log('📨 Navigation manager received message:', message);

    if (message.type === 'LOGOUT_REQUEST') {
        await this.handleLogout();
    }

    if (message.type === 'NAVIGATE_TO') {
        await this.navigateTo(message.payload.page);
    }

    if (message.type === 'USER_UPDATED') {
        await this.setUser(message.payload.user);
    }
}

// Новый метод для остановки всех компонентов
async function stopAllComponents() {
    try {
        // Останавливаем rounds-list
        const roundsList = await this.getComponentAsync('rounds-list', 'rounds-list');
        if (roundsList && roundsList.stopRefreshing) {
            roundsList.stopRefreshing();
            console.log('✅ Rounds list refreshing stopped');
        }

        // Останавливаем round-page если активен
        // const roundPage = await this.getComponentAsync('round-page', 'round-page');
        // if (roundPage && roundPage.stopRefreshing) {
        //     roundPage.stopRefreshing();
        //     console.log('✅ Round page refreshing stopped');
        // }

        console.log('✅ All components stopped');
    } catch (error) {
        console.error('Error stopping components:', error);
    }
}