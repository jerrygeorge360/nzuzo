import { useState, useCallback } from 'react';
import { useReadContract } from 'wagmi';
import { PAYROLL_ABI } from '../config/contracts';
import { useFhevm } from '../hooks/useFhevm';
import { CipherText } from './CipherText';
import { Loader2, UserMinus, Lock } from 'lucide-react';

interface EmployeeRowProps {
    address: string;
    isEmployer: boolean;
    onRemove: (address: string) => void;
    walletAddress: string;
    contractAddress: string;
}

export function EmployeeRow({
    address: employeeAddress,
    isEmployer,
    onRemove,
    walletAddress,
    contractAddress
}: EmployeeRowProps) {
    const { decrypt64 } = useFhevm();
    const [decryptedSalary, setDecryptedSalary] = useState<string | null>(null);
    const [isDecrypting, setIsDecrypting] = useState(false);
    const [error, setError] = useState(false);

    // ── Read Salary Handle for this specific employee ──
    const { data: handle, isLoading: isLoadingHandle } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: PAYROLL_ABI,
        functionName: 'getSalaryHandle',
        args: [employeeAddress as `0x${string}`],
        query: { enabled: !!contractAddress && !!employeeAddress },
    });

    const handleReveal = useCallback(async () => {
        if (!handle || isDecrypting || decryptedSalary) return;

        setIsDecrypting(true);
        setError(false);

        try {
            console.log(`[EmployeeRow] Decrypting salary for ${employeeAddress}...`);
            const clearValue = await decrypt64(
                handle as bigint,
                contractAddress,
                walletAddress
            );

            setDecryptedSalary(`${clearValue.toLocaleString()} mUSDC`);
        } catch (err) {
            console.error(`[EmployeeRow] Decryption failed for ${employeeAddress}:`, err);
            setError(true);
        } finally {
            setIsDecrypting(false);
        }
    }, [handle, decrypt64, contractAddress, walletAddress, employeeAddress, isDecrypting, decryptedSalary]);

    const handleHide = useCallback(() => {
        setDecryptedSalary(null);
    }, []);

    const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <tr>
            <td>
                <span className="address-cell" title={employeeAddress}>
                    {truncateAddress(employeeAddress)}
                </span>
            </td>
            <td>
                {decryptedSalary ? (
                    <div className="stat-value" style={{ fontSize: '13px', gap: '8px' }}>
                        <CipherText
                            value={decryptedSalary}
                            revealed={true}
                            onToggle={handleHide}
                        />
                        <button className="reveal-btn" onClick={handleHide} style={{ padding: '2px 6px' }}>
                            <Lock size={10} style={{ marginRight: '4px' }} />
                            Hide
                        </button>
                    </div>
                ) : error ? (
                    <span className="cipher-value error">Error</span>
                ) : isDecrypting ? (
                    <div className="decrypt-loading">
                        <Loader2 className="animate-spin" size={14} />
                        <span>Signing...</span>
                    </div>
                ) : (
                    <CipherText
                        value="ENCRYPTED"
                        revealed={false}
                        onToggle={handleReveal}
                    />
                )}
            </td>
            <td>
                <span className="access-level">Employee</span>
            </td>
            <td>
                <span className="status-badge active">
                    <span className="status-dot" />
                    Active
                </span>
            </td>
            <td style={{ display: 'flex', gap: '6px' }}>
                {isEmployer && (
                    <button
                        className="table-action-btn fire-btn"
                        onClick={() => onRemove(employeeAddress)}
                        title="Remove Employee"
                    >
                        <UserMinus size={14} />
                        Fire
                    </button>
                )}
            </td>
        </tr>
    );
}
