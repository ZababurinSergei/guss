import type { UserAttributes } from '../models/User';
import type { RoundAttributes } from '../models/Round';
import type { ParticipantAttributes } from '../models/Participant';
export type { UserAttributes, RoundAttributes, ParticipantAttributes };
export interface TapResult {
    tap_count: number;
    score: number;
    total_score: number;
    is_special_tap: boolean;
}
export interface RoundWithStats extends RoundAttributes {
    participants: Array<{
        user_id: string;
        username: string;
        tap_count: number;
        score: number;
    }>;
    user_stats?: {
        tap_count: number;
        score: number;
    };
    winner?: {
        username: string;
        score: number;
    };
}
export interface LoginRequest {
    username: string;
    password: string;
}
export interface LoginResponse {
    user: Omit<UserAttributes, 'password'>;
    token: string;
}
export interface CreateRoundRequest {
    start_date?: string;
}
export interface AuthUser {
    id: string;
    username: string;
    role: 'user' | 'admin' | 'nikita';
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginationParams {
    page?: number;
    limit?: number;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
//# sourceMappingURL=index.d.ts.map