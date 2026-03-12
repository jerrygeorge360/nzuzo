import { useCallback, useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { PAYROLL_ADDRESS, PAYROLL_ABI, TOKEN_ADDRESS, TOKEN_ABI } from '../config/contracts';
import { parseAbiItem, getAddress } from 'viem';

export type HistoryEvent = {
    type: 'EmployeeAdded' | 'EmployeeRemoved' | 'PayrollRun' | 'Transfer';
    detail: string;
    blockNumber: bigint;
    transactionHash: string;
    timestamp?: number;
};

export function useTransactionHistory() {
    const client = usePublicClient();
    const [events, setEvents] = useState<HistoryEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        if (!client) return;
        setIsLoading(true);
        setError(null);

        try {
            console.log('[History] Fetching logs...');

            // Fetch all event types in parallel
            const [addedLogs, removedLogs, payrollLogs, transferLogs] = await Promise.all([
                client.getLogs({
                    address: PAYROLL_ADDRESS,
                    event: parseAbiItem('event EmployeeAdded(address indexed employee)'),
                    fromBlock: 0n,
                    toBlock: 'latest',
                }),
                client.getLogs({
                    address: PAYROLL_ADDRESS,
                    event: parseAbiItem('event EmployeeRemoved(address indexed employee)'),
                    fromBlock: 0n,
                    toBlock: 'latest',
                }),
                client.getLogs({
                    address: PAYROLL_ADDRESS,
                    event: parseAbiItem('event PayrollRun(uint256 timestamp, uint256 employeeCount)'),
                    fromBlock: 0n,
                    toBlock: 'latest',
                }),
                client.getLogs({
                    address: TOKEN_ADDRESS,
                    event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 amount)'),
                    fromBlock: 0n,
                    toBlock: 'latest',
                }),
            ]);

            // Map and merge
            const merged: HistoryEvent[] = [
                ...addedLogs.map(l => ({
                    type: 'EmployeeAdded' as const,
                    detail: l.args.employee as string,
                    blockNumber: l.blockNumber,
                    transactionHash: l.transactionHash,
                })),
                ...removedLogs.map(l => ({
                    type: 'EmployeeRemoved' as const,
                    detail: l.args.employee as string,
                    blockNumber: l.blockNumber,
                    transactionHash: l.transactionHash,
                })),
                ...payrollLogs.map(l => ({
                    type: 'PayrollRun' as const,
                    detail: `${l.args.employeeCount} employees`,
                    blockNumber: l.blockNumber,
                    transactionHash: l.transactionHash,
                })),
                ...transferLogs.map(l => ({
                    type: 'Transfer' as const,
                    detail: `${(l.args.from as string).slice(0, 6)}...${(l.args.from as string).slice(-4)} → ${(l.args.to as string).slice(0, 6)}...${(l.args.to as string).slice(-4)}`,
                    blockNumber: l.blockNumber,
                    transactionHash: l.transactionHash,
                })),
            ];

            // Sort by block number descending
            merged.sort((a, b) => Number(b.blockNumber - a.blockNumber));

            // Fetch timestamps for top 20
            const top20 = merged.slice(0, 20);
            const withTimestamps = await Promise.all(
                top20.map(async (e) => {
                    try {
                        const block = await client.getBlock({ blockNumber: e.blockNumber });
                        return { ...e, timestamp: Number(block.timestamp) };
                    } catch {
                        return e;
                    }
                })
            );

            setEvents([...withTimestamps, ...merged.slice(20)]);
            console.log(`[History] Fetched ${merged.length} events`);
        } catch (err: any) {
            console.error('[History] Fetch failed:', err);
            setError(err.message || 'Failed to fetch history');
        } finally {
            setIsLoading(false);
        }
    }, [client]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return { events, isLoading, error, refresh: fetchHistory };
}
