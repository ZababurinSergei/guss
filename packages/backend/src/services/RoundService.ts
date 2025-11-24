import { RoundWithStats } from '../types';
import { Op } from 'sequelize';
import { User, Round, Participant } from 'the-last-of-guss-database';

export class RoundService {
    static async createRound(): Promise<Round> {
        const roundDuration = parseInt(process.env.ROUND_DURATION || '60')  * 1000; // 60 секунд
        const cooldownDuration = parseInt(process.env.COOLDOWN_DURATION || '30') * 1000; // 30 секунд

        const startDate = new Date(Date.now() + cooldownDuration);
        const endDate = new Date(startDate.getTime() + roundDuration);

        // Создаем раунд с автоматически определенным статусом
        const round = await Round.create({
            start_date: startDate,
            end_date: endDate
        });

        // Принудительно обновляем статус после создания
        await round.updateAndSaveStatus();

        return round;
    }

    static async getAllRounds(): Promise<Round[]> {
        const rounds = await Round.findAll({
            order: [['created_at', 'DESC']]
        });

        // Обновляем статусы всех полученных раундов
        for (const round of rounds) {
            await round.updateAndSaveStatus();
        }

        return rounds;
    }

    static async getRoundWithStats(roundId: string, userId?: string): Promise<RoundWithStats | null> {
        const round = await Round.findByPk(roundId);
        if (!round) return null;

        // Обновляем статус перед возвратом данных
        await round.updateAndSaveStatus();

        const participants = await Participant.findAll({
            where: { round_id: roundId },
            include: [{
                model: User,
                attributes: ['id', 'username']
            }],
            order: [['score', 'DESC']]
        });

        // Исправленная типизация
        const participantsData = participants.map((p: any) => {
            const participant = p as Participant & { User?: User };
            return {
                user_id: participant.dataValues.user_id,
                username: participant.User?.username || 'Unknown',
                tap_count: participant.dataValues.tap_count,
                score: participant.dataValues.score
            };
        });

        let userStats: { tap_count: number; score: number } | undefined;

        if (userId) {
            const userParticipant = participants.find((p: Participant) => p.dataValues.user_id === userId);
            if (userParticipant) {
                userStats = {
                    tap_count: userParticipant.dataValues.tap_count,
                    score: userParticipant.dataValues.score
                };
            }
        }

        let winner: { username: string; score: number } | undefined;
        if (round.status === 'finished' && participants.length > 0) {
            const topParticipant = participants[0] as any;
            if (topParticipant && topParticipant.dataValues.score > 0) {
                winner = {
                    username: topParticipant.User?.username || 'Unknown',
                    score: topParticipant.dataValues.score
                };
            }
        }

        const roundData = round.toJSON();

        return {
            ...roundData,
            participants: participantsData,
            user_stats: userStats,
            winner
        } as RoundWithStats;
    }

    static async getActiveRounds(): Promise<Round[]> {
        const now = new Date();
        const rounds = await Round.findAll({
            where: {
                start_date: { [Op.lte]: now },
                end_date: { [Op.gte]: now }
            },
            order: [['start_date', 'ASC']]
        });

        // Обновляем статусы активных раундов
        for (const round of rounds) {
            await round.updateAndSaveStatus();
        }

        return rounds;
    }

    static async updateRoundStatuses(): Promise<{ updated: number }> {
        const rounds = await Round.findAll({
            where: {
                status: { [Op.in]: ['cooldown', 'active'] }
            }
        });

        let updatedCount = 0;
        for (const round of rounds) {
            const oldStatus = round.dataValues.status;
            await round.updateAndSaveStatus();

            console.log('=============== rounds =================', round.dataValues.status)
            if (round.dataValues.status !== oldStatus) {
                updatedCount++;
                console.log(`🔄 Round ${round.dataValues.id} status changed: ${oldStatus} -> ${round.dataValues.status}`);
            }
        }

        console.log(`✅ Updated ${updatedCount} round statuses`);
        return { updated: updatedCount };
    }

    // Новый метод для принудительного обновления статуса конкретного раунда
    static async forceUpdateRoundStatus(roundId: string): Promise<Round | null> {
        const round = await Round.findByPk(roundId);
        if (!round) return null;

        const oldStatus = round.status;
        await round.updateAndSaveStatus();

        if (round.status !== oldStatus) {
            console.log(`🔄 Force updated round ${roundId}: ${oldStatus} -> ${round.status}`);
        }

        return round;
    }
}