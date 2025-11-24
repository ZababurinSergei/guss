import Test from './modules/test/index.mjs'
import { Mocha } from './modules/chai/index.mjs'
import css from './modules/mocha/mocha.min.css.mjs'

let mochaHtml =`<div id="tests" style="position: relative; display: none"><ul id="mocha"></ul></div><style>${css}</style>`;

/**
 * @returns {Promise<unknown>}
 * @param state
 */
export const test = (state = {}) => {
    const root = state.root || document.body
    const path = state.path || false
    const checkLeaks = state.checkLeaks || true

    return new Promise(async (resolve, reject) => {
        try {
            Mocha.setup("bdd");

            (path)
                ? await Test(path)
                : await Test()

            root.insertAdjacentHTML('beforeend', mochaHtml);

            (checkLeaks)
                ? Mocha.checkLeaks()
                : ''
            Mocha.run()
            resolve(true)
        } catch (e) {
            reject({
                success: false,
                status: "false",
                message: e
            })
        }
    })
}

export default `
/**
 * @param path
 * @param checkLeaks
 * @returns {Promise<unknown>}
 */

`
