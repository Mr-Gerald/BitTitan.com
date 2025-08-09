

import { User, CandlestickData, Order, Trade, InvestmentPlan, Transaction, LiveNotificationData, AlternativeInvestmentPlan } from './types';
import React from 'react';

// Icons
export const LOGO_ICON = <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />;
export const HOME_ICON = <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />;
export const TRADE_ICON = <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />;
export const INVEST_ICON = <path strokeLinecap="round" strokeLinejoin="round"d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />;
export const WALLET_ICON = <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />;
export const ACCOUNT_ICON = <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />;
export const LOGOUT_ICON = <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />;
export const MENU_ICON = <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />;
export const CLOSE_ICON = <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />;
export const AI_ICON = <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />;
export const ADMIN_ICON = <><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>;
export const VERIFIED_BADGE_ICON = <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 48 48" className="w-full h-full">
<polygon fill="#42a5f5" points="29.62,3 33.053,8.308 39.367,8.624 39.686,14.937 44.997,18.367 42.116,23.995 45,29.62 39.692,33.053 39.376,39.367 33.063,39.686 29.633,44.997 24.005,42.116 18.38,45 14.947,39.692 8.633,39.376 8.314,33.063 3.003,29.633 5.884,24.005 3,18.38 8.308,14.947 8.624,8.633 14.937,8.314 18.367,3.003 23.995,5.884" /><polygon fill="#fff" points="21.396,31.255 14.899,24.76 17.021,22.639 21.428,27.046 30.996,17.772 33.084,19.926" />
</svg>;
export const LOGIN_STREAK_ICON = <path d="M12.04 2C9.4 2 7.21 3.53 6.33 5.56c-.34.78-.5 1.63-.5 2.53C5.83 12.17 12.04 22 12.04 22s6.21-9.83 6.21-13.91c0-.9-.16-1.75-.5-2.53C16.87 3.53 14.68 2 12.04 2z" />
export const CHEVRON_DOWN_ICON = <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />;
export const NOTIFICATION_ICON = <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />;
export const PORTFOLIO_ICON = <><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 100 15 7.5 7.5 0 000-15z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 10.5V6" /></>;
export const ALT_INVEST_ICON = <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m1.5 0h1.5m-1.5 0H3.75m-1.5 0h1.5m0 0h1.5" />;
export const HISTORY_ICON = <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />;
export const TECH_ICON = <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />;
export const ENERGY_ICON = <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />;
export const REAL_ESTATE_ICON = <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M9 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" />;
export const SHIELD_ICON = <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />;
export const SUPPORT_ICON = <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
export const CHART_PIE_ICON = <><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 100 15 7.5 7.5 0 000-15z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></>;
export const USERS_ICON = <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />;
export const EMAIL_ICON = <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />;
export const VERIFICATION_ICON = <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />;
export const TRASH_ICON = <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />;

// Mock Data & Generators
const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const STATIC_TRANSACTION_HISTORY: Transaction[] = [
    { id: 'tx1', type: 'Deposit', asset: 'BTC', amount: 2.5, description: 'Crypto Deposit', date: '2023-10-28', status: 'Completed' },
    { id: 'tx2', type: 'Investment', asset: 'USDT', amount: 50000, description: 'Crypto Plan: Pro', date: '2023-10-25', status: 'Completed' },
    { id: 'tx3', type: 'Profit', asset: 'USDT', amount: 7250, description: 'Return from Crypto Plan: Starter', date: '2023-10-22', status: 'Completed' },
    { id: 'tx4', type: 'Withdrawal', asset: 'BTC', amount: 1.0, description: 'Withdrawal to bc1q...', date: '2023-10-20', status: 'Completed' },
    { id: 'tx5', type: 'Funding', asset: 'USDT', amount: 10000, description: 'Funded via Card', date: '2023-10-18', status: 'Completed' },
    { id: 'tx6', type: 'Investment', asset: 'USDT', amount: 25000, description: 'Alt Plan: Tech Growth Fund', date: '2023-10-15', status: 'Completed' },
    { id: 'tx7', type: 'Referral Bonus', asset: 'USDT', amount: 100, description: 'Bonus from referral: Alex T.', date: '2023-10-12', status: 'Completed' },
    { id: 'tx8', type: 'Deposit', asset: 'ETH', amount: 10, description: 'Crypto Deposit', date: '2023-10-10', status: 'Completed' },
    { id: 'tx9', type: 'Withdrawal', asset: 'USDT', amount: 5000, description: 'Withdrawal to 0x123...', date: '2023-10-05', status: 'Rejected' },
    { id: 'tx10', type: 'Investment', asset: 'USDT', amount: 1000, description: 'Crypto Plan: Starter', date: '2023-10-01', status: 'Completed' },
    { id: 'tx11', type: 'Profit', asset: 'USDT', amount: 1250, description: 'Return from Crypto Plan: Starter', date: '2023-09-30', status: 'Completed' },
    { id: 'tx12', type: 'Deposit', asset: 'BTC', amount: 0.5, description: 'Crypto Deposit', date: '2023-09-28', status: 'Completed' },
    { id: 'tx13', type: 'Withdrawal', asset: 'ETH', amount: 5, description: 'Withdrawal to 0xabc...', date: '2023-09-25', status: 'Completed' },
    { id: 'tx14', type: 'Investment', asset: 'USDT', amount: 5000, description: 'Alt Plan: Green Energy', date: '2023-09-22', status: 'Completed' },
    { id: 'tx15', type: 'Funding', asset: 'USDT', amount: 2000, description: 'Funded via PayPal', date: '2023-09-20', status: 'Completed' },
    { id: 'tx16', type: 'Deposit', asset: 'USDT', amount: 10000, description: 'Crypto Deposit', date: '2023-09-18', status: 'Completed' },
    { id: 'tx17', type: 'Investment', asset: 'BTC', amount: 0.2, description: 'Crypto Plan: Pro', date: '2023-09-15', status: 'Completed' },
    { id: 'tx18', type: 'Withdrawal', asset: 'USDT', amount: 3000, description: 'Withdrawal to 0xdef...', date: '2023-09-12', status: 'Completed' },
    { id: 'tx19', type: 'Profit', asset: 'BTC', amount: 0.05, description: 'Return from Crypto Plan: Pro', date: '2023-09-10', status: 'Completed' },
    { id: 'tx20', type: 'Deposit', asset: 'ETH', amount: 2, description: 'Crypto Deposit', date: '2023-09-08', status: 'Completed' },
    { id: 'tx21', type: 'Investment', asset: 'ETH', amount: 2, description: 'Crypto Plan: Starter', date: '2023-09-05', status: 'Completed' },
    { id: 'tx22', type: 'Funding', asset: 'USDT', amount: 500, description: 'Funded via Cash App', date: '2023-09-01', status: 'Completed' },
    { id: 'tx23', type: 'Withdrawal', asset: 'BTC', amount: 0.1, description: 'Withdrawal to bc1r...', date: '2023-08-28', status: 'Completed' },
    { id: 'tx24', type: 'Profit', asset: 'ETH', amount: 0.5, description: 'Return from Crypto Plan: Starter', date: '2023-08-25', status: 'Completed' },
    { id: 'tx25', type: 'Deposit', asset: 'USDT', amount: 1500, description: 'Crypto Deposit', date: '2023-08-20', status: 'Completed' },
    { id: 'tx26', type: 'Investment', asset: 'USDT', amount: 1500, description: 'Alt Plan: Real Estate', date: '2023-08-18', status: 'Completed' },
    { id: 'tx27', type: 'Referral Bonus', asset: 'USDT', amount: 100, description: 'Bonus from referral: Emily R.', date: '2023-08-15', status: 'Completed' },
    { id: 'tx28', type: 'Withdrawal', asset: 'USDT', amount: 1000, description: 'Withdrawal to 0xghi...', date: '2023-08-10', status: 'Failed' },
    { id: 'tx29', type: 'Funding', asset: 'USDT', amount: 1000, description: 'Funded via Zelle', date: '2023-08-05', status: 'Completed' },
    { id: 'tx30', type: 'Deposit', asset: 'BTC', amount: 1, description: 'Crypto Deposit', date: '2023-08-01', status: 'Completed' },
    { id: 'tx31', type: 'Investment', asset: 'BTC', amount: 1, description: 'Crypto Plan: Institutional', date: '2023-07-30', status: 'Completed' },
    { id: 'tx32', type: 'Profit', asset: 'USDT', amount: 500, description: 'Return from Alt Plan: Real Estate', date: '2023-07-28', status: 'Completed' },
    { id: 'tx33', type: 'Withdrawal', asset: 'USDT', amount: 2500, description: 'Withdrawal to 0xjkl...', date: '2023-07-25', status: 'Completed' },
    { id: 'tx34', type: 'Deposit', asset: 'ETH', amount: 15, description: 'Crypto Deposit', date: '2023-07-20', status: 'Completed' },
    { id: 'tx35', type: 'Investment', asset: 'ETH', amount: 15, description: 'Crypto Plan: Pro', date: '2023-07-18', status: 'Completed' },
    { id: 'tx36', type: 'Profit', asset: 'BTC', amount: 0.3, description: 'Return from Crypto Plan: Institutional', date: '2023-07-15', status: 'Completed' },
    { id: 'tx37', type: 'Funding', asset: 'USDT', amount: 3000, description: 'Funded via Card', date: '2023-07-12', status: 'Completed' },
    { id: 'tx38', type: 'Withdrawal', asset: 'BTC', amount: 0.5, description: 'Withdrawal to bc1s...', date: '2023-07-10', status: 'Completed' },
    { id: 'tx39', type: 'Deposit', asset: 'USDT', amount: 8000, description: 'Crypto Deposit', date: '2023-07-05', status: 'Completed' },
    { id: 'tx40', type: 'Investment', asset: 'USDT', amount: 8000, description: 'Crypto Plan: Starter', date: '2023-07-01', status: 'Completed' },
    { id: 'tx41', type: 'Profit', asset: 'ETH', amount: 3.5, description: 'Return from Crypto Plan: Pro', date: '2023-06-28', status: 'Completed' },
    { id: 'tx42', type: 'Withdrawal', asset: 'ETH', amount: 10, description: 'Withdrawal to 0x mno...', date: '2023-06-25', status: 'Completed' },
    { id: 'tx43', type: 'Deposit', asset: 'BTC', amount: 0.75, description: 'Crypto Deposit', date: '2023-06-20', status: 'Completed' },
    { id: 'tx44', type: 'Investment', asset: 'USDT', amount: 12000, description: 'Crypto Plan: Pro', date: '2023-06-18', status: 'Completed' },
    { id: 'tx45', type: 'Profit', asset: 'USDT', amount: 2000, description: 'Return from Crypto Plan: Starter', date: '2023-06-15', status: 'Completed' },
    { id: 'tx46', type: 'Funding', asset: 'USDT', amount: 6000, description: 'Funded via Bank Transfer', date: '2023-06-12', status: 'Completed' },
    { id: 'tx47', type: 'Withdrawal', asset: 'USDT', amount: 5000, description: 'Withdrawal to 0xpqr...', date: '2023-06-10', status: 'Completed' },
    { id: 'tx48', type: 'Referral Bonus', asset: 'USDT', amount: 100, description: 'Bonus from referral: Michael C.', date: '2023-06-08', status: 'Completed' },
    { id: 'tx49', type: 'Deposit', asset: 'ETH', amount: 3, description: 'Crypto Deposit', date: '2023-06-05', status: 'Completed' },
    { id: 'tx50', type: 'Investment', asset: 'ETH', amount: 3, description: 'Alt Plan: Green Energy', date: '2023-06-01', status: 'Completed' },
];


export const GERALD_USER: User = {
    id: 1,
    name: 'gerald',
    fullName: 'Gerald R.',
    dateOfBirth: '1985-05-15',
    email: 'gerald@basetitan.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=gerald',
    password: '123456',
    phone: '+1-202-555-0182',
    country: 'United States',
    bio: 'Seasoned crypto investor with a focus on long-term value. Diamond hands since 2016.',
    balances: {
        BTC: 12.8315024,
        USDT: 310542.77,
        ETH: 95.118
    },
    badges: ['Top Trader', 'Investor Elite', 'Diamond Hands'],
    transactions: STATIC_TRANSACTION_HISTORY,
    activeInvestments: [],
    referralCode: 'GERALD-AB12',
    loginStreak: 2,
    lastLoginDate: '2023-10-29', // Yesterday's date for demo
    verificationStatus: 'Verified',
    notifications: [],
    is2FAEnabled: false,
    isEmailVerified: true,
    emailVerificationToken: '',
};

export const ADMIN_USER: User = {
    id: 0,
    name: 'admin',
    fullName: 'BitTitan Admin',
    dateOfBirth: '1970-01-01',
    email: 'admin@basetitan.com',
    avatarUrl: 'https://i.pravatar.cc/150?u=admin',
    password: '123456',
    isAdmin: true,
    balances: { BTC: 999, USDT: 9999999, ETH: 9999 },
    badges: ['Platform Moderator'],
    transactions: [],
    activeInvestments: [],
    referralCode: 'ADMIN-A000',
    loginStreak: 0,
    lastLoginDate: '',
    verificationStatus: 'Verified',
    notifications: [],
    is2FAEnabled: true,
    isEmailVerified: true,
    emailVerificationToken: '',
};

export const generateNewUser = (id: number, fullName: string, name: string, email: string, country: string, dateOfBirth: string, phone: string, password?: string): User => ({
    id,
    name,
    fullName,
    email,
    country,
    dateOfBirth,
    password,
    avatarUrl: '',
    phone,
    bio: '',
    balances: { BTC: 0, USDT: 0, ETH: 0 },
    badges: ['New Member'],
    transactions: [],
    activeInvestments: [],
    referralCode: `${name.toUpperCase().substring(0, 4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    loginStreak: 0,
    lastLoginDate: '',
    verificationStatus: 'Not Verified',
    notifications: [],
    is2FAEnabled: false,
    isEmailVerified: false,
    emailVerificationToken: crypto.randomUUID(),
});

export const generateDefaultAccount = (id: number, details: { fullName: string; name: string; email: string; phone: string; dateOfBirth: string; password?: string; avatarUrl: string; address?: string; }): User => ({
    id,
    name: details.name,
    fullName: details.fullName,
    email: details.email,
    password: details.password,
    avatarUrl: details.avatarUrl,
    phone: details.phone,
    dateOfBirth: details.dateOfBirth,
    address: details.address,
    country: 'United States', // Defaulting this as it's not on the form
    bio: 'Newly generated default account. Eager to explore the platform.',
    balances: { ...GERALD_USER.balances },
    badges: [...GERALD_USER.badges, 'New Member'],
    transactions: [...STATIC_TRANSACTION_HISTORY],
    activeInvestments: [],
    referralCode: `${details.name.toUpperCase().substring(0, 4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    loginStreak: 1,
    lastLoginDate: getTodayDateString(),
    verificationStatus: 'Verified',
    notifications: [],
    is2FAEnabled: false,
    isEmailVerified: true,
    emailVerificationToken: '',
});


export const CANDLESTICK_DATA: CandlestickData[] = [
    { time: '2023-10-01', open: 65000, high: 65500, low: 64800, close: 65200 },
    { time: '2023-10-02', open: 65200, high: 66000, low: 65100, close: 65800 },
    { time: '2023-10-03', open: 65800, high: 66200, low: 65700, close: 65900 },
    { time: '2023-10-04', open: 65900, high: 66500, low: 65800, close: 66300 },
    { time: '2023-10-05', open: 66300, high: 66400, low: 65500, close: 65700 },
    { time: '2023-10-06', open: 65700, high: 67000, low: 65600, close: 66900 },
    { time: '2023-10-07', open: 66900, high: 67500, low: 66800, close: 67200 },
    { time: '2023-10-08', open: 67200, high: 68000, low: 67100, close: 67900 },
    { time: '2023-10-09', open: 67900, high: 67950, low: 67000, close: 67100 },
    { time: '2023-10-10', open: 67100, high: 67300, low: 66500, close: 66800 },
    { time: '2023-10-11', open: 66800, high: 67100, low: 66700, close: 67050 },
    { time: '2023-10-12', open: 67050, high: 67500, low: 66900, close: 67400 },
    { time: '2023-10-13', open: 67400, high: 67450, low: 66800, close: 66850 },
    { time: '2023-10-14', open: 66850, high: 67200, low: 66700, close: 67150 },
    { time: '2023-10-15', open: 67150, high: 67800, low: 67100, close: 67700 },
];

export const INVESTMENT_PLANS: InvestmentPlan[] = [
    { name: 'Starter', roi: 'Up to 45%', period: '72 Hours', minInvest: '50 USDT', maxInvest: '5,000 USDT', color: 'blue', profitMultiplier: 1.45 },
    { name: 'Pro', roi: 'Up to 65%', period: '120 Hours', minInvest: '5,000 USDT', maxInvest: '50,000 USDT', color: 'green', profitMultiplier: 1.65 },
    { name: 'Institutional', roi: 'Up to 85%', period: '120 Hours', minInvest: '50,000 USDT', maxInvest: '500,000 USDT', color: 'purple', profitMultiplier: 1.85 },
    { name: 'Whale', roi: 'Custom', period: 'Custom', minInvest: '500,000+ USDT', maxInvest: 'Unlimited', color: 'yellow', profitMultiplier: 2.0 },
];

export const ALTERNATIVE_INVESTMENT_PLANS: AlternativeInvestmentPlan[] = [
    { name: 'Tech Growth Fund', category: 'Tech', description: 'Invest in a portfolio of high-growth technology stocks and startups.', avgReturn: '18% p.a.', riskLevel: 'High', color: 'blue', icon: TECH_ICON, profitMultiplier: 1.18 },
    { name: 'Green Energy Portfolio', category: 'Green Energy', description: 'Fund renewable energy projects and sustainable technology companies.', avgReturn: '12% p.a.', riskLevel: 'Medium', color: 'green', icon: ENERGY_ICON, profitMultiplier: 1.12 },
    { name: 'Global Real Estate Trust', category: 'Real Estate', description: 'Diversify with commercial and residential properties across the globe.', avgReturn: '8% p.a.', riskLevel: 'Low', color: 'purple', icon: REAL_ESTATE_ICON, profitMultiplier: 1.08 },
];


export const LEADERBOARD_DATA = [
    { name: 'Alex T.', avatar: 'https://i.pravatar.cc/150?u=alex', profit: 5.2, currency: 'BTC' },
    { name: 'Jessica W.', avatar: 'https://i.pravatar.cc/150?u=jessica', profit: 4.8, currency: 'BTC' },
    { name: 'Michael C.', avatar: 'https://i.pravatar.cc/150?u=michael', profit: 150340.5, currency: 'USDT' },
    { name: 'Emily R.', avatar: 'https://i.pravatar.cc/150?u=emily', profit: 3.9, currency: 'BTC' },
];

export const RECENT_CASHOUTS = [
    { name: 'D. Johnson', amount: 1.5, currency: 'BTC', time: '2m ago' },
    { name: 'S. Lee', amount: 25000, currency: 'USDT', time: '5m ago' },
    { name: 'M. Patel', amount: 0.8, currency: 'BTC', time: '8m ago' },
];

const FIRST_NAMES = ['John', 'Jane', 'Alex', 'Emily', 'Chris', 'Katie', 'Michael', 'Sarah', 'David', 'Laura', 'Robert', 'Jessica', 'James', 'Linda', 'William', 'Maria', 'Richard', 'Susan', 'Joseph', 'Karen', 'Daniel', 'Nancy', 'Matthew', 'Lisa', 'Anthony', 'Betty', 'Mark', 'Sandra'];
const LAST_INITIALS = ['S', 'J', 'W', 'B', 'M', 'C', 'L', 'P', 'K', 'D', 'R', 'T', 'F', 'G', 'H', 'N', 'Y', 'A', 'E', 'O'];

const generateLiveProfitNotifications = (count: number): LiveNotificationData[] => {
    const notifications: LiveNotificationData[] = [];
    const currencies = ['USDT', 'BTC', 'ETH'];
    for (let i = 0; i < count; i++) {
        const currency = currencies[Math.floor(Math.random() * currencies.length)];
        let amount;
        if (currency === 'USDT') {
            amount = Math.random() * 5000 + 500;
        } else if (currency === 'BTC') {
            amount = Math.random() * 0.1 + 0.01;
        } else {
            amount = Math.random() * 2 + 0.5;
        }
        
        let name: string;
        if (Math.random() > 0.3) { // 70% chance for a real name
            const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
            const lastName = LAST_INITIALS[Math.floor(Math.random() * LAST_INITIALS.length)];
            name = `${firstName} ${lastName}.`;
        } else { // 30% chance for an anonymous investor
            name = `Investor #${Math.floor(Math.random() * 9000) + 1000}`;
        }

        notifications.push({
            name: name,
            amount: parseFloat(amount.toFixed(4)),
            currency: currency as 'USDT' | 'BTC' | 'ETH',
        });
    }
    return notifications;
};

export const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Democratic Republic of the", "Congo, Republic of the", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
];

export const LIVE_PROFIT_NOTIFICATIONS: LiveNotificationData[] = generateLiveProfitNotifications(200);