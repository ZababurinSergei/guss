// content.js — визуализация удалённого курсора и событий ввода на странице
(function () {
    let cursorElement = null;
    let clickEffectElement = null;

    function createCursor() {
        if (cursorElement) return;
        cursorElement = document.createElement('div');
        cursorElement.id = 'p2p-remote-cursor';
        cursorElement.style.position = 'fixed';
        cursorElement.style.zIndex = '2147483647'; // максимальный z-index
        cursorElement.style.pointerEvents = 'none';
        cursorElement.style.fontSize = '20px';
        cursorElement.style.transform = 'translate(-50%, -50%)';
        cursorElement.style.left = '0px';
        cursorElement.style.top = '0px';
        cursorElement.textContent = '🖱️';
        document.body.appendChild(cursorElement);
    }

    function createClickEffect(x, y) {
        if (clickEffectElement) {
            clickEffectElement.remove();
        }
        clickEffectElement = document.createElement('div');
        clickEffectElement.style.position = 'fixed';
        clickEffectElement.style.left = `${x}px`;
        clickEffectElement.style.top = `${y}px`;
        clickEffectElement.style.width = '20px';
        clickEffectElement.style.height = '20px';
        clickEffectElement.style.borderRadius = '50%';
        clickEffectElement.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
        clickEffectElement.style.transform = 'translate(-50%, -50%)';
        clickEffectElement.style.zIndex = '2147483646';
        clickEffectElement.style.pointerEvents = 'none';
        document.body.appendChild(clickEffectElement);

        // Анимация исчезновения
        const start = performance.now();
        const duration = 600;
        const animate = (time) => {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            const opacity = 1 - progress;
            const scale = 1 + progress;
            clickEffectElement.style.opacity = opacity;
            clickEffectElement.style.transform = `translate(-50%, -50%) scale(${scale})`;
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                clickEffectElement.remove();
                clickEffectElement = null;
            }
        };
        requestAnimationFrame(animate);
    }

    // Приём команд от background.js
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'REMOTE_CONTROL_EVENT') {
            const { payload } = message;
            if (payload.type === 'mousemove') {
                createCursor();
                cursorElement.style.left = `${payload.x}px`;
                cursorElement.style.top = `${payload.y}px`;
            } else if (payload.type === 'mousedown') {
                createClickEffect(payload.x, payload.y);
            }
            sendResponse({ handled: true });
        }
    });

    // Удаление элементов при выгрузке страницы
    window.addEventListener('beforeunload', () => {
        if (cursorElement) cursorElement.remove();
        if (clickEffectElement) clickEffectElement.remove();
    });
})();