import { FastifyInstance } from 'fastify';
import { EnhancedTapController } from '../controllers/EnhancedTapController';
import { authMiddleware } from '../middleware/auth';

export async function tapRoutes(fastify: FastifyInstance) {
    fastify.addHook('preHandler', authMiddleware);

    fastify.post('/rounds/:roundId/tap', EnhancedTapController.tap);
    fastify.get('/tap/status/:taskId', EnhancedTapController.getTapStatus);
}