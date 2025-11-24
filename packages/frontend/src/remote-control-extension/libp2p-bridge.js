// libp2p-bridge.js
// Мост между Chrome-расширением (CDP) и P2P-приложением через libp2p

class Libp2pBridge {
    constructor() {
        this.extensionId = null;
        this.isConnected = false;
        this.chatManager = null;
        this.remoteControl = null;
        this._messageHandlers = new Map();
        this._setupMessageHandlers();
    }

    async init(extensionId) {
        if (!extensionId) {
            console.warn('[libp2p-bridge] Не указан ID расширения');
            return false;
        }

        this.extensionId = extensionId;

        try {
            // Проверяем, установлено ли расширение
            await chrome.runtime.sendMessage(this.extensionId, { type: 'PING' });
            this.isConnected = true;
            console.log('[libp2p-bridge] Расширение подключено');
            return true;
        } catch (e) {
            console.warn('[libp2p-bridge] Расширение не установлено или недоступно:', e.message);
            this.isConnected = false;
            return false;
        }
    }

    _setupMessageHandlers() {
        // Обработка входящих сообщений от расширения (если потребуется)
        // В текущей архитектуре расширение только принимает команды
    }

    /**
     * Отправляет событие ввода в расширение для выполнения через CDP
     * @param {Object} eventData - данные события (type, x, y, button, keyCode и т.д.)
     * @returns {Promise<boolean>}
     */
    async sendInputEvent(eventData) {
        if (!this.isConnected || !this.extensionId) {
            console.warn('[libp2p-bridge] Расширение не подключено');
            return false;
        }

        try {
            const response = await chrome.runtime.sendMessage(this.extensionId, {
                type: 'REMOTE_CONTROL_EVENT',
                payload: eventData
            });

            if (response?.error) {
                console.error('[libp2p-bridge] Ошибка расширения:', response.error);
                return false;
            }

            return true;
        } catch (e) {
            console.error('[libp2p-bridge] Не удалось отправить команду в расширение:', e);
            return false;
        }
    }

    /**
     * Интеграция с компонентом remote-control
     * Подменяет sendInputEvent на использование CDP через расширение
     */
    async integrateWithRemoteControl() {
        const remoteControl = document.querySelector('remote-control[mode="controller"]');
        if (!remoteControl) return;

        // Сохраняем оригинальный метод
        const originalSend = remoteControl._actions?.sendInputEvent;

        if (originalSend && this.isConnected) {
            // Переопределяем sendInputEvent для использования расширения
            remoteControl._actions.sendInputEvent = async (eventData) => {
                // Сначала отправляем визуальное событие через libp2p (для отображения курсора)
                if (originalSend) {
                    await originalSend.call(remoteControl._actions, eventData);
                }

                // Затем выполняем реальное действие через CDP
                await this.sendInputEvent(eventData);
            };

            console.log('[libp2p-bridge] Интеграция с remote-control завершена');
        }
    }

    /**
     * Проверяет наличие расширения и инициализирует мост
     * Вызывается из chat-manager или remote-control при старте
     */
    static async autoInit() {
        // ID расширения должен быть известен заранее (указан в manifest.json)
        // Пример: "abcdefghijklmnopabcdefhijklmno"
        const EXTENSION_ID = 'abcdefghijklmnopabcdefhijklmno'; // ← замените на ваш

        const bridge = new Libp2pBridge();
        const success = await bridge.init(EXTENSION_ID);

        if (success) {
            // Ждём, пока компоненты загрузятся
            setTimeout(async () => {
                await bridge.integrateWithRemoteControl();
            }, 1000);
        }

        return bridge;
    }
}

// Экспорт для использования в компонентах
window.Libp2pBridge = Libp2pBridge;

// Автоинициализация при загрузке страницы
if (typeof chrome !== 'undefined' && chrome.runtime) {
    Libp2pBridge.autoInit().catch(console.error);
}