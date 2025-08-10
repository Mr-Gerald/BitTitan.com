
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
    signup: (fullName: string, name: string, email: string, pass: string, country: string, dateOfBirth: string, phone: string) => Promise<{ success: boolean; error?: string }>;
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

    // Initial data hydration from our secure API endpoint
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/get-state');

                if (response.status === 404 || response.status === 500) { // Handle "bin not found" or config errors
                     console.log("Remote bin not found or server misconfigured. Using local default state.");
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
                    } else {
                        console.log("Bin is empty or has incorrect format. It will be overwritten on the first state change.");
                    }
                }
            } catch (err: any) {
                console.error("Error hydrating state:", err);
                setError("Could not load saved data. Using default session.");
            } finally {
                setIsLoading(false);
                hasHydrated.current = true;
            }
        };

        fetchData();
    }, []);

    // Debounced effect to persist state changes to our secure API endpoint
    useEffect(() => {
        if (!hasHydrated.current || isLoading) {
            return;
        }
        
        const handler = setTimeout(() => {
            console.log("Persisting state via API...");
            const stateToPersist = {
                allUsers,
                withdrawalRequests,
                depositRequests,
                liveChatSessions,
                contactMessages,
            };

            fetch('/api/save-state', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(stateToPersist),
            }).then(response => {
                if (!response.ok) {
                    console.error("Failed to persist state:", response.statusText);
                } else {
                    console.log("State persisted successfully.");
                }
            }).catch(err => {
                console.error("Error persisting state:", err);
            });

        }, 1500);

        return () => {
            clearTimeout(handler);
        };
    }, [allUsers, withdrawalRequests, depositRequests, liveChatSessions, contactMessages, isLoading]);

    const currentUser = useMemo(() => {
        if (currentUserId === null) return null;
        return allUsers.find(u => u.id === currentUserId) ?? null;
    }, [allUsers, currentUserId]);

    const navigateTo = useCallback((targetPage: Page) => {
        if (activePage === targetPage) return;

        if (activePage === Page.Trade) {
            setTimeout(() => {
                setActivePage(targetPage);
            }, 250);
        } else {
            setActivePage(targetPage);
        }
    }, [activePage]);

    const login = (name: string, pass: string): { success: boolean; error?: string } => {
        const foundUser = allUsers.find(u => u.name.toLowerCase() === name.toLowerCase() && u.password === pass);
        if (foundUser) {
            // Login is now allowed immediately after signup.
            const today = getTodayDateString();
            
            if (foundUser.lastLoginDate !== today) {
                setAllUsers(prevUsers => updateUserInState(prevUsers, foundUser.id, user => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split('T')[0];
                    const newStreak = user.lastLoginDate === yesterdayStr ? user.loginStreak + 1 : 1;
                    return { ...user, lastLoginDate: today, loginStreak: newStreak };
                }));
            }
            
            setCurrentUserId(foundUser.id);
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
    }, []);

    const signup = async (fullName: string, name: string, email: string, pass: string, country: string, dateOfBirth: string, phone: string): Promise<{ success: boolean; error?: string }> => {
        if (allUsers.some(u => u.email.toLowerCase() === email.toLowerCase() || u.name.toLowerCase() === name.toLowerCase())) {
            return { success: false, error: 'Account with this email or username already exists.' };
        }
        
        const newUser = generateNewUser(allUsers.length + 1, fullName, name, email, country, dateOfBirth, phone, pass);
        setAllUsers(prev => [...prev, newUser]);
        
        // Fire-and-forget the welcome email API call
        fetch('/api/send-welcome-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: newUser.email, fullName: newUser.fullName }),
        }).then(response => {
             if (response.ok) {
                 console.log(`Welcome email sent to ${newUser.email}`);
                 // Mark that the welcome email has been sent
                 setAllUsers(prevUsers => updateUserInState(prevUsers, newUser.id, u => ({
                    ...u,
                    welcomeEmailSent: true,
                })));
             } else {
                 console.error(`Failed to send welcome email to ${newUser.email}`);
             }
        }).catch(err => {
            console.error('Error calling send-welcome-email API:', err);
        });

        return { success: true };
    };

    const createDefaultAccount = (details: { fullName: string; name: string; email: string; phone: string; dateOfBirth: string; password?: string; avatarUrl: string; address?: string; }): boolean => {
         if (allUsers.some(u => u.email.toLowerCase() === details.email.toLowerCase() || u.name.toLowerCase() === details.name.toLowerCase())) {
            return false;
        }
        const newUser = generateDefaultAccount(allUsers.length + 1, details);
        setAllUsers(prev => [...prev, newUser]);
        return true;
    };
    
    const addTransaction = useCallback((userId: number, transaction: Omit<Transaction, 'id' | 'date'> & { id?: string }) => {
        setAllUsers(prevUsers => updateUserInState(prevUsers, userId, user => {
            const { id, ...rest } = transaction;
            const newTransaction: Transaction = {
                ...rest,
                id: id || `tx${Date.now()}`,
                date: getTodayDateString(),
            };
            return { ...user, transactions: [newTransaction, ...user.transactions] };
        }));
    }, []);
    
    const updateUserBalance = useCallback((userId: number, asset: 'BTC' | 'USDT' | 'ETH', amount: number, type: Transaction['type'], description: string) => {
        setAllUsers(prevUsers => updateUserInState(prevUsers, userId, user => {
            const newBalance = user.balances[asset] + amount;
            const newTransaction: Transaction = {
                id: `tx${Date.now()}`,
                type,
                asset,
                amount: Math.abs(amount),
                description,
                date: getTodayDateString(),
                status: 'Completed',
            };
            return {
                ...user,
                balances: { ...user.balances, [asset]: newBalance < 0 ? 0 : newBalance },
                transactions: [newTransaction, ...user.transactions],
            };
        }));
    }, []);

    const addInvestment = useCallback((userId: number, investment: Omit<ActiveInvestment, 'id'>) => {
        setAllUsers(prevUsers => updateUserInState(prevUsers, userId, user => {
             const newInvestment: ActiveInvestment = { ...investment, id: `inv${Date.now()}` };
            return { ...user, activeInvestments: [newInvestment, ...user.activeInvestments] };
        }));
    }, []);
    
    const approveInvestment = useCallback((userId: number, investmentId: string) => {
        const user = allUsers.find(u => u.id === userId);
        const investmentToApprove = user?.activeInvestments.find(inv => inv.id === investmentId);
        if (!user || !investmentToApprove) return;

        updateUserBalance(userId, investmentToApprove.asset, investmentToApprove.potentialReturn, 'Profit', `Return from ${investmentToApprove.planName}`);
        updateUserBalance(ADMIN_USER.id, investmentToApprove.asset, -investmentToApprove.potentialReturn, 'Withdrawal', `Return sent for ${investmentToApprove.planName} to ${user.name}`);

        setAllUsers(prevUsers => updateUserInState(prevUsers, userId, u => ({
            ...u,
            activeInvestments: u.activeInvestments.map(inv => inv.id === investmentId ? { ...inv, status: 'Completed' } : inv),
        })));
    }, [allUsers, updateUserBalance]);

    const updateUserProfile = useCallback((userId: number, profileData: Partial<Pick<User, 'name' | 'avatarUrl' | 'phone' | 'country' | 'bio'>>) => {
        setAllUsers(prevUsers => updateUserInState(prevUsers, userId, user => ({ ...user, ...profileData })));
    }, []);

    const addNotification = useCallback((userId: number, message: string, title?: string, link?: Page) => {
        setAllUsers(prevUsers => updateUserInState(prevUsers, userId, user => {
            const newNotification: Notification = { id: `notif-${Date.now()}`, title, message, link, read: false, date: getISODateString() };
            return { ...user, notifications: [newNotification, ...user.notifications] };
        }));
    }, []);
    
    const submitWithdrawalRequest = useCallback((request: Omit<WithdrawalRequest, 'id' | 'date' | 'status'>) => {
        const newRequest: WithdrawalRequest = { ...request, id: `wd-${Date.now()}`, date: getTodayDateString(), status: 'Pending' };
        setWithdrawalRequests(prev => [newRequest, ...prev]);
        addTransaction(request.userId, { id: newRequest.id, type: 'Withdrawal', asset: request.asset, amount: request.amount, description: `Request to ${request.address}`, status: 'Pending' });
    }, [addTransaction]);

    const approveWithdrawal = useCallback((requestId: string) => {
        const request = withdrawalRequests.find(r => r.id === requestId);
        if (!request) return;

        setAllUsers(prevUsers => updateUserInState(prevUsers, request.userId, u => {
            const newBalance = u.balances[request.asset] - request.amount;
            return {
                ...u,
                balances: { ...u.balances, [request.asset]: newBalance < 0 ? 0 : newBalance },
                transactions: u.transactions.map(tx =>
                    (tx.id === requestId)
                        ? { ...tx, status: 'Completed', description: `Withdrawal to ${request.address}` }
                        : tx
                )
            };
        }));

        setWithdrawalRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'Approved' } : r));
        addNotification(request.userId, `Your withdrawal of ${request.amount} ${request.asset} has been approved.`, "Withdrawal Approved");
    }, [withdrawalRequests, addNotification]);


    const rejectWithdrawal = useCallback((requestId: string) => {
        const request = withdrawalRequests.find(r => r.id === requestId);
        if (!request) return;
        
        setAllUsers(prevUsers => updateUserInState(prevUsers, request.userId, u => ({
            ...u,
            transactions: u.transactions.map(tx => (tx.id === requestId) ? { ...tx, status: 'Rejected' } : tx)
        })));
        setWithdrawalRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'Rejected' } : r));
        addNotification(request.userId, `Your withdrawal of ${request.amount} ${request.asset} was rejected. Please contact support.`, "Withdrawal Rejected");
    }, [withdrawalRequests, addNotification]);

    const sendLiveChatMessage = useCallback((userId: number, text: string) => {
        const newMessage: LiveChatMessage = { sender: 'user', text, timestamp: Date.now() };
        setLiveChatSessions(prevSessions => {
             const existingSession = prevSessions.find(s => s.userId === userId);
             if(existingSession) {
                 return prevSessions.map(s => s.userId === userId ? {...s, messages: [...s.messages, newMessage], hasUnreadUserMessage: true} : s);
             }
             const user = allUsers.find(u => u.id === userId);
             if (!user) return prevSessions;
             const newSession: LiveChatSession = {
                userId, userName: user.name, messages: [{ sender: 'admin', text: `Hi ${user.name}! How can we help you today?`, timestamp: Date.now() }, newMessage],
                hasUnreadAdminMessage: true, hasUnreadUserMessage: true,
             }
             return [...prevSessions, newSession];
        });
    }, [allUsers]);

    const sendAdminReply = useCallback((userId: number, text: string) => {
        const newMessage: LiveChatMessage = { sender: 'admin', text, timestamp: Date.now() };
        setLiveChatSessions(prev => prev.map(s => s.userId === userId ? { ...s, messages: [...s.messages, newMessage], hasUnreadAdminMessage: true, hasUnreadUserMessage: false } : s));
    }, []);

    const markUserChatAsRead = useCallback((userId: number) => {
         setLiveChatSessions(prev => prev.map(s => s.userId === userId ? { ...s, hasUnreadAdminMessage: false } : s));
    }, []);
    
    const markAdminChatAsRead = useCallback((userId: number) => {
         setLiveChatSessions(prev => prev.map(s => s.userId === userId ? { ...s, hasUnreadUserMessage: false } : s));
    }, []);
    
    const submitContactMessage = useCallback((name: string, email: string, message: string) => {
        const newMessage: ContactMessage = { id: `cm-${Date.now()}`, name, email, message, date: getISODateString(), read: false };
        setContactMessages(prev => [newMessage, ...prev]);
    }, []);

    const markContactMessageAsRead = useCallback((id: string) => {
        setContactMessages(prev => prev.map(msg => msg.id === id ? { ...msg, read: true } : msg));
    }, []);

    const sendAdminMessage = useCallback((userId: number, message: string) => {
        addNotification(userId, message);
    }, [addNotification]);
    
    const submitVerification = useCallback((userId: number, data: VerificationData) => {
        setAllUsers(prevUsers => updateUserInState(prevUsers, userId, user => ({
            ...user,
            verificationStatus: 'Pending',
            verificationData: data,
        })));
        addNotification(userId, 'Your verification documents have been submitted and are now pending review.', 'Verification Pending', Page.Account);
    }, [addNotification]);

    const approveVerification = useCallback((userId: number) => {
        setAllUsers(prevUsers => updateUserInState(prevUsers, userId, user => ({
            ...user,
            verificationStatus: 'Verified',
            verificationData: undefined,
        })));
        addNotification(userId, 'Congratulations! Your account has been verified.', 'Verification Approved');
    }, [addNotification]);
    
    const rejectVerification = useCallback((userId: number, reason: string) => {
        setAllUsers(prevUsers => updateUserInState(prevUsers, userId, user => ({
            ...user,
            verificationStatus: 'Rejected',
            verificationData: undefined,
        })));
        addNotification(userId, `Your verification was rejected. Reason: ${reason}.`, 'Verification Rejected', Page.Verification);
    }, [addNotification]);
    
    const markNotificationAsRead = useCallback((userId: number, notificationId: string) => {
        setAllUsers(prevUsers => updateUserInState(prevUsers, userId, user => ({
            ...user,
            notifications: user.notifications.map(n => n.id === notificationId ? { ...n, read: true } : n)
        })));
    }, []);
    
    const deleteNotification = useCallback((userId: number, notificationId: string) => {
        setAllUsers(prevUsers => updateUserInState(prevUsers, userId, user => ({
            ...user,
            notifications: user.notifications.filter(n => n.id !== notificationId)
        })));
    }, []);

    const changePassword = useCallback((userId: number, currentPass: string, newPass: string): { success: boolean, message: string } => {
        let success = false;
        let message = "Current password is not correct.";
        setAllUsers(prevUsers => {
            const user = prevUsers.find(u => u.id === userId);
            if (!user || user.password !== currentPass) {
                return prevUsers;
            }
            success = true;
            message = "Password changed successfully.";
            return updateUserInState(prevUsers, userId, u => ({ ...u, password: newPass }));
        });
        return { success, message };
    }, []);
    
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
        return result;
    }, []);

    const deleteAccount = useCallback((userId: number) => {
        setAllUsers(prev => prev.filter(u => u.id !== userId));
        setCurrentUserId(null);
    }, []);

    const submitDepositRequest = useCallback((request: Omit<DepositRequest, 'id' | 'date' | 'status' | 'userName'>) => {
        const user = allUsers.find(u => u.id === request.userId);
        if (!user) return;
        
        const newRequest: DepositRequest = {
            ...request,
            id: `dep-${Date.now()}-${request.amount}`,
            date: getTodayDateString(),
            status: 'Pending',
            userName: user.name,
        };
        setDepositRequests(prev => [newRequest, ...prev]);
        
        addTransaction(request.userId, {
            id: newRequest.id,
            type: 'Deposit',
            asset: request.asset,
            amount: request.amount,
            description: 'Crypto deposit review',
            status: 'Pending',
        });

        addNotification(request.userId, `Your deposit of ${request.amount} ${request.asset} is pending review.`, "Deposit Request Submitted");
    }, [allUsers, addTransaction, addNotification]);

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
    }, [depositRequests, addNotification]);
    
    const rejectDeposit = useCallback((requestId: string, reason: string) => {
        const request = depositRequests.find(r => r.id === requestId);
        if (!request) return;

        setDepositRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'Rejected' } : r));
        setAllUsers(prevUsers => updateUserInState(prevUsers, request.userId, u => ({
            ...u,
            transactions: u.transactions.map(tx => (tx.id === requestId) ? { ...tx, status: 'Rejected' } : tx)
        })));
        addNotification(request.userId, `Your deposit was rejected. Reason: ${reason}`, "Deposit Rejected");
    }, [depositRequests, addNotification]);

    const value = useMemo(() => ({
        user: currentUser,
        users: allUsers,
        withdrawalRequests,
        depositRequests,
        isLoading,
        login,
        logout,
        signup,
        createDefaultAccount,
        updateUserBalance,
        addTransaction,
        addInvestment,
        approveInvestment,
        updateUserProfile,
        submitWithdrawalRequest,
        approveWithdrawal,
        rejectWithdrawal,
        submitDepositRequest,
        approveDeposit,
        rejectDeposit,
        checkAndResetLoginFlag,
        liveChatSessions,
        sendLiveChatMessage,
        sendAdminReply,
        markUserChatAsRead,
        markAdminChatAsRead,
        contactMessages,
        submitContactMessage,
        markContactMessageAsRead,
        submitVerification,
        approveVerification,
        rejectVerification,
        sendAdminMessage,
        markNotificationAsRead,
        deleteNotification,
        changePassword,
        toggle2FA,
        deleteAccount,
        activePage,
        navigateTo,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [
        currentUser, allUsers, withdrawalRequests, depositRequests, liveChatSessions, contactMessages, isLoading,
        checkAndResetLoginFlag, logout, signup, createDefaultAccount, addTransaction, updateUserBalance, addInvestment, approveInvestment, 
        updateUserProfile, submitWithdrawalRequest, approveWithdrawal, rejectWithdrawal, submitDepositRequest, approveDeposit, rejectDeposit, sendLiveChatMessage, 
        sendAdminReply, markUserChatAsRead, markAdminChatAsRead, submitContactMessage, markContactMessageAsRead,
        submitVerification, approveVerification, rejectVerification, sendAdminMessage, markNotificationAsRead,
        deleteNotification, changePassword, toggle2FA, deleteAccount, activePage, navigateTo
    ]);


    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};