import { TapResult } from '../types';
import { Transaction } from 'sequelize';
import { sequelize, User, Round, Participant } from 'the-last-of-guss-database';

export class EnhancedTapService {
    private static readonly USER_COOLDOWN = parseInt(process.env.TAP_COOLDOWN_MS || '50'); // ms между тапами одного пользователя
    private static readonly userLastTap = new Map<string, number>();

    static async processTap(roundId: string, userId: string): Promise<TapResult> {
        // Проверка cooldown на уровне приложения
        const now = Date.now();
        const lastTap = this.userLastTap.get(userId);
        console.log('----------!!!!!!!------------', lastTap)
        if (lastTap && now - lastTap < this.USER_COOLDOWN) {
            throw new Error('Tap too fast');
        }

        this.userLastTap.set(userId, now);

        return await sequelize.transaction(async (transaction: Transaction) => {
            // Блокируем запись раунда для чтения
            const round = await Round.findByPk(roundId, {
                transaction,
                lock: Transaction.LOCK.UPDATE,
                skipLocked: true
            });

            if (!round) throw new Error('Round not found');

            // Проверяем активность раунда с блокировкой
            const now = new Date();
            const start = new Date(round.start_date);
            const end = new Date(round.end_date);

            if (now < start) throw new Error('Round has not started');
            if (now > end) throw new Error('Round has ended');

            const user = await User.findByPk(userId, { transaction });
            if (!user) throw new Error('User not found');

            if (user.role === 'nikita') {
                return {
                    tap_count: 0,
                    score: 0,
                    total_score: round.total_score,
                    is_special_tap: false
                };
            }

            // Блокируем запись участника
            const [participant] = await Participant.findOrCreate({
                where: {
                    round_id: roundId,
                    user_id: userId
                },
                defaults: {
                    round_id: roundId,
                    user_id: userId,
                    tap_count: 0,
                    score: 0
                } as any,
                transaction,
                lock: Transaction.LOCK.UPDATE,
                skipLocked: true
            });

            // Атомарное обновление через Sequelize
            await participant.increment('tap_count', { by: 1, transaction });

            // Перезагружаем для получения актуального значения
            await participant.reload({ transaction });

            const tapCount = participant.tap_count;
            let points = 1;
            let isSpecialTap = false;

            if (tapCount % 11 === 0) {
                points = 10;
                isSpecialTap = true;
            }

            // Атомарное обновление очков
            await participant.increment('score', { by: points, transaction });
            await round.increment('total_score', { by: points, transaction });

            // Получаем финальные значения
            await participant.reload({ transaction });
            await round.reload({ transaction });

            return {
                tap_count: participant.tap_count,
                score: participant.score,
                total_score: round.total_score,
                is_special_tap: isSpecialTap
            };
        });
    }

    static async processTapAtomic(roundId: string, userId: string): Promise<TapResult> {
        return await sequelize.transaction(async (transaction: Transaction) => {
            // Блокируем раунд для обновления
            const round = await Round.findByPk(roundId, {
                transaction,
                lock: Transaction.LOCK.UPDATE,
                skipLocked: true
            });

            if (!round) throw new Error('Round not found');

            // Проверяем активность раунда
            const now = new Date();
            if (now < round.dataValues.start_date) throw new Error('Round has not started');
            if (now > round.dataValues.end_date) throw new Error('Round has ended');

            // Находим пользователя и проверяем, является ли он Никитой
            const user = await User.findByPk(userId, { transaction });
            if (!user) throw new Error('User not found');

            // Если пользователь Никита - возвращаем нулевой результат без сохранения
            if (user.dataValues.role === 'nikita') {
                console.log(`🎭 Nikita user ${userId} tapped - score not counted`);
                return {
                    tap_count: 0,
                    score: 0,
                    total_score: round.dataValues.total_score,
                    is_special_tap: false
                };
            }


            // Находим или создаем участника
            const [participant] = await Participant.findOrCreate({
                where: {
                    round_id: roundId,
                    user_id: userId
                },
                defaults: {
                    round_id: roundId,
                    user_id: userId,
                    tap_count: 0,
                    score: 0
                },
                transaction,
                lock: Transaction.LOCK.UPDATE,
                skipLocked: true
            });

            // Обновляем счетчики
            const currentTapCount = participant.dataValues.tap_count || 0;
            const currentScore = participant.dataValues.score || 0;
            const newTapCount = currentTapCount + 1;
            const points = newTapCount % 11 === 0 ? 10 : 1;
            const newScore = currentScore + points;

            await participant.update({
                tap_count: newTapCount,
                score: newScore
            }, { transaction });

            await round.increment('total_score', { by: points, transaction });

            // Получаем обновленные данные
            await participant.reload({ transaction });
            await round.reload({ transaction });

            return {
                tap_count: participant.dataValues.tap_count,
                score: participant.dataValues.score,
                total_score: round.dataValues.total_score,
                is_special_tap: newTapCount % 11 === 0
            };
        });
    }

    // Быстрая проверка раунда без блокировок (для предварительной валидации)
    static async quickRoundCheck(roundId: string): Promise<{isActive: boolean, reason?: string}> {
        const round = await Round.findByPk(roundId);

        if (!round) {
            return { isActive: false, reason: 'Round not found' };
        }

        const now = new Date();
        const start = new Date(round.start_date);
        const end = new Date(round.end_date);

        if (now < start) {
            return { isActive: false, reason: 'Round has not started' };
        }

        if (now > end) {
            return { isActive: false, reason: 'Round has ended' };
        }

        return { isActive: true };
    }

    // Получение статистики тапов пользователя (для отладки)
    static async getUserTapStats(userId: string): Promise<{lastTap: number, cooldown: number}> {
        const lastTap = this.userLastTap.get(userId) || 0;
        const now = Date.now();
        const timeSinceLastTap = now - lastTap;
        const cooldownRemaining = Math.max(0, this.USER_COOLDOWN - timeSinceLastTap);

        return {
            lastTap,
            cooldown: cooldownRemaining
        };
    }

    // Очистка старых записей cooldown (периодическая очистка)
    static cleanupOldCooldowns(maxAge: number = 60000): void {
        const now = Date.now();
        for (const [userId, lastTap] of this.userLastTap.entries()) {
            if (now - lastTap > maxAge) {
                this.userLastTap.delete(userId);
            }
        }
    }
}