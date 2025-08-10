
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
    refreshStateFromServer: () => Promise<void>;
    markWelcomeEmailSent: (userId: number) => void;
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
    return prevUsers.map(u => {
        if (u.id === userId) {
            return updateFn(u);
        }
        return u;
    });
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [allUsers, setAllUsers] = useState<User[]>([GERALD_USER, ADMIN_USER]);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
    const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
    const [wasJustLoggedIn, setWasJustLoggedIn] = useState(false);
    const [liveChatSessions, setLiveChatSessions] = useState<LiveChatSession[]>([]);
    const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
    const [activePage, setActivePage] = useState<Page>(Page.Dashboard);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasHydrated = useRef(false);
    const saveTimeoutRef = useRef<number | null>(null);
    
    // Explicit, debounced save function for reliability
    const saveState = useCallback(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        
        saveTimeoutRef.current = window.setTimeout(() => {
            if (!hasHydrated.current) return;
            
            console.log("Persisting state via API...");
            // Use a function form of setters to get the absolute latest state
            setAllUsers(currentUsers => {
                setWithdrawalRequests(currentWithdrawals => {
                    setDepositRequests(currentDeposits => {
                        setLiveChatSessions(currentChats => {
                            setContactMessages(currentContacts => {
                                const stateToPersist = {
                                    allUsers: currentUsers,
                                    withdrawalRequests: currentWithdrawals,
                                    depositRequests: currentDeposits,
                                    liveChatSessions: currentChats,
                                    contactMessages: currentContacts,
                                };
                                fetch('/api/save-state', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(stateToPersist),
                                }).then(response => {
                                    if (!response.ok) console.error("Failed to persist state:", response.statusText);
                                    else console.log("State persisted successfully.");
                                }).catch(err => console.error("Error persisting state:", err));
                                return currentContacts;
                            });
                            return currentChats;
                        });
                        return currentDeposits;
                    });
                    return currentWithdrawals;
                });
                return currentUsers;
            });
        }, 1500);
    }, []);

    // Initial data hydration from our secure API endpoint and local session
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const savedUserId = localStorage.getItem('bittitan_userId');
                const response = await fetch('/api/get-state');

                if (response.status === 404 || response.status === 500) {
                     console.log("Remote bin not found. Using local default state.");
                } else if (!response.ok) {
                    throw new Error(`Failed to fetch data: ${response.statusText}`);
                } else {
                    const data = await response.json();
                    if (data && data.allUsers && Array.isArray(data.allUsers)) {
                        console.log("Hydrating state from remote...");
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
    
    const refreshStateFromServer = useCallback(async () => {
        if (!hasHydrated.current) return;
        try {
            const response = await fetch('/api/get-state');
            if (response.ok) {
                const data = await response.json();
                if (data && data.allUsers) {
                    setAllUsers(data.allUsers);
                    setWithdrawalRequests(data.withdrawalRequests || []);
                    setDepositRequests(data.depositRequests || []);
                    setLiveChatSessions(data.liveChatSessions || []);
                    setContactMessages(data.contactMessages || []);
                }
            }
        } catch (err) {
            console.error("Error during state refresh:", err);
        }
    }, []);

    const currentUser = useMemo(() => {
        if (currentUserId === null) return null;
        return allUsers.find(u => u.id === currentUserId) ?? null;
    }, [allUsers, currentUserId]);

    const navigateTo = useCallback((targetPage: Page) => {
        if (activePage === targetPage) return;
        setTimeout(() => setActivePage(targetPage), activePage === Page.Trade ? 250 : 0);
    }, [activePage]);

    const login = (name: string, pass: string): { success: boolean; error?: string } => {
        const foundUser = allUsers.find(u => u.name.toLowerCase() === name.toLowerCase() && u.password === pass);
        if (foundUser) {
            setAllUsers(prevUsers => {
                const today = getTodayDateString();
                if (foundUser.lastLoginDate !== today) {
                    return updateUserInState(prevUsers, foundUser.id, user => {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        const newStreak = user.lastLoginDate === yesterday.toISOString().split('T')[0] ? user.loginStreak + 1 : 1;
                        return { ...user, lastLoginDate: today, loginStreak: newStreak };
                    });
                }
                return prevUsers;
            });
            saveState();
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
        
        if (referralCode) {
            const referringUser = allUsers.find(u => u.referralCode === referralCode);
            if (referringUser) newUser.referredBy = referringUser.id;
        }
        
        setAllUsers(prev => [...prev, newUser]);
        saveState();
        
        // Automated email sending is now decoupled. This function just saves the user.
        // A manual mailto: option will be available in the admin panel.

        return { success: true };
    };

    const createDefaultAccount = (details: { fullName: string; name: string; email: string; phone: string; dateOfBirth: string; password?: string; avatarUrl: string; address?: string; }): boolean => {
         if (allUsers.some(u => u.email.toLowerCase() === details.email.toLowerCase() || u.name.toLowerCase() === details.name.toLowerCase())) {
            return false;
        }
        const newUser = generateDefaultAccount(Date.now(), details);
        setAllUsers(prev => [...prev, newUser]);
        saveState();
        return true;
    };
    
    const addTransaction = useCallback((userId: number, transaction: Omit<Transaction, 'id' | 'date'> & { id?: string }) => {
        setAllUsers(prevUsers => updateUserInState(prevUsers, userId, user => {
            const newTransaction: Transaction = { ...transaction, id: transaction.id || `tx${Date.now()}`, date: getTodayDateString() };
            return { ...user, transactions: [newTransaction, ...user.transactions] };
        }));
        saveState();
    }, [saveState]);
    
    const updateUserBalance = useCallback((userId: number, asset: 'BTC' | 'USDT' | 'ETH', amount: number, type: Transaction['type'], description: string) => {
        setAllUsers(prevUsers => updateUserInState(prevUsers, userId, user => {
            const newBalance = user.balances[asset] + amount;
            const newTransaction: Transaction = {
                id: `tx${Date.now()}`, type, asset, amount: Math.abs(amount), description, date: getTodayDateString(), status: 'Completed',
            };
            return {
                ...user,
                balances: { ...user.balances, [asset]: newBalance < 0 ? 0 : newBalance },
                transactions: [newTransaction, ...user.transactions],
            };
        }));
        saveState();
    }, [saveState]);

    const addInvestment = useCallback((userId: number, investment: Omit<ActiveInvestment, 'id'>) => {
        setAllUsers(prevUsers => updateUserInState(prevUsers, userId, user => {
             const newInvestment: ActiveInvestment = { ...investment, id: `inv${Date.now()}` };
            return { ...user, activeInvestments: [newInvestment, ...user.activeInvestments] };
        }));
        saveState();
    }, [saveState]);
    
    const approveInvestment = useCallback((userId: number, investmentId: string) => {
        const user = allUsers.find(u => u.id === userId);
        const investmentToApprove = user?.activeInvestments.find(inv => inv.id === investmentId);
        if (!user || !investmentToApprove) return;

        updateUserBalance(userId, investmentToApprove.asset, investmentToApprove.potentialReturn, 'Profit', `Return from ${investmentToApprove.planName}`);
        updateUserBalance(ADMIN_USER.id, investmentToApprove.asset, -investmentToApprove.potentialReturn, 'Withdrawal', `Return sent for ${investmentToApprove.planName} to ${user.name}`);

        setAllUsers(prevUsers => updateUserInState(prevUsers, userId, u => ({
            ...u, activeInvestments: u.activeInvestments.map(inv => inv.id === investmentId ? { ...inv, status: 'Completed' } : inv),
        })));
        saveState();
    }, [allUsers, updateUserBalance, saveState]);

    const updateUserProfile = useCallback((userId: number, profileData: Partial<Pick<User, 'name' | 'avatarUrl' | 'phone' | 'country' | 'bio'>>) => {
        setAllUsers(prevUsers => updateUserInState(prevUsers, userId, user => ({ ...user, ...profileData })));
        saveState();
    }, [saveState]);

    const addNotification = useCallback((userId: number, message: string, title?: string, link?: Page) => {
        setAllUsers(prevUsers => updateUserInState(prevUsers, userId, user => {
            const newNotification: Notification = { id: `notif-${Date.now()}`, title, message, link, read: false, date: getISODateString() };
            return { ...user, notifications: [newNotification, ...user.notifications] };
        }));
        saveState();
    }, [saveState]);
    
    const submitWithdrawalRequest = useCallback((request: Omit<WithdrawalRequest, 'id' | 'date' | 'status'>) => {
        const newRequest: WithdrawalRequest = { ...request, id: `wd-${Date.now()}`, date: getTodayDateString(), status: 'Pending' };
        setWithdrawalRequests(prev => [newRequest, ...prev]);
        addTransaction(request.userId, { id: newRequest.id, type: 'Withdrawal', asset: request.asset, amount: request.amount, description: `Request to ${request.address}`, status: 'Pending' });
        saveState();
    }, [addTransaction, saveState]);

    const approveWithdrawal = useCallback((requestId: string) => {
        const request = withdrawalRequests.find(r => r.id === requestId);
        if (!request) return;
        setAllUsers(prevUsers => updateUserInState(prevUsers, request.userId, u => ({
            ...u,
            balances: { ...u.balances, [request.asset]: u.balances[request.asset] - request.amount },
            transactions: u.transactions.map(tx => tx.id === requestId ? { ...tx, status: 'Completed', description: `Withdrawal to ${request.address}` } : tx)
        })));
        setWithdrawalRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'Approved' } : r));
        addNotification(request.userId, `Your withdrawal of ${request.amount} ${request.asset} has been approved.`, "Withdrawal Approved");
        saveState();
    }, [withdrawalRequests, addNotification, saveState]);

    const rejectWithdrawal = useCallback((requestId: string) => {
        const request = withdrawalRequests.find(r => r.id === requestId);
        if (!request) return;
        setAllUsers(prevUsers => updateUserInState(prevUsers, request.userId, u => ({
            ...u, transactions: u.transactions.map(tx => (tx.id === requestId) ? { ...tx, status: 'Rejected' } : tx)
        })));
        setWithdrawalRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'Rejected' } : r));
        addNotification(request.userId, `Your withdrawal of ${request.amount} ${request.asset} was rejected. Please contact support.`, "Withdrawal Rejected");
        saveState();
    }, [withdrawalRequests, addNotification, saveState]);

    const sendLiveChatMessage = useCallback((userId: number, text: string) => {
        const newMessage: LiveChatMessage = { sender: 'user', text, timestamp: Date.now() };
        setLiveChatSessions(prev => {
             const user = allUsers.find(u => u.id === userId);
             if (!user) return prev;
             const existingSession = prev.find(s => s.userId === userId);
             if(existingSession) {
                 return prev.map(s => s.userId === userId ? {...s, messages: [...s.messages, newMessage], hasUnreadUserMessage: true} : s);
             }
             return [...prev, { userId, userName: user.name, messages: [{ sender: 'admin', text: `Hi ${user.name}! How can we help you today?`, timestamp: Date.now() }, newMessage], hasUnreadAdminMessage: true, hasUnreadUserMessage: true }];
        });
        saveState();
    }, [allUsers, saveState]);

    const sendAdminReply = useCallback((userId: number, text: string) => {
        const newMessage: LiveChatMessage = { sender: 'admin', text, timestamp: Date.now() };
        setLiveChatSessions(prev => prev.map(s => s.userId === userId ? { ...s, messages: [...s.messages, newMessage], hasUnreadAdminMessage: true, hasUnreadUserMessage: false } : s));
        saveState();
    }, [saveState]);

    const markUserChatAsRead = useCallback((userId: number) => {
         setLiveChatSessions(prev => prev.map(s => s.userId === userId ? { ...s, hasUnreadAdminMessage: false } : s));
         saveState();
    }, [saveState]);
    
    const markAdminChatAsRead = useCallback((userId: number) => {
         setLiveChatSessions(prev => prev.map(s => s.userId === userId ? { ...s, hasUnreadUserMessage: false } : s));
         saveState();
    }, [saveState]);
    
    const submitContactMessage = useCallback((name: string, email: string, message: string) => {
        const newMessage: ContactMessage = { id: `cm-${Date.now()}`, name, email, message, date: getISODateString(), read: false };
        setContactMessages(prev => [newMessage, ...prev]);
        saveState();
    }, [saveState]);

    const markContactMessageAsRead = useCallback((id: string) => {
        setContactMessages(prev => prev.map(msg => msg.id === id ? { ...msg, read: true } : msg));
        saveState();
    }, [saveState]);

    const sendAdminMessage = useCallback((userId: number, message: string) => {
        addNotification(userId, message);
    }, [addNotification]);
    
    const submitVerification = useCallback((userId: number, data: VerificationData) => {
        setAllUsers(prevUsers => updateUserInState(prevUsers, userId, user => ({
            ...user, verificationStatus: 'Pending', verificationData: data,
        })));
        addNotification(userId, 'Your verification documents have been submitted and are now pending review.', 'Verification Pending', Page.Account);
        saveState();
    }, [addNotification, saveState]);

    const approveVerification = useCallback((userId: number) => {
        setAllUsers(prevUsers => updateUserInState(prevUsers, userId, user => ({
            ...user, verificationStatus: 'Verified', verificationData: undefined,
        })));
        addNotification(userId, 'Congratulations! Your account has been verified.', 'Verification Approved');
        saveState();
    }, [addNotification, saveState]);
    
    const rejectVerification = useCallback((userId: number, reason: string) => {
        setAllUsers(prevUsers => updateUserInState(prevUsers, userId, user => ({
            ...user, verificationStatus: 'Rejected', verificationData: undefined,
        })));
        addNotification(userId, `Your verification was rejected. Reason: ${reason}.`, 'Verification Rejected', Page.Verification);
        saveState();
    }, [addNotification, saveState]);
    
    const markNotificationAsRead = useCallback((userId: number, notificationId: string) => {
        setAllUsers(prevUsers => updateUserInState(prevUsers, userId, user => ({
            ...user, notifications: user.notifications.map(n => n.id === notificationId ? { ...n, read: true } : n)
        })));
        saveState();
    }, [saveState]);
    
    const deleteNotification = useCallback((userId: number, notificationId: string) => {
        setAllUsers(prevUsers => updateUserInState(prevUsers, userId, user => ({
            ...user, notifications: user.notifications.filter(n => n.id !== notificationId)
        })));
        saveState();
    }, [saveState]);

    const changePassword = useCallback((userId: number, currentPass: string, newPass: string): { success: boolean, message: string } => {
        let result = { success: false, message: "Current password is not correct." };
        setAllUsers(prevUsers => {
            const user = prevUsers.find(u => u.id === userId);
            if (!user || user.password !== currentPass) return prevUsers;
            result = { success: true, message: "Password changed successfully." };
            return updateUserInState(prevUsers, userId, u => ({ ...u, password: newPass }));
        });
        if (result.success) saveState();
        return result;
    }, [saveState]);
    
    const toggle2FA = useCallback((userId: number, code?: string): { success: boolean, message: string } => {
        let result = { success: false, message: "User not found." };
        setAllUsers(prevUsers => {
            const user = prevUsers.find(u => u.id === userId);
            if (!user) return prevUsers;
            const isEnabling = !user.is2FAEnabled;
            if (isEnabling && (!code || !/^\d{6}$/.test(code))) {
                result = { success: false, message: "Invalid 6-digit code." };
                return prevUsers;
            }
            result = { success: true, message: `2FA ${isEnabling ? 'enabled' : 'disabled'} successfully.` };
            return updateUserInState(prevUsers, userId, u => ({ ...u, is2FAEnabled: isEnabling }));
        });
        if (result.success) saveState();
        return result;
    }, [saveState]);

    const deleteAccount = useCallback((userId: number) => {
        setAllUsers(prev => prev.filter(u => u.id !== userId));
        if (currentUserId === userId) logout();
        saveState();
    }, [currentUserId, logout, saveState]);

    const adminDeleteUser = useCallback((userId: number) => {
        setAllUsers(prev => prev.filter(u => u.id !== userId));
        saveState();
    }, [saveState]);

    const submitDepositRequest = useCallback((request: Omit<DepositRequest, 'id' | 'date' | 'status' | 'userName'>) => {
        const user = allUsers.find(u => u.id === request.userId);
        if (!user) return;
        const newRequest: DepositRequest = { ...request, id: `dep-${Date.now()}`, date: getTodayDateString(), status: 'Pending', userName: user.name };
        setDepositRequests(prev => [newRequest, ...prev]);
        addTransaction(request.userId, { id: newRequest.id, type: 'Deposit', asset: request.asset, amount: request.amount, description: 'Crypto deposit review', status: 'Pending' });
        addNotification(request.userId, `Your deposit of ${request.amount} ${request.asset} is pending review.`, "Deposit Request Submitted");
        saveState();
    }, [allUsers, addTransaction, addNotification, saveState]);

    const approveDeposit = useCallback((requestId: string) => {
        const request = depositRequests.find(r => r.id === requestId);
        if (!request) return;
        setAllUsers(prevUsers => updateUserInState(prevUsers, request.userId, u => ({
            ...u,
            balances: { ...u.balances, [request.asset]: u.balances[request.asset] + request.amount },
            transactions: u.transactions.map(tx => (tx.id === requestId) ? { ...tx, status: 'Completed', type: 'Deposit', description: 'Approved crypto deposit' } : tx)
        })));
        setDepositRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'Approved' } : r));
        addNotification(request.userId, `Your deposit of ${request.amount} ${request.asset} has been approved.`, "Deposit Approved");
        saveState();
    }, [depositRequests, addNotification, saveState]);
    
    const rejectDeposit = useCallback((requestId: string, reason: string) => {
        const request = depositRequests.find(r => r.id === requestId);
        if (!request) return;
        setDepositRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'Rejected' } : r));
        setAllUsers(prevUsers => updateUserInState(prevUsers, request.userId, u => ({
            ...u, transactions: u.transactions.map(tx => (tx.id === requestId) ? { ...tx, status: 'Rejected' } : tx)
        })));
        addNotification(request.userId, `Your deposit was rejected. Reason: ${reason}`, "Deposit Rejected");
        saveState();
    }, [depositRequests, addNotification, saveState]);
    
    const markWelcomeEmailSent = useCallback((userId: number) => {
        setAllUsers(prevUsers => updateUserInState(prevUsers, userId, user => ({
            ...user, welcomeEmailSent: true
        })));
        saveState();
    }, [saveState]);

    const value = useMemo(() => ({
        user: currentUser, users: allUsers, withdrawalRequests, depositRequests, isLoading, login, logout, signup, createDefaultAccount, updateUserBalance,
        addTransaction, addInvestment, approveInvestment, updateUserProfile, submitWithdrawalRequest, approveWithdrawal, rejectWithdrawal, submitDepositRequest, approveDeposit,
        rejectDeposit, adminDeleteUser, checkAndResetLoginFlag, liveChatSessions, sendLiveChatMessage, sendAdminReply, markUserChatAsRead, markAdminChatAsRead,
        contactMessages, submitContactMessage, markContactMessageAsRead, submitVerification, approveVerification, rejectVerification, sendAdminMessage,
        markNotificationAsRead, deleteNotification, changePassword, toggle2FA, deleteAccount, activePage, navigateTo, refreshStateFromServer, markWelcomeEmailSent,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [
        currentUser, allUsers, withdrawalRequests, depositRequests, liveChatSessions, contactMessages, isLoading,
        checkAndResetLoginFlag, logout, signup, createDefaultAccount, addTransaction, updateUserBalance, addInvestment, approveInvestment, 
        updateUserProfile, submitWithdrawalRequest, approveWithdrawal, rejectWithdrawal, submitDepositRequest, approveDeposit, rejectDeposit, adminDeleteUser, sendLiveChatMessage, 
        sendAdminReply, markUserChatAsRead, markAdminChatAsRead, submitContactMessage, markContactMessageAsRead,
        submitVerification, approveVerification, rejectVerification, sendAdminMessage, markNotificationAsRead,
        deleteNotification, changePassword, toggle2FA, deleteAccount, activePage, navigateTo, refreshStateFromServer, markWelcomeEmailSent
    ]);


    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
