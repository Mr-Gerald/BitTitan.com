import React, { useState, useContext } from 'react';
import { INVESTMENT_PLANS, ADMIN_USER } from '../constants';
import Card from './shared/Card';
import { AuthContext } from './auth/AuthContext';
import InvestmentModal from './shared/InvestmentModal';
import { InvestmentPlan, Page } from '../types';

const planColorClasses = {
    blue: 'border-blue-500 from-blue-500/10 to-basetitan-light',
    green: 'border-green-500 from-green-500/10 to-basetitan-light',
    purple: 'border-purple-500 from-purple-500/10 to-basetitan-light',
    yellow: 'border-yellow-500 from-yellow-500/10 to-basetitan-light',
};

const InvestmentPlans: React.FC = () => {
    const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
    const auth = useContext(AuthContext);

    const handleInvest = (amount: number, asset: 'BTC' | 'USDT' | 'ETH') => {
        if (!selectedPlan || !auth?.user) return;

        const { user, updateUserBalance, addInvestment } = auth;
        const investmentAmount = amount;
        const totalReturnValue = investmentAmount * selectedPlan.profitMultiplier;

        // 1. Deduct investment from the user's balance
        updateUserBalance(user.id, asset, -investmentAmount, 'Investment', `Crypto Plan: ${selectedPlan.name}`);
        
        // 2. Credit the invested amount to the admin's balance to simulate fund transfer
        updateUserBalance(ADMIN_USER.id, asset, investmentAmount, 'Deposit', `Investment from ${user.name} (${user.id})`);
        
        // 3. Record the active investment for the user, awaiting admin approval
        addInvestment(user.id, {
            planName: selectedPlan.name,
            amountInvested: investmentAmount,
            asset: asset,
            startDate: new Date().toISOString().split('T')[0],
            potentialReturn: totalReturnValue,
            status: 'Active'
        });

        // The modal will handle its own closing
    };
    
    return (
        <div className="p-4 md:p-8">
            {selectedPlan && auth?.user && (
                <InvestmentModal
                    plan={selectedPlan}
                    balances={auth.user.balances}
                    onInvest={handleInvest}
                    onClose={() => setSelectedPlan(null)}
                    onSuccessNavigation={() => auth.navigateTo(Page.InvestmentHistory)}
                />
            )}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-white">Intelligent Crypto Plans</h1>
                <p className="text-basetitan-text-secondary mt-4 max-w-2xl mx-auto">Dynamic ROI plans that auto-adjust with market trends. Invest with BTC, ETH, or USDT and watch your assets grow.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {INVESTMENT_PLANS.map((plan, index) => (
                    <Card key={index} className={`bg-gradient-to-br ${planColorClasses[plan.color]} border-t-4 flex flex-col`}>
                        <div className="flex-grow">
                            <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
                            <p className="text-4xl font-bold my-4" style={{color: plan.color === 'blue' ? '#3b82f6' : plan.color === 'green' ? '#22c55e' : plan.color === 'purple' ? '#a855f7' : '#eab308'}}>{plan.roi}</p>
                            <p className="text-basetitan-text-secondary font-semibold">{plan.period} Investment Period</p>
                            
                            <ul className="text-sm space-y-2 my-6 text-basetitan-text">
                                <li className="flex justify-between"><span>Min. Investment:</span> <span className="font-mono">{plan.minInvest}</span></li>
                                <li className="flex justify-between"><span>Max. Investment:</span> <span className="font-mono">{plan.maxInvest}</span></li>
                                <li className="flex justify-between"><span>Assets:</span> <span className="font-mono">BTC, ETH, USDT</span></li>
                                <li className="flex justify-between"><span>AI Forecaster:</span> <span className="text-accent-secondary">Positive Outlook</span></li>
                            </ul>
                        </div>
                        
                        <button 
                            onClick={() => setSelectedPlan(plan)}
                            className={`w-full mt-4 font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 ${plan.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700 text-white' : plan.color === 'green' ? 'bg-green-600 hover:bg-green-700 text-white' : plan.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-basetitan-dark'}`}>
                           Invest Now
                        </button>
                    </Card>
                ))}
            </div>

            <Card className="mt-12">
                <h2 className="text-2xl font-bold text-white text-center">AI Profit Forecaster</h2>
                <p className="text-basetitan-text-secondary text-center mt-2 mb-6">Projected ROI based on the past 30-day market behavior for a $10,000 investment.</p>
                <div className="h-64 bg-basetitan-dark rounded-lg flex items-center justify-center">
                    <p className="text-basetitan-text-secondary">Chart placeholder showing projected profit growth.</p>
                </div>
                 <div className="text-center mt-4">
                    <button className="bg-accent-secondary hover:bg-accent-secondary-hover text-white font-bold py-2 px-6 rounded-md">Smart Reinvest All Earnings</button>
                </div>
            </Card>
        </div>
    );
};

export default InvestmentPlans;