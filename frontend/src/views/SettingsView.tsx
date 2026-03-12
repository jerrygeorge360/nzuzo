import { useDisconnect } from 'wagmi';
import { FACTORY_ADDRESS, TOKEN_ADDRESS } from '../config/contracts';
import { Copy, ExternalLink, LogOut, Wallet, Code, Calendar, ChevronRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useMemo } from 'react';
import { usePayroll } from '../hooks/usePayroll';
import { format } from 'date-fns';

interface SettingsViewProps {
    address: string;
    role: 'Employer' | 'Employee';
    contractAddress: `0x${string}`;
}

export function SettingsView({ address, role, contractAddress }: SettingsViewProps) {
    const { disconnect } = useDisconnect();
    const payroll = usePayroll(contractAddress);
    const [copied, setCopied] = useState(false);

    // -- Cooldown state --
    const [selectedCycle, setSelectedCycle] = useState<string>('custom');
    const [customDays, setCustomDays] = useState<string>('30');
    const [isSaving, setIsSaving] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const inviteLink = `${window.location.origin}/org/${contractAddress}`;

    return (
        <div className="content-body" style={{ flex: 1, padding: '32px', maxWidth: '800px', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '32px' }}>Settings</h2>

            {/* Invite Section (Employer only) */}
            {role === 'Employer' && (
                <section style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: 600 }}>
                        Invite Employees
                    </h3>
                    <div style={{ background: 'var(--accent-dim)', border: '1px solid rgba(52, 211, 153, 0.2)', borderRadius: 'var(--radius)', padding: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', flexShrink: 0 }}>
                            <QRCodeSVG value={inviteLink} size={120} level="H" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ margin: '0 0 8px', fontSize: '16px', color: 'var(--text-primary)' }}>Organization Access Link</h4>
                            <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                Share this link with your employees. They will be able to access their personal
                                dashboard and reveal their salary after you've added them to the roster.
                            </p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <div style={{
                                    flex: 1,
                                    background: 'var(--bg-root)',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontFamily: 'var(--font-mono)',
                                    color: 'var(--text-secondary)',
                                    border: '1px solid var(--border-hairline)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {inviteLink}
                                </div>
                                <button
                                    className="reveal-btn"
                                    onClick={() => copyToClipboard(inviteLink)}
                                    style={{ padding: '0 16px', background: 'var(--bg-elevated)' }}
                                >
                                    {copied ? 'Copied!' : <Copy size={14} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Payroll Cycle Section (Employer only) */}
            {role === 'Employer' && (
                <section style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: 600 }}>
                        Payroll Cycle
                    </h3>
                    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius)', padding: '24px' }}>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>Frequency</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                                {[
                                    { id: 'weekly', label: 'Weekly', seconds: 604800 },
                                    { id: 'biweekly', label: 'Biweekly', seconds: 1209600 },
                                    { id: 'monthly', label: 'Monthly', seconds: 2592000 },
                                    { id: 'custom', label: 'Custom', seconds: 0 }
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setSelectedCycle(opt.id)}
                                        style={{
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid',
                                            borderColor: selectedCycle === opt.id ? 'var(--accent)' : 'var(--border-hairline)',
                                            background: selectedCycle === opt.id ? 'var(--accent-dim)' : 'var(--bg-root)',
                                            color: selectedCycle === opt.id ? 'var(--accent)' : 'var(--text-secondary)',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedCycle === 'custom' && (
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Custom days</label>
                                <input
                                    type="number"
                                    className="terminal-input"
                                    value={customDays}
                                    onChange={(e) => setCustomDays(e.target.value)}
                                    placeholder="e.g. 15"
                                    style={{ width: '100px' }}
                                />
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-hairline)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-root)', border: '1px solid var(--border-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                                    <Calendar size={16} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Next available run</div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {!payroll.payrollCooldown || payroll.payrollCooldown === 0n ? 'No cooldown set' : (
                                            (() => {
                                                const nextTime = Number(payroll.lastPayrollRun || 0n) + Number(payroll.payrollCooldown || 0n);
                                                const diff = nextTime - Math.floor(Date.now() / 1000);
                                                if (diff <= 0) return 'Available now';
                                                return `Available in ${Math.ceil(diff / 86400)} days (${format(new Date(nextTime * 1000), 'MMM d, yyyy')})`;
                                            })()
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                className="send-action-btn"
                                disabled={isSaving || payroll.isTxPending}
                                onClick={async () => {
                                    setIsSaving(true);
                                    try {
                                        let seconds = 0;
                                        if (selectedCycle === 'weekly') seconds = 604800;
                                        else if (selectedCycle === 'biweekly') seconds = 1209600;
                                        else if (selectedCycle === 'monthly') seconds = 2592000;
                                        else seconds = Number(customDays) * 86400;

                                        await payroll.setPayrollCooldown(seconds);
                                    } catch (e) {
                                        console.error('Save cooldown failed', e);
                                    } finally {
                                        setIsSaving(false);
                                    }
                                }}
                            >
                                {isSaving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </div>
                </section>
            )}

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
                    Active Contracts (Sepolia)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                        { label: 'Nzuzo Organization', address: contractAddress },
                        { label: 'Payroll Factory', address: FACTORY_ADDRESS },
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
