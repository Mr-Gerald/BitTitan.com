import React, { useContext } from 'react';
import { AuthContext } from './auth/AuthContext';
import Card from './shared/Card';
import Icon from './shared/Icon';
import { HISTORY_ICON } from '../constants';

const InvestmentHistory: React.FC = () => {
    const auth = useContext(AuthContext);
    const investments = auth?.user?.activeInvestments || [];

    const StatusBadge: React.FC<{ status: 'Active' | 'Completed' }> = ({ status }) => {
        if (status === 'Completed') {
            return (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400">
                    Completed
                </span>
            );
        }
        return (
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-400 animate-pulse">
                Active
            </span>
        );
    };

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Investment History</h1>
                <p className="text-basetitan-text-secondary mt-1">A complete record of all your investments.</p>
            </div>
            
            {investments.length === 0 ? (
                <Card>
                    <div className="text-center py-12">
                        <Icon className="w-16 h-16 mx-auto text-basetitan-text-secondary">{HISTORY_ICON}</Icon>
                        <h2 className="mt-4 text-xl font-bold text-white">No Investment History</h2>
                        <p className="text-basetitan-text-secondary mt-2">Start an investment plan to see your history here.</p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {investments.map(inv => (
                        <Card key={inv.id} className={`bg-basetitan-light border-l-4 ${inv.status === 'Active' ? 'border-accent-primary' : 'border-green-500'} animate-fade-in-up`}>
                            <h2 className="text-xl font-bold text-white">{inv.planName}</h2>
                            <div className="mt-4 space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-basetitan-text-secondary">Invested Amount:</span>
                                    <span className="font-mono text-white">{inv.amountInvested.toLocaleString(undefined, { maximumFractionDigits: 6 })} {inv.asset}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-basetitan-text-secondary">Start Date:</span>
                                    <span className="font-mono text-white">{inv.startDate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-basetitan-text-secondary">Total Return:</span>
                                    <span className="font-mono text-accent-secondary">{inv.potentialReturn.toLocaleString(undefined, { maximumFractionDigits: 6 })} {inv.asset}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-basetitan-border mt-2">
                                    <span className="text-basetitan-text-secondary">Status:</span>
                                    <StatusBadge status={inv.status} />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InvestmentHistory;