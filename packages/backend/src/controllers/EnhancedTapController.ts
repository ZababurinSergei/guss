import { FastifyRequest, FastifyReply } from 'fastify';
import { QueueService } from '../services/QueueService';
import { EnhancedTapService } from '../services/EnhancedTapService';
import { RoundCheckService } from '../services/RoundCheckService';

export class EnhancedTapController {
    static async tap(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { roundId } = request.params as { roundId: string };
            const userId = request.user.id;

            console.log(`🎯 Processing tap for user ${userId} in round ${roundId}`);

            // Быстрая проверка раунда без блокировки
            const quickCheck = await RoundCheckService.quickRoundCheck(roundId);

            if (!quickCheck.isActive) {
                console.log(`❌ Round check failed: ${quickCheck.reason}`);
                return reply.status(400).send({ error: quickCheck.reason });
            }

            // Опционально: используем очередь для высокой нагрузки
            const useQueue = process.env.USE_TAP_QUEUE === 'true';

            if (useQueue) {
                console.log(`📤 Enqueueing tap task for user ${userId}`);
                const taskId = await QueueService.enqueueTap(roundId, userId);

                return reply.send({
                    status: 'queued',
                    taskId,
                    message: 'Tap is being processed in queue'
                });
            } else {
                // Прямая обработка с блокировками
                console.log(`⚡ Direct tap processing for user ${userId}`);
                const result = await EnhancedTapService.processTapAtomic(roundId, userId);

                console.log(`✅ Tap processed successfully:`, {
                    user: userId,
                    tap_count: result.tap_count,
                    score: result.score,
                    total_score: result.total_score,
                    is_special_tap: result.is_special_tap
                });

                return reply.send(result);
            }

        } catch (error) {
            console.error('❌ Tap processing error:', error);

            if (error instanceof Error) {
                const message = error.message.toLowerCase();

                if (message.includes('not active') ||
                    message.includes('not found') ||
                    message.includes('ended') ||
                    message.includes('started') ||
                    message.includes('has not started') ||
                    message.includes('has ended')) {
                    return reply.status(400).send({ error: error.message });
                }

                if (message.includes('rate limit') ||
                    message.includes('too fast') ||
                    message.includes('cooldown')) {
                    return reply.status(429).send({
                        error: error.message,
                        retry_after: '50ms'
                    });
                }

                if (message.includes('locked') ||
                    message.includes('timeout') ||
                    message.includes('deadlock')) {
                    return reply.status(503).send({
                        error: 'System busy, please try again',
                        retry_after: '1s'
                    });
                }
            }

            return reply.status(500).send({
                error: 'Failed to process tap',
                details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
            });
        }
    }

    static async getTapStatus(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { taskId } = request.params as { taskId: string };

            if (!taskId) {
                return reply.status(400).send({ error: 'Task ID is required' });
            }

            console.log(`📊 Checking status for task: ${taskId}`);

            const statusResult = await QueueService.getTapStatus(taskId);

            let additionalData = {};

            // Если задача завершена, получаем результат
            if (statusResult.status === 'completed') {
                const resultJson = await (QueueService as any).redis.get(`completed:${taskId}`);
                if (resultJson) {
                    additionalData = { result: JSON.parse(resultJson) };
                }
            } else if (statusResult.status === 'failed') {
                const errorMessage = await (QueueService as any).redis.get(`failed:${taskId}`);
                if (errorMessage) {
                    additionalData = { error: errorMessage };
                }
            }

            return reply.send({
                taskId,
                ...statusResult,
                ...additionalData
            });

        } catch (error) {
            console.error('❌ Tap status check error:', error);
            return reply.status(500).send({
                error: 'Failed to check tap status',
                details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
            });
        }
    }

    static async getTapStatistics(request: FastifyRequest, reply: FastifyReply) {
        try {
            const userId = request.user.id;
            const useQueue = process.env.USE_TAP_QUEUE === 'true';

            const stats = {
                processing_mode: useQueue ? 'queue' : 'direct',
                user_id: userId,
                rate_limit: {
                    max_taps_per_second: parseInt(process.env.MAX_TAPS_PER_SECOND || '10'),
                    cooldown_ms: parseInt(process.env.TAP_COOLDOWN_MS || '50')
                },
                features: {
                    atomic_operations: true,
                    database_locks: true,
                    rate_limiting: true,
                    queue_support: useQueue
                }
            };

            return reply.send(stats);

        } catch (error) {
            console.error('❌ Statistics error:', error);
            return reply.status(500).send({
                error: 'Failed to get statistics',
                details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
            });
        }
    }

    static async batchTap(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { roundId, count = 1 } = request.body as { roundId: string; count?: number };
            const userId = request.user.id;

            if (count < 1 || count > 10) {
                return reply.status(400).send({ error: 'Count must be between 1 and 10' });
            }

            console.log(`🔄 Processing batch of ${count} taps for user ${userId}`);

            const results = [];
            const errors = [];

            for (let i = 0; i < count; i++) {
                try {
                    // Добавляем небольшую задержку между тапами в батче
                    if (i > 0) {
                        await new Promise(resolve => setTimeout(resolve, 10));
                    }

                    const result = await EnhancedTapService.processTapAtomic(roundId, userId);
                    results.push({
                        sequence: i + 1,
                        ...result
                    });

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    errors.push({
                        sequence: i + 1,
                        error: errorMessage
                    });

                    // Если получили ошибку rate limit, прерываем батч
                    if (errorMessage.includes('rate limit') || errorMessage.includes('too fast')) {
                        break;
                    }
                }
            }

            const response = {
                batch_id: `batch_${userId}_${Date.now()}`,
                total_requested: count,
                processed: results.length,
                failed: errors.length,
                results,
                errors: errors.length > 0 ? errors : undefined
            };

            console.log(`✅ Batch processed: ${results.length} successful, ${errors.length} failed`);

            return reply.send(response);

        } catch (error) {
            console.error('❌ Batch tap error:', error);
            return reply.status(500).send({
                error: 'Failed to process batch tap',
                details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
            });
        }
    }
}