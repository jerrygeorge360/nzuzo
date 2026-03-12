import { useState, useCallback } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { PAYROLL_ABI, PAYROLL_ADDRESS } from '../config/contracts';
import { useFhevm } from './useFhevm';

export function usePayroll() {
  const { address } = useAccount();
  const { encrypt64 } = useFhevm();

  // ── Read employer address ──
  const { data: employer } = useReadContract({
    address: PAYROLL_ADDRESS || undefined,
    abi: PAYROLL_ABI,
    functionName: 'employer',
    query: { enabled: !!PAYROLL_ADDRESS },
  });

  // ── Read full employee list from chain ──
  const {
    data: employeeAddresses,
    isLoading: isLoadingEmployees,
    refetch: refetchEmployees,
  } = useReadContract({
    address: PAYROLL_ADDRESS || undefined,
    abi: PAYROLL_ABI,
    functionName: 'getEmployees',
    query: { enabled: !!PAYROLL_ADDRESS },
  });

  // ── Read token address ──
  const { data: tokenAddress } = useReadContract({
    address: PAYROLL_ADDRESS || undefined,
    abi: PAYROLL_ABI,
    functionName: 'token',
    query: { enabled: !!PAYROLL_ADDRESS },
  });

  // ── Read Treasury Handle ──
  const { data: treasuryHandle, refetch: refetchTreasury } = useReadContract({
    address: PAYROLL_ADDRESS || undefined,
    abi: PAYROLL_ABI,
    functionName: 'getTreasuryHandle',
    account: address,
    query: { enabled: !!PAYROLL_ADDRESS && !!address },
  });

  // ── Write contract ──
  const { writeContractAsync, data: txHash, isPending: isTxPending } = useWriteContract();

  // ── Wait for tx receipt ──
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // ── Run Payroll ──
  const runPayroll = useCallback(async (): Promise<string> => {
    const hash = await writeContractAsync({
      address: PAYROLL_ADDRESS,
      abi: PAYROLL_ABI,
      functionName: 'runPayroll',
    });
    return hash;
  }, [writeContractAsync]);

  // ── Add Employee (with FHE encryption) ──
  const addEmployee = useCallback(
    async (employeeAddress: string, salaryAmount: number, callerAddress: string): Promise<string> => {
      const { inputHandle, inputProof } = await encrypt64(
        salaryAmount,
        PAYROLL_ADDRESS,
        callerAddress
      );

      const hash = await writeContractAsync({
        address: PAYROLL_ADDRESS,
        abi: PAYROLL_ABI,
        functionName: 'addEmployee',
        args: [employeeAddress as `0x${string}`, inputHandle, inputProof],
      });

      // Refresh the employee list after add
      await refetchEmployees();
      return hash;
    },
    [writeContractAsync, encrypt64, refetchEmployees]
  );

  // ── Remove Employee ──
  const removeEmployee = useCallback(
    async (employeeAddress: string): Promise<string> => {
      const hash = await writeContractAsync({
        address: PAYROLL_ADDRESS,
        abi: PAYROLL_ABI,
        functionName: 'removeEmployee',
        args: [employeeAddress as `0x${string}`],
      });

      // Refresh the employee list after removal
      await refetchEmployees();
      return hash;
    },
    [writeContractAsync, refetchEmployees]
  );

  // ── Grant Salary Access ──
  const grantSalaryAccess = useCallback(
    async (thirdPartyAddress: string): Promise<string> => {
      const hash = await writeContractAsync({
        address: PAYROLL_ADDRESS,
        abi: PAYROLL_ABI,
        functionName: 'grantSalaryAccess',
        args: [thirdPartyAddress as `0x${string}`],
      });
      return hash;
    },
    [writeContractAsync]
  );

  // ── Sync Treasury Allowance ──
  const syncTreasuryAllowance = useCallback(async (): Promise<string> => {
    const hash = await writeContractAsync({
      address: PAYROLL_ADDRESS,
      abi: PAYROLL_ABI,
      functionName: 'syncTreasuryAllowance',
      gas: 5_000_000n,
    });
    return hash;
  }, [writeContractAsync]);

  return {
    // Data
    employer: employer as `0x${string}` | undefined,
    tokenAddress: tokenAddress as `0x${string}` | undefined,
    employeeAddresses: (employeeAddresses || []) as string[],
    isLoadingEmployees,
    refetchEmployees,

    // Transaction state
    txHash,
    isTxPending,
    isConfirming,
    isConfirmed,

    // Actions
    addEmployee,
    removeEmployee,
    runPayroll,
    grantSalaryAccess,
    syncTreasuryAllowance,

    // Treasury
    treasuryHandle: treasuryHandle as bigint | undefined,
    refetchTreasury,

    // Config
    contractAddress: PAYROLL_ADDRESS,
    isConfigured: !!PAYROLL_ADDRESS,
  };
}