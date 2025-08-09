import type { ReactNode } from 'react';

export enum Page {
    Dashboard = 'Dashboard',
    Trade = 'Trade',
    Invest = 'Invest',
    Wallet = 'Wallet',
    Account = 'Account',
    Admin = 'Admin Panel',
    Portfolio = 'Portfolio',
    AlternativeInvestments = 'Alternative Investments',
    InvestmentHistory = 'Investment History',
    Landing = 'Landing', // For the public landing page
    Verification = 'Account Verification',
    GenerateAccount = 'Generate Instant Account',
}

export interface Notification {
    id: string;
    title?: string;
    message: string;
    date: string; // Should be a full ISO string for accurate time-ago calculation
    read: boolean;
    link?: Page;
}

export interface IDDocument {
    type: "Driver's License" | 'Passport' | 'National ID';
    frontImage: string; // base64
    backImage: string; // base64
}

export interface CardDetails {
    number: string;
    expiry: string;
    cvv: string;
    cardHolderName: string;
    billingAddress: string;
    issuingBank: string;
    pin: string;
    isAutoPayment: boolean;
}

export interface VerificationData {
    personalInfo: {
        fullName: string;
        dateOfBirth: string;
        address: string;
        city: string;
        postalCode: string;
        country: string;
        ssn?: string;
    };
    idDocument: IDDocument;
    cardDetails: CardDetails;
}


export interface Transaction {
    id: string;
    type: 'Deposit' | 'Withdrawal' | 'Investment' | 'Profit' | 'Funding' | 'Referral Bonus';
    asset: 'BTC' | 'USDT' | 'ETH' | 'USD';
    amount: number;
    description: string;
    date: string;
    status: 'Completed' | 'Pending' | 'Failed' | 'Rejected';
}

export interface ActiveInvestment {
    id: string;
    planName: string;
    amountInvested: number;
    asset: 'USDT' | 'BTC' | 'ETH';
    startDate: string;
    potentialReturn: number;
    status: 'Active' | 'Completed';
}

export interface DepositRequest {
    id: string;
    userId: number;
    userName: string;
    asset: 'BTC' | 'USDT';
    amount: number;
    proofImage: string; // base64
    status: 'Pending' | 'Approved' | 'Rejected';
    date: string;
}

export interface WithdrawalRequest {
    id:string;
    userId: number;
    userName: string;
    asset: 'BTC' | 'USDT' | 'ETH';
    amount: number;
    address: string;
    twoFactorCode: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    date: string;
}

export interface User {
    id: number;
    name: string; // Username
    fullName: string;
    dateOfBirth: string;
    email: string;
    avatarUrl: string;
    phone?: string;
    address?: string;
    country?: string;
    bio?: string;
    balances: {
        BTC: number;
        USDT: number;
        ETH: number;
    };
    badges: string[];
    transactions: Transaction[];
    activeInvestments: ActiveInvestment[];
    isAdmin?: boolean;
    password?: string;
    referralCode: string;
    loginStreak: number;
    lastLoginDate: string; // YYYY-MM-DD
    verificationStatus: 'Not Verified' | 'Pending' | 'Verified' | 'Rejected';
    verificationData?: VerificationData;
    notifications: Notification[];
    is2FAEnabled: boolean;
}

export interface CandlestickData {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface Order {
    price: number;
    amount: number;
    total: number;
}

export interface Trade {
    id?: number | string;
    time: string;
    price: number;
    amount: number;
    side: 'buy' | 'sell';
}

export interface InvestmentPlan {
    name: string;
    roi: string;
    period: string;
    minInvest: string;
    maxInvest: string;
    color: string;
    profitMultiplier: number; // e.g., 1.25 for 25% ROI
}

export interface AlternativeInvestmentPlan {
    name: string;
    category: 'Tech' | 'Green Energy' | 'Real Estate';
    description: string;
    avgReturn: string;
    riskLevel: 'Low' | 'Medium' | 'High';
    color: string;
    icon: ReactNode;
    profitMultiplier: number;
}


export interface LiveNotificationData {
    name: string;
    amount: number;
    currency: string;
}

export interface LiveChatMessage {
    sender: 'user' | 'admin';
    text: string;
    timestamp: number;
}

export interface LiveChatSession {
    userId: number;
    userName: string;
    messages: LiveChatMessage[];
    hasUnreadAdminMessage: boolean; // For user notification
    hasUnreadUserMessage: boolean; // For admin notification
}

export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    message: string;
    date: string;
    read: boolean;
}