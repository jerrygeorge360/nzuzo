import { useState, useCallback } from 'react';
import { useReadContract } from 'wagmi';
import { PAYROLL_ABI } from '../config/contracts';
import { useFhevm } from '../hooks/useFhevm';
import { CipherText } from './CipherText';
import { Loader2, UserMinus, Lock, Edit3, DollarSign, Send } from 'lucide-react';
import { usePayroll } from '../hooks/usePayroll';

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
    const payroll = usePayroll(contractAddress as `0x${string}`);
    const [decryptedSalary, setDecryptedSalary] = useState<string | null>(null);
    const [isDecrypting, setIsDecrypting] = useState(false);
    const [error, setError] = useState(false);

    // Modal states
    const [isEditSalaryOpen, setIsEditSalaryOpen] = useState(false);
    const [isPayBonusOpen, setIsPayBonusOpen] = useState(false);

    // Form states
    const [newSalary, setNewSalary] = useState('');
    const [bonusAmount, setBonusAmount] = useState('');
    const [bonusMemo, setBonusMemo] = useState('');
    const [isActionSubmitting, setIsActionSubmitting] = useState(false);

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
                    <>
                        <button
                            className="table-action-btn"
                            onClick={() => setIsEditSalaryOpen(true)}
                            title="Edit Salary"
                            style={{ background: 'var(--bg-root)', border: '1px solid var(--border-hairline)', color: 'var(--text-secondary)' }}
                        >
                            <Edit3 size={14} />
                            Edit
                        </button>
                        <button
                            className="table-action-btn"
                            onClick={() => setIsPayBonusOpen(true)}
                            title="Pay Bonus"
                            style={{ background: 'var(--bg-root)', border: '1px solid var(--border-hairline)', color: 'var(--text-secondary)' }}
                        >
                            <DollarSign size={14} />
                            Bonus
                        </button>
                        <button
                            className="table-action-btn fire-btn"
                            onClick={() => onRemove(employeeAddress)}
                            title="Remove Employee"
                        >
                            <UserMinus size={14} />
                            Fire
                        </button>
                    </>
                )}
            </td>

            {/* Edit Salary Modal */}
            {isEditSalaryOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>Adjust Salary</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
                            Update the monthly salary for employee {truncateAddress(employeeAddress)}.
                            The new amount will be encrypted before submission.
                        </p>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>New Monthly Salary (mUSDC)</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="number"
                                    className="terminal-input"
                                    placeholder="0.00"
                                    value={newSalary}
                                    onChange={(e) => setNewSalary(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                className="fire-btn"
                                style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border-hairline)', color: 'var(--text-primary)' }}
                                onClick={() => setIsEditSalaryOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="send-action-btn"
                                style={{ flex: 1 }}
                                disabled={!newSalary || isActionSubmitting}
                                onClick={async () => {
                                    setIsActionSubmitting(true);
                                    try {
                                        await payroll.updateSalary(employeeAddress, Number(newSalary), walletAddress);
                                        setIsEditSalaryOpen(false);
                                        setNewSalary('');
                                    } catch (err) {
                                        console.error('Update salary failed', err);
                                    } finally {
                                        setIsActionSubmitting(false);
                                    }
                                }}
                            >
                                {isActionSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Update'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pay Bonus Modal */}
            {isPayBonusOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>Send Bonus</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
                            Send a one-time confidential bonus to {truncateAddress(employeeAddress)}.
                        </p>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>Bonus Amount (mUSDC)</label>
                            <input
                                type="number"
                                className="terminal-input"
                                placeholder="0.00"
                                value={bonusAmount}
                                onChange={(e) => setBonusAmount(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase' }}>Memo (Plain Text)</label>
                            <input
                                type="text"
                                className="terminal-input"
                                placeholder="e.g. Q1 Performance"
                                value={bonusMemo}
                                onChange={(e) => setBonusMemo(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                className="fire-btn"
                                style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border-hairline)', color: 'var(--text-primary)' }}
                                onClick={() => setIsPayBonusOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="send-action-btn"
                                style={{ flex: 1 }}
                                disabled={!bonusAmount || isActionSubmitting}
                                onClick={async () => {
                                    setIsActionSubmitting(true);
                                    try {
                                        await payroll.payBonus(employeeAddress, Number(bonusAmount), bonusMemo, walletAddress);
                                        setIsPayBonusOpen(false);
                                        setBonusAmount('');
                                        setBonusMemo('');
                                    } catch (err) {
                                        console.error('Pay bonus failed', err);
                                    } finally {
                                        setIsActionSubmitting(false);
                                    }
                                }}
                            >
                                {isActionSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Send Bonus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </tr>
    );
}
