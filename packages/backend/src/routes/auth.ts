import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/auth';

export async function authRoutes(fastify: FastifyInstance) {
    fastify.post('/auth/login', AuthController.login);
    fastify.post('/auth/logout', { preHandler: authMiddleware }, AuthController.logout);
    fastify.get('/auth/me', { preHandler: authMiddleware }, AuthController.getProfile);
}