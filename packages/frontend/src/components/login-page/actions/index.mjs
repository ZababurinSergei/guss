export async function createActions(context) {
    return {
        handleSubmit: handleSubmit.bind(context)
    };
}

async function handleSubmit(formData) {
    const username = formData.get('username');
    const password = formData.get('password');

    if (!username || !password) {
        this.state.error = 'Заполните все поля';
        await this.fullRender(this.state);
        return;
    }

    this.state.loading = true;
    this.state.error = null;
    await this.fullRender(this.state);

    try {
        const stateManager = await this.getComponentAsync('state-manager', 'state-manager');
        const navigationManager = await this.getComponentAsync('navigation-manager', 'navigation-manager');

        if (stateManager && navigationManager) {
            const result = await stateManager.login(username, password);

            if (result.success) {
                await navigationManager.setUser(result.user);
                await navigationManager.navigateTo('rounds-list');
            } else {
                this.state.error = result.error;
                this.state.loading = false;
                await this.fullRender(this.state);
            }
        }
    } catch (error) {
        this.state.error = error.message || 'Ошибка входа';
        this.state.loading = false;
        await this.fullRender(this.state);
    }
}