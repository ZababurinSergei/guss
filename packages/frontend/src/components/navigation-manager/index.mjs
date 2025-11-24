import { BaseComponent } from '../../base/base-component.mjs';
import * as template from './template/index.mjs';
import { controller } from './controller/index.mjs';
import { createActions } from './actions/index.mjs';

export class NavigationManager extends BaseComponent {
    static observedAttributes = ['current-page', 'user'];

    constructor() {
        super();
        this._templateMethods = template;
        this.state = {
            currentPage: 'login',
            user: null
        };
    }

    async _componentReady() {
        this._controller = await controller(this);
        this._actions = await createActions(this);

        // Проверяем авторизацию при загрузке
        await this.checkAuth();

        await this.fullRender(this.state);
        return true;
    }

    async checkAuth() {
        const stateManager = await this.getComponentAsync('state-manager', 'state-manager');
        if (stateManager) {
            const user = await stateManager.getCurrentUser();
            if (user) {
                this.state.user = user;
                this.state.currentPage = 'rounds-list';
                console.log('✅ User authenticated:', user.username);
            } else {
                console.log('🔐 No authenticated user found');
            }
        }
    }

    async _componentAttributeChanged(name, oldValue, newValue) {
        if (name === 'current-page' && newValue !== oldValue) {
            this.state.currentPage = newValue;
            await this.fullRender(this.state);
        }
    }

    async navigateTo(page) {
        if (this.state.currentPage !== page) {
            this.state.currentPage = page;
            await this.fullRender(this.state);
            console.log('🧭 Navigated to:', page);
        }
    }

    async setUser(user) {
        this.state.user = user;
        await this.fullRender(this.state);
        console.log('👤 User updated:', user?.username || 'null');
    }

    // Публичный метод для выхода (можно вызывать из других компонентов)
    async logout() {
        await this._actions.handleLogout();
    }

    // Новый метод для остановки всех компонентов
    async stopAllComponents() {
        // Делегируем вызов actions
        await this._actions.stopAllComponents();
    }
}

if (!customElements.get('navigation-manager')) {
    customElements.define('navigation-manager', NavigationManager);
}