import { logger } from '@libp2p/logger'
const log = logger('base-component')
const exclusion = []

/*** Абстрактный базовый класс компонента
 * @abstract
 * @version 5.0.1
 */
export class BaseComponent extends HTMLElement {
    static pendingRequests = new Map();
    static observedAttributes = ['*'];
    static MAX_POLLING_INTERVAL = 100; // ms
    static errorStore = [];
    static ERROR_STORE_LIMIT = 10; // Лимит записей

    constructor() {
        super();
        if (new.target === BaseComponent) {
            throw new Error('ЯТО-ABS1: Нельзя инстанциировать BaseComponent напрямую');
        }

        if (!this.shadowRoot) {
            this.attachShadow({mode: 'open'});
        }

        this.#templateImported = false
        this.getComponentAsync = BaseComponent.getComponentAsync
        this.addError = BaseComponent.addError
        this.getErrors = BaseComponent.getErrors
        this.clearErrors = BaseComponent.clearErrors
        this.getComponent = BaseComponent.getComponent
        this.pendingRequests = BaseComponent.pendingRequests

        this.#isReady = false;
        this.#isQuantum = false;
        this.entropy = 1.0;
        this.qubits = 0;
        this.getTemplate = () => '<div>Шаблон не определен</div>';
        this._id = this.constructor.generateId();
        this._isLoading = false; // Флаг загрузки
        log(`Создан экземпляр ${this.constructor.name} с ID: ${this._id}`);
    }

    // Приватные поля
    #templateImported = false;
    #isReady = false;
    #isQuantum = false;

    /**
     * Добавляет ошибку в статическое хранилище ошибок.
     * @param {Object} errorData - Данные об ошибке.
     * @param {string} errorData.componentName - Имя компонента, где произошла ошибка.
     * @param {string} errorData.source - Источник ошибки (например, 'controller', 'actions', 'render').
     * @param {string} errorData.message - Сообщение об ошибки.
     * @param {any} [errorData.details] - Дополнительные детали (например, объект ошибки, состояние).
     * @param {number} [errorData.timestamp] - Временная метка ошибки.
     */
    static addError(errorData) {
        const errorEntry = {
            timestamp: Date.now(),
            ...errorData
        };

        // Добавляем новую ошибку в начало массива
        BaseComponent.errorStore.unshift(errorEntry);

        // Проверяем лимит
        if (BaseComponent.errorStore.length > BaseComponent.ERROR_STORE_LIMIT) {
            // Удаляем последние (самые старые) записи, чтобы оставить только ERROR_STORE_LIMIT
            BaseComponent.errorStore = BaseComponent.errorStore.slice(0, BaseComponent.ERROR_STORE_LIMIT);
        }

        console.error(`Ошибка добавлена в хранилище. Всего записей: ${BaseComponent.errorStore.length}`, errorEntry);
        // Опционально: можно отправить глобальное событие об ошибке
        // window.dispatchEvent(new CustomEvent('yato-global-error', { detail: errorEntry }));
    }

    /**
     * Получает копию текущего хранилища ошибок.
     * @returns {Array} Массив объектов с данными об ошибках.
     */
    static getErrors() {
        // Возвращаем копию массива, чтобы предотвратить его изменение извне
        return [...BaseComponent.errorStore];
    }

    /**
     * Очищает хранилище ошибок.
     */
    static clearErrors() {
        BaseComponent.errorStore = [];
        log('Хранилище ошибок очищено.');
    }

    /**
     * Отображает универсальное модальное окно.
     * @param {Object} options - Параметры модального окна.
     * @param {string} options.title - Заголовок модального окна.
     * @param {string} options.content - HTML-содержимое модального окна.
     * @param {Array<Object>} [options.buttons] - Массив объектов кнопок.
     *   Каждый объект: { text: string, type: string (e.g., 'primary', 'secondary'), action: Function }
     * @param {boolean} [options.closeOnBackdropClick=true] - Закрывать ли окно по клику на подложке.
     * @returns {Promise<void>} - Promise, разрешающийся при закрытии модального окна.
     */
    showModal({title = 'Информация', content = '', buttons = [], closeOnBackdropClick = true} = {}) {
        return new Promise((resolve) => {
            // Создаем элементы модального окна
            const modalBackdrop = document.createElement('div');
            modalBackdrop.className = 'yato-modal-backdrop';

            const currentModal = document.body.querySelector('.yato-modal-backdrop')

            if(currentModal) {
                currentModal.remove()
            }

            // Функция закрытия модального окна
            const closeModal = () => {
                if (modalBackdrop.parentNode) {
                    modalBackdrop.parentNode.removeChild(modalBackdrop);
                }
                // Разрешаем Promise при закрытии
                resolve();
            };

            const modalWrapper = document.createElement('div');
            modalWrapper.className = 'yato-modal-wrapper';
            modalWrapper.setAttribute('role', 'dialog');
            modalWrapper.setAttribute('aria-modal', 'true');
            modalWrapper.setAttribute('aria-labelledby', 'yato-modal-title');

            const modalContent = document.createElement('div');
            modalContent.className = 'yato-modal-content';

            const modalHeader = document.createElement('div');
            modalHeader.className = 'yato-modal-header';

            const modalTitle = document.createElement('h3');
            modalTitle.id = 'yato-modal-title';
            modalTitle.className = 'yato-modal-title';
            modalTitle.textContent = title;

            const modalCloseButton = document.createElement('button');
            modalCloseButton.type = 'button';
            modalCloseButton.className = 'yato-modal-close-button';
            modalCloseButton.setAttribute('aria-label', 'Закрыть');
            modalCloseButton.innerHTML = '&times;'; // Символ "крестик"

            const modalBody = document.createElement('div');
            modalBody.className = 'yato-modal-body';
            modalBody.innerHTML = content; // Используем innerHTML для вставки HTML

            const modalFooter = document.createElement('div');
            modalFooter.className = 'yato-modal-footer';

            // Собираем модальное окно
            modalHeader.appendChild(modalTitle);
            modalHeader.appendChild(modalCloseButton);
            modalContent.appendChild(modalHeader);
            modalContent.appendChild(modalBody);

            // Создаем кнопки
            if (buttons && buttons.length > 0) {
                buttons.forEach(btnConfig => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = `yato-button ${btnConfig.type ? btnConfig.type : 'secondary'}`;
                    button.textContent = btnConfig.text || 'OK';
                    // Кнопка будет закрывать модальное окно и вызывать action, если он есть
                    button.onclick = () => {
                        // Сначала вызываем пользовательское действие, если оно есть
                        if (typeof btnConfig.action === 'function') {
                            try {
                                btnConfig.action(); // Выполняем действие
                            } catch (e) {
                                console.error('Ошибка в обработчике кнопки модального окна:', e);
                            }
                        }
                        // Затем закрываем модальное окно
                        closeModal();
                    };
                    modalFooter.appendChild(button);
                });
                modalContent.appendChild(modalFooter);
            } else {
                // Если кнопок нет, добавим кнопку по умолчанию "Закрыть"
                const defaultCloseButton = document.createElement('button');
                defaultCloseButton.type = 'button';
                defaultCloseButton.className = 'yato-button primary';
                defaultCloseButton.textContent = 'Закрыть';
                defaultCloseButton.onclick = closeModal;
                modalFooter.appendChild(defaultCloseButton);
                modalContent.appendChild(modalFooter);
            }

            modalWrapper.appendChild(modalContent);
            modalBackdrop.appendChild(modalWrapper);

            // Назначаем обработчики событий для закрытия
            modalCloseButton.onclick = closeModal;
            if (closeOnBackdropClick !== false) { // По умолчанию true
                modalBackdrop.onclick = (event) => {
                    if (event.target === modalBackdrop) {
                        closeModal();
                    }
                };
            }

            // Закрытие по Escape (опционально)
            const handleKeyDown = (event) => {
                if (event.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', handleKeyDown);
                }
            };

            document.addEventListener('keydown', handleKeyDown);

            // Добавляем модальное окно в тело документа
            document.body.appendChild(modalBackdrop);
        });
    }

    static generateId() {
        return 'yato-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * @private
     */
    async connectedCallback() {
        try {
            log(`${this.constructor.name} подключается к DOM.`);
            await this.#initComponent(this.state);
            log(`${this.constructor.name} готов.`);
        } catch (error) {
            console.error(`Ошибка в connectedCallback для ${this.constructor.name}:`, error);
            await this.#render({error: error.message});
        }
    }

    /**
     * @private
     */
    async disconnectedCallback() {
        log(`${this.constructor.name} отключен от DOM.`);
        await this._componentDisconnected()
    }

    /**
     * @private
     */
    async adoptedCallback() {
        log(`${this.constructor.name} перемещен в новый документ.`);
        await this._componentAdopted()
    }

    /**
     * @private
     */
    async attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        if(this.#templateImported) {
            await this._componentAttributeChanged(name, oldValue, newValue)
            log(`Атрибут ${name} изменился с '${oldValue}' на '${newValue}'.`);
        }
    }

    async #initComponent(state) {
        const type = this.dataset.type

        if (!exclusion.includes(this.tagName)) {
            this.#templateImported = true;
            if(type !== "server" && !this.hasAttribute('data-no-render')) {
                await this.#loadComponentStyles();
                await this.showSkeleton()
            }
        }

        await this._componentReady();
        await this.#registerComponent();
    }

    async #loadComponentStyles() {
        try {
            const componentTagName = this.constructor.tagName || this.tagName.toLowerCase();
            let cssPath = new URL(`../components/${componentTagName}/css/index.css`, import.meta.url)
            const style = document.createElement('style');
            style.textContent = `@import url('.${cssPath.pathname}');`;
            this.shadowRoot.appendChild(style);
            log(`Стили для ${this.constructor.name} загружены из ${cssPath}`);
        } catch (error) {
            console.error(`Ошибка загрузки стилей для ${this.constructor.name}:`, error)
        }
    }

    // В метод showSkeleton добавляем:
    async showSkeleton() {
        this._isLoading = true;
        const container = this.shadowRoot.querySelector('#root') || document.createElement('div');
        container.id = 'root';
        container.classList.add('skeleton-container'); // Добавляем универсальный класс

        // Добавляем универсальные стили скелетона если их еще нет
        if (!this.shadowRoot.querySelector('#skeleton-styles')) {
            const style = document.createElement('style');
            style.id = 'skeleton-styles';
            style.textContent = `
                /* Универсальные стили скелетона для всех компонентов */
                :host {
                    position: relative;
                }
                .skeleton-container * {
                    pointer-events: none !important;
                    user-select: none !important;
                }
                
                .skeleton-container :not(style, script, link, meta) {
                    color: transparent !important;
                    background-size: 200% 100% !important;
                    animation: skeleton-loading 1.5s infinite !important;
                    border-color: transparent !important;
                    box-shadow: none !important;
                }
                
                .skeleton-container :not(style, script, link, meta)::before {
                    content: "" !important;
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    background: inherit !important;
                    border-radius: inherit !important;
                    z-index: 1 !important;
                }
                
                @keyframes skeleton-loading {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                
                /* Темная тема для скелетона */
                [data-theme="dark"] .skeleton-container :not(style, script, link, meta) {
                    background: linear-gradient(90deg, #2d3748 25%, #4a5568 50%, #2d3748 75%) !important;
                }
                
                /* Сохранение структуры форм */
                .skeleton-container form,
                .skeleton-container input,
                .skeleton-container textarea,
                .skeleton-container select,
                .skeleton-container button {
                    opacity: 1 !important;
                    visibility: visible !important;
                    display: block !important;
                }
                
                /* Круглые элементы */
                .skeleton-container img,
                .skeleton-container [class*="avatar"],
                .skeleton-container [class*="circle"] {
                    border-radius: 50% !important;
                }
        `;
            this.shadowRoot.appendChild(style);
        }

        // if (!this.shadowRoot.querySelector('#root')) {
        //     this.shadowRoot.appendChild(container);
        // }
    }

    async hideSkeleton() {
        this._isLoading = false;
        const container = this.shadowRoot.querySelector('#root');
        if (container) {
            container.classList.remove('skeleton-container');
        }
    }

    /**
     * Проверяет, активна ли скелетон-загрузка
     * @returns {boolean}
     */
    isLoading() {
        return this._isLoading;
    }

    // В класс BaseComponent добавим метод fullRender
    async fullRender(state = {}) {
        try {
            await this.#render({
                state: state,
                context: this
            });

            this.#isReady = true
            log(`Полный рендеринг выполнен для ${this.constructor.name}`);
            return true;
        } catch (error) {
            console.error(`Ошибка полного рендеринга:`, error);
            return false;
        }
    }

    /**
     * Рендерит конкретную часть шаблона в указанный селектор
     * @param {Object} options - Параметры рендеринга
     * @param {string} options.partName - Название метода шаблона (по умолчанию 'defaultTemplate')
     * @param {Object} options.state - Состояние для рендеринга
     * @param {string} options.selector - CSS селектор целевого элемента
     * @param {string} [options.method='innerHTML'] - Метод вставки: 'innerHTML', 'append', 'prepend', 'before', 'after'
     * @returns {Promise<boolean>} Успешность операции
     */
    async renderPart({ partName = 'defaultTemplate', state = {}, selector, method = 'innerHTML' } = {}) {
        try {
            if (!this._templateMethods || !this._templateMethods[partName]) {
                console.error(`Метод шаблона '${partName}' не найден в ${this.constructor.name}`);
                return false;
            }

            if (!selector) {
                console.error(`Не указан селектор для рендеринга части '${partName}'`);
                return false;
            }

            const targetElement = this.shadowRoot.querySelector(selector);
            if (!targetElement) {
                console.error(`Элемент с селектором '${selector}' не найден`);
                return false;
            }

            // Получаем HTML из шаблона
            const htmlContent = await this._templateMethods[partName]({
                state: state,
                context: this
            });

            // Применяем выбранный метод вставки
            switch (method) {
                case 'innerHTML':
                    targetElement.innerHTML = htmlContent;
                    break;
                case 'append':
                    targetElement.insertAdjacentHTML('beforeend', htmlContent);
                    break;
                case 'prepend':
                    targetElement.insertAdjacentHTML('afterbegin', htmlContent);
                    break;
                case 'before':
                    targetElement.insertAdjacentHTML('beforebegin', htmlContent);
                    break;
                case 'after':
                    targetElement.insertAdjacentHTML('afterend', htmlContent);
                    break;
                default:
                    console.error(`Неизвестный метод вставки: ${method}`);
                    return false;
            }

            log(`Часть '${partName}' успешно отрендерена в '${selector}' методом '${method}'`);

            await this.#waitForDOMUpdate();
            // Обновляем обработчики событий для новой части
            await this.#setupEventListeners();

            return true;

        } catch (error) {
            console.error(`Ошибка рендеринга части '${partName}':`, error);
            this.addError({
                componentName: this.constructor.name,
                source: 'renderPart',
                message: `Ошибка рендеринга части ${partName}`,
                details: error
            });
            return false;
        }
    }

    /**
     * Универсальный метод для обновления содержимого элементов
     * @param {Object} options - Параметры обновления
     * @param {string} options.selector - CSS селектор целевого элемента
     * @param {string|number|boolean} options.value - Значение для установки
     * @param {string} [options.property='textContent'] - Свойство элемента для обновления:
     *   - 'textContent' для текстового содержимого
     *   - 'innerHTML' для HTML содержимого
     *   - 'value' для input, textarea, select
     *   - 'checked' для checkbox
     *   - 'src' для изображений
     *   - 'href' для ссылок
     *   - 'className' для классов
     *   - 'style' для стилей (передавать объект)
     *   - любое другое свойство элемента
     * @param {string} [options.action='set'] - Действие: 'set', 'append', 'prepend', 'toggle', 'add', 'remove'
     * @returns {Promise<boolean>} Успешность операции
     */
    async updateElement({ selector, value, property = 'textContent', action = 'set' } = {}) {
        try {
            if (!selector) {
                console.warn(`[Компонент] Не указан селектор для обновления элемента`);
                return false;
            }

            const targetElement = this.shadowRoot.querySelector(selector);

            if (!targetElement) {
                console.warn(`[Компонент] Элемент с селектором '${selector}' не найден`);
                return false;
            }

            if(selector === '.network-addresses') {
                console.log('--------------------- targetElement ----------------------------',action,  targetElement)
            }
            switch (action) {
                case 'set':
                    // Простая установка значения
                    if (property === 'style' && typeof value === 'object') {
                        // Для стилей - устанавливаем каждое свойство
                        Object.assign(targetElement.style, value);
                    } else if (property === 'className' && typeof value === 'string') {
                        // Для классов - заменяем все классы
                        targetElement.className = value;
                    } else if (property === 'dataset.theme' && typeof value === 'string') {
                        // Для классов - заменяем все классы
                        targetElement.dataset.theme = value;
                    } else {
                        targetElement[property] = value;
                    }
                    break;

                case 'append':
                    // Добавление в конец
                    if (property === 'innerHTML' || property === 'textContent') {
                        targetElement[property] += value;
                    } else if (property === 'value') {
                        targetElement.value += String(value);
                    }
                    break;

                case 'prepend':
                    // Добавление в начало
                    if (property === 'innerHTML' || property === 'textContent') {
                        targetElement[property] = value + targetElement[property];
                    } else if (property === 'value') {
                        targetElement.value = String(value) + targetElement.value;
                    }
                    break;

                case 'toggle':
                    // Переключение булевых свойств
                    if (property === 'checked' || property === 'disabled' || property === 'hidden') {
                        targetElement[property] = !targetElement[property];
                    } else if (property === 'className') {
                        // Переключение класса
                        targetElement.classList.toggle(String(value));
                    }
                    break;

                case 'add':
                    // Добавление класса
                    if (property === 'className') {
                        targetElement.classList.add(String(value));
                    }
                    break;

                case 'remove':
                    // Удаление класса
                    if (property === 'className') {
                        targetElement.classList.remove(String(value));
                    }
                    break;

                default:
                    console.warn(`[Компонент] Неизвестное действие: ${action}`);
                    return false;
            }

            // log(`[Компонент] Элемент '${selector}' обновлен: ${property} = ${value} (действие: ${action})`);
            return true;

        } catch (error) {
            console.error(`[Компонент] Ошибка обновления элемента '${selector}':`, error);
            this.addError({
                componentName: this.constructor.name,
                source: 'updateElement',
                message: `Ошибка обновления элемента ${selector}`,
                details: error
            });
            return false;
        }
    }

    async #render({partName = 'defaultTemplate', state = {},  selector = '*'} = {}) {
        try {
            if(this._templateMethods) {
                const storedState = this.state || {};
                const mergedState = {...storedState, ...state};

                const rootContainer = document.createElement('div')

                if(!this._templateMethods[partName]) {
                    partName = 'default'
                }

                rootContainer.insertAdjacentHTML('beforeend', await this._templateMethods[partName]({
                    state: mergedState,
                    context: this
                }))

                rootContainer.id = 'root'
                if(selector === '*') {
                    const rootContainerExist = this.shadowRoot.querySelector('#root')
                    if (rootContainerExist) {
                        rootContainerExist.remove()
                    }
                    this.shadowRoot.appendChild(rootContainer);
                } else {
                    const rootContainerExist = this.shadowRoot.querySelector(selector)
                    rootContainerExist.innerHTML = ''
                    rootContainerExist.appendChild(rootContainer)
                }

                await this.#waitForDOMUpdate();
                await this.#setupEventListeners();
                await this.hideSkeleton()
                log(`${this.constructor.name} отрендерен с состоянием:`, mergedState);
            } else {
                console.error(`${this.constructor.name} темплейт не определен`);
            }
        } catch (error) {
            console.error(`Ошибка рендеринга для ${this.constructor.name}:`, error);
            this.shadowRoot.innerHTML = `<p style="color:red;">Ошибка рендеринга: ${error.message}</p>`;
        }
    }

    async #waitForDOMUpdate(timeout = 100) {
        return new Promise(resolve => {
            const rafId = requestAnimationFrame(() => {
                clearTimeout(timeoutId);
                resolve();
            });
            const timeoutId = setTimeout(() => {
                cancelAnimationFrame(rafId);
                resolve();
            }, timeout);
            return () => {
                cancelAnimationFrame(rafId);
                clearTimeout(timeoutId);
            };
        });
    }

    async #setupEventListeners() {
        if (this?._controller?.destroy) {
            this._controller.destroy()
        }

        if (this?._controller?.init) {
            this._controller.init()
        }
        // Базовая реализация. Переопределяется в дочерних компонентах.
        log(`${this.constructor.name} настройка обработчиков событий (базовая реализация).`);
    }

    async #registerComponent() {
        try {
            if (!this.id) {
                console.error('ЯТО-ID1: Компонент желательно имеет ID для регистрации');
                throw new Error('ЯТО-ID1: Компонент требует ID'); // Строгое требование по спецификации
                return;
            }
            const key = `${this.tagName.toLowerCase()}:${this.id}`;
            BaseComponent.pendingRequests.set(key, this);
            if(this.tagName.toLowerCase() === 'navigation-manager' || this.tagName.toLowerCase() === 'navigation-sections') {
                log(`${this.constructor.name} с ID ${this.id} зарегистрирован.`);
            }
        } catch (e) {
            console.error(e.toString(), this.tagName.toLowerCase())
        }
    }

    /**
     * Асинхронно получает экземпляр компонента, ожидая его регистрации, если необходимо.
     * @param {string} tagName - Тег компонента.
     * @param {string} id - Идентификатор экземпляра.
     * @param {number} timeout - Таймаут в миллисекундах.
     * @returns {Promise<BaseComponent|null>}
     * @static
     */
    static async getComponentAsync(tagName, id, timeout = 5000) {
        const key = `${tagName}:${id}`;
        let component = BaseComponent.pendingRequests.get(key);

        if (component) {
            return Promise.resolve(component);
        }

        return new Promise((resolve, reject) => {
            let resolved = false;
            const timeoutId = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    console.error(`Таймаут ожидания компонента '${key}'.`);
                    resolve(null);
                }
            }, timeout);

            const checkComponent = () => {
                if (resolved) return;
                component = BaseComponent.pendingRequests.get(key);
                if (component) {
                    clearTimeout(timeoutId);
                    resolved = true;
                    log(`Асинхронно найден зарегистрированный компонент '${key}'.`);
                    resolve(component);
                } else {
                    setTimeout(checkComponent, BaseComponent.MAX_POLLING_INTERVAL);
                }
            };

            checkComponent();
        });
    }

    async postMessage(event) {
        // Базовая реализация. Переопределяется в дочерних компонентах.
        log(`сообщение для компонента ${this.constructor.name} отправленно.`);
    }

    async _componentReady() {
        // Базовая реализация. Переопределяется в дочерних компонентах.
        log(`${this.constructor.name} компонент готов (базовая реализация).`);
    }

    async _componentAttributeChanged() {
        // Базовая реализация. Переопределяется в дочерних компонентах.
        log(`${this.constructor.name} Атрибуты изменены (базовая реализация).`);
    }

    async _componentAdopted() {
        // Базовая реализация. Переопределяется в дочерних компонентах.
        log(`${this.constructor.name} компонент перемещен (базовая реализация).`);
    }

    async _componentDisconnected() {
        // Базовая реализация. Переопределяется в дочерних компонентах.
        log(`${this.constructor.name} компонент отключен (базовая реализация).`);
    }
}