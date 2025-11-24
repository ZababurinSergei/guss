import { AuthController } from '../controllers/AuthController.js';
import { authMiddleware } from '../middleware/auth.js';
export async function authRoutes(fastify) {
    fastify.post('/auth/login', AuthController.login);
    fastify.post('/auth/logout', { preHandler: authMiddleware }, AuthController.logout);
    fastify.get('/auth/me', { preHandler: authMiddleware }, AuthController.getProfile);
}
