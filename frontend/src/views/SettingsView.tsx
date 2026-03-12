import { useDisconnect } from 'wagmi';
import { PAYROLL_ADDRESS, TOKEN_ADDRESS } from '../config/contracts';
import { Copy, ExternalLink, LogOut, Wallet, Code } from 'lucide-react';

interface SettingsViewProps {
    address: string;
    role: 'Employer' | 'Employee';
}

export function SettingsView({ address, role }: SettingsViewProps) {
    const { disconnect } = useDisconnect();

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="content-body" style={{ flex: 1, padding: '32px', maxWidth: '800px', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '32px' }}>Settings</h2>

            {/* Account Section */}
            <section style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: 600 }}>
                    Connected Account
                </h3>
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius)', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', background: 'var(--accent-dim)', color: 'var(--accent)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Wallet size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>MetaMask Wallet</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{role} Role</div>
                            </div>
                        </div>
                        <span className="status-badge active" style={{ borderRadius: '6px' }}>Connected</span>
                    </div>

                    <div style={{ background: 'var(--bg-root)', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', border: '1px solid var(--border-hairline)' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{address}</span>
                        <button onClick={() => copyToClipboard(address)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}>
                            <Copy size={14} />
                        </button>
                    </div>

                    <button
                        onClick={() => disconnect()}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'rgba(239, 68, 68, 0.05)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        <LogOut size={16} />
                        Disconnect Wallet
                    </button>
                </div>
            </section>

            {/* Contracts Section */}
            <section>
                <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: 600 }}>
                    Smart Contracts (Sepolia)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                        { label: 'Nzuzo Payroll', address: PAYROLL_ADDRESS },
                        { label: 'MockUSDC Token', address: TOKEN_ADDRESS }
                    ].map((contract) => (
                        <div key={contract.address} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius)', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Code size={16} style={{ color: 'var(--text-tertiary)' }} />
                                <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{contract.label}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => copyToClipboard(contract.address)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}>
                                    <Copy size={14} />
                                </button>
                                <a href={`https://sepolia.etherscan.io/address/${contract.address}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-tertiary)', padding: '4px' }}>
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
