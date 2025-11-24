import { BaseComponent } from '../../base/base-component.mjs';
import * as template from './template/index.mjs';

export class StateManager extends BaseComponent {
    static observedAttributes = [];

    constructor() {
        super();
        this._templateMethods = template;
        this.state = {
            currentUser: null,
            rounds: [],
            currentRound: null
        };
    }

    async _componentReady() {
        // Проверяем авторизацию при загрузке
        await this.checkAuth();
        return true;
    }

    async checkAuth() {
        try {
            const apiService = await this.getComponentAsync('api-service', 'api-service');
            if (apiService && apiService.state.token) {
                const profile = await apiService.getProfile();
                this.state.currentUser = profile.user;
                return true;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.state.currentUser = null;
        }
        return false;
    }

    async login(username, password) {
        try {
            const apiService = await this.getComponentAsync('api-service', 'api-service');
            const result = await apiService.login(username, password);

            apiService.setToken(result.token);
            this.state.currentUser = result.user;

            return { success: true, user: result.user };
        } catch (error) {
            console.error('Login failed:', error);
            return {
                success: false,
                error: error.message || 'Login failed'
            };
        }
    }

    async logout() {
        try {
            const apiService = await this.getComponentAsync('api-service', 'api-service');
            await apiService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.state.currentUser = null;
        }
    }

    async getCurrentUser() {
        return this.state.currentUser;
    }

    async createRound() {
        try {
            const apiService = await this.getComponentAsync('api-service', 'api-service');
            const round = await apiService.createRound();

            // Добавляем раунд в локальное состояние
            this.state.rounds.unshift(round);

            return round;
        } catch (error) {
            console.error('Create round failed:', error);
            throw error;
        }
    }

    async getRounds() {
        try {
            const apiService = await this.getComponentAsync('api-service', 'api-service');
            const rounds = await apiService.getRounds();

            // Обновляем локальное состояние
            this.state.rounds = rounds;

            return rounds.map(round => ({
                ...round,
                status: this.calculateRoundStatus(round)
            }));
        } catch (error) {
            console.error('Get rounds failed:', error);
            throw error;
        }
    }

    async getRound(id) {
        try {
            const apiService = await this.getComponentAsync('api-service', 'api-service');
            const round = await apiService.getRound(id);

            // Обновляем статус раунда
            round.status = this.calculateRoundStatus(round);

            return round;
        } catch (error) {
            console.error('Get round failed:', error);
            throw error;
        }
    }

    async tapRound(roundId, userId) {
        try {
            const apiService = await this.getComponentAsync('api-service', 'api-service');
            const result = await apiService.tapRound(roundId);

            return result;
        } catch (error) {
            console.error('Tap failed:', error);
            throw error;
        }
    }

    calculateRoundStatus(round) {
        const now = new Date();
        const start = new Date(round.start_date);
        const end = new Date(round.end_date);

        if (now < start) return 'cooldown';
        if (now >= start && now <= end) return 'active';
        return 'finished';
    }

    generateId() {
        return 'id-' + Math.random().toString(36).substr(2, 9);
    }
}

if (!customElements.get('state-manager')) {
    customElements.define('state-manager', StateManager);
}