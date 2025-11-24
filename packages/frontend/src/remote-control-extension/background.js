// background.js
let attachedTabId = null;
let isAttached = false;

// Подключаемся к активной вкладке при старте
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    if (isAttached && attachedTabId !== activeInfo.tabId) {
        await detachDebugger();
    }
    attachedTabId = activeInfo.tabId;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (tabId === attachedTabId && changeInfo.status === 'complete') {
        attachIfNeeded(tabId);
    }
});

async function attachIfNeeded(tabId) {
    if (!isAttached) {
        try {
            await chrome.debugger.attach({ tabId }, '1.3');
            isAttached = true;
            console.log('Отладчик подключён к вкладке', tabId);
            chrome.debugger.onEvent.addListener(onDebuggerEvent);
        } catch (e) {
            console.error('Не удалось подключить отладчик:', e);
        }
    }
}

async function detachDebugger() {
    if (isAttached && attachedTabId) {
        try {
            chrome.debugger.onEvent.removeListener(onDebuggerEvent);
            await chrome.debugger.detach({ tabId: attachedTabId });
        } catch (e) {}
        isAttached = false;
        attachedTabId = null;
    }
}

function onDebuggerEvent(source, method, params) {
    // Можно использовать для отправки скриншотов и т.п.
}

// Получение команд от веб-страницы (вашего P2P-приложения)
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (!isAttached || !attachedTabId) {
        sendResponse({ error: 'Отладчик не подключён' });
        return;
    }

    if (message.type === 'REMOTE_CONTROL_EVENT') {
        const { payload } = message;
        if (payload.type === 'mousemove') {
            chrome.debugger.sendCommand(
                { tabId: attachedTabId },
                'Input.dispatchMouseEvent',
                {
                    type: 'mouseMoved',
                    x: payload.x,
                    y: payload.y,
                    button: 'none'
                }
            );
        } else if (payload.type === 'mousedown') {
            chrome.debugger.sendCommand(
                { tabId: attachedTabId },
                'Input.dispatchMouseEvent',
                {
                    type: 'mousePressed',
                    x: payload.x,
                    y: payload.y,
                    button: payload.button === 0 ? 'left' : 'right',
                    clickCount: 1
                }
            );
        } else if (payload.type === 'mouseup') {
            chrome.debugger.sendCommand(
                { tabId: attachedTabId },
                'Input.dispatchMouseEvent',
                {
                    type: 'mouseReleased',
                    x: payload.x,
                    y: payload.y,
                    button: payload.button === 0 ? 'left' : 'right'
                }
            );
        } else if (payload.type === 'keydown') {
            chrome.debugger.sendCommand(
                { tabId: attachedTabId },
                'Input.dispatchKeyEvent',
                {
                    type: 'keyDown',
                    windowsVirtualKeyCode: payload.keyCode
                }
            );
        }
        sendResponse({ success: true });
    }
});