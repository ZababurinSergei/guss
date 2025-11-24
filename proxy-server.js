#!/usr/bin/env node

import http from 'http';
import httpProxy from 'http-proxy';
import dotenv from 'dotenv';

dotenv.config();

// Создаем прокси
const proxy = httpProxy.createProxyServer({
    changeOrigin: true,
    timeout: 30000
});

// Обработчики ошибок прокси
proxy.on('error', (err, req, res) => {
    console.error('Proxy Error:', err.message);

    if (!res.headersSent) {
        res.writeHead(502, {
            'Content-Type': 'application/json'
        });
    }

    res.end(JSON.stringify({
        error: 'Proxy error',
        message: err.message,
        timestamp: new Date().toISOString()
    }));
});

proxy.on('proxyReq', (proxyReq, req, res, options) => {
    console.log(`[PROXY] ${req.method} ${req.url} -> ${options.target.href}`);
});

// Создаем сервер
const server = http.createServer((req, res) => {
    // Устанавливаем CORS заголовки
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:3012');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Обработка preflight запросов
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Проксируем запрос к бэкенду
    const target = `http://localhost:${process.env.BACKEND_PORT || 3012}`;

    proxy.web(req, res, {
        target: target,
        secure: false
    });
});

// WebSocket поддержка для реального времени
server.on('upgrade', (req, socket, head) => {
    const target = `http://localhost:${process.env.BACKEND_PORT || 3019}`;

    proxy.ws(req, socket, head, {
        target: target,
        secure: false
    });
});

const PORT = process.env.PROXY_PORT || 3020;
const HOST = process.env.PROXY_HOST || 'localhost';

server.listen(PORT, HOST, () => {
    console.log(`🔄 Reverse Proxy Server running on http://${HOST}:${PORT}`);
    console.log(`🎯 Proxying to backend: http://localhost:${process.env.BACKEND_PORT || 3012}`);
    console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3012'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down proxy gracefully...');
    server.close(() => {
        console.log('✅ Proxy server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down proxy gracefully...');
    server.close(() => {
        console.log('✅ Proxy server closed');
        process.exit(0);
    });
});