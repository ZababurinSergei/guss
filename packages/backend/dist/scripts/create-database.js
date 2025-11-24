import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function createDatabase() {
    // Подключаемся к системной базе данных для создания новой БД
    const sequelize = new Sequelize({
        dialect: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: 'postgres', // подключаемся к стандартной БД
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        logging: false
    });

    try {
        await sequelize.authenticate();
        console.log('✅ Connected to PostgreSQL');

        const dbName = process.env.DB_NAME || 'the_last_of_guss';

        // Проверяем существование базы данных
        const result = await sequelize.query(
            `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`
        );

        if (result[0].length === 0) {
            // Создаем базу данных с template0 чтобы избежать проблем с collation
            await sequelize.query(`CREATE DATABASE ${dbName} WITH TEMPLATE template0 ENCODING 'UTF8'`);
            console.log(`✅ Database "${dbName}" created successfully with template0`);
        } else {
            console.log(`✅ Database "${dbName}" already exists`);
        }

    } catch (error) {
        console.error('❌ Error creating database:', error.message);

        // Альтернативный способ если первый не сработал
        try {
            console.log('🔄 Trying alternative method...');
            const dbName = process.env.DB_NAME || 'the_last_of_guss';
            await sequelize.query(`CREATE DATABASE ${dbName}`);
            console.log(`✅ Database "${dbName}" created successfully (alternative method)`);
        } catch (altError) {
            console.error('❌ Alternative method also failed:', altError.message);
        }
    } finally {
        await sequelize.close();
    }
}

createDatabase();