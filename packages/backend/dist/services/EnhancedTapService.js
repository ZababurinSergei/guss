import { Transaction } from 'sequelize';
import { sequelize, User, Round, Participant } from 'the-last-of-guss-database';
export class EnhancedTapService {
    static USER_COOLDOWN = parseInt(process.env.TAP_COOLDOWN_MS || '50');
    static userLastTap = new Map();
    static async processTap(roundId, userId) {
        const now = Date.now();
        const lastTap = this.userLastTap.get(userId);
        console.log('----------!!!!!!!------------', lastTap);
        if (lastTap && now - lastTap < this.USER_COOLDOWN) {
            throw new Error('Tap too fast');
        }
        this.userLastTap.set(userId, now);
        return await sequelize.transaction(async (transaction) => {
            const round = await Round.findByPk(roundId, {
                transaction,
                lock: Transaction.LOCK.UPDATE,
                skipLocked: true
            });
            if (!round)
                throw new Error('Round not found');
            const now = new Date();
            const start = new Date(round.start_date);
            const end = new Date(round.end_date);
            if (now < start)
                throw new Error('Round has not started');
            if (now > end)
                throw new Error('Round has ended');
            const user = await User.findByPk(userId, { transaction });
            if (!user)
                throw new Error('User not found');
            if (user.role === 'nikita') {
                return {
                    tap_count: 0,
                    score: 0,
                    total_score: round.total_score,
                    is_special_tap: false
                };
            }
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
            await participant.increment('tap_count', { by: 1, transaction });
            await participant.reload({ transaction });
            const tapCount = participant.tap_count;
            let points = 1;
            let isSpecialTap = false;
            if (tapCount % 11 === 0) {
                points = 10;
                isSpecialTap = true;
            }
            await participant.increment('score', { by: points, transaction });
            await round.increment('total_score', { by: points, transaction });
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
    static async processTapAtomic(roundId, userId) {
        return await sequelize.transaction(async (transaction) => {
            const round = await Round.findByPk(roundId, {
                transaction,
                lock: Transaction.LOCK.UPDATE,
                skipLocked: true
            });
            if (!round)
                throw new Error('Round not found');
            const now = new Date();
            if (now < round.dataValues.start_date)
                throw new Error('Round has not started');
            if (now > round.dataValues.end_date)
                throw new Error('Round has ended');
            const user = await User.findByPk(userId, { transaction });
            if (!user)
                throw new Error('User not found');
            if (user.dataValues.role === 'nikita') {
                console.log(`🎭 Nikita user ${userId} tapped - score not counted`);
                return {
                    tap_count: 0,
                    score: 0,
                    total_score: round.dataValues.total_score,
                    is_special_tap: false
                };
            }
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
    static async quickRoundCheck(roundId) {
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
    static async getUserTapStats(userId) {
        const lastTap = this.userLastTap.get(userId) || 0;
        const now = Date.now();
        const timeSinceLastTap = now - lastTap;
        const cooldownRemaining = Math.max(0, this.USER_COOLDOWN - timeSinceLastTap);
        return {
            lastTap,
            cooldown: cooldownRemaining
        };
    }
    static cleanupOldCooldowns(maxAge = 60000) {
        const now = Date.now();
        for (const [userId, lastTap] of this.userLastTap.entries()) {
            if (now - lastTap > maxAge) {
                this.userLastTap.delete(userId);
            }
        }
    }
}
