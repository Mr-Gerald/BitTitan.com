import React, { useState, useContext } from 'react';
import { ALTERNATIVE_INVESTMENT_PLANS, ADMIN_USER } from '../constants';
import Card from './shared/Card';
import Icon from './shared/Icon';
import { AuthContext } from './auth/AuthContext';
import InvestmentModal from './shared/InvestmentModal';
import { AlternativeInvestmentPlan, Page } from '../types';

const planColorClasses = {
    blue: 'border-blue-500 from-blue-500/10 to-basetitan-light',
    green: 'border-green-500 from-green-500/10 to-basetitan-light',
    purple: 'border-purple-500 from-purple-500/10 to-basetitan-light',
};

const AlternativeInvestments: React.FC = () => {
    const [selectedPlan, setSelectedPlan] = useState<AlternativeInvestmentPlan | null>(null);
    const auth = useContext(AuthContext);

     const handleInvest = (amount: number, asset: 'BTC' | 'USDT' | 'ETH') => {
        if (!selectedPlan || !auth?.user) return;
        const { user, updateUserBalance, addInvestment } = auth;

        if (asset !== 'USDT') {
            // This case should ideally be prevented by the modal UI,
            // but we handle it gracefully here.
            setSelectedPlan(null);
            return;
        }

        const investmentAmount = amount;
        const totalReturnValue = investmentAmount * selectedPlan.profitMultiplier;

        // 1. Deduct from user
        updateUserBalance(user.id, 'USDT', -investmentAmount, 'Investment', `Alt Plan: ${selectedPlan.name}`);
        
        // 2. Credit to admin
        updateUserBalance(ADMIN_USER.id, 'USDT', investmentAmount, 'Deposit', `Alt. Investment from ${user.name} (${user.id})`);
        
        // 3. Record investment for user, awaiting admin approval
        addInvestment(user.id, {
            planName: selectedPlan.name,
            amountInvested: investmentAmount,
            asset: 'USDT',
            startDate: new Date().toISOString().split('T')[0],
            potentialReturn: totalReturnValue,
            status: 'Active'
        });
        
        // The modal handles its own closing
    };


    return (
        <div className="p-4 md:p-8">
             {selectedPlan && auth?.user && (
                <InvestmentModal
                    plan={{
                        name: selectedPlan.name,
                        roi: selectedPlan.avgReturn,
                        period: 'Varies',
                        minInvest: '100 USDT', // Provide a default minimum as the modal requires it
                        maxInvest: 'Unlimited',
                        color: selectedPlan.color,
                        profitMultiplier: selectedPlan.profitMultiplier,
                    }}
                    balances={auth.user.balances}
                    onInvest={handleInvest}
                    onClose={() => setSelectedPlan(null)}
                    onSuccessNavigation={() => auth.navigateTo(Page.InvestmentHistory)}
                />
            )}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-white">Diversify Your Portfolio</h1>
                <p className="text-basetitan-text-secondary mt-4 max-w-2xl mx-auto">Explore investment opportunities beyond cryptocurrency. Invest in curated portfolios of stocks, green energy, and real estate.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {ALTERNATIVE_INVESTMENT_PLANS.map((plan, index) => (
                     <Card key={index} className={`bg-gradient-to-br ${planColorClasses[plan.color as keyof typeof planColorClasses]} border-t-4 flex flex-col`}>
                        <div className="flex-grow">
                            <Icon className={`w-12 h-12 mb-4 ${plan.color === 'blue' ? 'text-blue-500' : plan.color === 'green' ? 'text-green-500' : 'text-purple-500'}`}>{plan.icon}</Icon>
                            <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
                            <p className="text-basetitan-text-secondary mt-2">{plan.description}</p>
                            
                            <div className="my-6 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-basetitan-text-secondary">Avg. Return (p.a.)</span>
                                    <span className="font-bold text-white">{plan.avgReturn}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-basetitan-text-secondary">Risk Level</span>
                                    <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${plan.riskLevel === 'Low' ? 'bg-green-500/20 text-green-400' : plan.riskLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{plan.riskLevel}</span>
                                </div>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => setSelectedPlan(plan)}
                            className={`w-full mt-4 font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 ${plan.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700 text-white' : plan.color === 'green' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}>
                           Invest with USDT
                        </button>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AlternativeInvestments;