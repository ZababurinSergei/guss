import { BaseComponent } from '../../base/base-component.mjs';
import * as template from './template/index.mjs';
import { controller } from './controller/index.mjs';
import { createActions } from './actions/index.mjs';
import { createLogger } from "../../modules/index.mjs";

const log = createLogger('round-page')

export class RoundPage extends BaseComponent {
    static observedAttributes = [];

    constructor() {
        super();
        this._templateMethods = template;
        this.state = {
            round: null,
            user: null,
            userStats: null,
            timeLeft: 0,
            roundStatus: 'loading',
            error: null,
            roundId: null,
            isTapping: false
        };

        // Привязываем методы к контексту
        this.updateTimerDisplay = this.updateTimerDisplay.bind(this);
        this.getTimerText = this.getTimerText.bind(this);
        this.formatTime = this.formatTime.bind(this);
    }

    async _componentReady() {
        this._controller = await controller(this);
        this._actions = await createActions(this);

        const stateManager = await this.getComponentAsync('state-manager', 'state-manager');
        if (stateManager) {
            this.state.user = await stateManager.getCurrentUser();
        }

        return true;
    }

    async setRound(roundId) {
        this.state.roundId = roundId;
        await this.loadRoundData();
    }

    async loadRoundData() {
        if (!this.state.roundId) return;

        try {
            const stateManager = await this.getComponentAsync('state-manager', 'state-manager');
            if (stateManager) {
                this.state.round = await stateManager.getRound(this.state.roundId);
                await this.updateRoundStatus();
                this.state.error = null;
                await this.fullRender(this.state);
            }
        } catch (error) {
            console.error('Ошибка загрузки раунда:', error);
            this.state.error = error.message || 'Ошибка загрузки раунда';
            await this.fullRender(this.state);
        }
    }

    async updateRoundStatus() {
        if (!this.state.round) return;

        const now = new Date();
        const start = new Date(this.state.round.start_date);
        const end = new Date(this.state.round.end_date);

        if (now < start) {
            this.state.roundStatus = 'cooldown';
            this.state.timeLeft = start - now;
        } else if (now >= start && now <= end) {
            this.state.roundStatus = 'active';
            this.state.timeLeft = end - now;
        } else {
            this.state.roundStatus = 'finished';
            this.state.timeLeft = 0;
        }

        // Используем статистику из API
        this.state.userStats = this.state.round.user_stats || { tap_count: 0, score: 0 };
    }

    // Новый метод для обновления отображения таймера
    async updateTimerDisplay() {
        const timerElement = this.shadowRoot.querySelector('.timer');
        if (timerElement) {
            timerElement.textContent = this.getTimerText();
        }
    }

    // Метод для получения текста таймера
    getTimerText() {
        const { roundStatus, timeLeft } = this.state;

        switch (roundStatus) {
            case 'cooldown':
                return `до начала раунда ${this.formatTime(timeLeft)}`;
            case 'active':
                return `До конца осталось: ${this.formatTime(timeLeft)}`;
            default:
                return '';
        }
    }

    async handleTap() {
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

    async showTapFeedback() {
        const gooseImage = this.shadowRoot.querySelector('.goose-image');
        if (gooseImage) {
            gooseImage.style.transform = 'scale(0.95)';
            setTimeout(() => {
                gooseImage.style.transform = '';
            }, 100);
        }
    }

    async showSpecialTapNotification() {
        // Временное уведомление вместо модального окна
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: absolute;
            top: 30%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            font-weight: bold;
            z-index: 10000;
            animation: fadeInOut 2s ease-in-out;
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -60%); }
                20% { opacity: 1; transform: translate(-50%, -50%); }
                80% { opacity: 1; transform: translate(-50%, -50%); }
                100% { opacity: 0; transform: translate(-50%, -40%); }
            }
        `;

        notification.textContent = '🎉 Специальный тап! +10 очков!';
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(notification);

        // document.body.appendChild(style);
        // document.body.appendChild(notification);

        setTimeout(() => {
            this.shadowRoot.removeChild(notification);
            this.shadowRoot.removeChild(style);
        }, 2000);
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Метод для остановки таймеров
    stopRefreshing() {
        if (this._controller && this._controller.destroy) {
            this._controller.destroy();
        }
    }

    async disconnectedCallback() {
        this.stopRefreshing();
        await super.disconnectedCallback();
    }
}

if (!customElements.get('round-page')) {
    customElements.define('round-page', RoundPage);
}