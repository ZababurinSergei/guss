describe('Подключание к relay[серверу реле] lestener [Слушателем] и подключение к [Слушателю] dialer[Инициатором]', async function () {
    this.timeout(10000);

    let app;
    let peerConnection;
    let connectPeerBtn;
    let peerAddressInput;
    let queryString;
    let params;
    let mode;

    before(async function () {
        peerConnection = document.body.querySelector('peer-connection');
        if(!peerConnection) {
            app = await (await import('../index.bundle.mjs')).app
            peerConnection = app.components["peer-connection"].id["peer-connection"]
        }

        while (peerConnection.isLoading()) {}
        queryString = window.location.search;
        params = new URLSearchParams(queryString);
        mode = params.get('mode');

        connectPeerBtn = peerConnection.shadowRoot.querySelector('#connect-peer-btn');
        peerAddressInput = peerConnection.shadowRoot.querySelector('#peer-address-input');
    });

    describe('/?mode=listener/dialer значение по умолчанию listener/dialer', async function () {
        it('Происходит соединение (listener[Слушатель] <-> relay[Сервер реле]) -> (dialer[Инициатор] <-> listener[Слушатель])', function () {
            return new Promise(async (resolve, reject) => {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList') {
                            mutation.addedNodes.forEach(item => {
                                switch (item.tagName) {
                                    case 'DIV':
                                        let address = {};
                                        if(item.classList.contains('addresses-container')) {
                                            item.querySelectorAll('div[data-address]').forEach(data => {
                                                switch (mode) {
                                                    case null:
                                                    case 'listener':
                                                        const protocol = data.querySelector('.address-protocol');
                                                        if(protocol) {
                                                            if(protocol.textContent) {
                                                                if(protocol.textContent.includes('WebSocket')) {
                                                                    address.protocol = 'WebSocket';
                                                                    address.address = data.dataset.address;
                                                                    window.localStorage.setItem('test_listener_address', data.dataset.address);
                                                                }
                                                            }
                                                        }
                                                        resolve(true);
                                                        break;
                                                    case 'dialer':
                                                        resolve(true);
                                                        break;
                                                    default:
                                                        console.warn('неизвестный тип mode', mode);
                                                }
                                            });
                                        }
                                        break;
                                    default:
                                        break;
                                }
                            });
                        }
                    });
                });

                observer.observe(peerConnection.shadowRoot, {
                    childList: true,
                    subtree: true
                });

                switch (mode) {
                    case null:
                    case 'listener':
                        connectPeerBtn.click();
                        break;
                    case 'dialer':
                        const test_listener_address = window.localStorage.getItem('test_listener_address');
                        peerAddressInput.value = test_listener_address;
                        connectPeerBtn.click();
                        break;
                    default:
                        console.warn('неизвестный тип mode', mode);
                }
            });
        });

        it('создается группа в dialer', function () {
            return new Promise(async (resolve, reject) => {
                switch (mode) {
                    case null:
                    case 'listener':
                        resolve(true);
                        break;
                    case 'dialer':
                        const chatManager = await peerConnection.getComponentAsync('chat-manager', 'chat-manager')
                        const createGroup = chatManager.shadowRoot.querySelector('#create-group')
                        createGroup.click()
                        const quickGroupName = document.body.querySelector('#quick-group-name')
                        const yatoModalFooter = document.body.querySelector('.yato-modal-footer')
                        const btnCreate = yatoModalFooter.querySelector('.primary')

                        quickGroupName.value = 'Тестовая группа'
                        btnCreate.click()
                        resolve(true);
                        break;
                    default:
                        console.warn('неизвестный тип mode', mode);
                        reject(true);
                }
            });
        });

        it('Нажимается кнопка скопировать адрес [Слушатель/Инициатор]', function () {
            return new Promise(async (resolve, reject) => {
                resolve(true);
            });
        });
    });
});