import { FastifyRequest, FastifyReply } from 'fastify';
import { RoundService } from '../services/RoundService';

export class RoundController {
    static async createRound(_request: FastifyRequest, reply: FastifyReply) {
        try {
            const round = await RoundService.createRound();
            return reply.status(201).send(round);
        } catch (error) {
            console.error('Create round error:', error);
            return reply.status(500).send({ error: 'Failed to create round' });
        }
    }

    static async getAllRounds(_request: FastifyRequest, reply: FastifyReply) {
        try {
            const rounds = await RoundService.getAllRounds();
            return reply.send(rounds);
        } catch (error) {
            console.error('Get rounds error:', error);
            return reply.status(500).send({ error: 'Failed to fetch rounds' });
        }
    }

    static async getRound(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as { id: string };
            const roundWithStats = await RoundService.getRoundWithStats(id, request.user.id);

            if (!roundWithStats) {
                return reply.status(404).send({ error: 'Round not found' });
            }

            console.log('$$$$$$$$$$$$$$$$$$$$ getRound $$$$$$$$$$$$$$$$$$$$$$$$', roundWithStats)
            return reply.send(roundWithStats);
        } catch (error) {
            console.error('Get round error:', error);
            return reply.status(500).send({ error: 'Failed to fetch round' });
        }
    }
}