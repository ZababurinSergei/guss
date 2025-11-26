import type { User, Round, TapResult } from '../types';

class ApiService {
    private baseURL = '/api';
    private token: string | null = null;

    constructor() {
        this.token = localStorage.getItem('guss-token');
    }

    setToken(token: string): void {
        this.token = token;
        localStorage.setItem('guss-token', token);
    }

    removeToken(): void {
        this.token = null;
        localStorage.removeItem('guss-token');
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        if (options.headers) {
            Object.assign(headers, options.headers);
        }

        const config: RequestInit = {
            ...options,
            headers,
        };

        if ((options.method === 'POST' || options.method === 'PUT') && !options.body) {
            delete headers['Content-Type'];
        }

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                // Если 401 Unauthorized, удаляем токен
                if (response.status === 401) {
                    this.removeToken();
                }

                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async login(username: string, password: string): Promise<{ user: User; token: string }> {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    }

    async logout(): Promise<void> {
        try {
            await this.request('/auth/logout', {
                method: 'POST',
                body: JSON.stringify({}),
            });
        } catch (error) {
            console.error('Logout request failed:', error);
            // Всегда удаляем токен даже если запрос не удался
        } finally {
            this.removeToken();
        }
    }

    async getProfile(): Promise<{ user: User }> {
        return this.request('/auth/me');
    }

    async getRounds(): Promise<Round[]> {
        return this.request('/rounds');
    }

    async getRound(id: string): Promise<Round> {
        return this.request(`/rounds/${id}`);
    }

    async createRound(): Promise<Round> {
        return this.request('/rounds', {
            method: 'POST',
            body: JSON.stringify({}),
        });
    }

    async tapRound(roundId: string): Promise<TapResult> {
        return this.request(`/rounds/${roundId}/tap`, {
            method: 'POST',
            body: JSON.stringify({}),
        });
    }
}

export const apiService = new ApiService();