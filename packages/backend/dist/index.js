import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { authRoutes } from './routes/auth.js';
import { roundRoutes } from './routes/rounds.js';
import { tapRoutes } from './routes/taps.js';
import { RoundService } from './services/RoundService.js';
import { QueueService } from './services/QueueService.js';
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
await fastify.register(cookie, {
    secret: process.env.JWT_SECRET || 'fallback-secret-key'
});
await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3012' || 'http://127.0.0.1:3012' || 'http://localhost:3020' || 'http://127.0.0.1:3020',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
});
await fastify.register(authRoutes, { prefix: '/api' });
await fastify.register(roundRoutes, { prefix: '/api' });
await fastify.register(tapRoutes, { prefix: '/api' });
fastify.get('/health', async () => {
    return { status: 'OK', timestamp: new Date().toISOString() };
});
const publicPath = path.join(__dirname, '../../public');
function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
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
fastify.get('/*', async (request, reply) => {
    const url = request.url;
    if (url.startsWith('/api/')) {
        return reply.status(404).send({ error: 'API route not found' });
    }
    if (url === '/') {
        try {
            const html = await fs.readFile(path.join(publicPath, 'index.html'), 'utf-8');
            return reply.type('text/html').send(html);
        }
        catch (error) {
            return reply.status(404).send('Page not found');
        }
    }
    if (url.includes('/components/') && url.endsWith('.css')) {
        try {
            const componentPath = url.replace(/^\/+/, '');
            const fullPath = path.join(__dirname, '../../public', componentPath);
            console.log('$$$$$$$$$$$$ ------------- $$$$$$$$$$$$$', __dirname, fullPath);
            await fs.access(fullPath);
            console.log('-----------------------------------', fullPath);
            const content = await fs.readFile(fullPath, 'utf-8');
            return reply.type('text/css').send(content);
        }
        catch (error) {
            console.log(`CSS file not found: ${url}`);
        }
    }
    try {
        const filePath = path.join(publicPath, url.replace(/^\/+/, ''));
        const normalizedPath = path.normalize(filePath);
        if (!normalizedPath.startsWith(publicPath)) {
            return reply.status(403).send('Access denied');
        }
        await fs.access(normalizedPath);
        const content = await fs.readFile(normalizedPath);
        const contentType = getContentType(normalizedPath);
        return reply.type(contentType).send(content);
    }
    catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            try {
                const html = await fs.readFile(path.join(publicPath, 'index.html'), 'utf-8');
                return reply.type('text/html').send(html);
            }
            catch {
                return reply.status(404).send('Page not found');
            }
        }
        return reply.status(404).send('File not found');
    }
});
fastify.setErrorHandler((error, _request, reply) => {
    fastify.log.error(error);
    if (error instanceof Error && 'validation' in error) {
        const validationError = error;
        return reply.status(400).send({
            error: 'Validation error',
            details: validationError.validation
        });
    }
    return reply.status(500).send({ error: 'Internal server error' });
});
const start = async () => {
    try {
        await connectDatabase();
        if (process.env.USE_TAP_QUEUE === 'true') {
            QueueService.initialize();
            console.log('✅ Tap queue initialized');
        }
        else {
            console.log('ℹ️  Tap queue disabled (direct processing)');
        }
        setInterval(async () => {
            try {
                const result = await RoundService.updateRoundStatuses();
                if (result.updated > 0) {
                    console.log(`🔄 Auto-updated ${result.updated} round statuses`);
                }
            }
            catch (error) {
                console.error('Error updating round statuses:', error);
            }
        }, 10000);
        const port = parseInt(process.env.PORT || '3019');
        const host = '0.0.0.0';
        await fastify.listen({ port, host });
        console.log(`🚀 Server running on http://${host}:${port}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV}`);
        console.log(`📁 Serving static files from: ${publicPath}`);
        console.log(`📄 SPA fallback enabled`);
        console.log(`🔧 Tap processing mode: ${process.env.USE_TAP_QUEUE === 'true' ? 'QUEUE' : 'DIRECT'}`);
    }
    catch (err) {
        console.error('Server startup error:', err);
        process.exit(1);
    }
};
start();
