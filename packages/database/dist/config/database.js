import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();
export const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'the_last_of_guss',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        timestamps: true,
        underscored: true
    }
});
export const connectDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully');
        if (process.env.NODE_ENV === 'development' && process.env.FORCE_SYNC === 'true') {
            console.log('🔄 Force syncing database...');
            await sequelize.sync({ force: true });
            console.log('✅ Database synchronized');
        }
        else {
            console.log('✅ Database connected (using migrations only)');
        }
    }
    catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        process.exit(1);
    }
};
//# sourceMappingURL=database.js.map