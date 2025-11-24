export default {
    // Настройки прокси
    backend: {
        port: process.env.BACKEND_PORT || 3012,
        host: 'localhost'
    },

    proxy: {
        port: process.env.PROXY_PORT || 3020,
        host: process.env.PROXY_HOST || 'localhost'
    },

    // Настройки CORS
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3012',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        headers: ['Content-Type', 'Authorization', 'Cookie']
    },

    // Таймауты
    timeouts: {
        proxy: 30000,
        socket: 60000
    },

    // Логирование
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: '[:method] :url -> :target (:status) - :response-time ms'
    }
};