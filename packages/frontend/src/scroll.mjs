
// Прослушиватель прокрутки
export class ScrollManager {
    constructor() {
        this.scrollTimeout = null;
        this.isScrolling = false;
        this.debounceDelay = 200; // Задержка перед скрытием скроллбара

        this.init();
    }

    init() {
        // Добавляем класс при начале прокрутки
        document.addEventListener('scroll', () => {

            this.handleScrollStart();

        }, {passive: false});
        // Предварительная проверка необходимости скроллбара
        this.checkScrollNecessity();
    }

    handleScrollStart() {
        if (!this.isScrolling) {
            this.isScrolling = true;
            document.documentElement.classList.add('scrolling');
        }

        // Сбрасываем таймер при каждом скролле
        this.clearTimeout();
        this.scrollTimeout = setTimeout(() => {
            this.handleScrollEnd();
        }, this.debounceDelay);
    }

    handleScrollEnd() {
        this.isScrolling = false;
        document.documentElement.classList.remove('scrolling');
    }

    clearTimeout() {
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = null;
        }
    }

    checkScrollNecessity() {
        // Проверяем, нужен ли вообще скроллбар на странице
        const hasScrollbar = document.documentElement.scrollHeight > window.innerHeight;

        if (!hasScrollbar) {
            document.documentElement.style.setProperty('--scrollbar-visibility', 'hidden');
            document.documentElement.style.setProperty('--scrollbar-opacity', '0');
        }
    }

    // Метод для принудительного показа/скрытия
    showScrollbar() {
        document.documentElement.classList.add('scrolling');
    }

    hideScrollbar() {
        document.documentElement.classList.remove('scrolling');
    }

    // Обновить настройки
    updateSettings(delay = 1500) {
        this.debounceDelay = delay;
    }
}