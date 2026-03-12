import { ActionZone } from '../components/ActionZone';
import { StatsBar } from '../components/StatsBar';
import { Shield } from 'lucide-react';

interface DashboardViewProps {
    treasuryBalance: string;
    isTreasuryRevealed: boolean;
    isDecryptingTreasury: boolean;
    employeeCount: number;
    lastPayroll: string;
    onRevealTreasury: () => void;
    onHideTreasury: () => void;
    isEmployer: boolean;
    onRunPayroll: () => void;
    onAddEmployee: () => void;
    isPayrollRunning: boolean;
}

export function DashboardView({
    treasuryBalance,
    isTreasuryRevealed,
    isDecryptingTreasury,
    employeeCount,
    lastPayroll,
    onRevealTreasury,
    onHideTreasury,
    isEmployer,
    onRunPayroll,
    onAddEmployee,
    isPayrollRunning,
}: DashboardViewProps) {
    return (
        <>
            <StatsBar
                treasuryBalance={treasuryBalance}
                employeeCount={employeeCount}
                lastPayroll={lastPayroll}
                onReveal={onRevealTreasury}
                onHide={onHideTreasury}
                revealed={isTreasuryRevealed}
                isDecrypting={isDecryptingTreasury}
            />

            <div className="content-body" style={{ flex: 1, padding: '24px' }}>
                <div className="info-card" style={{
                    background: 'rgba(52, 211, 153, 0.03)',
                    border: '1px solid rgba(52, 211, 153, 0.1)',
                    borderRadius: 'var(--radius)',
                    padding: '24px',
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'center',
                    marginBottom: '24px'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'var(--accent-dim)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent)',
                        flexShrink: 0
                    }}>
                        <Shield size={24} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>Privacy-Enabled Payroll</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            Your financial data is protected by Fully Homomorphic Encryption. Only authorized parties can reveal
                            sensitive details after multi-party validation on the Zama Sepolia network.
                        </p>
                    </div>
                </div>
            </div>

            {isEmployer && (
                <ActionZone
                    onRunPayroll={onRunPayroll}
                    onAddEmployee={onAddEmployee}
                    isPayrollRunning={isPayrollRunning}
                    employeeCount={employeeCount}
                />
            )}
        </>
    );
}
