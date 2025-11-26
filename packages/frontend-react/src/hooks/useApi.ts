import { useState, useCallback } from 'react';

interface UseApiOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
}

export function useApi<T>() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async (
        apiCall: () => Promise<T>,
        options: UseApiOptions<T> = {}
    ): Promise<T | null> => {
        setLoading(true);
        setError(null);

        try {
            const data = await apiCall();
            options.onSuccess?.(data);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            options.onError?.(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        loading,
        error,
        execute,
        clearError,
    };
}