export function defaultTemplate({ state = {} }) {
    if (!state.round) {
        return `
            <div class="round-page-container">
                <div class="loading">Загрузка раунда...</div>
            </div>
        `;
    }

    console.log('#################### ROUND TEST ####################', state)
    return `
        <div class="round-page-container">
            <header class="page-header">
                <h1>${getHeaderTitle(state.roundStatus)}</h1>
                ${state.user ? `<div class="user-info">${state.user.username}</div>` : ''}
            </header>

            <button class="back-btn">← Назад к списку</button>

            <div class="game-area">
                ${renderGoose(state.roundStatus)}
                
                <div class="game-info">
                    ${renderGameInfo(state)}
                </div>
            </div>
        </div>
    `;
}

function getHeaderTitle(status) {
    switch (status) {
        case 'cooldown': return 'Cooldown';
        case 'active': return 'Раунды';
        case 'finished': return 'Раунд завершен';
        default: return 'Раунд';
    }
}

function renderGoose(status) {
    const clickableClass = status === 'active' ? 'clickable' : '';

    return `
        <div class="goose-container">
            <div class="goose-image ${clickableClass}">
                <div class="goose-art">
                    <div class="art-line">            ░░░░░░░░░░░░░░░            </div>
                    <div class="art-line">          ░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░           </div>
                    <div class="art-line">        ░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░         </div>
                    <div class="art-line">        ░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░         </div>
                    <div class="art-line">      ░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░       </div>
                    <div class="art-line">    ░░▒▒▒▒░░░░▓▓▓▓▓▓▓▓▓▓▓▓░░░░▒▒▒▒░░   </div>
                    <div class="art-line">    ░░▒▒▒▒▒▒▒▒░░░░░░░░░░░░▒▒▒▒▒▒▒▒░░   </div>
                    <div class="art-line">    ░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░   </div>
                    <div class="art-line">      ░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░     </div>
                    <div class="art-line">        ░░░░░░░░░░░░░░░░░░░░░░░░░░     </div>
                </div>
            </div>
        </div>
    `;
}

function renderGameInfo(state) {
    const { roundStatus, timeLeft, userStats, round, formatTime } = state;

    // Функция форматирования времени
    const formatTimeFunc = formatTime || ((ms) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    });

    switch (roundStatus) {
        case 'cooldown':
            return `
                <div class="status-message cooldown">
                    Cooldown
                </div>
                <div class="timer">
                    до начала раунда ${formatTimeFunc(timeLeft)}
                </div>
            `;

        case 'active':
            return `
                <div class="status-message active">
                    Раунд активен!
                </div>
                <div class="timer">
                    До конца осталось: ${formatTimeFunc(timeLeft)}
                </div>
                ${userStats ? `
                    <div class="user-score">
                        Мои очки - ${userStats.score}
                    </div>
                ` : ''}
            `;

        case 'finished':
            const winner = round.winner || (round.participants?.length > 0
                ? round.participants.reduce((prev, current) =>
                    (prev.score > current.score) ? prev : current
                )
                : null);

            return `
                <div class="status-message finished">
                    Раунд завершен
                </div>
                <div class="round-stats">
                    <div class="stats-divider"></div>
                    <div class="stat-row">
                        <span>Всего очков</span>
                        <span>${round.total_score || 0}</span>
                    </div>
                    ${winner ? `
                        <div class="stat-row">
                            <span>Победитель</span>
                            <span>${winner.username} (${winner.score})</span>
                        </div>
                    ` : ''}
                    ${userStats ? `
                        <div class="stat-row">
                            <span>Мои очки</span>
                            <span>${userStats.score}</span>
                        </div>
                        <div class="stat-row">
                            <span>Мои тапы</span>
                            <span>${userStats.tap_count || 0}</span>
                        </div>
                    ` : ''}
                </div>
            `;

        default:
            return '<div class="loading">2222 Загрузка...</div>';
    }
}