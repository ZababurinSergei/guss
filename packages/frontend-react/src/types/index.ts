export interface User {
    readonly id: string;
    readonly username: string;
    readonly role: 'admin' | 'user' | 'nikita';
}

export interface Participant {
    readonly user_id: string;
    readonly username: string;
    readonly tap_count: number;
    readonly score: number;
    readonly joined_at?: string;
}

export interface UserStats {
    readonly tap_count: number;
    readonly score: number;
}

export interface Round {
    readonly id: string;
    readonly start_date: string;
    readonly end_date: string;
    readonly status: 'cooldown' | 'active' | 'finished';
    readonly total_score: number;
    readonly participants: readonly Participant[];
    readonly winner?: Participant;
    readonly user_stats?: UserStats;
    readonly created_at?: string;
    readonly duration?: number;
    readonly time_until_start?: number;
    readonly is_upcoming?: boolean;
    readonly is_active?: boolean;
    readonly is_finished?: boolean;
    readonly start_timestamp?: number;
    readonly end_timestamp?: number;
    readonly _last_updated?: number;
}

export interface TapResult {
    readonly tap_count: number;
    readonly score: number;
    readonly total_score: number;
    readonly is_special_tap: boolean;
}

export interface LoginResponse {
    readonly user: User;
    readonly token: string;
}

export interface ProfileResponse {
    readonly user: User;
}

export interface ApiError {
    readonly error: string;
    readonly code?: string;
    readonly details?: unknown;
}

export type ApiResponse<T> =
    | { readonly data: T; readonly error?: never }
    | { readonly data?: never; readonly error: ApiError };

export interface AppState {
    readonly user: User | null;
    readonly rounds: readonly Round[];
    readonly currentRound: Round | null;
    readonly loading: boolean;
    readonly error: string | null;
    readonly lastUpdate: Date | null;
    readonly pollingEnabled: boolean;
}

export interface RoundStatusInfo {
    readonly status: Round['status'];
    readonly timeLeft: number;
    readonly isClickable: boolean;
    readonly displayText: string;
    readonly cssClass: string;
}

export interface RoundCreationParams {
    readonly duration?: number;
    readonly cooldown?: number;
}

export interface RoundUpdateParams {
    readonly status?: Round['status'];
    readonly total_score?: number;
    readonly participants?: readonly Participant[];
    readonly winner?: Participant;
}

export interface PollingConfig {
    readonly enabled: boolean;
    readonly interval: number;
    readonly maxInterval: number;
    readonly backoffFactor: number;
}

export interface NavigationState {
    readonly currentPage: 'login' | 'rounds-list' | 'round-page';
    readonly previousPage?: string;
    readonly routeParams: Record<string, string>;
}

export interface ModalOptions {
    readonly title: string;
    readonly content: string;
    readonly buttons?: readonly ModalButton[];
    readonly closeOnBackdropClick?: boolean;
    readonly closeOnEscape?: boolean;
}

export interface ModalButton {
    readonly text: string;
    readonly type: 'primary' | 'secondary' | 'danger';
    readonly action: () => void | Promise<void>;
}

export interface ValidationResult {
    readonly isValid: boolean;
    readonly errors: readonly string[];
}

export interface PaginationParams {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
}

export interface FilterParams {
    readonly status?: Round['status'];
    readonly dateFrom?: string;
    readonly dateTo?: string;
    readonly sortBy?: 'start_date' | 'end_date' | 'total_score' | 'status';
    readonly sortOrder?: 'asc' | 'desc';
}

export interface RoundFilters extends FilterParams {
    readonly search?: string;
    readonly participants?: readonly string[];
}

export interface StatsSummary {
    readonly totalRounds: number;
    readonly activeRounds: number;
    readonly upcomingRounds: number;
    readonly finishedRounds: number;
    readonly totalScore: number;
    readonly averageScore: number;
    readonly userStats?: UserStats;
}

export interface WebSocketMessage {
    readonly type: 'ROUND_UPDATED' | 'ROUND_CREATED' | 'ROUND_COMPLETED' | 'USER_TAPPED' | 'ERROR';
    readonly payload: unknown;
    readonly timestamp: number;
    readonly id?: string;
}

export interface RoundUpdateMessage extends WebSocketMessage {
    readonly type: 'ROUND_UPDATED';
    readonly payload: Round;
}

export interface RoundCreatedMessage extends WebSocketMessage {
    readonly type: 'ROUND_CREATED';
    readonly payload: Round;
}

export interface UserTappedMessage extends WebSocketMessage {
    readonly type: 'USER_TAPPED';
    readonly payload: {
        readonly roundId: string;
        readonly userId: string;
        readonly tapCount: number;
        readonly score: number;
        readonly totalScore: number;
        readonly timestamp: number;
    };
}

export interface ErrorMessage extends WebSocketMessage {
    readonly type: 'ERROR';
    readonly payload: {
        readonly message: string;
        readonly code: string;
        readonly details?: unknown;
    };
}

export type SpecificWebSocketMessage =
    | RoundUpdateMessage
    | RoundCreatedMessage
    | UserTappedMessage
    | ErrorMessage;

export interface CacheConfig {
    readonly maxAge: number;
    readonly staleWhileRevalidate: number;
    readonly enabled: boolean;
}

export interface QueryOptions {
    readonly cache?: CacheConfig;
    readonly retry?: {
        readonly attempts: number;
        readonly delay: number;
        readonly backoff: boolean;
    };
    readonly timeout?: number;
}

export interface ApiConfig {
    readonly baseURL: string;
    readonly timeout: number;
    readonly retryAttempts: number;
    readonly cacheEnabled: boolean;
}

export interface ThemeConfig {
    readonly mode: 'light' | 'dark' | 'auto';
    readonly colors: {
        readonly primary: string;
        readonly secondary: string;
        readonly accent: string;
        readonly background: string;
        readonly surface: string;
        readonly text: string;
    };
}

export interface AppConfig {
    readonly api: ApiConfig;
    readonly polling: PollingConfig;
    readonly theme: ThemeConfig;
    readonly features: {
        readonly offlineMode: boolean;
        readonly pushNotifications: boolean;
        readonly analytics: boolean;
    };
}

// Utility types for strict TypeScript usage
export type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type Nullable<T> = T | null;

export type Maybe<T> = T | undefined;

// Strict event handler types
export interface DOMEventHandlers {
    readonly onClick?: (event: React.MouseEvent<HTMLElement>) => void;
    readonly onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
    readonly onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    readonly onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;
    readonly onFocus?: (event: React.FocusEvent<HTMLElement>) => void;
    readonly onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
}

// Component prop types with strict typing
export interface BaseComponentProps {
    readonly className?: string;
    readonly style?: React.CSSProperties;
    readonly children?: React.ReactNode;
    readonly 'data-testid'?: string;
}

export interface AuthComponentProps extends BaseComponentProps {
    readonly requiredRole?: User['role'];
    readonly fallback?: React.ReactNode;
}

// Hook return types
export interface UseRoundResult {
    readonly round: Round | null;
    readonly loading: boolean;
    readonly error: string | null;
    readonly refetch: () => Promise<void>;
    readonly updateRound: (updates: RoundUpdateParams) => Promise<void>;
}

export interface UseRoundsResult {
    readonly rounds: readonly Round[];
    readonly loading: boolean;
    readonly error: string | null;
    readonly refetch: () => Promise<void>;
    readonly filters: RoundFilters;
    readonly setFilters: (filters: RoundFilters) => void;
    readonly pagination: PaginationParams;
    readonly stats: StatsSummary;
}

export interface UseAuthResult {
    readonly user: User | null;
    readonly loading: boolean;
    readonly error: string | null;
    readonly login: (username: string, password: string) => Promise<void>;
    readonly logout: () => Promise<void>;
    readonly isAuthenticated: boolean;
    readonly hasRole: (role: User['role']) => boolean;
}

// Form types with validation
export interface LoginFormData {
    readonly username: string;
    readonly password: string;
}

export interface RoundFormData {
    readonly duration: number;
    readonly cooldown: number;
}

export type ValidationRules<T> = {
    readonly [K in keyof T]?: (value: T[K], form: T) => string | null;
};

export interface ValidationResult {
    readonly isValid: boolean;
    readonly errors: readonly string[];
}

// Error boundary types
export interface ErrorBoundaryState {
    readonly hasError: boolean;
    readonly error: Error | null;
    readonly errorInfo: React.ErrorInfo | null;
}

export interface ErrorBoundaryProps {
    readonly fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
    readonly onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    readonly children: React.ReactNode;
}

// Performance monitoring types
export interface PerformanceMetrics {
    readonly componentRenderTime: number;
    readonly apiResponseTime: number;
    readonly memoryUsage: number;
    readonly networkStatus: 'slow' | 'normal' | 'fast';
}

export interface AnalyticsEvent {
    readonly name: string;
    readonly properties: Record<string, unknown>;
    readonly timestamp: number;
    readonly userId?: string;
}

// Strict API response types
export type StrictApiResponse<T> =
    | { readonly success: true; readonly data: T; readonly timestamp: number }
    | { readonly success: false; readonly error: ApiError; readonly timestamp: number };

// Union types for better type safety
export type RoundStatus = Round['status'];

export type UserRole = User['role'];

export type ApiEndpoint =
    | '/auth/login'
    | '/auth/logout'
    | '/auth/me'
    | '/rounds'
    | '/rounds/:id'
    | '/rounds/:id/tap';

// Literal types for maximum type safety
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type SortOrder = 'asc' | 'desc';

export type ThemeMode = 'light' | 'dark' | 'auto';

// Branded types for additional type safety
type Brand<K, T> = K & { readonly __brand: T };

export type UserId = Brand<string, 'UserId'>;
export type RoundId = Brand<string, 'RoundId'>;
export type AuthToken = Brand<string, 'AuthToken'>;

// Conditional types for advanced TypeScript features
export type ApiRequest<T> = T extends { readonly method: 'POST' }
    ? { readonly body: unknown }
    : { readonly body?: never };

export type ResponseType<T> = T extends '/auth/login' ? LoginResponse :
    T extends '/auth/me' ? ProfileResponse :
        T extends '/rounds' ? Round[] :
            T extends `/rounds/${string}` ? Round :
                T extends `/rounds/${string}/tap` ? TapResult :
                    never;

// Mapped types for configuration
export type ApiEndpointsConfig = {
    readonly [K in ApiEndpoint]: {
        readonly method: HttpMethod;
        readonly requiresAuth: boolean;
        readonly cacheable: boolean;
    };
};

// Template literal types
export type DynamicApiEndpoint = `/rounds/${string}` | `/rounds/${string}/tap`;

// Complete type exports
export type {
    // Re-export for convenience
    User as IUser,
    Round as IRound,
    Participant as IParticipant,
};