export function defaultTemplate({ state = {} }) {
    const pages = {
        'login': '<login-page id="login-page"></login-page>',
        'rounds-list': '<rounds-list id="rounds-list"></rounds-list>',
        'round-page': '<round-page id="round-page"></round-page>'
    };

    console.log('Navigation Manager State:', state);

    return `
        <div id="app-container">
            ${state.user ? `
                <div class="user-header">
                    <div class="user-info">
                        <span class="username">👤 ${state.user.username}</span>
                        <span class="user-role">(${state.user.role})</span>
                    </div>
                    <button class="logout-btn" title="Выйти (Escape)">
                        🚪 Выйти
                    </button>
                </div>
            ` : ''}
            ${pages[state.currentPage] || pages.login}
        </div>
    `;
}