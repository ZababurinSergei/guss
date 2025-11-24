import { EnhancedTapController } from '../controllers/EnhancedTapController.js';
import { authMiddleware } from '../middleware/auth.js';
export async function tapRoutes(fastify) {
    fastify.addHook('preHandler', authMiddleware);
    fastify.post('/rounds/:roundId/tap', EnhancedTapController.tap);
    fastify.get('/tap/status/:taskId', EnhancedTapController.getTapStatus);
}
