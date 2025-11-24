import Redis from 'ioredis';
import { EnhancedTapService } from './EnhancedTapService.js';
export class QueueService {
    static redis;
    static QUEUE_KEY = 'tap_queue';
    static PROCESSING_KEY = 'processing_taps';
    static USER_RATE_LIMIT_KEY = 'user_rate_limit';
    static COMPLETED_PREFIX = 'completed:';
    static FAILED_PREFIX = 'failed:';
    static isProcessorRunning = false;
    static initialize() {
        if (!this.redis) {
            this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
                maxRetriesPerRequest: 3,
                lazyConnect: true
            });
            this.redis.on('error', (error) => {
                console.error('Redis connection error:', error);
            });
            this.redis.on('connect', () => {
                console.log('✅ Redis connected successfully');
            });
        }
        if (!this.isProcessorRunning) {
            this.startProcessor();
            this.isProcessorRunning = true;
        }
    }
    static async enqueueTap(roundId, userId) {
        if (!this.redis) {
            throw new Error('QueueService not initialized');
        }
        const task = {
            roundId,
            userId,
            timestamp: Date.now(),
            id: `${userId}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`
        };
        const rateLimitKey = `${this.USER_RATE_LIMIT_KEY}:${userId}`;
        const currentCount = await this.redis.incr(rateLimitKey);
        if (currentCount === 1) {
            await this.redis.expire(rateLimitKey, 1);
        }
        else if (currentCount > 10) {
            await this.redis.decr(rateLimitKey);
            throw new Error('Rate limit exceeded: maximum 10 taps per second');
        }
        await this.redis.lpush(this.QUEUE_KEY, JSON.stringify(task));
        console.log(`📨 Tap queued: ${task.id} for user ${userId} in round ${roundId}`);
        return task.id;
    }
    static async getTapStatus(taskId) {
        if (!this.redis) {
            throw new Error('QueueService not initialized');
        }
        const processingTime = await this.redis.hget(this.PROCESSING_KEY, taskId);
        if (processingTime) {
            return {
                status: 'processing',
                timestamp: parseInt(processingTime)
            };
        }
        const completedResult = await this.redis.get(`${this.COMPLETED_PREFIX}${taskId}`);
        if (completedResult) {
            try {
                const result = JSON.parse(completedResult);
                return {
                    status: 'completed',
                    result,
                    timestamp: Date.now()
                };
            }
            catch (error) {
                console.error('Error parsing completed task result:', error);
            }
        }
        const failedError = await this.redis.get(`${this.FAILED_PREFIX}${taskId}`);
        if (failedError) {
            return {
                status: 'failed',
                error: failedError,
                timestamp: Date.now()
            };
        }
        return {
            status: 'pending',
            timestamp: Date.now()
        };
    }
    static async getQueueStatus() {
        if (!this.redis) {
            throw new Error('QueueService not initialized');
        }
        const pending = await this.redis.llen(this.QUEUE_KEY);
        const processing = await this.redis.hlen(this.PROCESSING_KEY);
        return {
            pending,
            processing
        };
    }
    static async cleanupOldTasks(hours = 1) {
        if (!this.redis) {
            throw new Error('QueueService not initialized');
        }
        const now = Date.now();
        const expirationTime = hours * 60 * 60 * 1000;
        const completedKeys = await this.redis.keys(`${this.COMPLETED_PREFIX}*`);
        for (const key of completedKeys) {
            const taskId = key.replace(this.COMPLETED_PREFIX, '');
            const taskInfo = await this.getTapStatus(taskId);
            if (taskInfo.status === 'completed' && taskInfo.timestamp &&
                now - taskInfo.timestamp > expirationTime) {
                await this.redis.del(key);
            }
        }
        const failedKeys = await this.redis.keys(`${this.FAILED_PREFIX}*`);
        for (const key of failedKeys) {
            const taskId = key.replace(this.FAILED_PREFIX, '');
            const taskInfo = await this.getTapStatus(taskId);
            if (taskInfo.status === 'failed' && taskInfo.timestamp &&
                now - taskInfo.timestamp > expirationTime) {
                await this.redis.del(key);
            }
        }
        const processingTasks = await this.redis.hgetall(this.PROCESSING_KEY);
        for (const [taskId, timestampStr] of Object.entries(processingTasks)) {
            const timestamp = parseInt(timestampStr);
            if (now - timestamp > 5 * 60 * 1000) {
                await this.redis.hdel(this.PROCESSING_KEY, taskId);
                console.log(`🧹 Cleaned up stuck task: ${taskId}`);
            }
        }
    }
    static async startProcessor() {
        console.log('🔄 Starting tap queue processor...');
        const processNext = async () => {
            try {
                if (!this.redis) {
                    console.error('Redis not available, restarting processor in 5 seconds...');
                    setTimeout(() => this.startProcessor(), 5000);
                    return;
                }
                const result = await this.redis.brpop(this.QUEUE_KEY, 1);
                if (result) {
                    const task = JSON.parse(result[1]);
                    await this.processTask(task);
                }
                setImmediate(() => processNext());
            }
            catch (error) {
                console.error('Queue processor error:', error);
                await new Promise(resolve => setTimeout(resolve, 1000));
                setImmediate(() => processNext());
            }
        };
        processNext();
        setInterval(() => {
            this.cleanupOldTasks(1).catch(error => {
                console.error('Cleanup error:', error);
            });
        }, 30 * 60 * 1000);
    }
    static async processTask(task) {
        let processingSet = false;
        try {
            await this.redis.hset(this.PROCESSING_KEY, task.id, Date.now().toString());
            processingSet = true;
            console.log(`🔧 Processing tap: ${task.id} for user ${task.userId}`);
            const result = await EnhancedTapService.processTapAtomic(task.roundId, task.userId);
            await this.redis.hdel(this.PROCESSING_KEY, task.id);
            await this.redis.setex(`${this.COMPLETED_PREFIX}${task.id}`, 3600, JSON.stringify(result));
            console.log(`✅ Tap processed successfully: ${task.id}`, {
                tap_count: result.tap_count,
                score: result.score,
                total_score: result.total_score,
                is_special_tap: result.is_special_tap
            });
        }
        catch (error) {
            console.error(`❌ Task ${task.id} failed:`, error);
            if (processingSet) {
                await this.redis.hdel(this.PROCESSING_KEY, task.id);
            }
            await this.redis.setex(`${this.FAILED_PREFIX}${task.id}`, 3600, error instanceof Error ? error.message : 'Unknown error');
        }
    }
    static async shutdown() {
        if (this.redis) {
            await this.redis.quit();
            console.log('🛑 Queue service shutdown completed');
        }
    }
    static async debugQueue() {
        if (!this.redis) {
            return { error: 'Redis not connected' };
        }
        const pendingTasks = await this.redis.lrange(this.QUEUE_KEY, 0, -1);
        const processingTasks = await this.redis.hgetall(this.PROCESSING_KEY);
        const queueStatus = await this.getQueueStatus();
        return {
            queueStatus,
            pendingTasks: pendingTasks.map((task, index) => ({
                position: index,
                task: JSON.parse(task)
            })),
            processingTasks: Object.entries(processingTasks).map(([taskId, timestamp]) => ({
                taskId,
                startedAt: new Date(parseInt(timestamp)),
                duration: Date.now() - parseInt(timestamp)
            }))
        };
    }
}
