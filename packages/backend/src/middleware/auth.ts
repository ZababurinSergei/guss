import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/AuthService';

// /11/backend/src/middleware/auth.ts
export const authMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const token = extractToken(request);
        if (!token) {
            return reply.status(401).send({ error: 'Authentication required' });
        }
        const user = await AuthService.validateToken(token);
        request.user = user;
    } catch (error) {
        console.error('Auth middleware error:', error);
        return reply.status(401).send({ error: 'Invalid token' });
    }
};

export const adminMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.user.role !== 'admin') {
        return reply.status(403).send({ error: 'Admin access required' });
    }
};

function extractToken(request: FastifyRequest): string | null {
    // Проверяем заголовок Authorization
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    // Проверяем куки
    const tokenCookie = (request as any).cookies?.token;
    if (tokenCookie) {
        return tokenCookie;
    }

    // Проверяем query параметр
    const tokenQuery = (request.query as any)?.token;
    if (tokenQuery) {
        return tokenQuery;
    }

    return null;
}