#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);

// Функция для получения параметров подключения к БД
function getDatabaseConfig() {
    const databaseUrl = process.env.DATABASE_URL;

    if (databaseUrl) {
        // Парсинг DATABASE_URL формата: postgres://user:password@host:port/database
        const url = new URL(databaseUrl);
        return {
            user: url.username,
            password: url.password,
            host: url.hostname,
            port: url.port || '5432',
            database: url.pathname.substring(1) // убираем ведущий слэш
        };
    }

    // Используем отдельные переменные окружения
    return {
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '5432',
        database: process.env.DB_NAME || 'the_last_of_guss'
    };
}

// Функция для проверки существования базы данных
async function databaseExists(dbConfig) {
    try {
        const checkCmd = `PGPASSWORD="${dbConfig.password}" psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -c "SELECT 1;" -t`;
        await execAsync(checkCmd);
        return true;
    } catch (error) {
        return false;
    }
}

// Функция для удаления базы данных
async function dropDatabase(dbConfig) {
    try {
        // Завершаем все активные подключения к базе
        const terminateConnectionsCmd = `PGPASSWORD="${dbConfig.password}" psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${dbConfig.database}';"`;
        await execAsync(terminateConnectionsCmd);

        // Удаляем базу данных
        const dropCmd = `PGPASSWORD="${dbConfig.password}" psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d postgres -c "DROP DATABASE IF EXISTS ${dbConfig.database};"`;
        await execAsync(dropCmd);

        return true;
    } catch (error) {
        console.error('❌ Ошибка при удалении базы данных:', error.message);
        return false;
    }
}

// Основная функция
async function main() {
    console.log('🗑️  Проверка существования базы данных...');

    const dbConfig = getDatabaseConfig();

    console.log(`📊 Конфигурация БД:`, {
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        user: dbConfig.user
    });

    // Проверяем существование базы данных
    const exists = await databaseExists(dbConfig);

    if (!exists) {
        console.log('ℹ️  База данных не существует, удаление не требуется');
        process.exit(0);
    }

    console.log(`📋 База данных "${dbConfig.database}" существует, начинаю удаление...`);

    // Удаляем базу данных
    const success = await dropDatabase(dbConfig);

    if (success) {
        console.log('✅ База данных успешно удалена');
    } else {
        console.log('❌ Не удалось удалить базу данных');
        process.exit(1);
    }
}

// Обработка ошибок
main().catch(error => {
    console.error('💥 Критическая ошибка:', error);
    process.exit(1);
});