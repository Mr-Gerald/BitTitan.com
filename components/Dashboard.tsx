import React, { useContext } from 'react';
import Card from './shared/Card';
import { LEADERBOARD_DATA, RECENT_CASHOUTS, VERIFIED_BADGE_ICON } from '../constants';
import Icon from './shared/Icon';
import { AuthContext } from './auth/AuthContext';

const Dashboard: React.FC = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;

  if (!user) {
    return null; // or a loading spinner
  }

  const totalBalanceUSD = user.balances.USDT + (user.balances.BTC * 67100) + (user.balances.ETH * 3500);

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header Welcome */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome, {user.name}</h1>
          <div className="flex items-center space-x-2 mt-2">
            {user.badges.map(badge => (
              <span key={badge} className="bg-accent-primary/20 text-accent-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">{badge}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Account Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
          <h3 className="text-lg font-semibold">Total Balance (USD)</h3>
          <p className="text-4xl font-bold mt-2">${totalBalanceUSD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p className="text-blue-200 mt-1">+5.2% last 24h</p>
        </Card>
        <Card>
          <h3 className="text-basetitan-text-secondary font-semibold">Bitcoin Balance</h3>
          <p className="text-2xl font-bold text-white mt-2">{user.balances.BTC.toFixed(4)} BTC</p>
          <p className="text-basetitan-text-secondary mt-1">~ ${ (user.balances.BTC * 67100).toLocaleString() }</p>
        </Card>
         <Card>
          <h3 className="text-basetitan-text-secondary font-semibold">USDT Balance</h3>
          <p className="text-2xl font-bold text-white mt-2">${user.balances.USDT.toLocaleString()}</p>
          <p className="text-basetitan-text-secondary mt-1">Tether</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Social Trust Engine */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <h3 className="font-bold text-white text-lg mb-4">Verified Investors Leaderboard</h3>
            <ul className="space-y-4">
              {LEADERBOARD_DATA.map((user, index) => (
                <li key={index} className="flex items-center space-x-4">
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <p className="font-semibold text-white flex items-center">{user.name} <span className="ml-2 w-5 h-5">{VERIFIED_BADGE_ICON}</span></p>
                    <p className="text-sm text-accent-secondary">+{user.profit.toLocaleString()} {user.currency}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <h3 className="font-bold text-white text-lg mb-4">Recent Big Cashouts</h3>
            <ul className="space-y-3">
              {RECENT_CASHOUTS.map((cashout, index) => (
                <li key={index} className="flex justify-between items-center text-sm animate-pulse-slow">
                  <div>
                    <span className="font-semibold text-white">{cashout.name}</span>
                    <span className="text-basetitan-text-secondary"> just withdrew</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent-secondary">{cashout.amount} {cashout.currency}</p>
                    <p className="text-xs text-basetitan-text-secondary">{cashout.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <h3 className="font-bold text-white text-lg mb-4">Set Your Goal</h3>
                <p className="text-basetitan-text-secondary mb-4">Challenge yourself to grow your portfolio. e.g., turn $100 to $1000 in 30 days.</p>
                <div className="flex items-center space-x-4">
                    <input type="text" placeholder="Your financial goal..." className="flex-1 bg-basetitan-dark border border-basetitan-border rounded-md px-3 py-2 focus:ring-accent-primary focus:border-accent-primary"/>
                    <button className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-2 px-4 rounded-md">Start Challenge</button>
                </div>
            </Card>
             <Card>
                <h3 className="font-bold text-white text-lg mb-4">Platform Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="text-3xl font-bold text-accent-primary">1.2M+</p>
                        <p className="text-basetitan-text-secondary text-sm">Registered Users</p>
                    </div>
                     <div>
                        <p className="text-3xl font-bold text-accent-primary">$5.4B+</p>
                        <p className="text-basetitan-text-secondary text-sm">Total Invested</p>
                    </div>
                     <div>
                        <p className="text-3xl font-bold text-accent-secondary">99.9%</p>
                        <p className="text-basetitan-text-secondary text-sm">Uptime</p>
                    </div>
                     <div>
                        <p className="text-3xl font-bold text-accent-secondary">24/7</p>
                        <p className="text-basetitan-text-secondary text-sm">Support</p>
                    </div>
                </div>
            </Card>
        </div>
      </div>
      
      {/* "As Seen On" Section */}
      <div className="mt-8">
        <p className="text-center text-basetitan-text-secondary font-semibold mb-4">AS SEEN ON</p>
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-60 grayscale">
            <p className="font-bold text-2xl">Forbes</p>
            <p className="font-bold text-2xl">TechCrunch</p>
            <p className="font-bold text-2xl">Binance</p>
            <p className="font-bold text-2xl">Bloomberg</p>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;