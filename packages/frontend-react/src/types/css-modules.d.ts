declare module '*.module.css' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

declare module '*.module.scss' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

// Строгая типизация для конкретных CSS модулей
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
        readonly cooldown: string;
        readonly active: string;
        readonly clickable: string;
    };
    export default classes;
}

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

// Общие типы для всех CSS модулей
interface CSSModuleClasses {
    readonly [key: string]: string;
}

// Утилиты для работы с CSS модулями
type CSSModule<T extends string> = {
    readonly [K in T]: string;
};

// Строгий тип для Layout компонента
export type LayoutCSS = CSSModule<'appContainer' | 'userHeader' | 'userInfo' | 'username' | 'userRole' | 'logoutBtn'>;

// Строгий тип для LoginPage компонента
export type LoginPageCSS = CSSModule<'loginContainer' | 'loginCard' | 'formGroup' | 'errorMessage' | 'loginBtn' | 'loading'>;

// Строгий тип для RoundPage компонента
export type RoundPageCSS = CSSModule<'roundPageContainer' | 'pageHeader' | 'userInfo' | 'backBtn' | 'gameArea' | 'gooseContainer' | 'gooseImage' | 'gooseArt' | 'gooseBody' | 'gooseNeck' | 'gooseHead' | 'gooseWings' | 'statusMessage' | 'timer' | 'userScore' | 'roundStats' | 'statsDivider' | 'statRow' | 'loading' | 'cooldown' | 'active' | 'clickable'>;

// Строгий тип для RoundsList компонента
export type RoundsListCSS = CSSModule<'roundsListContainer' | 'pageHeader' | 'headerContent' | 'lastUpdate' | 'userInfo' | 'username' | 'userRole' | 'actionsBar' | 'createRoundBtn' | 'pollingStatus' | 'statusIndicator' | 'roundsGrid' | 'roundCard' | 'roundHeader' | 'roundId' | 'roundDuration' | 'roundDates' | 'dateRow' | 'dateLabel' | 'dateValue' | 'roundDivider' | 'roundStats' | 'statRow' | 'statLabel' | 'statValue' | 'countdown' | 'roundStatus' | 'statusCooldown' | 'statusActive' | 'statusFinished' | 'loadingState' | 'spinner' | 'errorState' | 'errorIcon' | 'retryBtn' | 'emptyState' | 'emptyIcon' | 'active' | 'paused'>;