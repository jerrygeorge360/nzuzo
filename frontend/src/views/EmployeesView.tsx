import { EmployeeList } from '../components/EmployeeList';
import { Plus } from 'lucide-react';

interface EmployeesViewProps {
    addresses: string[];
    isEmployer: boolean;
    onRemove: (address: string) => Promise<string>;
    isLoading: boolean;
    walletAddress: string;
    contractAddress: string;
    onAddClick: () => void;
}

export function EmployeesView({
    addresses,
    isEmployer,
    onRemove,
    isLoading,
    walletAddress,
    contractAddress,
    onAddClick,
}: EmployeesViewProps) {
    return (
        <div className="content-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Team Roster</h2>
                {isEmployer && (
                    <button className="send-action-btn" onClick={onAddClick}>
                        <Plus size={14} style={{ marginRight: '6px' }} />
                        Add Employee
                    </button>
                )}
            </div>
            <EmployeeList
                addresses={addresses}
                isEmployer={isEmployer}
                onRemove={onRemove}
                isLoading={isLoading}
                walletAddress={walletAddress}
                contractAddress={contractAddress}
            />
        </div>
    );
}
