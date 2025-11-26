import { createContext, useContext, useState, ReactNode } from 'react';
import { apiService } from '../services/api';
import type { User, Round } from '../types';

interface AppContextType {
    user: User | null;
    rounds: Round[];
    currentRound: Round | null;
    loading: boolean;
    error: string | null;
    lastUpdate: Date | null;
    pollingEnabled: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    setCurrentRound: (round: Round | null) => void;
    setRounds: (rounds: Round[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setPollingEnabled: (enabled: boolean) => void;
    updateLastUpdate: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [rounds, setRounds] = useState<Round[]>([]);
    const [currentRound, setCurrentRound] = useState<Round | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [pollingEnabled, setPollingEnabled] = useState(true);

    const login = async (username: string, password: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.login(username, password);
            setUser(response.user);
            apiService.setToken(response.token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            await apiService.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setUser(null);
            setRounds([]);
            setCurrentRound(null);
            setLoading(false);
            apiService.removeToken();
        }
    };

    const updateLastUpdate = () => {
        setLastUpdate(new Date());
    };

    const value: AppContextType = {
        user,
        rounds,
        currentRound,
        loading,
        error,
        lastUpdate,
        pollingEnabled,
        login,
        logout,
        setCurrentRound,
        setRounds,
        setLoading,
        setError,
        setPollingEnabled,
        updateLastUpdate,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}