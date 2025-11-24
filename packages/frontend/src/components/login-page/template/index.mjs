export function defaultTemplate({ state = {} }) {
    return `
        <div class="login-container">
            <div class="login-card">
                <h2>ВОЙТИ</h2>
                <form>
                    <div class="form-group">
                        <label for="username">Имя пользователя:</label>
                        <input 
                            type="text" 
                            id="username" 
                            name="username" 
                            required
                            ${state.loading ? 'disabled' : ''}
                        >
                    </div>
                    <div class="form-group">
                        <label for="password">Пароль:</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            required
                            ${state.loading ? 'disabled' : ''}
                        >
                    </div>
                    ${state.error ? `<div class="error-message">${state.error}</div>` : ''}
                    <button type="submit" class="login-btn" ${state.loading ? 'disabled' : ''}>
                        ${state.loading ? 'Вход...' : 'Войти'}
                    </button>
                </form>
            </div>
        </div>
    `;
}