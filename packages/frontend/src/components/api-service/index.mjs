import { BaseComponent } from '../../base/base-component.mjs';
import * as template from './template/index.mjs';

export class ApiService extends BaseComponent {
    static observedAttributes = [];

    constructor() {
        super();
        this._templateMethods = template;
        this.state = {
            baseURL: 'http://localhost:3012/api',
            token: null
        };
    }

    async _componentReady() {
        // Восстанавливаем токен из localStorage
        this.state.token = localStorage.getItem('guss-token');
        return true;
    }

    setToken(token) {
        this.state.token = token;
        localStorage.setItem('guss-token', token);
    }

    removeToken() {
        this.state.token = null;
        localStorage.removeItem('guss-token');
    }
    async request(endpoint, options = {}) {
        const url = `${this.state.baseURL}${endpoint}`;

        // Базовые заголовки
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        const config = {
            headers,
            ...options
        };

        // Добавляем токен авторизации
        if (this.state.token) {
            config.headers.Authorization = `Bearer ${this.state.token}`;
        }

        // Убираем Content-Type если тело отсутствует
        if (!options.body && options.method === 'POST') {
            delete config.headers['Content-Type'];
        }

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Методы для конкретных API endpoints
    async login(username, password) {
        return await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    }

    async logout() {
        try {
            // Отправляем POST запрос с пустым телом
            await this.request('/auth/logout', {
                method: 'POST',
                body: JSON.stringify({}) // Пустой объект вместо null
            });
        } finally {
            this.removeToken();
        }
    }

    async getProfile() {
        return await this.request('/auth/me');
    }

    async getRounds() {
        return await this.request('/rounds');
    }

    async getRound(id) {
        return await this.request(`/rounds/${id}`);
    }

    async createRound() {
        return await this.request('/rounds', {
            method: 'POST'
        });
    }

    async tapRound(roundId) {
        return await this.request(`/rounds/${roundId}/tap`, {
            method: 'POST'
        });
    }
}

if (!customElements.get('api-service')) {
    customElements.define('api-service', ApiService);
}