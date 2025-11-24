// /11/backend/scripts/reset-database.js
import { Sequelize } from 'sequelize';
// import dotenv from 'dotenv';

// dotenv.config();

async function resetDatabase() {
    const sequelize = new Sequelize({
        dialect: 'postgres',
        host: 'localhost',
        port: 5432,
        database: 'the_last_of_guss',
        username: 'postgres',
        password: 'password',
        logging: false
    });

    try {
        console.log('🚨 Starting database reset...');

        await sequelize.authenticate();
        console.log('✅ Connected to database');

        // Получаем все таблицы
        const tables = await sequelize.query(
            `SELECT table_name 
             FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_type = 'BASE TABLE'`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        console.log(`📋 Dropping ${tables.length} tables...`);

        // Удаляем все таблицы (каскадно)
        for (const table of tables) {
            const tableName = table.table_name;

            // Пропускаем системные таблицы
            if (tableName.startsWith('pg_') || tableName.startsWith('sql_')) {
                continue;
            }

            try {
                await sequelize.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
                console.log(`✅ Dropped table: ${tableName}`);
            } catch (error) {
                console.log(`⚠️  Could not drop table ${tableName}:`, error.message);
            }
        }

        console.log('🎉 Database reset completed!');
        console.log('💡 Run "npm run migrate" to recreate tables with migrations');

    } catch (error) {
        console.error('❌ Database reset failed:', error.message);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

resetDatabase();

export { resetDatabase };