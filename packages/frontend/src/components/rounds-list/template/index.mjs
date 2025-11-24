// /11/public/components/rounds-list/template/index.mjs
export function defaultTemplate({ state = {} }) {
    return `
        <div class="rounds-list-container">
            <header class="page-header">
                <div class="header-content">
                    <h1>Список РАУНДОВ</h1>
                    ${state.lastUpdate ? `
                        <div class="last-update">
                            Обновлено: ${formatTime(state.lastUpdate)}
                        </div>
                    ` : ''}
                </div>
                ${state.user ? `
                    <div class="user-info">
                        <span class="username">${state.user.username}</span>
                        <span class="user-role">(${state.user.role})</span>
                    </div>
                ` : ''}
            </header>

            ${state.user?.role === 'admin' ? `
                <div class="actions-bar">
                    <button class="create-round-btn">
                        🎯 Создать раунд
                    </button>
                    <div class="polling-status">
                        <span class="status-indicator ${state.pollingEnabled ? 'active' : 'paused'}"></span>
                        ${state.pollingEnabled ? 'Автообновление' : 'Обновление приостановлено'}
                    </div>
                </div>
            ` : ''}

            <div class="rounds-grid" id="rounds-grid">
                ${state.loading ? `
                    <div class="loading-state">
                        <div class="spinner"></div>
                        <span>Загрузка раундов...</span>
                    </div>
                ` : state.error ? `
                    <div class="error-state">
                        <div class="error-icon">⚠️</div>
                        <h3>Ошибка загрузки</h3>
                        <p>${state.error}</p>
                        <button class="retry-btn" onclick="this.getRootNode().host.retryLoading()">
                            Повторить
                        </button>
                    </div>
                ` : state.rounds.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-icon">🎯</div>
                        <h3>Нет активных раундов</h3>
                        <p>Создайте первый раунд или дождитесь начала нового</p>
                    </div>
                ` : state.rounds.map(round => renderRoundCard(round)).join('')}
            </div>

            ${!state.loading && state.rounds.length > 0 ? `
                <div class="footer-info">
                    <div class="rounds-count">
                        Всего раундов: ${state.rounds.length}
                    </div>
                    <div class="active-rounds-count">
                        Активных: ${state.rounds.filter(r => r.status === 'active').length}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function renderRoundCard(round) {
    const startDate = new Date(round.start_date);
    const endDate = new Date(round.end_date);

    return `
        <div class="round-card" 
             data-round-id="${round.id}"
             data-start-timestamp="${round.start_timestamp}"
             data-status="${round.status}"
             data-is-upcoming="${round.is_upcoming}"
             data-is-active="${round.is_active}"
             data-is-finished="${round.is_finished}">
            
            <div class="round-header">
                <span class="round-id">● Round ID: ${round.id.slice(0, 8)}...</span>
                <span class="round-duration">${round.duration} сек</span>
            </div>
            
            <div class="round-dates">
                <div class="date-row">
                    <span class="date-label">📅 Начало:</span>
                    <span class="date-value start-date-value">
                        ${formatDateTime(startDate)}
                    </span>
                </div>
                <div class="date-row">
                    <span class="date-label">⏰ Конец:</span>
                    <span class="date-value end-date-value">
                        ${formatDateTime(endDate)}
                    </span>
                </div>
            </div>
            
            <div class="round-divider"></div>
            
            <div class="round-stats">
                <div class="stat-row">
                    <span class="stat-label">Общий счет:</span>
                    <span class="stat-value">${round.total_score || 0}</span>
                </div>
                ${round.time_until_start > 0 ? `
                    <div class="stat-row">
                        <span class="stat-label">До начала:</span>
                        <span class="stat-value countdown">
                            ${formatCountdown(round.time_until_start)}
                        </span>
                    </div>
                ` : ''}
                ${round.participants && round.participants.length > 0 ? `
                    <div class="stat-row">
                        <span class="stat-label">Участников:</span>
                        <span class="stat-value">${round.participants.length}</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="round-status ${getStatusClass(round.status)}">
                ${getStatusIcon(round.status)} ${getStatusText(round.status)}
            </div>

            ${round.winner ? `
                <div class="round-winner">
                    <span class="winner-label">🏆 Победитель:</span>
                    <span class="winner-name">${round.winner.username} (${round.winner.score})</span>
                </div>
            ` : ''}
        </div>
    `;
}

// Вспомогательные функции
function formatDateTime(date) {
    return date.toLocaleDateString('ru-RU') + ' ' +
        date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
}

function formatTime(date) {
    return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function formatCountdown(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}ч ${minutes.toString().padStart(2, '0')}м`;
    } else if (minutes > 0) {
        return `${minutes}м ${secs.toString().padStart(2, '0')}с`;
    } else {
        return `${secs}с`;
    }
}

function getStatusText(status) {
    const statusMap = {
        'cooldown': 'Cooldown',
        'active': 'Активен',
        'finished': 'Завершен'
    };
    return statusMap[status] || status;
}

function getStatusClass(status) {
    const classMap = {
        'cooldown': 'status-cooldown',
        'active': 'status-active',
        'finished': 'status-finished'
    };
    return classMap[status] || '';
}

function getStatusIcon(status) {
    const iconMap = {
        'cooldown': '⏱️',
        'active': '🎯',
        'finished': '✅'
    };
    return iconMap[status] || '●';
}