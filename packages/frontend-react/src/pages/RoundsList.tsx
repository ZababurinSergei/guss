import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useApp } from '../contexts/AppContext';
import { usePolling } from '../hooks/usePolling';
import type { Round } from '../types';
import styles from './RoundsList.module.css';

export const RoundsList: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useApp();
    const [rounds, setRounds] = useState<Round[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    // Проверка прав для создания раундов
    const canCreateRound = user?.role === 'admin';

    const fetchRounds = async (): Promise<void> => {
        try {
            setError(null);
            const result = await apiService.getRounds();

            if (Array.isArray(result)) {
                // Добавляем защиту от undefined participants
                const safeRounds = result.map(round => ({
                    ...round,
                    participants: round.participants || []
                }));
                setRounds(safeRounds);
            } else {
                console.error('Expected array of rounds, got:', result);
                setRounds([]);
            }

            setLastUpdate(new Date());
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch rounds';
            setError(errorMessage);
            console.error('Error fetching rounds:', err);
        } finally {
            setLoading(false);
        }
    };

    const { startPolling, stopPolling } = usePolling(fetchRounds, {
        interval: 5000,
        enabled: true,
    });

    useEffect(() => {
        fetchRounds();
        startPolling();

        return () => {
            stopPolling();
        };
    }, [startPolling, stopPolling]);

    const handleCreateRound = async (): Promise<void> => {
        if (!canCreateRound) {
            setError('Only administrators can create rounds');
            return;
        }

        try {
            const newRound = await apiService.createRound();
            await fetchRounds(); // Refresh the list
            navigate(`/rounds/${newRound.id}`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create round';
            setError(errorMessage);
            console.error('Error creating round:', err);
        }
    };

    const handleRoundClick = (roundId: string): void => {
        navigate(`/rounds/${roundId}`);
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleString('ru-RU');
    };

    const formatDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getRoundStatusInfo = (round: Round) => {
        const now = Date.now();
        const startTime = new Date(round.start_date).getTime();
        const endTime = new Date(round.end_date).getTime();

        if (round.status === 'finished') {
            return {
                status: 'finished',
                text: 'Завершен',
                class: styles.statusFinished,
            };
        }

        if (round.status === 'cooldown') {
            const timeLeft = Math.max(0, startTime - now);
            return {
                status: 'cooldown',
                text: `До начала: ${formatDuration(Math.floor(timeLeft / 1000))}`,
                class: styles.statusCooldown,
            };
        }

        if (round.status === 'active') {
            const timeLeft = Math.max(0, endTime - now);
            return {
                status: 'active',
                text: `Активен: ${formatDuration(Math.floor(timeLeft / 1000))}`,
                class: styles.statusActive,
            };
        }

        return {
            status: 'unknown',
            text: 'Неизвестно',
            class: styles.statusFinished,
        };
    };

    if (loading && rounds.length === 0) {
        return (
            <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <div>Загрузка раундов...</div>
            </div>
        );
    }

    if (error && rounds.length === 0) {
        return (
            <div className={styles.errorState}>
                <div className={styles.errorIcon}>⚠️</div>
                <h3>Ошибка загрузки</h3>
                <p>{error}</p>
                <button className={styles.retryBtn} onClick={fetchRounds}>
                    Попробовать снова
                </button>
            </div>
        );
    }

    return (
        <div className={styles.roundsListContainer}>
            <div className={styles.pageHeader}>
                <div className={styles.headerContent}>
                    <h1>Раунды игры</h1>
                    {lastUpdate && (
                        <div className={styles.lastUpdate}>
                            Последнее обновление: {lastUpdate.toLocaleString('ru-RU')}
                        </div>
                    )}
                </div>
                <div className={styles.userInfo}>
                    <span className={styles.username}>{user?.username}</span>
                    <span className={styles.userRole}>{user?.role}</span>
                </div>
            </div>

            <div className={styles.actionsBar}>
                {canCreateRound && (
                    <button
                        className={styles.createRoundBtn}
                        onClick={handleCreateRound}
                        disabled={loading}
                        type="button"
                    >
                        {loading ? 'Создание...' : 'Создать новый раунд'}
                    </button>
                )}

                {!canCreateRound && user && (
                    <div className={styles.userPermissionInfo}>
                        Только администраторы могут создавать раунды
                    </div>
                )}

                <div className={styles.pollingStatus}>
                    <div
                        className={`${styles.statusIndicator} ${
                            loading ? styles.paused : styles.active
                        }`}
                    ></div>
                    <span>{loading ? 'Пауза' : 'Автообновление'}</span>
                </div>
            </div>

            {error && (
                <div className={styles.errorState}>
                    <div className={styles.errorIcon}>⚠️</div>
                    <p>{error}</p>
                    <button className={styles.retryBtn} onClick={fetchRounds}>
                        Обновить
                    </button>
                </div>
            )}

            {rounds.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🎮</div>
                    <h3>Раунды не найдены</h3>
                    <p>
                        {canCreateRound
                            ? 'Создайте первый раунд, чтобы начать игру!'
                            : 'Дождитесь создания раунда администратором'
                        }
                    </p>
                    {canCreateRound && (
                        <button
                            className={styles.createRoundBtn}
                            onClick={handleCreateRound}
                            type="button"
                        >
                            Создать раунд
                        </button>
                    )}
                </div>
            ) : (
                <div className={styles.roundsGrid}>
                    {rounds.map((round) => {
                        const statusInfo = getRoundStatusInfo(round);
                        // ЗАЩИТА ОТ UNDEFINED - используем optional chaining
                        const userStats = round.participants?.find(
                            (p) => p.user_id === user?.id
                        );

                        return (
                            <div
                                key={round.id}
                                className={styles.roundCard}
                                onClick={() => handleRoundClick(round.id)}
                                data-is-active={round.status === 'active'}
                                data-is-upcoming={round.status === 'cooldown'}
                                data-is-finished={round.status === 'finished'}
                            >
                                <div className={styles.roundHeader}>
                                    <div className={styles.roundId}>
                                        Раунд #{round.id.slice(-6)}
                                    </div>
                                    <div className={styles.roundDuration}>
                                        {round.duration ? formatDuration(round.duration) : 'N/A'}
                                    </div>
                                </div>

                                <div className={styles.roundDates}>
                                    <div className={styles.dateRow}>
                                        <span className={styles.dateLabel}>Начало:</span>
                                        <span className={styles.dateValue}>
                                            {formatDate(round.start_date)}
                                        </span>
                                    </div>
                                    <div className={styles.dateRow}>
                                        <span className={styles.dateLabel}>Конец:</span>
                                        <span className={styles.dateValue}>
                                            {formatDate(round.end_date)}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.roundDivider}></div>

                                <div className={styles.roundStats}>
                                    <div className={styles.statRow}>
                                        <span className={styles.statLabel}>Участников:</span>
                                        <span className={styles.statValue}>
                                            {round.participants?.length || 0}
                                        </span>
                                    </div>
                                    <div className={styles.statRow}>
                                        <span className={styles.statLabel}>Общий счет:</span>
                                        <span className={styles.statValue}>
                                            {round.total_score}
                                        </span>
                                    </div>
                                    {userStats && (
                                        <div className={styles.statRow}>
                                            <span className={styles.statLabel}>Ваш счет:</span>
                                            <span className={styles.statValue}>
                                                {userStats.score}
                                            </span>
                                        </div>
                                    )}
                                    {round.winner && (
                                        <div className={styles.statRow}>
                                            <span className={styles.statLabel}>Победитель:</span>
                                            <span className={styles.statValue}>
                                                {round.winner.username}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.roundDivider}></div>

                                <div className={`${styles.roundStatus} ${statusInfo.class}`}>
                                    {statusInfo.text}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};