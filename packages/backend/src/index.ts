import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { authRoutes } from './routes/auth';
import { roundRoutes } from './routes/rounds';
import { tapRoutes } from './routes/taps';
import { RoundService } from './services/RoundService';
import { QueueService } from './services/QueueService';
import { connectDatabase } from 'the-last-of-guss-database';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
    logger: process.env.NODE_ENV === 'development' ? {
        level: 'info',
        transport: {
            target: 'pino-pretty'
        }
    } : false
});

// Регистрируем плагины
await fastify.register(cookie, {
    secret: process.env.JWT_SECRET || 'fallback-secret-key'
});

await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3012' || 'http://127.0.0.1:3012' || 'http://localhost:3020' || 'http://127.0.0.1:3020',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
});

// Регистрируем роуты API
await fastify.register(authRoutes, { prefix: '/api' });
await fastify.register(roundRoutes, { prefix: '/api' });
await fastify.register(tapRoutes, { prefix: '/api' });

// Health check
fastify.get('/health', async () => {
    return { status: 'OK', timestamp: new Date().toISOString() };
});

// Статический маршрут для всех файлов
const publicPath = path.join(__dirname, '../../public');

// Функция для определения MIME типа
function getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.mjs': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ttf': 'font/ttf',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'font/otf',
        '.ico': 'image/x-icon',
        '.txt': 'text/plain'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

// Статический маршрут для всех файлов
fastify.get('/*', async (request, reply) => {
    const url = request.url;

    // Исключаем API маршруты
    if (url.startsWith('/api/')) {
        return reply.status(404).send({ error: 'API route not found' });
    }

    // Для корневого пути отдаем index.html
    if (url === '/') {
        try {
            const html = await fs.readFile(path.join(publicPath, 'index.html'), 'utf-8');
            return reply.type('text/html').send(html);
        } catch (error) {
            return reply.status(404).send('Page not found');
        }
    }

    // Для CSS файлов компонентов ищем в правильной структуре
    if (url.includes('/components/') && url.endsWith('.css')) {
        try {
            // Извлекаем путь к CSS файлу
            const componentPath = url.replace(/^\/+/, '');
            const fullPath = path.join(__dirname, '../../public', componentPath);
            console.log('$$$$$$$$$$$$ ------------- $$$$$$$$$$$$$',__dirname,  fullPath)
            // Проверяем существование файла
            await fs.access(fullPath);

            console.log('-----------------------------------', fullPath)
            // Читаем и отдаем файл
            const content = await fs.readFile(fullPath, 'utf-8');
            return reply.type('text/css').send(content);
        } catch (error) {
            console.log(`CSS file not found: ${url}`);
            // Продолжаем к обычной логике
        }
    }

    // Для всех остальных путей пытаемся найти файл
    try {
        // Убираем начальный слэш и разрешаем только файлы внутри public директории
        const filePath = path.join(publicPath, url.replace(/^\/+/, ''));

        // Проверяем, что путь не выходит за пределы public директории
        const normalizedPath = path.normalize(filePath);
        if (!normalizedPath.startsWith(publicPath)) {
            return reply.status(403).send('Access denied');
        }

        // Проверяем существование файла
        await fs.access(normalizedPath);

        // Читаем и отдаем файл
        const content = await fs.readFile(normalizedPath);
        const contentType = getContentType(normalizedPath);

        return reply.type(contentType).send(content);
    } catch (error) {
        // Если файл не найден, отдаем index.html для SPA роутинга
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            try {
                const html = await fs.readFile(path.join(publicPath, 'index.html'), 'utf-8');
                return reply.type('text/html').send(html);
            } catch {
                return reply.status(404).send('Page not found');
            }
        }

        // Для других ошибок возвращаем 404
        return reply.status(404).send('File not found');
    }
});

// Обработка ошибок
fastify.setErrorHandler((error, _request, reply) => {
    fastify.log.error(error);

    if (error instanceof Error && 'validation' in error) {
        const validationError = error as any;
        return reply.status(400).send({
            error: 'Validation error',
            details: validationError.validation
        });
    }

    return reply.status(500).send({ error: 'Internal server error' });
});

// Запуск сервера
const start = async () => {
    try {
        await connectDatabase();

        // Инициализируем очередь тапов если включена в настройках
        if (process.env.USE_TAP_QUEUE === 'true') {
            QueueService.initialize();
            console.log('✅ Tap queue initialized');
        } else {
            console.log('ℹ️  Tap queue disabled (direct processing)');
        }

        // Запускаем периодическое обновление статусов раундов (каждые 10 секунд вместо 60)
        setInterval(async () => {
            try {
                const result = await RoundService.updateRoundStatuses();
                if (result.updated > 0) {
                    console.log(`🔄 Auto-updated ${result.updated} round statuses`);
                }
            } catch (error) {
                console.error('Error updating round statuses:', error);
            }
        }, 10000); // 10 секунд

        const port = parseInt(process.env.PORT || '3019');
        const host = '0.0.0.0';

        await fastify.listen({ port, host });
        console.log(`🚀 Server running on http://${host}:${port}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV}`);
        console.log(`📁 Serving static files from: ${publicPath}`);
        console.log(`📄 SPA fallback enabled`);
        console.log(`🔧 Tap processing mode: ${process.env.USE_TAP_QUEUE === 'true' ? 'QUEUE' : 'DIRECT'}`);
    } catch (err) {
        console.error('Server startup error:', err);
        process.exit(1);
    }
};

start();