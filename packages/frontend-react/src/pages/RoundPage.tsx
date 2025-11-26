import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { apiService } from '../services/api';
import { usePolling } from '../hooks/usePolling';
import { Layout } from '../components/Layout';
import styles from './RoundPage.module.css';
import type { Round, TapResult } from '../types';

export const RoundPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useApp();
    const [round, setRound] = useState<Round | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tapping, setTapping] = useState(false);

    const fetchRound = useCallback(async () => {
        if (!id) return;

        try {
            const roundData = await apiService.getRound(id);
            setRound(roundData);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch round');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchRound();
    }, [fetchRound]);

    const { startPolling, stopPolling } = usePolling(fetchRound, {
        interval: 3000,
        enabled: !!round && (round.status === 'cooldown' || round.status === 'active')
    });

    useEffect(() => {
        if (round && (round.status === 'cooldown' || round.status === 'active')) {
            startPolling();
        } else {
            stopPolling();
        }

        return stopPolling;
    }, [round, startPolling, stopPolling]);

    const handleTap = async () => {
        if (!id || !round || round.status !== 'active' || tapping) return;

        setTapping(true);
        try {
            const result: TapResult = await apiService.tapRound(id);
            console.log('Tap result:', result);

            // Update local round state with new tap data
            if (round.user_stats) {
                setRound({
                    ...round,
                    user_stats: {
                        ...round.user_stats,
                        tap_count: result.tap_count,
                        score: result.score
                    },
                    total_score: result.total_score
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to tap');
        } finally {
            setTapping(false);
        }
    };

    const handleBack = () => {
        navigate('/rounds');
    };

    const getRoundStatusInfo = () => {
        if (!round) return null;

        const now = Date.now();
        const startTime = new Date(round.start_date).getTime();
        const endTime = new Date(round.end_date).getTime();

        switch (round.status) {
            case 'cooldown':
                const timeUntilStart = Math.max(0, startTime - now);
                return {
                    status: 'cooldown',
                    timeLeft: timeUntilStart,
                    isClickable: false,
                    displayText: 'Round Starting Soon',
                    cssClass: styles.statusCooldown
                };
            case 'active':
                const timeUntilEnd = Math.max(0, endTime - now);
                return {
                    status: 'active',
                    timeLeft: timeUntilEnd,
                    isClickable: true,
                    displayText: 'Round Active - Tap Now!',
                    cssClass: styles.statusActive
                };
            case 'finished':
                return {
                    status: 'finished',
                    timeLeft: 0,
                    isClickable: false,
                    displayText: 'Round Finished',
                    cssClass: styles.statusFinished
                };
            default:
                return null;
        }
    };

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    };

    const statusInfo = getRoundStatusInfo();

    if (!user) {
        return (
            <div className={styles.roundPageContainer}>
                <div className={styles.errorState}>
                    Please log in to view rounds
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={styles.roundPageContainer}>
                <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    Loading round...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.roundPageContainer}>
                <div className={styles.errorState}>
                    <div className={styles.errorIcon}>⚠️</div>
                    <h3>Error</h3>
                    <p>{error}</p>
                    <button onClick={fetchRound} className={styles.retryBtn}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!round) {
        return (
            <div className={styles.roundPageContainer}>
                <div className={styles.errorState}>
                    <div className={styles.errorIcon}>❓</div>
                    <h3>Round Not Found</h3>
                    <p>The requested round could not be found.</p>
                    <button onClick={handleBack} className={styles.retryBtn}>
                        Back to Rounds
                    </button>
                </div>
            </div>
        );
    }

    return (
        <Layout user={user} onLogout={() => navigate('/login')}>
            <div className={styles.roundPageContainer}>
                <button onClick={handleBack} className={styles.backBtn}>
                    ← Back to Rounds
                </button>

                <div className={styles.pageHeader}>
                    <h1>Round {round.id}</h1>
                    <div className={styles.userInfo}>
                        {user.username} ({user.role})
                    </div>
                </div>

                <div className={styles.gameArea}>
                    <div className={styles.gooseContainer}>
                        <div
                            className={`${styles.gooseImage} ${
                                statusInfo?.isClickable && !tapping ? styles.clickable : ''
                            }`}
                            onClick={statusInfo?.isClickable && !tapping ? handleTap : undefined}
                            style={{ cursor: statusInfo?.isClickable && !tapping ? 'pointer' : 'default' }}
                        >
                            {/* Goose ASCII Art */}
                            <div className={styles.gooseArt}>
                                <div className={styles.gooseBody}></div>
                                <div className={styles.gooseNeck}></div>
                                <div className={styles.gooseHead}></div>
                                <div className={styles.gooseWings}></div>
                            </div>
                        </div>
                    </div>

                    {statusInfo && (
                        <>
                            <div className={`${styles.statusMessage} ${statusInfo.cssClass}`}>
                                {statusInfo.displayText}
                            </div>
                            <div className={styles.timer}>
                                {formatTime(statusInfo.timeLeft)}
                            </div>
                        </>
                    )}

                    {round.user_stats && (
                        <div className={styles.userScore}>
                            Your Score: {round.user_stats.score}
                            (Taps: {round.user_stats.tap_count})
                        </div>
                    )}

                    <div className={styles.roundStats}>
                        <div className={styles.statsDivider}></div>
                        <div className={styles.statRow}>
                            <span>Total Round Score:</span>
                            <span>{round.total_score}</span>
                        </div>
                        <div className={styles.statRow}>
                            <span>Participants:</span>
                            <span>{round.participants.length}</span>
                        </div>
                        <div className={styles.statRow}>
                            <span>Status:</span>
                            <span className={`${styles.roundStatus} ${statusInfo?.cssClass}`}>
                                {round.status}
                            </span>
                        </div>
                        {round.winner && (
                            <div className={styles.statRow}>
                                <span>Winner:</span>
                                <span>{round.winner.username}</span>
                            </div>
                        )}
                    </div>

                    {tapping && (
                        <div className={styles.loadingState}>
                            <div className={styles.spinner}></div>
                            Tapping...
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};