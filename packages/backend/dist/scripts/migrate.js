// /11/backend/scripts/migrate.js
import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Конфигурация базы данных
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'the_last_of_guss',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
};

const sequelize = new Sequelize({
    dialect: 'postgres',
    ...dbConfig
});

// Определяем SQL для миграций
const migrations = [
    {
        name: '001-create-users-table',
        up: `
            -- Сначала создаем enum тип если его нет
            DO $$ BEGIN
                CREATE TYPE user_role AS ENUM ('user', 'admin', 'nikita');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
            
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role user_role DEFAULT 'user',
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
        `,
        down: `DROP TABLE IF EXISTS users CASCADE; DROP TYPE IF EXISTS user_role;`
    },
    {
        name: '002-create-rounds-table',
        up: `
            -- Создаем enum тип для статуса раунда
            DO $$ BEGIN
                CREATE TYPE round_status AS ENUM ('cooldown', 'active', 'finished');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
            
            CREATE TABLE IF NOT EXISTS rounds (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                start_date TIMESTAMPTZ NOT NULL,
                end_date TIMESTAMPTZ NOT NULL,
                total_score INTEGER DEFAULT 0,
                status round_status DEFAULT 'cooldown',
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE INDEX IF NOT EXISTS idx_rounds_status ON rounds(status);
            CREATE INDEX IF NOT EXISTS idx_rounds_dates ON rounds(start_date, end_date);
        `,
        down: `DROP TABLE IF EXISTS rounds CASCADE; DROP TYPE IF EXISTS round_status;`
    },
    {
        name: '003-create-participants-table',
        up: `
            CREATE TABLE IF NOT EXISTS participants (
                                                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
                tap_count INTEGER DEFAULT 0,
                score INTEGER DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, round_id)
                );

            CREATE UNIQUE INDEX IF NOT EXISTS idx_participants_user_round ON participants(user_id, round_id);
            CREATE INDEX IF NOT EXISTS idx_participants_round_score ON participants(round_id, score);
        `,
        down: `DROP TABLE IF EXISTS participants CASCADE;`
    },
    {
        name: '004-create-migrations-table',
        up: `
            CREATE TABLE IF NOT EXISTS migrations (
                                                      id SERIAL PRIMARY KEY,
                                                      name VARCHAR(255) UNIQUE NOT NULL,
                executed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                );
        `,
        down: `DROP TABLE IF EXISTS migrations;`
    }
];

async function runMigrations() {
    try {
        console.log('🚀 Starting database migrations...');

        // Подключаемся к базе данных
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        // Создаем таблицу миграций если её нет
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                                                      id SERIAL PRIMARY KEY,
                                                      name VARCHAR(255) UNIQUE NOT NULL,
                executed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                );
        `);
        console.log('✅ Migrations table ready');

        // Получаем уже выполненные миграции
        const [executedMigrations] = await sequelize.query(
            'SELECT name FROM migrations ORDER BY id ASC'
        );
        const executedNames = executedMigrations.map(m => m.name);
        console.log(`📊 Found ${executedNames.length} executed migrations`);

        // Выполняем миграции
        let executedCount = 0;
        for (const migration of migrations) {
            if (executedNames.includes(migration.name)) {
                console.log(`⏭️  Skipping: ${migration.name}`);
                continue;
            }

            console.log(`🔄 Executing: ${migration.name}`);

            try {
                // Выполняем миграцию без транзакции (некоторые операции не поддерживаются в транзакциях)
                await sequelize.query(migration.up);

                // Сохраняем запись о миграции
                await sequelize.query(
                    'INSERT INTO migrations (name) VALUES ($1)',
                    {
                        bind: [migration.name]
                    }
                );

                console.log(`✅ Completed: ${migration.name}`);
                executedCount++;
            } catch (error) {
                console.error(`❌ Failed: ${migration.name}`, error.message);
                throw error;
            }
        }

        if (executedCount === 0) {
            console.log('✅ All migrations are already up to date');
        } else {
            console.log(`🎉 Successfully executed ${executedCount} migrations`);
        }

        // Проверяем структуру базы данных
        console.log('\n📊 Database structure:');
        const tables = await sequelize.query(
            `SELECT table_name
             FROM information_schema.tables
             WHERE table_schema = 'public'
               AND table_type = 'BASE TABLE'
             ORDER BY table_name`
        );

        console.log('📋 Tables:');
        tables[0].forEach(table => {
            console.log(`   - ${table.table_name}`);
        });

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

async function undoMigrations() {
    try {
        console.log('↩️  Undoing migrations...');

        await sequelize.authenticate();
        console.log('✅ Connected to database');

        // Получаем выполненные миграции в обратном порядке
        const [executedMigrations] = await sequelize.query(
            'SELECT name FROM migrations ORDER BY id DESC'
        );

        console.log(`📋 Found ${executedMigrations.length} migrations to undo`);

        // Откатываем в обратном порядке
        for (const migration of executedMigrations) {
            const migrationObj = migrations.find(m => m.name === migration.name);
            if (!migrationObj) {
                console.log(`⚠️  No migration definition found for: ${migration.name}`);
                continue;
            }

            console.log(`🔄 Undoing: ${migration.name}`);

            try {
                // Выполняем down миграцию
                await sequelize.query(migrationObj.down);

                // Удаляем запись о миграции
                await sequelize.query(
                    'DELETE FROM migrations WHERE name = $1',
                    {
                        bind: [migration.name]
                    }
                );

                console.log(`✅ Undone: ${migration.name}`);
            } catch (error) {
                console.error(`❌ Failed to undo: ${migration.name}`, error.message);
                throw error;
            }
        }

        console.log('🎉 All migrations undone successfully!');

    } catch (error) {
        console.error('❌ Undo migration failed:', error.message);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

async function resetDatabase() {
    try {
        console.log('🔄 Resetting database...');

        await sequelize.authenticate();
        console.log('✅ Connected to database');

        // Удаляем все таблицы в правильном порядке (из-за foreign keys)
        const tables = ['participants', 'rounds', 'users', 'migrations'];
        const types = ['round_status', 'user_role'];

        // Удаляем таблицы
        for (const table of tables) {
            try {
                await sequelize.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
                console.log(`✅ Dropped table: ${table}`);
            } catch (error) {
                console.log(`⚠️  Could not drop table ${table}:`, error.message);
            }
        }

        // Удаляем типы
        for (const type of types) {
            try {
                await sequelize.query(`DROP TYPE IF EXISTS ${type} CASCADE`);
                console.log(`✅ Dropped type: ${type}`);
            } catch (error) {
                console.log(`⚠️  Could not drop type ${type}:`, error.message);
            }
        }

        console.log('🎉 Database reset completed!');
        console.log('💡 Run migrations to recreate tables');

    } catch (error) {
        console.error('❌ Database reset failed:', error.message);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

// Обработка команд
const command = process.argv[2];

if (command === 'up') {
    runMigrations();
} else if (command === 'down') {
    undoMigrations();
} else if (command === 'reset') {
    resetDatabase();
} else if (command === 'status') {
    checkStatus();
} else {
    console.log(`
Usage:
  npm run migrate:up      # Run migrations
  npm run migrate:down    # Undo migrations
  npm run migrate:reset   # Reset database
  npm run migrate:status  # Check migration status
  `);
    process.exit(1);
}

async function checkStatus() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        const [executedMigrations] = await sequelize.query(
            'SELECT name, executed_at FROM migrations ORDER BY id ASC'
        );

        console.log('\n📊 Migration Status:');
        console.log(`Executed: ${executedMigrations.length}/${migrations.length}`);

        migrations.forEach(migration => {
            const executed = executedMigrations.find(m => m.name === migration.name);
            console.log(`  ${executed ? '✅' : '❌'} ${migration.name}`);
        });

    } catch (error) {
        console.error('❌ Status check failed:', error.message);
    } finally {
        await sequelize.close();
    }
}