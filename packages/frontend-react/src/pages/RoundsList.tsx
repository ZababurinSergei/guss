import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useApp } from '../contexts/AppContext';
import { usePolling } from '../hooks/usePolling';
import { Layout } from '../components/Layout';
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
            console.log('🔄 Fetching rounds...');

            const result = await apiService.getRounds();
            console.log('📦 Rounds API response:', result);

            if (Array.isArray(result)) {
                // Добавляем защиту от undefined participants и обогащаем данные
                const safeRounds = result.map(round => ({
                    ...round,
                    participants: round.participants || [],
                    // Добавляем вычисляемые поля для отображения
                    displayId: round.id.slice(-6), // Короткий ID для отображения
                    startDate: new Date(round.start_date),
                    endDate: new Date(round.end_date),
                    isUpcoming: round.status === 'cooldown',
                    isActive: round.status === 'active',
                    isFinished: round.status === 'finished'
                }));

                setRounds(safeRounds);
                console.log('✅ Rounds set:', safeRounds.length, 'rounds');
            } else {
                console.error('❌ Expected array of rounds, got:', result);
                setRounds([]);
                setError('Invalid data format received from server');
            }

            setLastUpdate(new Date());
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch rounds';
            console.error('❌ Error fetching rounds:', err);
            setError(errorMessage);
            setRounds([]);
        } finally {
            setLoading(false);
        }
    };

    const { startPolling, stopPolling } = usePolling(fetchRounds, {
        interval: 1000, // Обновляем каждые 5 секунд
        enabled: !!user, // Включаем только если пользователь авторизован
    });

    useEffect(() => {
        console.log('🎯 RoundsList mounted, user:', user);

        if (user) {
            fetchRounds();
            startPolling();
        } else {
            setLoading(false);
            setRounds([]);
        }

        return () => {
            stopPolling();
        };
    }, [user, startPolling, stopPolling]);

    const handleCreateRound = async (): Promise<void> => {
        if (!canCreateRound) {
            setError('Only administrators can create rounds');
            return;
        }

        try {
            setLoading(true);
            const newRound = await apiService.createRound();
            console.log('✅ Round created:', newRound);

            // Обновляем список после создания
            await fetchRounds();

            // Навигация к созданному раунду
            navigate(`/rounds/${newRound.id}`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create round';
            setError(errorMessage);
            console.error('❌ Error creating round:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRoundClick = (roundId: string): void => {
        console.log('🎯 Navigating to round:', roundId);
        navigate(`/rounds/${roundId}`);
    };

    const formatDate = (dateString: string): string => {
        try {
            return new Date(dateString).toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const formatDuration = (startDate: string, endDate: string): string => {
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const durationMs = end.getTime() - start.getTime();
            const minutes = Math.floor(durationMs / 60000);
            const seconds = Math.floor((durationMs % 60000) / 1000);
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        } catch {
            return 'N/A';
        }
    };

    const getRoundStatusInfo = (round: Round) => {
        const now = new Date();
        const startTime = new Date(round.start_date).getTime();
        const endTime = new Date(round.end_date).getTime();

        if (round.status === 'finished') {
            return {
                status: 'finished',
                text: 'Завершен',
                class: styles.statusFinished,
                icon: '✅'
            };
        }

        if (round.status === 'cooldown') {
            const timeLeft = Math.max(0, startTime - now.getTime());
            const seconds = Math.floor(timeLeft / 1000);
            return {
                status: 'cooldown',
                text: `До начала: ${formatCountdown(seconds)}`,
                class: styles.statusCooldown,
                icon: '⏱️'
            };
        }

        if (round.status === 'active') {
            const timeLeft = Math.max(0, endTime - now.getTime());
            const seconds = Math.floor(timeLeft / 1000);
            return {
                status: 'active',
                text: `Активен: ${formatCountdown(seconds)}`,
                class: styles.statusActive,
                icon: '🎯'
            };
        }

        return {
            status: 'unknown',
            text: 'Неизвестно',
            class: styles.statusFinished,
            icon: '❓'
        };
    };

    const formatCountdown = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getUserStats = (round: Round) => {
        if (!user || !round.participants) return null;
        return round.participants.find(p => p.user_id === user.id);
    };

    // Добавим отладочную информацию
    console.log('📊 RoundsList state:', {
        loading,
        error,
        roundsCount: rounds.length,
        user,
        lastUpdate
    });

    if (loading && rounds.length === 0) {
        return (
            <div className={styles.roundsListContainer}>
                <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    <div>Загрузка раундов...</div>
                </div>
            </div>
        );
    }

    if (error && rounds.length === 0) {
        return (
            <div className={styles.roundsListContainer}>
                <div className={styles.errorState}>
                    <div className={styles.errorIcon}>⚠️</div>
                    <h3>Ошибка загрузки</h3>
                    <p>{error}</p>
                    <button className={styles.retryBtn} onClick={fetchRounds}>
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={styles.roundsListContainer}>
                <div className={styles.errorState}>
                    <div className={styles.errorIcon}>🔒</div>
                    <h3>Требуется авторизация</h3>
                    <p>Пожалуйста, войдите в систему для просмотра раундов</p>
                </div>
            </div>
        );
    }

    return (
        <Layout user={user}>
            <div className={styles.roundsListContainer}>
                <div className={styles.pageHeader}>
                    <div className={styles.headerContent}>
                        <h1>Список раундов</h1>
                        {lastUpdate && (
                            <div className={styles.lastUpdate}>
                                Последнее обновление: {lastUpdate.toLocaleString('ru-RU')}
                            </div>
                        )}
                    </div>
                    <div className={styles.userInfo}>
                        <span className={styles.username}>{user.username}</span>
                        <span className={styles.userRole}>({user.role})</span>
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
                            {loading ? 'Создание...' : '🎯 Создать новый раунд'}
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

                {error && rounds.length > 0 && (
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
                    <>
                        <div className={styles.roundsGrid}>
                            {rounds.map((round) => {
                                const statusInfo = getRoundStatusInfo(round);
                                const userStats = getUserStats(round);

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
                                                {formatDuration(round.start_date, round.end_date)}
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
                                                <span className={styles.statLabel}>Общий счет:</span>
                                                <span className={styles.statValue}>
                                                    {round.total_score || 0}
                                                </span>
                                            </div>
                                            {userStats && (
                                                <div className={styles.statRow}>
                                                    <span className={styles.statLabel}>Ваш счет:</span>
                                                    <span className={styles.statValue}>
                                                        {userStats.score || 0}
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
                                            {statusInfo.icon} {statusInfo.text}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className={styles.footerInfo}>
                            <div className={styles.roundsCount}>
                                Всего раундов: {rounds.length}
                            </div>
                            <div className={styles.activeRoundsCount}>
                                Активных: {rounds.filter(r => r.status === 'active').length}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
};