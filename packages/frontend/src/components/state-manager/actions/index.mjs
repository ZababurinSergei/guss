export async function createActions(context) {
    return {
        handleRoundCreation: handleRoundCreation.bind(context),
        handleRoundJoin: handleRoundJoin.bind(context),
        handleUserTap: handleUserTap.bind(context),
        handleRoundCompletion: handleRoundCompletion.bind(context),
        handleRoundStatusUpdate: handleRoundStatusUpdate.bind(context)
    };
}

async function handleRoundCreation(roundData) {
    try {
        const stateManager = await this.getComponentAsync('state-manager', 'state-manager');
        if (!stateManager) {
            throw new Error('State manager not found');
        }

        const roundDuration = parseInt(process.env.ROUND_DURATION || '60') * 1000;
        const cooldownDuration = parseInt(process.env.COOLDOWN_DURATION || '30') * 1000;

        const newRound = {
            id: this.generateRoundId(),
            startDate: new Date(Date.now() + cooldownDuration).toISOString(),
            endDate: new Date(Date.now() + cooldownDuration + roundDuration).toISOString(),
            status: 'cooldown',
            totalScore: 0,
            participants: [],
            createdAt: new Date().toISOString(),
            ...roundData
        };

        await stateManager.addRound(newRound);

        // Notify about new round creation
        const navigationManager = await this.getComponentAsync('navigation-manager', 'navigation-manager');
        if (navigationManager) {
            await navigationManager.postMessage({
                type: 'ROUND_CREATED',
                payload: newRound
            });
        }

        return newRound;
    } catch (error) {
        console.error('Error creating round:', error);
        this.addError({
            componentName: this.constructor.name,
            source: 'handleRoundCreation',
            message: 'Failed to create round',
            details: error
        });
        throw error;
    }
}

async function handleRoundJoin(roundId, user) {
    try {
        const stateManager = await this.getComponentAsync('state-manager', 'state-manager');
        if (!stateManager) {
            throw new Error('State manager not found');
        }

        const round = await stateManager.getRound(roundId);
        if (!round) {
            throw new Error('Round not found');
        }

        // Check if user is already a participant
        const existingParticipant = round.participants.find(p => p.userId === user.id);
        if (!existingParticipant) {
            const newParticipant = {
                userId: user.id,
                username: user.username,
                tapCount: 0,
                score: 0,
                joinedAt: new Date().toISOString()
            };

            round.participants.push(newParticipant);
            await stateManager.updateRound(roundId, round);
        }

        return round;
    } catch (error) {
        console.error('Error joining round:', error);
        this.addError({
            componentName: this.constructor.name,
            source: 'handleRoundJoin',
            message: 'Failed to join round',
            details: error
        });
        throw error;
    }
}

async function handleUserTap(roundId, userId) {
    try {
        const stateManager = await this.getComponentAsync('state-manager', 'state-manager');
        if (!stateManager) {
            throw new Error('State manager not found');
        }

        const round = await stateManager.getRound(roundId);
        if (!round) {
            throw new Error('Round not found');
        }

        // Check if round is active
        const currentStatus = this.calculateRoundStatus(round);
        if (currentStatus !== 'active') {
            throw new Error('Round is not active');
        }

        const user = await stateManager.getCurrentUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        // Find participant
        let participant = round.participants.find(p => p.userId === userId);
        if (!participant) {
            throw new Error('User is not participating in this round');
        }

        // Update tap count
        participant.tapCount += 1;

        // Calculate points (every 11th tap gives 10 points)
        let points = 1;
        if (participant.tapCount % 11 === 0) {
            points = 10;
        }

        // For user with role 'nikita', points are not counted
        if (user.role !== 'nikita') {
            participant.score += points;
            round.totalScore += points;
        }

        await stateManager.updateRound(roundId, round);

        // Notify about tap
        const navigationManager = await this.getComponentAsync('navigation-manager', 'navigation-manager');
        if (navigationManager) {
            await navigationManager.postMessage({
                type: 'USER_TAPPED',
                payload: {
                    roundId,
                    userId,
                    tapCount: participant.tapCount,
                    score: participant.score,
                    totalScore: round.totalScore
                }
            });
        }

        return {
            tapCount: participant.tapCount,
            score: participant.score,
            totalScore: round.totalScore
        };
    } catch (error) {
        console.error('Error handling user tap:', error);
        this.addError({
            componentName: this.constructor.name,
            source: 'handleUserTap',
            message: 'Failed to process user tap',
            details: error
        });
        throw error;
    }
}

async function handleRoundCompletion(roundId) {
    try {
        const stateManager = await this.getComponentAsync('state-manager', 'state-manager');
        if (!stateManager) {
            throw new Error('State manager not found');
        }

        const round = await stateManager.getRound(roundId);
        if (!round) {
            throw new Error('Round not found');
        }

        // Update round status to finished
        round.status = 'finished';
        await stateManager.updateRound(roundId, round);

        // Determine winner
        let winner = null;
        if (round.participants.length > 0) {
            winner = round.participants.reduce((prev, current) =>
                (prev.score > current.score) ? prev : current
            );
        }

        // Notify about round completion
        const navigationManager = await this.getComponentAsync('navigation-manager', 'navigation-manager');
        if (navigationManager) {
            await navigationManager.postMessage({
                type: 'ROUND_COMPLETED',
                payload: {
                    roundId,
                    winner,
                    totalScore: round.totalScore,
                    participants: round.participants
                }
            });
        }

        return {
            roundId,
            winner,
            totalScore: round.totalScore,
            participants: round.participants
        };
    } catch (error) {
        console.error('Error completing round:', error);
        this.addError({
            componentName: this.constructor.name,
            source: 'handleRoundCompletion',
            message: 'Failed to complete round',
            details: error
        });
        throw error;
    }
}

async function handleRoundStatusUpdate(roundId) {
    try {
        const stateManager = await this.getComponentAsync('state-manager', 'state-manager');
        if (!stateManager) {
            throw new Error('State manager not found');
        }

        const round = await stateManager.getRound(roundId);
        if (!round) {
            throw new Error('Round not found');
        }

        const previousStatus = round.status;
        const currentStatus = this.calculateRoundStatus(round);

        // Update status if changed
        if (previousStatus !== currentStatus) {
            round.status = currentStatus;
            await stateManager.updateRound(roundId, round);

            // Notify about status change
            const navigationManager = await this.getComponentAsync('navigation-manager', 'navigation-manager');
            if (navigationManager) {
                await navigationManager.postMessage({
                    type: 'ROUND_STATUS_CHANGED',
                    payload: {
                        roundId,
                        previousStatus,
                        currentStatus,
                        round
                    }
                });
            }

            // If round just became active, notify participants
            if (currentStatus === 'active') {
                await navigationManager.postMessage({
                    type: 'ROUND_STARTED',
                    payload: round
                });
            }

            // If round just finished, handle completion
            if (currentStatus === 'finished') {
                await this.handleRoundCompletion(roundId);
            }
        }

        return currentStatus;
    } catch (error) {
        console.error('Error updating round status:', error);
        this.addError({
            componentName: this.constructor.name,
            source: 'handleRoundStatusUpdate',
            message: 'Failed to update round status',
            details: error
        });
        throw error;
    }
}