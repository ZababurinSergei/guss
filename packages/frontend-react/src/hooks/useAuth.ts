import { useCallback } from 'react';
import { useApp } from '../contexts/AppContext';

export function useAuth() {
    const { user, login, logout, loading, error } = useApp();

    const loginWithValidation = useCallback(async (username: string, password: string) => {
        if (!username.trim() || !password.trim()) {
            throw new Error('Заполните все поля');
        }

        if (password.length < 3) {
            throw new Error('Пароль должен содержать минимум 3 символа');
        }

        return await login(username, password);
    }, [login]);

    const logoutWithConfirmation = useCallback(async () => {
        if (window.confirm('Вы уверены, что хотите выйти?')) {
            await logout();
        }
    }, [logout]);

    return {
        user,
        login: loginWithValidation,
        logout: logoutWithConfirmation,
        loading,
        error,
        isAuthenticated: !!user,
    };
}