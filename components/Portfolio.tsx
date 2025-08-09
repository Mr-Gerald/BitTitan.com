import React, { useContext } from 'react';
import { AuthContext } from './auth/AuthContext';
import Card from './shared/Card';

const PieChart: React.FC<{ data: { label: string, value: number, color: string }[] }> = ({ data }) => {
    const total = data.reduce((acc, d) => acc + d.value, 0);
    if (total === 0) {
        return <div className="flex items-center justify-center h-64 w-64 rounded-full bg-basetitan-dark"><p className="text-basetitan-text-secondary">No assets to display</p></div>;
    }
    
    let cumulative = 0;
    const segments = data.map(d => {
        const percentage = d.value / total;
        const angle = percentage * 360;
        const startAngle = cumulative * 360;
        cumulative += percentage;
        return { ...d, angle, startAngle };
    });

    const getCoords = (angle: number) => {
        const rads = (angle - 90) * Math.PI / 180;
        return [100 + 100 * Math.cos(rads), 100 + 100 * Math.sin(rads)];
    };

    return (
        <svg viewBox="0 0 200 200" className="w-64 h-64">
            {segments.map(seg => {
                const [startX, startY] = getCoords(seg.startAngle);
                const [endX, endY] = getCoords(seg.startAngle + seg.angle);
                const largeArcFlag = seg.angle > 180 ? 1 : 0;

                const pathData = `M ${startX} ${startY} A 100 100 0 ${largeArcFlag} 1 ${endX} ${endY}`;

                return (
                    <path
                        key={seg.label}
                        d={pathData}
                        stroke={seg.color}
                        strokeWidth="20"
                        fill="none"
                    />
                );
            })}
        </svg>
    );
};

const Portfolio: React.FC = () => {
    const auth = useContext(AuthContext);
    const user = auth?.user;

    if (!user) {
        return <div className="p-8"><h1 className="text-3xl font-bold">User not found.</h1></div>;
    }

    const btcValue = user.balances.BTC * 67100;
    const ethValue = user.balances.ETH * 3500;
    const usdtValue = user.balances.USDT;
    const totalBalanceUSD = btcValue + ethValue + usdtValue;

    const portfolioData = [
        { label: 'BTC', value: btcValue, color: '#f7931a' },
        { label: 'USDT', value: usdtValue, color: '#26a17b' },
        { label: 'ETH', value: ethValue, color: '#627eea' },
    ].filter(d => d.value > 0);

    return (
        <div className="p-4 md:p-8 space-y-8">
            <Card>
                <h1 className="text-3xl font-bold text-white">Your Portfolio</h1>
                <p className="text-basetitan-text-secondary">A complete overview of your assets and investments.</p>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card>
                        <h2 className="text-xl font-bold text-white mb-4">Asset Allocation</h2>
                        <div className="flex justify-center my-6">
                            <PieChart data={portfolioData} />
                        </div>
                        <ul className="space-y-2">
                            {portfolioData.map(item => (
                                <li key={item.label} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center">
                                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                                        <span className="text-white font-semibold">{item.label}</span>
                                    </div>
                                    <span className="font-mono text-basetitan-text">{((item.value / totalBalanceUSD) * 100).toFixed(2)}%</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card>
                        <h2 className="text-xl font-bold text-white mb-4">Holdings Summary</h2>
                        <div className="bg-basetitan-dark p-6 rounded-lg mb-6">
                            <h3 className="text-basetitan-text-secondary font-semibold">Total Net Worth (USD)</h3>
                            <p className="text-4xl font-bold text-white mt-2">${totalBalanceUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-basetitan-dark rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="text-white font-bold text-lg">Bitcoin</p>
                                    <p className="text-basetitan-text-secondary text-sm">{user.balances.BTC.toFixed(6)} BTC</p>
                                </div>
                                <p className="font-mono text-white text-lg">${btcValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div className="p-4 bg-basetitan-dark rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="text-white font-bold text-lg">Tether</p>
                                    <p className="text-basetitan-text-secondary text-sm">{user.balances.USDT.toFixed(2)} USDT</p>
                                </div>
                                <p className="font-mono text-white text-lg">${usdtValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            </div>
                             <div className="p-4 bg-basetitan-dark rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="text-white font-bold text-lg">Ethereum</p>
                                    <p className="text-basetitan-text-secondary text-sm">{user.balances.ETH.toFixed(4)} ETH</p>
                                </div>
                                <p className="font-mono text-white text-lg">${ethValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Portfolio;
