

import React, { createContext, useState, ReactNode, useCallback, useMemo, useEffect, useRef } from 'react';
import { User, Transaction, ActiveInvestment, WithdrawalRequest, LiveChatSession, LiveChatMessage, ContactMessage, VerificationData, Notification, Page, DepositRequest } from '../../types';
import { GERALD_USER, ADMIN_USER, generateNewUser, generateDefaultAccount } from '../../constants';

interface AuthContextType {
    user: User | null;
    users: User[];
    withdrawalRequests: WithdrawalRequest[];
    depositRequests: DepositRequest[];
    isLoading: boolean;
    login: (name: string, pass: string) => { success: boolean; error?: string };
    logout: () => void;
    signup: (fullName: string, name: string, email: string, pass: string, country: string, dateOfBirth: string, phone: string, referralCode?: string | null) => Promise<{ success: boolean; error?: string }>;
    createDefaultAccount: (details: { fullName: string; name: string; email: string; phone: string; dateOfBirth: string; password?: string; avatarUrl: string; address?: string; }) => boolean;
    updateUserBalance: (userId: number, asset: 'BTC' | 'USDT' | 'ETH', amount: number, type: Transaction['type'], description: string) => void;
    addTransaction: (userId: number, transaction: Omit<Transaction, 'id' | 'date'> & { id?: string }) => void;
    addInvestment: (userId: number, investment: Omit<ActiveInvestment, 'id'>) => void;
    approveInvestment: (userId: number, investmentId: string) => void;
    updateUserProfile: (userId: number, profileData: Partial<Pick<User, 'name' | 'avatarUrl' | 'phone' | 'country' | 'bio'>>) => void;
    submitWithdrawalRequest: (request: Omit<WithdrawalRequest, 'id' | 'date' | 'status'>) => void;
    approveWithdrawal: (requestId: string) => void;
    rejectWithdrawal: (requestId: string) => void;
    submitDepositRequest: (request: Omit<DepositRequest, 'id' | 'date' | 'status' | 'userName'>) => void;
    approveDeposit: (requestId: string) => void;
    rejectDeposit: (requestId: string, reason: string) => void;
    adminDeleteUser: (userId: number) => void;
    checkAndResetLoginFlag: () => boolean;
    liveChatSessions: LiveChatSession[];
    sendLiveChatMessage: (userId: number, text: string) => void;
    sendAdminReply: (userId: number, text: string) => void;
    markUserChatAsRead: (userId: number) => void;
    markAdminChatAsRead: (userId: number) => void;
    setUserTyping: (userId: number, isTyping: boolean) => void;
    setAdminTyping: (userId: number, isTyping: boolean) => void;
    contactMessages: ContactMessage[];
    submitContactMessage: (name: string, email: string, message: string) => void;
    markContactMessageAsRead: (id: string) => void;
    submitVerification: (userId: number, data: VerificationData) => void;
    approveVerification: (userId: number) => void;
    rejectVerification: (userId: number, reason: string) => void;
    sendAdminMessage: (userId: number, message: string) => void;
    markNotificationAsRead: (userId: number, notificationId: string) => void;
    deleteNotification: (userId: number, notificationId: string) => void;
    changePassword: (userId: number, currentPass: string, newPass: string) => { success: boolean, message: string };
    toggle2FA: (userId: number, code?: string) => { success: boolean, message: string };
    deleteAccount: (userId: number) => void;
    activePage: Page;
    navigateTo: (page: Page) => void;
    markWelcomeEmailSent: (userId: number) => void;
    addNotification: (userId: number, message: string, title?: string, link?: Page) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];
const getISODateString = () => new Date().toISOString();

const updateUserInState = (
    prevUsers: User[],
    userId: number,
    updateFn: (user: User) => User
): User[] => {
    return prevUsers.map(u => (u.id === userId ? updateFn(u) : u));
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [allUsers, setAllUsers] = useState<User[]>([GERALD_USER, ADMIN_USER]);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
    const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
    const [liveChatSessions, setLiveChatSessions] = useState<LiveChatSession[]>([]);
    const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
    
    const [wasJustLoggedIn, setWasJustLoggedIn] = useState(false);
    const [activePage, setActivePage] = useState<Page>(Page.Dashboard);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const hasHydrated = useRef(false);
    const isPersistingRef = useRef(false);
    const stateQueueRef = useRef<any>(null);

    const persistState = useCallback(async (stateToPersist?: any) => {
        if (stateToPersist) {
            stateQueueRef.current = stateToPersist;
        }
        
        if (isPersistingRef.current || !stateQueueRef.current || !hasHydrated.current) {
            return;
        }

        isPersistingRef.current = true;
        const state = stateQueueRef.current;
        stateQueueRef.current = null; 

        console.log(`Persisting state via API (debounced)...`);
        try {
            const response = await fetch('/api/save-state', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(state),
            });

            if (!response.ok) {
                 console.error("Failed to persist state:", response.status, await response.text());
            } else {
                 console.log("State persisted successfully.");
            }
        } catch (err) {
            console.error("Error persisting state:", err);
        } finally {
            isPersistingRef.current = false;
            if (stateQueueRef.current) {
                persistState();
            }
        }
    }, []);

    // **NEW**: Centralized effect to persist state changes.
    useEffect(() => {
        if (!hasHydrated.current || isLoading) {
            return;
        }
        const currentState = { allUsers, withdrawalRequests, depositRequests, liveChatSessions, contactMessages };
        persistState(currentState);
    }, [allUsers, withdrawalRequests, depositRequests, liveChatSessions, contactMessages, persistState, isLoading]);


    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const savedUserId = localStorage.getItem('bittitan_userId');
                const response = await fetch('/api/get-state');

                if (response.status !== 404 && !response.ok) {
                    throw new Error(`Failed to fetch data: ${response.statusText}`);
                }
                
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.allUsers && Array.isArray(data.allUsers)) {
                        setAllUsers(data.allUsers);
                        setWithdrawalRequests(data.withdrawalRequests || []);
                        setDepositRequests(data.depositRequests || []);
                        setLiveChatSessions(data.liveChatSessions || []);
                        setContactMessages(data.contactMessages || []);
                        if (savedUserId && data.allUsers.some((u: User) => u.id === parseInt(savedUserId, 10))) {
                            setCurrentUserId(parseInt(savedUserId, 10));
                        }
                    }
                }
            } catch (err: any) {
                console.error("Error hydrating state:", err);
                setError("Could not load saved data.");
            } finally {
                setIsLoading(false);
                hasHydrated.current = true;
            }
        };
        fetchData();
    }, []);
    
    const currentUser = useMemo(() => allUsers.find(u => u.id === currentUserId) ?? null, [allUsers, currentUserId]);

    const navigateTo = useCallback((targetPage: Page) => {
        if (activePage === targetPage) return;
        setTimeout(() => setActivePage(targetPage), activePage === Page.Trade ? 250 : 0);
    }, [activePage]);

    const login = (name: string, pass: string): { success: boolean; error?: string } => {
        const foundUser = allUsers.find(u => u.name.toLowerCase() === name.toLowerCase() && u.password === pass);
        if (foundUser) {
            const today = getTodayDateString();
            if (foundUser.lastLoginDate !== today) {
                setAllUsers(prevUsers => 
                    updateUserInState(prevUsers, foundUser.id, user => {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        const newStreak = user.lastLoginDate === yesterday.toISOString().split('T')[0] ? user.loginStreak + 1 : 1;
                        return { ...user, lastLoginDate: today, loginStreak: newStreak };
                    })
                );
            }
            setCurrentUserId(foundUser.id);
            localStorage.setItem('bittitan_userId', foundUser.id.toString());
            setActivePage(Page.Dashboard);
            setWasJustLoggedIn(true);
            return { success: true };
        }
        return { success: false, error: "invalid_credentials" };
    };

    const checkAndResetLoginFlag = useCallback(() => {
        if (wasJustLoggedIn) {
            setWasJustLoggedIn(false);
            return true;
        }
        return false;
    }, [wasJustLoggedIn]);
    
    const logout = useCallback(() => {
        setCurrentUserId(null);
        localStorage.removeItem('bittitan_userId');
    }, []);

    const signup = async (fullName: string, name: string, email: string, pass: string, country: string, dateOfBirth: string, phone: string, referralCode?: string | null): Promise<{ success: boolean; error?: string }> => {
        if (allUsers.some(u => u.email.toLowerCase() === email.toLowerCase() || u.name.toLowerCase() === name.toLowerCase())) {
            return { success: false, error: 'Account with this email or username already exists.' };
        }
        
        let newUser = generateNewUser(Date.now(), fullName, name, email, country, dateOfBirth, phone, pass);
        const referringUser = referralCode ? allUsers.find(u => u.referralCode === referralCode) : null;
        if (referringUser) newUser.referredBy = referringUser.id;
        
        setAllUsers(prev => [...prev, newUser]);
        
        return { success: true };
    };

    const createDefaultAccount = (details: any): boolean => {
         if (allUsers.some(u => u.email.toLowerCase() === details.email.toLowerCase() || u.name.toLowerCase() === details.name.toLowerCase())) {
            return false;
        }
        const newUser = generateDefaultAccount(Date.now(), details);
        setAllUsers(prev => [...prev, newUser]);
        return true;
    };
    
    const addTransaction = useCallback((userId: number, transaction: Omit<Transaction, 'id' | 'date'> & { id?: string }) => {
        setAllUsers(prevUsers => 
            updateUserInState(prevUsers, userId, user => {
                const newTransaction: Transaction = { ...transaction, id: transaction.id || `tx${Date.now()}`, date: getTodayDateString(), status: 'Completed' };
                return { ...user, transactions: [newTransaction, ...user.transactions] };
            })
        );
    }, []);
    
    const updateUserBalance = useCallback((userId: number, asset: 'BTC' | 'USDT' | 'ETH', amount: number, type: Transaction['type'], description: string) => {
        setAllUsers(prevUsers => 
            updateUserInState(prevUsers, userId, user => {
                const newBalance = (user.balances[asset] || 0) + amount;
                const newTransaction: Transaction = {
                    id: `tx${Date.now()}`, type, asset, amount: Math.abs(amount), description, date: getTodayDateString(), status: 'Completed',
                };
                return {
                    ...user,
                    balances: { ...user.balances, [asset]: Math.max(0, newBalance) },
                    transactions: [newTransaction, ...user.transactions],
                };
            })
        );
    }, []);

    const addInvestment = useCallback((userId: number, investment: Omit<ActiveInvestment, 'id'>) => {
        setAllUsers(prevUsers => 
            updateUserInState(prevUsers, userId, user => {
                const newInvestment: ActiveInvestment = { ...investment, id: `inv${Date.now()}` };
                return { ...user, activeInvestments: [newInvestment, ...user.activeInvestments] };
            })
        );
    }, []);
    
    const addNotification = useCallback((userId: number, message: string, title?: string, link?: Page) => {
        setAllUsers(prevUsers => {
            const newNotification: Notification = { id: `notif-${Date.now()}`, title, message, link, read: false, date: getISODateString() };
            return updateUserInState(prevUsers, userId, user => ({ ...user, notifications: [newNotification, ...user.notifications] }));
        });
    }, []);

    const approveInvestment = useCallback((userId: number, investmentId: string) => {
        const user = allUsers.find(u => u.id === userId);
        const investment = user?.activeInvestments.find(inv => inv.id === investmentId);
        if (!user || !investment) return;

        setAllUsers(prevUsers => {
            let allUpdatedUsers = prevUsers;
            
            allUpdatedUsers = updateUserInState(allUpdatedUsers, userId, u => {
                const newBalance = u.balances[investment.asset] + investment.potentialReturn;
                const profitTx: Transaction = { id: `tx-profit-${investment.id}`, type: 'Profit', asset: investment.asset, amount: investment.potentialReturn, description: `Return from ${investment.planName}`, date: getTodayDateString(), status: 'Completed' };
                const notification: Notification = { id: `notif-profit-${investment.id}`, title: 'Profit Credited', message: `Your profit of ${(investment.potentialReturn - investment.amountInvested).toFixed(4)} ${investment.asset} from the ${investment.planName} plan has been credited.`, date: getISODateString(), read: false, link: Page.Wallet };
                return {
                    ...u,
                    balances: { ...u.balances, [investment.asset]: newBalance },
                    transactions: [profitTx, ...u.transactions],
                    activeInvestments: u.activeInvestments.map(inv => inv.id === investmentId ? { ...inv, status: 'Completed' } : inv),
                    notifications: [notification, ...u.notifications]
                };
            });

            allUpdatedUsers = updateUserInState(allUpdatedUsers, ADMIN_USER.id, admin => {
                const newBalance = admin.balances[investment.asset] - investment.potentialReturn;
                const adminTx: Transaction = { id: `tx-admret-${investment.id}`, type: 'Withdrawal', asset: investment.asset, amount: investment.potentialReturn, description: `Return sent for ${investment.planName} to ${user.name}`, date: getTodayDateString(), status: 'Completed' };
                return { ...admin, balances: { ...admin.balances, [investment.asset]: newBalance }, transactions: [adminTx, ...admin.transactions] };
            });

            return allUpdatedUsers;
        });
    }, [allUsers]);

    const updateUserProfile = useCallback((userId: number, profileData: Partial<any>) => {
        setAllUsers(prev => updateUserInState(prev, userId, user => ({ ...user, ...profileData })));
    }, []);
    
    const submitWithdrawalRequest = useCallback((request: Omit<WithdrawalRequest, 'id' | 'date' | 'status'>) => {
        const user = allUsers.find(u => u.id === request.userId);
        if (!user) return;
        const newRequest: WithdrawalRequest = { ...request, id: `wd-${Date.now()}`, date: getTodayDateString(), status: 'Pending' };
        
        setWithdrawalRequests(prevReqs => [newRequest, ...prevReqs]);
        setAllUsers(prevUsers => 
            updateUserInState(prevUsers, request.userId, u => {
                const newTransaction: Transaction = { id: newRequest.id, type: 'Withdrawal', asset: request.asset, amount: request.amount, description: `Request to ${request.address}`, date: newRequest.date, status: 'Pending' };
                return { ...u, transactions: [newTransaction, ...u.transactions] };
            })
        );
    }, [allUsers]);

    const approveWithdrawal = useCallback((requestId: string) => {
        const request = withdrawalRequests.find(r => r.id === requestId);
        if (!request) return;

        setAllUsers(prevUsers => 
            updateUserInState(prevUsers, request.userId, u => ({
                ...u,
                balances: { ...u.balances, [request.asset]: u.balances[request.asset] - request.amount },
                transactions: u.transactions.map(tx => tx.id === requestId ? { ...tx, status: 'Completed', description: `Withdrawal to ${request.address}` } : tx)
            }))
        );
        addNotification(request.userId, `Your withdrawal of ${request.amount} ${request.asset} has been approved.`, "Withdrawal Approved", Page.Wallet);
        setWithdrawalRequests(prevReqs => prevReqs.filter(r => r.id !== requestId));
    }, [withdrawalRequests, addNotification]);

    const rejectWithdrawal = useCallback((requestId: string) => {
        const request = withdrawalRequests.find(r => r.id === requestId);
        if (!request) return;

        setAllUsers(prevUsers => 
            updateUserInState(prevUsers, request.userId, u => ({
                ...u, transactions: u.transactions.map(tx => (tx.id === requestId) ? { ...tx, status: 'Rejected' } : tx)
            }))
        );
        addNotification(request.userId, `Your withdrawal of ${request.amount} ${request.asset} was rejected. Please contact support.`, "Withdrawal Rejected", Page.Wallet);
        setWithdrawalRequests(prevReqs => prevReqs.filter(r => r.id !== requestId));
    }, [withdrawalRequests, addNotification]);

    const submitDepositRequest = useCallback((request: Omit<DepositRequest, 'id' | 'date' | 'status' | 'userName'>) => {
        const user = allUsers.find(u => u.id === request.userId);
        if (!user) return;

        const newRequest: DepositRequest = { ...request, id: `dep-${Date.now()}`, date: getTodayDateString(), status: 'Pending', userName: user.name };
        
        setDepositRequests(prev => [newRequest, ...prev]);
        setAllUsers(prevUsers => 
            updateUserInState(prevUsers, request.userId, u => {
                const newTransaction: Transaction = { id: newRequest.id, type: 'Deposit', asset: request.asset, amount: request.amount, description: 'Crypto deposit review', status: 'Pending', date: getTodayDateString() };
                const newNotification: Notification = { id: `notif-${Date.now()}`, title: "Deposit Request Submitted", message: `Your deposit of ${request.amount.toFixed(8)} ${request.asset} is pending review.`, read: false, date: getISODateString() };
                return { ...u, transactions: [newTransaction, ...u.transactions], notifications: [newNotification, ...u.notifications] };
            })
        );
    }, [allUsers]);

    const approveDeposit = useCallback((requestId: string) => {
        const request = depositRequests.find(r => r.id === requestId);
        if (!request) return;

        setAllUsers(prevUsers => 
            updateUserInState(prevUsers, request.userId, u => ({
                ...u,
                balances: { ...u.balances, [request.asset]: u.balances[request.asset] + request.amount },
                transactions: u.transactions.map(tx => (tx.id === requestId) ? { ...tx, status: 'Completed', type: 'Deposit', description: 'Approved crypto deposit' } : tx)
            }))
        );
        addNotification(request.userId, `Your deposit of ${request.amount.toFixed(8)} ${request.asset} has been approved.`, "Deposit Approved", Page.Wallet);
        setDepositRequests(prevReqs => prevReqs.filter(r => r.id !== requestId));
    }, [depositRequests, addNotification]);

    const rejectDeposit = useCallback((requestId: string, reason: string) => {
        const request = depositRequests.find(r => r.id === requestId);
        if (!request) return;

        setAllUsers(prevUsers => 
            updateUserInState(prevUsers, request.userId, u => ({
                ...u, transactions: u.transactions.map(tx => (tx.id === requestId) ? { ...tx, status: 'Rejected' } : tx)
            }))
        );
        addNotification(request.userId, `Your deposit was rejected. Reason: ${reason}`, "Deposit Rejected", Page.Wallet);
        setDepositRequests(prevReqs => prevReqs.filter(r => r.id !== requestId));
    }, [depositRequests, addNotification]);
    
    const sendLiveChatMessage = useCallback((userId: number, text: string) => {
        const user = allUsers.find(u => u.id === userId);
        if (!user) return;
        
        setLiveChatSessions(prev => {
            const existingSession = prev.find(s => s.userId === userId);
            const newMessage: LiveChatMessage = { sender: 'user', text, timestamp: Date.now() };

            if(existingSession) {
                return prev.map(s => s.userId === userId ? {...s, messages: [...s.messages, newMessage], hasUnreadUserMessage: true, hasUnreadAdminMessage: false } : s);
            } else {
                const newSession: LiveChatSession = { userId, userName: user.name, messages: [{ sender: 'admin', text: `Hi ${user.name}! How can we help you today?`, timestamp: Date.now() }, newMessage], hasUnreadAdminMessage: false, hasUnreadUserMessage: true };
                return [...prev, newSession];
            }
        });
    }, [allUsers]);

    const sendAdminReply = useCallback((userId: number, text: string) => {
        setLiveChatSessions(prev => {
            const newMessage: LiveChatMessage = { sender: 'admin', text, timestamp: Date.now() };
            return prev.map(s => s.userId === userId ? { ...s, messages: [...s.messages, newMessage], hasUnreadAdminMessage: true, hasUnreadUserMessage: false } : s);
        });
    }, []);

    const markUserChatAsRead = useCallback((userId: number) => {
        setLiveChatSessions(prev => prev.map(s => s.userId === userId ? { ...s, hasUnreadAdminMessage: false } : s));
    }, []);
    
    const markAdminChatAsRead = useCallback((userId: number) => {
        setLiveChatSessions(prev => prev.map(s => s.userId === userId ? { ...s, hasUnreadUserMessage: false } : s));
    }, []);
    
    const setUserTyping = useCallback((userId: number, isTyping: boolean) => setLiveChatSessions(prev => prev.map(s => (s.userId === userId ? { ...s, isUserTyping: isTyping } : s))), []);
    const setAdminTyping = useCallback((userId: number, isTyping: boolean) => setLiveChatSessions(prev => prev.map(s => (s.userId === userId ? { ...s, isAdminTyping: isTyping } : s))), []);

    const submitContactMessage = useCallback((name: string, email: string, message: string) => {
        setContactMessages(prev => [
            { id: `cm-${Date.now()}`, name, email, message, date: getISODateString(), read: false }, 
            ...prev
        ]);
    }, []);

    const markContactMessageAsRead = useCallback((id: string) => {
        setContactMessages(prev => prev.map(msg => msg.id === id ? { ...msg, read: true } : msg));
    }, []);

    const sendAdminMessage = useCallback((userId: number, message: string) => addNotification(userId, message), [addNotification]);
    
    const submitVerification = useCallback((userId: number, data: VerificationData) => {
        setAllUsers(prev => 
            updateUserInState(prev, userId, user => {
                const newNotification: Notification = { id: `notif-${Date.now()}`, message: 'Your verification documents have been submitted and are now pending review.', title: 'Verification Pending', read: false, date: getISODateString(), link: Page.Account };
                return { 
                    ...user, 
                    verificationStatus: 'Pending', 
                    verificationData: data,
                    notifications: [newNotification, ...user.notifications]
                };
            })
        );
    }, []);

    const approveVerification = useCallback((userId: number) => {
        setAllUsers(prev => updateUserInState(prev, userId, user => ({ ...user, verificationStatus: 'Verified', verificationData: undefined })));
        addNotification(userId, 'Congratulations! Your account has been verified.', 'Verification Approved');
    }, [addNotification]);
    
    const rejectVerification = useCallback((userId: number, reason: string) => {
        setAllUsers(prev => updateUserInState(prev, userId, user => ({ ...user, verificationStatus: 'Rejected', verificationData: undefined })));
        addNotification(userId, `Your verification was rejected. Reason: ${reason}.`, 'Verification Rejected', Page.Verification);
    }, [addNotification]);
    
    const markNotificationAsRead = useCallback((userId: number, notificationId: string) => {
        setAllUsers(prev => updateUserInState(prev, userId, user => ({ ...user, notifications: user.notifications.map(n => n.id === notificationId ? { ...n, read: true } : n) })));
    }, []);
    
    const deleteNotification = useCallback((userId: number, notificationId: string) => {
        setAllUsers(prev => updateUserInState(prev, userId, user => ({ ...user, notifications: user.notifications.filter(n => n.id !== notificationId) })));
    }, []);

    const changePassword = useCallback((userId: number, currentPass: string, newPass: string): { success: boolean, message: string } => {
        const user = allUsers.find(u => u.id === userId);
        if (!user || user.password !== currentPass) return { success: false, message: "Current password is not correct." };
        
        setAllUsers(prev => updateUserInState(prev, userId, u => ({ ...u, password: newPass })));
        return { success: true, message: "Password changed successfully." };
    }, [allUsers]);
    
    const toggle2FA = useCallback((userId: number, code?: string): { success: boolean, message: string } => {
        const user = allUsers.find(u => u.id === userId);
        if (!user) return { success: false, message: "User not found." };
        
        const isEnabling = !user.is2FAEnabled;
        if (isEnabling && (!code || !/^\d{6}$/.test(code))) return { success: false, message: "Invalid 6-digit code." };
        
        setAllUsers(prev => updateUserInState(prev, userId, u => ({ ...u, is2FAEnabled: isEnabling })));
        return { success: true, message: `2FA ${isEnabling ? 'enabled' : 'disabled'} successfully.` };
    }, [allUsers]);

    const deleteAccount = useCallback((userId: number) => {
        setAllUsers(prev => prev.filter(u => u.id !== userId));
        if (currentUserId === userId) logout();
    }, [currentUserId, logout]);

    const adminDeleteUser = useCallback((userId: number) => {
        setAllUsers(prev => prev.filter(u => u.id !== userId));
    }, []);
    
    const markWelcomeEmailSent = useCallback((userId: number) => {
        setAllUsers(prev => updateUserInState(prev, userId, user => ({ ...user, welcomeEmailSent: true })));
    }, []);

    const value: AuthContextType = useMemo(() => ({
        user: currentUser, users: allUsers, withdrawalRequests, depositRequests, isLoading, login, logout, signup, createDefaultAccount, updateUserBalance,
        addTransaction, addInvestment, approveInvestment, updateUserProfile, submitWithdrawalRequest, approveWithdrawal, rejectWithdrawal, submitDepositRequest, approveDeposit,
        rejectDeposit, adminDeleteUser, checkAndResetLoginFlag, liveChatSessions, sendLiveChatMessage, sendAdminReply, markUserChatAsRead, markAdminChatAsRead,
        setUserTyping, setAdminTyping, contactMessages, submitContactMessage, markContactMessageAsRead, submitVerification, approveVerification, rejectVerification, sendAdminMessage,
        markNotificationAsRead, deleteNotification, changePassword, toggle2FA, deleteAccount, activePage, navigateTo, markWelcomeEmailSent, addNotification
    }), [
        currentUser, allUsers, withdrawalRequests, depositRequests, liveChatSessions, contactMessages, isLoading, activePage,
        login, logout, signup, createDefaultAccount, updateUserBalance, addTransaction, addInvestment, approveInvestment, 
        updateUserProfile, submitWithdrawalRequest, approveWithdrawal, rejectWithdrawal, submitDepositRequest, approveDeposit, 
        rejectDeposit, adminDeleteUser, checkAndResetLoginFlag, sendLiveChatMessage, sendAdminReply, markUserChatAsRead, 
        markAdminChatAsRead, setUserTyping, setAdminTyping, submitContactMessage, markContactMessageAsRead, submitVerification, 
        approveVerification, rejectVerification, sendAdminMessage, markNotificationAsRead, deleteNotification, changePassword, 
        toggle2FA, deleteAccount, navigateTo, markWelcomeEmailSent, addNotification
    ]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};