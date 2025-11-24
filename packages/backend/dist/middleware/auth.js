import { AuthService } from '../services/AuthService.js';
export const authMiddleware = async (request, reply) => {
    try {
        const token = extractToken(request);
        if (!token) {
            return reply.status(401).send({ error: 'Authentication required' });
        }
        const user = await AuthService.validateToken(token);
        request.user = user;
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        return reply.status(401).send({ error: 'Invalid token' });
    }
};
export const adminMiddleware = async (request, reply) => {
    if (request.user.role !== 'admin') {
        return reply.status(403).send({ error: 'Admin access required' });
    }
};
function extractToken(request) {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    const tokenCookie = request.cookies?.token;
    if (tokenCookie) {
        return tokenCookie;
    }
    const tokenQuery = request.query?.token;
    if (tokenQuery) {
        return tokenQuery;
    }
    return null;
}
