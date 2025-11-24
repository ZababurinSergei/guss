export { sequelize, connectDatabase } from './config/database';
export * from './models';
export { User } from './models/User';
export { Round } from './models/Round';
export { Participant } from './models/Participant';
export type { UserAttributes, UserCreationAttributes } from './models/User';
export type { RoundAttributes, RoundCreationAttributes } from './models/Round';
export type { ParticipantAttributes, ParticipantCreationAttributes } from './models/Participant';
import { DataTypes, Model, Op, Transaction } from 'sequelize';
export { DataTypes, Model, Op, Transaction };
export type { Optional } from 'sequelize';
export type { QueryOptions, FindOptions, CreateOptions, UpdateOptions } from 'sequelize';
export declare const checkDatabaseHealth: () => Promise<{
    status: string;
    details?: any;
}>;
export declare class DatabaseManager {
    private static instance;
    private isConnected;
    private constructor();
    static getInstance(): DatabaseManager;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getConnectionStatus(): boolean;
    healthCheck(): Promise<{
        status: string;
        details?: any;
    }>;
}
export declare const databaseManager: DatabaseManager;
//# sourceMappingURL=index.d.ts.map