interface ActionZoneProps {
    onRunPayroll: () => void;
    onAddEmployee: () => void;
    isPayrollRunning: boolean;
    employeeCount: number;
}

export function ActionZone({ onRunPayroll, onAddEmployee, isPayrollRunning, employeeCount }: ActionZoneProps) {
    return (
        <div className="action-zone">
            <button
                className="btn btn-primary"
                onClick={onRunPayroll}
                disabled={isPayrollRunning || employeeCount === 0}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5,3 19,12 5,21 5,3" />
                </svg>
                {isPayrollRunning ? 'Executing...' : 'Run Payroll'}
            </button>

            <button className="btn btn-secondary" onClick={onAddEmployee}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Employee
            </button>

            <div className="action-spacer" />

            <span className="action-status">
                {employeeCount > 0
                    ? `${employeeCount} employee${employeeCount !== 1 ? 's' : ''} • FHE batch ready`
                    : 'No employees registered'}
            </span>
        </div>
    );
}
