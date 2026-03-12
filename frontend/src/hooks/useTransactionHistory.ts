import { useCallback, useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { PAYROLL_ABI, TOKEN_ADDRESS, TOKEN_ABI, PAYROLL_DEPLOY_BLOCK } from '../config/contracts';
import { parseAbiItem, getAddress } from 'viem';

export type HistoryEvent = {
    type: 'EmployeeAdded' | 'EmployeeRemoved' | 'PayrollRun' | 'Transfer' | 'SalaryUpdated' | 'BonusPaid';
    detail: string;
    blockNumber: bigint;
    transactionHash: string;
    timestamp?: number;
};

export function useTransactionHistory(contractAddress: `0x${string}`) {
    const client = usePublicClient();
    const [events, setEvents] = useState<HistoryEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        if (!client || !contractAddress) return;
        setIsLoading(true);
        setError(null);

        try {
            console.log('[History] Fetching logs for:', contractAddress);

            const latestBlock = await client.getBlockNumber();
            const fromBlock = latestBlock - 9n;

            // Fetch all event types in parallel using last 10 blocks
            const [addedLogs, removedLogs, payrollLogs, transferLogs, salaryLogs, bonusLogs] = await Promise.all([
                client.getLogs({
                    address: contractAddress,
                    event: parseAbiItem('event EmployeeAdded(address indexed employee)'),
                    fromBlock
                }),
                client.getLogs({
                    address: contractAddress,
                    event: parseAbiItem('event EmployeeRemoved(address indexed employee)'),
                    fromBlock
                }),
                client.getLogs({
                    address: contractAddress,
                    event: parseAbiItem('event PayrollRun(uint256 timestamp, uint256 employeeCount)'),
                    fromBlock
                }),
                client.getLogs({
                    address: TOKEN_ADDRESS,
                    event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 amount)'),
                    fromBlock
                }),
                client.getLogs({
                    address: contractAddress,
                    event: parseAbiItem('event SalaryUpdated(address indexed employee, uint256 timestamp)'),
                    fromBlock
                }),
                client.getLogs({
                    address: contractAddress,
                    event: parseAbiItem('event BonusPaid(address indexed employee, uint256 timestamp, string memo)'),
                    fromBlock
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
                ...salaryLogs.map(l => ({
                    type: 'SalaryUpdated' as const,
                    detail: `Salary updated for ${l.args.employee}`,
                    blockNumber: l.blockNumber,
                    transactionHash: l.transactionHash,
                })),
                ...bonusLogs.map(l => ({
                    type: 'BonusPaid' as const,
                    detail: `Bonus paid: ${l.args.memo}`,
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
    }, [client, contractAddress]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return { events, isLoading, error, refresh: fetchHistory };
}
