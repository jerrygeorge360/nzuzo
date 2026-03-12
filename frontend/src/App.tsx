import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { usePayroll } from './hooks/usePayroll';
import { useFhevm } from './hooks/useFhevm';
import { RoleGate } from './components/RoleGate';
import { Shield, Wallet, Landmark, RefreshCw, Plus, UserMinus, Play, Key } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { AddEmployeeModal } from './components/AddEmployeeModal';
import { PayrollTerminal } from './components/PayrollTerminal';
import { BalanceCard } from './components/BalanceCard';
import { SendTokensModal } from './components/SendTokensModal';

import { DashboardView } from './views/DashboardView';
import { EmployeesView } from './views/EmployeesView';
import { TransactionsView } from './views/TransactionsView';
import { SettingsView } from './views/SettingsView';

function App() {
  const wallet = useAccount();
  const { data: walletClient } = useWalletClient();
  const payroll = usePayroll();
  const fhevm = useFhevm();
  const hasDecryptedRef = useRef(false);

  // ── Local UI State ──
  const [isTreasuryRevealed, setIsTreasuryRevealed] = useState(false);
  const [treasuryBalance, setTreasuryBalance] = useState<string>('••••••');
  const [isDecryptingTreasury, setIsDecryptingTreasury] = useState(false);

  // Modal / Form state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // ── Derived State ──
  const isEmployer = useMemo(() => {
    if (!wallet.address || !payroll.employer) return false;
    return wallet.address.toLowerCase() === payroll.employer.toLowerCase();
  }, [wallet.address, payroll.employer]);

  // ── Action Handlers ──
  const handleRunPayroll = async () => {
    if (!isEmployer || payroll.isTxPending) return;
    try {
      console.log('[App] Running payroll...');
      setIsTerminalOpen(true);
      await payroll.runPayroll();
    } catch (err) {
      console.error('[App] Run payroll failed:', err);
    }
  };

  const handleRevealTreasury = useCallback(async () => {
    if (isTreasuryRevealed || isDecryptingTreasury) return;

    setTreasuryBalance('Syncing...');
    setIsDecryptingTreasury(true);
    hasDecryptedRef.current = false;

    try {
      console.log('[App] Syncing treasury handle for public decryption...');
      await payroll.syncTreasuryAllowance();
    } catch (err: any) {
      console.error('[App] Sync failed:', err);
      setTreasuryBalance('Error');
      setIsDecryptingTreasury(false);
    }
  }, [payroll, isTreasuryRevealed, isDecryptingTreasury]);

  const handleHideTreasury = useCallback(() => {
    setTreasuryBalance('••••••');
    setIsTreasuryRevealed(false);
    hasDecryptedRef.current = false;
  }, []);

  useEffect(() => {
    if (isDecryptingTreasury && payroll.isConfirmed && !hasDecryptedRef.current) {
      hasDecryptedRef.current = true;
      (async () => {
        try {
          console.log('[App] Confirmation received. Fetching fresh handle...');
          const { data: freshHandle } = await payroll.refetchTreasury();

          if (!freshHandle) throw new Error('Failed to fetch fresh treasury handle');

          // v0.9: Use decryptPublic (no signing) for treasury
          const clear = await fhevm.decryptPublic(freshHandle as bigint);
          console.log('[App] Public decryption result:', clear);

          setTreasuryBalance(`${clear.toLocaleString()} USDC`);
          setIsTreasuryRevealed(true);
        } catch (err: any) {
          console.error('[App] Public decryption error:', err);
          setTreasuryBalance('Error');
        } finally {
          setIsDecryptingTreasury(false);
        }
      })();
    }
  }, [isDecryptingTreasury, payroll.isConfirmed, payroll.refetchTreasury, fhevm.decryptPublic]);

  if (!wallet.isConnected) {
    return <RoleGate>{null}</RoleGate>;
  }

  return (
    <div className="app-layout">
      <div className="lock-grid-bg" />

      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        wallet={{
          address: wallet.address,
          isConnected: wallet.isConnected,
          isConnecting: wallet.isConnecting,
          connect: () => { },
          disconnect: () => { }
        }}
      />

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <DashboardView
            treasuryBalance={treasuryBalance}
            isTreasuryRevealed={isTreasuryRevealed}
            isDecryptingTreasury={isDecryptingTreasury}
            employeeCount={payroll.employeeAddresses.length}
            lastPayroll={payroll.isConfirmed ? 'Just now' : 'Synced'}
            onRevealTreasury={handleRevealTreasury}
            onHideTreasury={handleHideTreasury}
            isEmployer={isEmployer}
            onRunPayroll={handleRunPayroll}
            onAddEmployee={() => setIsAddModalOpen(true)}
            isPayrollRunning={payroll.isTxPending}
          />
        )}

        {activeTab === 'employees' && (
          <EmployeesView
            addresses={payroll.employeeAddresses}
            isEmployer={isEmployer}
            onRemove={payroll.removeEmployee}
            isLoading={payroll.isLoadingEmployees}
            walletAddress={wallet.address || ''}
            contractAddress={payroll.contractAddress}
            onAddClick={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            address={wallet.address || ''}
            role={isEmployer ? 'Employer' : 'Employee'}
          />
        )}

        <BalanceCard
          walletAddress={wallet.address || ''}
          onSendClick={() => setIsSendModalOpen(true)}
        />
      </main>

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={async (addr, sal) => {
          await payroll.addEmployee(addr, Number(sal), wallet.address!);
        }}
        isLive={true}
      />

      <PayrollTerminal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        txHash={payroll.txHash}
        isLive={true}
      />

      <SendTokensModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        senderAddress={wallet.address || ''}
      />
    </div>
  );
}

export default App;