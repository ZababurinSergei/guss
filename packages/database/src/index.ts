import { sequelize, connectDatabase } from './config/database';

export { sequelize, connectDatabase } from './config/database';
export * from './models';

// Явно реэкспортируем модели
export { User } from './models/User';
export { Round } from './models/Round';
export { Participant } from './models/Participant';

// Реэкспортируем типы
export type { UserAttributes, UserCreationAttributes } from './models/User';
export type { RoundAttributes, RoundCreationAttributes } from './models/Round';
export type { ParticipantAttributes, ParticipantCreationAttributes } from './models/Participant';

// Re-export commonly used types and utilities
import { DataTypes, Model, Op, Transaction } from 'sequelize';
export { DataTypes, Model, Op, Transaction };
export type { Optional } from 'sequelize';
export type { QueryOptions, FindOptions, CreateOptions, UpdateOptions } from 'sequelize';

// Database health check utility
export const checkDatabaseHealth = async (): Promise<{ status: string; details?: any }> => {
    try {
        await sequelize.authenticate();
        const [result] = await sequelize.query('SELECT version();');
        return {
            status: 'healthy',
            details: {
                database: sequelize.getDatabaseName(),
                version: result
            }
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            details: error instanceof Error ? error.message : String(error)
        };
    }
};

// Database connection manager
export class DatabaseManager {
    private static instance: DatabaseManager;
    private isConnected = false;

    private constructor() {}

    static getInstance(): DatabaseManager {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }

    async connect(): Promise<void> {
        if (this.isConnected) {
            console.log('ℹ️ Database already connected');
            return;
        }

        try {
            await connectDatabase();
            this.isConnected = true;
            console.log('✅ Database manager connected successfully');
        } catch (error) {
            console.error('❌ Database manager connection failed:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        if (!this.isConnected) {
            console.log('ℹ️ Database already disconnected');
            return;
        }

        try {
            await sequelize.close();
            this.isConnected = false;
            console.log('✅ Database manager disconnected successfully');
        } catch (error) {
            console.error('❌ Database manager disconnection failed:', error);
            throw error;
        }
    }

    getConnectionStatus(): boolean {
        return this.isConnected;
    }

    async healthCheck(): Promise<{ status: string; details?: any }> {
        return checkDatabaseHealth();
    }
}

// Default database manager instance
export const databaseManager = DatabaseManager.getInstance();

// Initialize database connection when module is imported (optional)
// This can be disabled if you want manual control over connection timing
if (process.env.AUTO_CONNECT_DB !== 'false') {
    process.nextTick(async () => {
        try {
            await databaseManager.connect();
        } catch (error) {
            console.error('Failed to auto-connect database:', error);
        }
    });
}