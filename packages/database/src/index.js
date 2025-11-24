import { sequelize, connectDatabase } from './config/database';
export { sequelize, connectDatabase } from './config/database';
export * from './models';
export { User } from './models/User';
export { Round } from './models/Round';
export { Participant } from './models/Participant';
import { DataTypes, Model, Op, Transaction } from 'sequelize';
export { DataTypes, Model, Op, Transaction };
export const checkDatabaseHealth = async () => {
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
    }
    catch (error) {
        return {
            status: 'unhealthy',
            details: error instanceof Error ? error.message : String(error)
        };
    }
};
export class DatabaseManager {
    static instance;
    isConnected = false;
    constructor() { }
    static getInstance() {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }
    async connect() {
        if (this.isConnected) {
            console.log('ℹ️ Database already connected');
            return;
        }
        try {
            await connectDatabase();
            this.isConnected = true;
            console.log('✅ Database manager connected successfully');
        }
        catch (error) {
            console.error('❌ Database manager connection failed:', error);
            throw error;
        }
    }
    async disconnect() {
        if (!this.isConnected) {
            console.log('ℹ️ Database already disconnected');
            return;
        }
        try {
            await sequelize.close();
            this.isConnected = false;
            console.log('✅ Database manager disconnected successfully');
        }
        catch (error) {
            console.error('❌ Database manager disconnection failed:', error);
            throw error;
        }
    }
    getConnectionStatus() {
        return this.isConnected;
    }
    async healthCheck() {
        return checkDatabaseHealth();
    }
}
export const databaseManager = DatabaseManager.getInstance();
if (process.env.AUTO_CONNECT_DB !== 'false') {
    process.nextTick(async () => {
        try {
            await databaseManager.connect();
        }
        catch (error) {
            console.error('Failed to auto-connect database:', error);
        }
    });
}
