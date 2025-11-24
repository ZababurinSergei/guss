import { logger as libp2pLogger } from '@libp2p/logger';

// Цветовые константы
const COLORS = {
    WARN: '\x1b[33m',     // Темно-желтый
    INFO: '\x1b[36m',     // Голубой
    DEBUG: '\x1b[90m',    // Серый
    ERROR: '\x1b[31m',    // Красный
    RESET: '\x1b[0m'      // Сброс
};

export function createLogger(prefix) {
    const baseLogger = libp2pLogger(prefix);

    const enhancedLogger = (...args) => baseLogger(...args);

    // Копируем существующие методы
    enhancedLogger.trace = baseLogger.trace;

    // Переопределяем с цветами
    enhancedLogger.warn = (...args) => {
        baseLogger(`${COLORS.WARN}⚠️ WARN:${COLORS.RESET}`, ...args);
    };

    enhancedLogger.info = (...args) => {
        baseLogger(`${COLORS.INFO}ℹ️ INFO:${COLORS.RESET}`, ...args);
    };

    enhancedLogger.debug = (...args) => {
        baseLogger(`${COLORS.DEBUG}🔍 DEBUG:${COLORS.RESET}`, ...args);
    };

    enhancedLogger.error = (...args) => {
        baseLogger(`${COLORS.ERROR}❌ ERROR:${COLORS.RESET}`, ...args);
    };

    return enhancedLogger;
}