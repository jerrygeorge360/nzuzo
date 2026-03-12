import { useState, useCallback } from 'react';

export function useFaucet() {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const requestMUSDC = useCallback(async (address: string) => {
        if (!address) return;

        setIsLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            const response = await fetch(import.meta.env.VITE_FAUCET_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ address }),
            });

            if (response.ok) {
                setStatus('success');
                setMessage('✅ 10,000 mUSDC sent to your wallet');
            } else {
                setStatus('error');
                setMessage('❌ Request failed. You may have already claimed today.');
            }
        } catch (error) {
            console.error('[useFaucet] Request failed:', error);
            setStatus('error');
            setMessage('❌ Request failed. Please try again later.');
        } finally {
            setIsLoading(false);

            // Reset after 5 seconds
            setTimeout(() => {
                setStatus('idle');
                setMessage('');
            }, 5000);
        }
    }, []);

    return {
        requestMUSDC,
        isLoading,
        status,
        message
    };
}
