import './components/api-service/index.mjs'
import './components/navigation-manager/index.mjs'
import './components/state-manager/index.mjs'
import './components/login-page/index.mjs'
import './components/rounds-list/index.mjs'
import './components/round-page/index.mjs'
import {test} from './components/tests/src/index.mjs'
import {createLogger} from '../modules/index.mjs'
import {ScrollManager} from './scroll.mjs'
import { injectCSS } from 'virtual:css';

const log = createLogger('incoming_message')
let app = {}
const components = {}
const isTests = false
let root;
const context = { }

app = window.onload = (async () => {
    injectCSS();

    // Обновите функцию loadTemplateBasedOnPath в index.html:
    function loadTemplateBasedOnPath() {
        const container = document.getElementById('main-container');
        const path = window.location.pathname;

        let templateId;

        // Обработка YouTube-specific путей
        if (path.includes('/youtube/receiver')) {
            templateId = 'receiver-template';
        } else if (path.includes('/youtube/sender')) {
            templateId = 'sender-template';
        } else if (path.includes('/youtube/')) {
            templateId = 'main-template';
        } else {
            // Оригинальная логика для других путей
            if (path.includes('/receiver')) {
                templateId = 'receiver-template';
            } else if (path.includes('/sender')) {
                templateId = 'sender-template';
            } else {
                templateId = 'main-template';
            }
        }

        const template = document.getElementById(templateId);

        if (template) {
            container.innerHTML = '';
            const content = template.content.cloneNode(true);
            container.appendChild(content);

            // Обновляем активные ссылки в навигации
            updateActiveNavLinks(path);
        }
    }

    // loadTemplateBasedOnPath()
    // Глобальные переменные
    app.startTime = Date.now();
    app.NODE_PORT = 6832;

    const html = document.body.querySelector('.container')
    // const tabContents = () => {
    //     const component = html.querySelector('#tab-contents')
    //     // component.
    //
    // }


    const components = []
    // const components = [{
    //     component: 'youtube-proxy',
    //     id: 'youtube-proxy',
    //     slot: 'youtube-proxy'
    // }, {
    //     component: 'peer-connection',
    //     id: 'peer-connection',
    //     slot: 'peer-connection'
    // }]

    for(let item of components) {
        const isAttribute = item.hasOwnProperty('attributes')

        context[`${item.component}`] = []

        const element = document.createElement(`${item.component}`)
        element.setAttribute('id', `${item.id}`)
        element.setAttribute('slot', `${item.slot}`)
        if(isAttribute) {
            for(let key in  item.attributes) {
                element.setAttribute(key, `${item.attributes[key]}`)
            }
        }

        // await element.connectedCallback()

        context[`${item.component}`].push({
            element: element
        })

        if(!components[`${item.component}`]) {
            components[`${item.component}`] = {
                id: {
                    [`${item.id}`]: element
                }
            }
            root = root ? root: element
        } else if(!components[`${item.component}`].id[item.id]) {
            components[`${item.component}`].id[item.id] = element
            root = root ? root: element
        } else {
            console.log('item', item)
            console.error('не должно быть')
        }

        html.appendChild(element)
    }



    setTimeout(async () => {
        document.documentElement.classList.add('visible');
    }, 1500)

    if (isTests) {
        test({
            path: '/tests/index.mjs'
        }).catch(e => {
            console.log('error devtool', e)
        })
    }

    return components
})()


// Также инициализируем если скрипт загрузился после DOMContentLoaded
if (document.readyState === 'loading') {
    console.log('------------------- loading -------------------')
    document.addEventListener('DOMContentLoaded', () => {
        window.scrollManager = new ScrollManager();
    });
} else {
    window.scrollManager = new ScrollManager();
}



export { app, createLogger }