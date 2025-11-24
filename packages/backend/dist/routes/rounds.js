import { RoundController } from '../controllers/RoundController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { RoundService } from '../services/RoundService.js';
export async function roundRoutes(fastify) {
    fastify.addHook('preHandler', authMiddleware);
    fastify.get('/rounds', RoundController.getAllRounds);
    fastify.get('/rounds/:id', RoundController.getRound);
    fastify.post('/rounds', { preHandler: adminMiddleware }, RoundController.createRound);
    fastify.post('/rounds/:id/update-status', { preHandler: adminMiddleware }, async (request, reply) => {
        try {
            const { id } = request.params;
            const round = await RoundService.forceUpdateRoundStatus(id);
            if (!round) {
                return reply.status(404).send({ error: 'Round not found' });
            }
            return reply.send({
                message: 'Round status updated',
                round
            });
        }
        catch (error) {
            console.error('Force update round status error:', error);
            return reply.status(500).send({ error: 'Failed to update round status' });
        }
    });
}
