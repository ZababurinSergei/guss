// /11/public/components/rounds-list/index.mjs
import { BaseComponent } from '../../base/base-component.mjs';
import * as template from './template/index.mjs';
import { controller } from './controller/index.mjs';
import { createActions } from './actions/index.mjs';

export class RoundsList extends BaseComponent {
    static observedAttributes = [];

    constructor() {
        super();
        this._templateMethods = template;
        this.state = {
            rounds: [],
            loading: true,
            user: null,
            error: null,
            lastUpdate: null,
            pollingEnabled: true
        };

        this._pollingInterval = null;
        this._previousRoundsState = new Map();
        this._pollingTimeout = 10000; // 10 секунд
        this._maxPollingTimeout = 60000; // 1 минута максимум
    }

    async _componentReady() {
        this._controller = await controller(this);
        this._actions = await createActions(this);

        await this.loadData();
        await this.startPolling();
        await this.fullRender(this.state);

        return true;
    }

    async loadData() {
        try {
            const [stateManager, navigationManager] = await Promise.all([
                this.getComponentAsync('state-manager', 'state-manager'),
                this.getComponentAsync('navigation-manager', 'navigation-manager')
            ]);

            if (!stateManager || !navigationManager) {
                throw new Error('Required services not available');
            }

            this.state.user = await stateManager.getCurrentUser();

            if (!this.state.user) {
                await navigationManager.navigateTo('login');
                return;
            }

            const rounds = await stateManager.getRounds();
            this._updatePreviousState(rounds);
            this.state.rounds = this._enrichRoundsData(rounds);
            this.state.lastUpdate = new Date();
            this.state.error = null;

        } catch (error) {
            console.error('❌ Data loading error:', error);
            this.state.error = error.message || 'Ошибка загрузки раундов';

            if (error.message.includes('Authentication') || error.message.includes('token')) {
                const navigationManager = await this.getComponentAsync('navigation-manager', 'navigation-manager');
                if (navigationManager) {
                    await navigationManager.navigateTo('login');
                }
            }
        } finally {
            this.state.loading = false;
        }
    }

    // Long polling для обновления раундов
    async startPolling() {
        if (!this.state.pollingEnabled) return;

        const poll = async () => {
            if (!this.state.pollingEnabled || !this.state.user) {
                this.stopPolling();
                return;
            }

            try {
                await this.refreshRounds();
            } catch (error) {
                console.error('❌ Polling error:', error);

                // Увеличиваем таймаут при ошибках
                this._pollingTimeout = Math.min(
                    this._pollingTimeout * 1.5,
                    this._maxPollingTimeout
                );
            }

            if (this.state.pollingEnabled) {
                this._pollingInterval = setTimeout(poll, this._pollingTimeout);
            }
        };

        this._pollingInterval = setTimeout(poll, this._pollingTimeout);
    }

    async refreshRounds() {
        const stateManager = await this.getComponentAsync('state-manager', 'state-manager');

        if (!stateManager || !stateManager.state.currentUser) {
            console.log('👋 User logged out, stopping polling');
            this.stopPolling();
            return;
        }

        try {
            const rounds = await stateManager.getRounds();
            const enrichedRounds = this._enrichRoundsData(rounds);

            // Проверяем все типы изменений: новые раунды, измененные и удаленные
            const { newRounds, changedRounds, removedRounds } = this._getAllChanges(enrichedRounds);

            console.log('🔄 Rounds update analysis:', {
                total: enrichedRounds.length,
                new: newRounds.length,
                changed: changedRounds.length,
                removed: removedRounds.length
            });

            let hasChanges = false;

            // Обрабатываем новые раунды
            if (newRounds.length > 0) {
                console.log(`🆕 Adding ${newRounds.length} new rounds`);

                // Добавляем новые раунды в состояние
                this.state.rounds = [...this.state.rounds, ...newRounds];
                hasChanges = true;

                // Если есть новые upcoming раунды, логируем их
                const upcomingRounds = newRounds.filter(round => round.is_upcoming);
                if (upcomingRounds.length > 0) {
                    console.log(`⏰ New upcoming rounds:`, upcomingRounds.map(r => ({
                        id: r.id,
                        start: r.start_date,
                        status: r.status
                    })));
                }
            }

            // Обрабатываем измененные раунды
            if (changedRounds.length > 0) {
                console.log(`📝 Updating ${changedRounds.length} changed rounds`);

                for (const round of changedRounds) {
                    await this._actions.updateRoundCard(round.id, round);

                    // Обновляем раунд в состоянии
                    const index = this.state.rounds.findIndex(r => r.id === round.id);
                    if (index !== -1) {
                        this.state.rounds[index] = round;
                    }
                }
                hasChanges = true;
            }

            // Обрабатываем удаленные раунды
            if (removedRounds.length > 0) {
                console.log(`🗑️ Removing ${removedRounds.length} rounds`);

                // Удаляем карточки из DOM
                for (const roundId of removedRounds) {
                    const roundCard = this.shadowRoot.querySelector(`[data-round-id="${roundId}"]`);
                    if (roundCard) {
                        roundCard.remove();
                    }
                }

                // Обновляем состояние
                this.state.rounds = this.state.rounds.filter(round =>
                    !removedRounds.includes(round.id)
                );
                hasChanges = true;
            }

            // Если есть любые изменения, обновляем состояние и время
            if (hasChanges) {
                // Сортируем раунды: активные -> upcoming -> завершенные
                this.state.rounds = this._sortRounds(this.state.rounds);
                this.state.lastUpdate = new Date();

                // Полный ререндер если есть новые или удаленные раунды
                if (newRounds.length > 0 || removedRounds.length > 0) {
                    console.log('🎨 Full re-render due to structural changes');
                    await this.fullRender(this.state);
                }

                // Уменьшаем таймаут при активных изменениях
                this._pollingTimeout = Math.max(5000, this._pollingTimeout * 0.8);
                console.log(`⏱️ Polling timeout decreased to: ${this._pollingTimeout}ms`);
            } else {
                // Увеличиваем таймаут если изменений нет
                this._pollingTimeout = Math.min(
                    this._pollingTimeout * 1.1,
                    this._maxPollingTimeout
                );
                console.log(`⏱️ No changes, polling timeout increased to: ${this._pollingTimeout}ms`);
            }

            // Всегда обновляем предыдущее состояние
            this._updatePreviousState(enrichedRounds);

        } catch (error) {
            console.error('❌ Rounds refresh error:', error);
            throw error;
        }
    }

    // Новый метод для анализа всех типов изменений
    _getAllChanges(newRounds) {
        const currentRoundIds = new Set(this.state.rounds.map(r => r.id));
        const newRoundIds = new Set(newRounds.map(r => r.id));

        // Новые раунды (есть в новых данных, но нет в текущих)
        const newRoundsList = newRounds.filter(round => !currentRoundIds.has(round.id));

        // Удаленные раунды (есть в текущих данных, но нет в новых)
        const removedRounds = Array.from(currentRoundIds).filter(id => !newRoundIds.has(id));

        // Измененные раунды (есть в обоих наборах, но данные изменились)
        const changedRounds = newRounds.filter(newRound => {
            if (currentRoundIds.has(newRound.id)) {
                const currentRound = this.state.rounds.find(r => r.id === newRound.id);
                return this._hasRoundChanged(currentRound, newRound);
            }
            return false;
        });

        return {
            newRounds: newRoundsList,
            changedRounds,
            removedRounds
        };
    }

    // Метод для проверки изменений в раунде
    _hasRoundChanged(oldRound, newRound) {
        if (!oldRound || !newRound) return true;

        return (
            oldRound.status !== newRound.status ||
            oldRound.start_date !== newRound.start_date ||
            oldRound.end_date !== newRound.end_date ||
            oldRound.total_score !== newRound.total_score ||
            JSON.stringify(oldRound.participants) !== JSON.stringify(newRound.participants) ||
            JSON.stringify(oldRound.winner) !== JSON.stringify(newRound.winner)
        );
    }

    // Метод для сортировки раундов
    _sortRounds(rounds) {
        return rounds.sort((a, b) => {
            // Сначала активные раунды
            if (a.status === 'active' && b.status !== 'active') return -1;
            if (b.status === 'active' && a.status !== 'active') return 1;

            // Затем upcoming (cooldown) раунды
            if (a.status === 'cooldown' && b.status !== 'cooldown') return -1;
            if (b.status === 'cooldown' && a.status !== 'cooldown') return 1;

            // Затем по дате начала (новые сначала)
            return new Date(b.start_date) - new Date(a.start_date);
        });
    }

    // Обновленный метод обогащения данных
    _enrichRoundsData(rounds) {
        return rounds.map(round => {
            const startDate = new Date(round.start_date);
            const endDate = new Date(round.end_date);
            const now = new Date();

            const startTimestamp = startDate.getTime();
            const endTimestamp = endDate.getTime();
            const duration = Math.round((endTimestamp - startTimestamp) / 1000);
            const timeUntilStart = Math.max(0, Math.round((startTimestamp - now.getTime()) / 1000));
            const isUpcoming = startDate > now && round.status === 'cooldown';
            const isActive = round.status === 'active';
            const isFinished = round.status === 'finished';

            return {
                ...round,
                start_timestamp: startTimestamp,
                end_timestamp: endTimestamp,
                duration: duration,
                time_until_start: timeUntilStart,
                is_upcoming: isUpcoming,
                is_active: isActive,
                is_finished: isFinished,
                // Добавляем timestamp для отслеживания времени получения данных
                _last_updated: Date.now()
            };
        });
    }

    // Обновленный метод для обновления предыдущего состояния
    _updatePreviousState(rounds) {
        this._previousRoundsState.clear();
        rounds.forEach(round => {
            this._previousRoundsState.set(round.id, {
                status: round.status,
                start_date: round.start_date,
                end_date: round.end_date,
                total_score: round.total_score,
                participants: round.participants ? [...round.participants] : [],
                winner: round.winner ? { ...round.winner } : null,
                _hash: this._createRoundHash(round) // Хэш для быстрого сравнения
            });
        });
    }

    // Вспомогательный метод для создания хэша раунда
    _createRoundHash(round) {
        const data = {
            status: round.status,
            start_date: round.start_date,
            end_date: round.end_date,
            total_score: round.total_score,
            participants: round.participants,
            winner: round.winner
        };
        return JSON.stringify(data);
    }

    // Управление polling
    stopPolling() {
        this.state.pollingEnabled = false;

        if (this._pollingInterval) {
            clearTimeout(this._pollingInterval);
            this._pollingInterval = null;
        }
    }

    resumePolling() {
        if (!this.state.pollingEnabled) {
            this.state.pollingEnabled = true;
            this.startPolling();
        }
    }

    // Метод для повторной загрузки при ошибках
    async retryLoading() {
        this.state.loading = true;
        this.state.error = null;
        await this.fullRender(this.state);
        await this.loadData();
    }

    // Публичные методы для управления состоянием
    async setPollingTimeout(timeout) {
        this._pollingTimeout = Math.min(timeout, this._maxPollingTimeout);

        if (this.state.pollingEnabled) {
            this.stopPolling();
            this.startPolling();
        }
    }

    getPollingStatus() {
        return {
            enabled: this.state.pollingEnabled,
            timeout: this._pollingTimeout,
            lastUpdate: this.state.lastUpdate,
            roundsCount: this.state.rounds.length
        };
    }

    // Очистка ресурсов
    async disconnectedCallback() {
        this.stopPolling();

        if (this._controller && this._controller.destroy) {
            await this._controller.destroy();
        }

        await super.disconnectedCallback();
    }
}

if (!customElements.get('rounds-list')) {
    customElements.define('rounds-list', RoundsList);
}