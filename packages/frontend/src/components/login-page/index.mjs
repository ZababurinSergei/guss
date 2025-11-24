import { BaseComponent } from '../../base/base-component.mjs';
import * as template from './template/index.mjs';
import { controller } from './controller/index.mjs';
import { createActions } from './actions/index.mjs';

export class LoginPage extends BaseComponent {
    static observedAttributes = [];

    constructor() {
        super();
        this._templateMethods = template;
        this.state = {
            error: null,
            loading: false
        };
    }

    async _componentReady() {
        this._controller = await controller(this);
        this._actions = await createActions(this);
        await this.fullRender(this.state);
        return true;
    }
}

if (!customElements.get('login-page')) {
    customElements.define('login-page', LoginPage);
}