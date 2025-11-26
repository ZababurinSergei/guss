import { useEffect, useRef, useCallback } from 'react';

interface UsePollingOptions {
    interval: number;
    enabled: boolean;
}

export function usePolling(
    callback: () => Promise<void>,
    options: UsePollingOptions
) {
    const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = undefined;
        }
    }, []);

    const startPolling = useCallback(() => {
        stopPolling();

        if (options.enabled) {
            intervalRef.current = setInterval(() => {
                callbackRef.current().catch(console.error);
            }, options.interval);
        }
    }, [options.enabled, options.interval, stopPolling]);

    useEffect(() => {
        startPolling();
        return stopPolling;
    }, [startPolling, stopPolling]);

    return {
        stopPolling,
        startPolling,
    };
}