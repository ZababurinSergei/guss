declare module '*.module.css' {
    const classes: {
        readonly [key: string]: string;
    };
    export default classes;
}

// Специфичные типы для Layout.module.css
declare module '*/Layout.module.css' {
    const classes: {
        readonly appContainer: string;
        readonly userHeader: string;
        readonly userInfo: string;
        readonly username: string;
        readonly userRole: string;
        readonly logoutBtn: string;
    };
    export default classes;
}

// Специфичные типы для LoginPage.module.css
declare module '*/LoginPage.module.css' {
    const classes: {
        readonly loginContainer: string;
        readonly loginCard: string;
        readonly formGroup: string;
        readonly errorMessage: string;
        readonly loginBtn: string;
        readonly loading: string;
    };
    export default classes;
}

// Специфичные типы для RoundPage.module.css
declare module '*/RoundPage.module.css' {
    const classes: {
        readonly roundPageContainer: string;
        readonly pageHeader: string;
        readonly userInfo: string;
        readonly backBtn: string;
        readonly gameArea: string;
        readonly gooseContainer: string;
        readonly gooseImage: string;
        readonly gooseArt: string;
        readonly gooseBody: string;
        readonly gooseNeck: string;
        readonly gooseHead: string;
        readonly gooseWings: string;
        readonly statusMessage: string;
        readonly timer: string;
        readonly userScore: string;
        readonly roundStats: string;
        readonly statsDivider: string;
        readonly statRow: string;
        readonly loading: string;
        readonly statusCooldown: string;
        readonly statusActive: string;
        readonly statusFinished: string;
        readonly clickable: string;
        readonly errorState: string;
        readonly loadingState: string;
        readonly spinner: string;
        readonly errorIcon: string;
        readonly retryBtn: string;
        readonly roundStatus: string;
    };
    export default classes;
}

// Специфичные типы для RoundsList.module.css
declare module '*/RoundsList.module.css' {
    const classes: {
        readonly roundsListContainer: string;
        readonly pageHeader: string;
        readonly headerContent: string;
        readonly lastUpdate: string;
        readonly userInfo: string;
        readonly username: string;
        readonly userRole: string;
        readonly actionsBar: string;
        readonly createRoundBtn: string;
        readonly pollingStatus: string;
        readonly statusIndicator: string;
        readonly roundsGrid: string;
        readonly roundCard: string;
        readonly roundHeader: string;
        readonly roundId: string;
        readonly roundDuration: string;
        readonly roundDates: string;
        readonly dateRow: string;
        readonly dateLabel: string;
        readonly dateValue: string;
        readonly roundDivider: string;
        readonly roundStats: string;
        readonly statRow: string;
        readonly statLabel: string;
        readonly statValue: string;
        readonly countdown: string;
        readonly roundStatus: string;
        readonly statusCooldown: string;
        readonly statusActive: string;
        readonly statusFinished: string;
        readonly loadingState: string;
        readonly spinner: string;
        readonly errorState: string;
        readonly errorIcon: string;
        readonly retryBtn: string;
        readonly emptyState: string;
        readonly emptyIcon: string;
        readonly active: string;
        readonly paused: string;
    };
    export default classes;
}

// Строгая типизация для общих CSS файлов
declare module '*/index.css' {
    const css: string;
    export default css;
}

declare module '*/scroll.css' {
    const css: string;
    export default css;
}