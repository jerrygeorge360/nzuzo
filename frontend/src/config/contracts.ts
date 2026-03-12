// ── Contract Addresses (set via Vite env vars after deployment) ──
export const PAYROLL_ADDRESS = (import.meta.env.VITE_PAYROLL_ADDRESS || '') as `0x${string}`;
export const TOKEN_ADDRESS = (import.meta.env.VITE_TOKEN_ADDRESS || '') as `0x${string}`;

// ── ConfidentialPayroll ABI ──
export const PAYROLL_ABI = [
    {
        inputs: [{ internalType: 'address', name: 'tokenAddress', type: 'address' }],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        anonymous: false,
        inputs: [{ indexed: true, internalType: 'address', name: 'employee', type: 'address' }],
        name: 'EmployeeAdded',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [{ indexed: true, internalType: 'address', name: 'employee', type: 'address' }],
        name: 'EmployeeRemoved',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
            { indexed: false, internalType: 'uint256', name: 'employeeCount', type: 'uint256' },
        ],
        name: 'PayrollRun',
        type: 'event',
    },
    {
        inputs: [
            { internalType: 'address', name: 'employee', type: 'address' },
            { internalType: 'einput', name: 'encryptedSalary', type: 'bytes32' },
            { internalType: 'bytes', name: 'inputProof', type: 'bytes' },
        ],
        name: 'addEmployee',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: 'employee', type: 'address' }],
        name: 'removeEmployee',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getEmployees',
        outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'employeeCount',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        name: 'employees',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'employer',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: 'employee', type: 'address' }],
        name: 'getSalaryHandle',
        outputs: [{ internalType: 'euint64', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: 'thirdParty', type: 'address' }],
        name: 'grantSalaryAccess',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: '', type: 'address' }],
        name: 'isEmployee',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'runPayroll',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'token',
        outputs: [{ internalType: 'contract IConfidentialERC20', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getTreasuryHandle',
        outputs: [{ internalType: 'euint64', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'syncTreasuryAllowance',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
] as const;

// ── MockUSDC ABI ──
export const TOKEN_ABI = [
    {
        inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ internalType: 'euint64', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'einput', name: 'encryptedAmount', type: 'bytes32' },
            { internalType: 'bytes', name: 'inputProof', type: 'bytes' },
        ],
        name: 'transfer',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: 'address', name: 'from', type: 'address' },
            { indexed: true, internalType: 'address', name: 'to', type: 'address' },
            { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
        ],
        name: 'Transfer',
        type: 'event',
    },
] as const;
