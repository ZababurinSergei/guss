import { Round } from 'the-last-of-guss-database';
export class RoundCheckService {
    static async quickRoundCheck(roundId) {
        try {
            const round = await Round.findByPk(roundId);
            if (!round) {
                return { isActive: false, reason: 'Round not found' };
            }
            const now = new Date();
            const start = new Date(round.dataValues.start_date);
            const end = new Date(round.dataValues.end_date);
            if (now < start) {
                const timeUntilStart = Math.ceil((start.getTime() - now.getTime()) / 1000);
                return {
                    isActive: false,
                    reason: `Round starts in ${timeUntilStart} seconds`
                };
            }
            if (now > end) {
                return { isActive: false, reason: 'Round has ended' };
            }
            if (round.dataValues.status !== 'active') {
                return {
                    isActive: false,
                    reason: `Round is ${round.dataValues.status}`
                };
            }
            return { isActive: true };
        }
        catch (error) {
            console.error('Quick round check error:', error);
            return {
                isActive: false,
                reason: 'Error checking round status'
            };
        }
    }
    static async validateRoundForTap(roundId) {
        try {
            const round = await Round.findByPk(roundId);
            if (!round) {
                return { valid: false, error: 'Round not found' };
            }
            const now = new Date();
            const start = new Date(round.start_date);
            const end = new Date(round.end_date);
            if (now < start) {
                const timeUntilStart = Math.ceil((start.getTime() - now.getTime()) / 1000);
                return {
                    valid: false,
                    error: `Round starts in ${timeUntilStart} seconds`
                };
            }
            if (now > end) {
                return { valid: false, error: 'Round has ended' };
            }
            if (round.status !== 'active') {
                return {
                    valid: false,
                    error: `Cannot tap - round is ${round.status}`
                };
            }
            return { valid: true, round };
        }
        catch (error) {
            console.error('Round validation error:', error);
            return {
                valid: false,
                error: 'Internal server error during round validation'
            };
        }
    }
    static async getRoundTimeInfo(roundId) {
        try {
            const round = await Round.findByPk(roundId);
            if (!round) {
                return { exists: false, isActive: false, status: 'not_found' };
            }
            const now = new Date();
            const start = new Date(round.start_date);
            const end = new Date(round.end_date);
            let timeUntilStart;
            let timeUntilEnd;
            let isActive = false;
            if (now < start) {
                timeUntilStart = Math.ceil((start.getTime() - now.getTime()) / 1000);
            }
            else if (now > end) {
                timeUntilEnd = Math.ceil((now.getTime() - end.getTime()) / 1000);
            }
            else {
                isActive = true;
                timeUntilEnd = Math.ceil((end.getTime() - now.getTime()) / 1000);
            }
            return {
                exists: true,
                isActive,
                timeUntilStart,
                timeUntilEnd,
                status: round.status
            };
        }
        catch (error) {
            console.error('Get round time info error:', error);
            return {
                exists: false,
                isActive: false,
                status: 'error'
            };
        }
    }
    static async batchRoundCheck(roundIds) {
        try {
            const rounds = await Round.findAll({
                where: {
                    id: roundIds
                }
            });
            const roundMap = new Map();
            rounds.forEach((round) => {
                roundMap.set(round.id, round);
            });
            const results = new Map();
            const now = new Date();
            for (const roundId of roundIds) {
                const round = roundMap.get(roundId);
                if (!round) {
                    results.set(roundId, { isActive: false, reason: 'Round not found' });
                    continue;
                }
                const start = new Date(round.start_date);
                const end = new Date(round.end_date);
                if (now < start) {
                    results.set(roundId, {
                        isActive: false,
                        reason: `Round starts at ${start.toISOString()}`
                    });
                }
                else if (now > end) {
                    results.set(roundId, {
                        isActive: false,
                        reason: `Round ended at ${end.toISOString()}`
                    });
                }
                else if (round.status !== 'active') {
                    results.set(roundId, {
                        isActive: false,
                        reason: `Round is ${round.status}`
                    });
                }
                else {
                    results.set(roundId, { isActive: true });
                }
            }
            return results;
        }
        catch (error) {
            console.error('Batch round check error:', error);
            const errorResults = new Map();
            roundIds.forEach(roundId => {
                errorResults.set(roundId, {
                    isActive: false,
                    reason: 'Error checking round status'
                });
            });
            return errorResults;
        }
    }
}
