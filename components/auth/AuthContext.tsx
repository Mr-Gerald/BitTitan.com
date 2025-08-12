

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
    
    // Refs for state management to prevent race conditions and stale closures
    const hasHydrated = useRef(false);
    const stateRef = useRef({ allUsers, withdrawalRequests, depositRequests, liveChatSessions, contactMessages });

    // Robust save queue implementation
    const isPersistingRef = useRef(false);
    const stateQueueRef = useRef<any>(null);

    // Keep the state ref up-to-date with any changes.
    useEffect(() => {
        stateRef.current = { allUsers, withdrawalRequests, depositRequests, liveChatSessions, contactMessages };
    }, [allUsers, withdrawalRequests, depositRequests, liveChatSessions, contactMessages]);

    const persistState = useCallback(async (stateToPersist?: any) => {
        if (stateToPersist) {
            stateQueueRef.current = stateToPersist;
        }
        
        if (isPersistingRef.current || !stateQueueRef.current || !hasHydrated.current) return;

        isPersistingRef.current = true;
        const state = stateQueueRef.current;
        stateQueueRef.current = null; 

        console.log(`Persisting state via API...`);
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
            // If a new state came in while we were saving, trigger another save.
            if (stateQueueRef.current) {
                persistState();
            }
        }
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
            const today = getTodayDateString();
            if (foundUser.lastLoginDate !== today) {
                setAllUsers(prevUsers => {
                    const updatedUsers = updateUserInState(prevUsers, foundUser.id, user => {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        const newStreak = user.lastLoginDate === yesterday.toISOString().split('T')[0] ? user.loginStreak + 1 : 1;
                        return { ...user, lastLoginDate: today, loginStreak: newStreak };
                    });
                     persistState({ ...stateRef.current, allUsers: updatedUsers });
                     return updatedUsers;
                });
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
        
        if (referralCode) {
            const referringUser = allUsers.find(u => u.referralCode === referralCode);
            if (referringUser) newUser.referredBy = referringUser.id;
        }
        
        const newAllUsers = [...allUsers, newUser];
        setAllUsers(newAllUsers);
        persistState({ ...stateRef.current, allUsers: newAllUsers });
        
        return { success: true };
    };

    const createDefaultAccount = (details: { fullName: string; name: string; email: string; phone: string; dateOfBirth: string; password?: string; avatarUrl: string; address?: string; }): boolean => {
         if (allUsers.some(u => u.email.toLowerCase() === details.email.toLowerCase() || u.name.toLowerCase() === details.name.toLowerCase())) {
            return false;
        }
        const newUser = generateDefaultAccount(Date.now(), details);
        const newAllUsers = [...allUsers, newUser];
        setAllUsers(newAllUsers);
        persistState({ ...stateRef.current, allUsers: newAllUsers });
        return true;
    };
    
    const addTransaction = useCallback((userId: number, transaction: Omit<Transaction, 'id' | 'date'> & { id?: string }) => {
        setAllUsers(prevUsers => {
            const newAllUsers = updateUserInState(prevUsers, userId, user => {
                const newTransaction: Transaction = { ...transaction, id: transaction.id || `tx${Date.now()}`, date: getTodayDateString() };
                return { ...user, transactions: [newTransaction, ...user.transactions] };
            });
            persistState({ ...stateRef.current, allUsers: newAllUsers });
            return newAllUsers;
        });
    }, [persistState]);
    
    const updateUserBalance = useCallback((userId: number, asset: 'BTC' | 'USDT' | 'ETH', amount: number, type: Transaction['type'], description: string) => {
        setAllUsers(prevUsers => {
            const newAllUsers = updateUserInState(prevUsers, userId, user => {
                const newBalance = user.balances[asset] + amount;
                const newTransaction: Transaction = {
                    id: `tx${Date.now()}`, type, asset, amount: Math.abs(amount), description, date: getTodayDateString(), status: 'Completed',
                };
                return {
                    ...user,
                    balances: { ...user.balances, [asset]: newBalance < 0 ? 0 : newBalance },
                    transactions: [newTransaction, ...user.transactions],
                };
            });
            persistState({ ...stateRef.current, allUsers: newAllUsers });
            return newAllUsers;
        });
    }, [persistState]);

    const addInvestment = useCallback((userId: number, investment: Omit<ActiveInvestment, 'id'>) => {
        setAllUsers(prevUsers => {
            const newAllUsers = updateUserInState(prevUsers, userId, user => {
                const newInvestment: ActiveInvestment = { ...investment, id: `inv${Date.now()}` };
                return { ...user, activeInvestments: [newInvestment, ...user.activeInvestments] };
            });
            persistState({ ...stateRef.current, allUsers: newAllUsers });
            return newAllUsers;
        });
    }, [persistState]);
    
    const addNotification = useCallback((userId: number, message: string, title?: string, link?: Page) => {
        setAllUsers(prevUsers => {
            const newNotification: Notification = { id: `notif-${Date.now()}`, title, message, link, read: false, date: getISODateString() };
            const newAllUsers = updateUserInState(prevUsers, userId, user => ({ ...user, notifications: [newNotification, ...user.notifications] }));
            persistState({ ...stateRef.current, allUsers: newAllUsers });
            return newAllUsers;
        });
    }, [persistState]);

    const approveInvestment = useCallback((userId: number, investmentId: string) => {
        const user = allUsers.find(u => u.id === userId);
        const investmentToApprove = user?.activeInvestments.find(inv => inv.id === investmentId);
        if (!user || !investmentToApprove) return;

        updateUserBalance(userId, investmentToApprove.asset, investmentToApprove.potentialReturn, 'Profit', `Return from ${investmentToApprove.planName}`);
        updateUserBalance(ADMIN_USER.id, investmentToApprove.asset, -investmentToApprove.potentialReturn, 'Withdrawal', `Return sent for ${investmentToApprove.planName} to ${user.name}`);

        const profitAmount = investmentToApprove.potentialReturn - investmentToApprove.amountInvested;
        addNotification(userId, `Your profit of ${profitAmount.toFixed(4)} ${investmentToApprove.asset} from the ${investmentToApprove.planName} plan has been credited to your wallet.`, "Profit Credited", Page.Wallet);

        setAllUsers(prevUsers => {
            const newAllUsers = updateUserInState(prevUsers, userId, u => ({
                ...u, activeInvestments: u.activeInvestments.map(inv => inv.id === investmentId ? { ...inv, status: 'Completed' } : inv),
            }));
            persistState({ ...stateRef.current, allUsers: newAllUsers });
            return newAllUsers;
        });
    }, [allUsers, updateUserBalance, addNotification, persistState]);

    const updateUserProfile = useCallback((userId: number, profileData: Partial<Pick<User, 'name' | 'avatarUrl' | 'phone' | 'country' | 'bio'>>) => {
        setAllUsers(prevUsers => {
            const newAllUsers = updateUserInState(prevUsers, userId, user => ({ ...user, ...profileData }));
            persistState({ ...stateRef.current, allUsers: newAllUsers });
            return newAllUsers;
        });
    }, [persistState]);
    
    const submitWithdrawalRequest = useCallback((request: Omit<WithdrawalRequest, 'id' | 'date' | 'status'>) => {
        const newRequest: WithdrawalRequest = { ...request, id: `wd-${Date.now()}`, date: getTodayDateString(), status: 'Pending' };
        
        setAllUsers(prevUsers => {
            const newUsers = updateUserInState(prevUsers, request.userId, user => {
                const newTransaction: Transaction = { id: newRequest.id, type: 'Withdrawal', asset: request.asset, amount: request.amount, description: `Request to ${request.address}`, date: getTodayDateString(), status: 'Pending' };
                return { ...user, transactions: [newTransaction, ...user.transactions] };
            });
            setWithdrawalRequests(prevReqs => {
                const newReqs = [newRequest, ...prevReqs];
                persistState({ ...stateRef.current, allUsers: newUsers, withdrawalRequests: newReqs });
                return newReqs;
            });
            return newUsers;
        });
    }, [persistState]);

    const approveWithdrawal = useCallback((requestId: string) => {
        const request = withdrawalRequests.find(r => r.id === requestId);
        if (!request) return;
        
        setAllUsers(prevUsers => {
            const newAllUsers = updateUserInState(prevUsers, request.userId, u => ({
                ...u,
                balances: { ...u.balances, [request.asset]: u.balances[request.asset] - request.amount },
                transactions: u.transactions.map(tx => tx.id === requestId ? { ...tx, status: 'Completed', description: `Withdrawal to ${request.address}` } : tx)
            }));
            setWithdrawalRequests(prevReqs => {
                const newWithdrawalRequests = prevReqs.map((r): WithdrawalRequest => r.id === requestId ? { ...r, status: 'Approved' } : r);
                persistState({ ...stateRef.current, allUsers: newAllUsers, withdrawalRequests: newWithdrawalRequests });
                return newWithdrawalRequests;
            });
            addNotification(request.userId, `Your withdrawal of ${request.amount} ${request.asset} has been approved.`, "Withdrawal Approved");
            return newAllUsers;
        });
    }, [withdrawalRequests, addNotification, persistState]);

    const rejectWithdrawal = useCallback((requestId: string) => {
        const request = withdrawalRequests.find(r => r.id === requestId);
        if (!request) return;
        
        setAllUsers(prevUsers => {
            const newAllUsers = updateUserInState(prevUsers, request.userId, u => ({
                ...u, transactions: u.transactions.map(tx => (tx.id === requestId) ? { ...tx, status: 'Rejected' } : tx)
            }));
            setWithdrawalRequests(prevReqs => {
                const newWithdrawalRequests = prevReqs.map((r): WithdrawalRequest => r.id === requestId ? { ...r, status: 'Rejected' } : r);
                persistState({ ...stateRef.current, allUsers: newAllUsers, withdrawalRequests: newWithdrawalRequests });
                return newWithdrawalRequests;
            });
            addNotification(request.userId, `Your withdrawal of ${request.amount} ${request.asset} was rejected. Please contact support.`, "Withdrawal Rejected");
            return newAllUsers;
        });
    }, [withdrawalRequests, addNotification, persistState]);

    const sendLiveChatMessage = useCallback((userId: number, text: string) => {
        const newMessage: LiveChatMessage = { sender: 'user', text, timestamp: Date.now() };
        const user = allUsers.find(u => u.id === userId);
        if (!user) return;
        
        setLiveChatSessions(prevSessions => {
            const existingSession = prevSessions.find(s => s.userId === userId);
            let newSessions: LiveChatSession[];
            if(existingSession) {
                newSessions = prevSessions.map(s => s.userId === userId ? {...s, messages: [...s.messages, newMessage], hasUnreadUserMessage: true, hasUnreadAdminMessage: false } : s);
            } else {
                const newSession: LiveChatSession = { 
                    userId, 
                    userName: user.name, 
                    messages: [{ sender: 'admin', text: `Hi ${user.name}! How can we help you today?`, timestamp: Date.now() }, newMessage], 
                    hasUnreadAdminMessage: false, 
                    hasUnreadUserMessage: true 
                };
                newSessions = [...prevSessions, newSession];
            }
            persistState({ ...stateRef.current, liveChatSessions: newSessions });
            return newSessions;
        });
    }, [allUsers, persistState]);

    const sendAdminReply = useCallback((userId: number, text: string) => {
        const newMessage: LiveChatMessage = { sender: 'admin', text, timestamp: Date.now() };
        setLiveChatSessions(prevSessions => {
            const newSessions = prevSessions.map(s => s.userId === userId ? { ...s, messages: [...s.messages, newMessage], hasUnreadAdminMessage: true, hasUnreadUserMessage: false } : s);
            persistState({ ...stateRef.current, liveChatSessions: newSessions });
            return newSessions;
        });
    }, [persistState]);

    const markUserChatAsRead = useCallback((userId: number) => {
        setLiveChatSessions(prevSessions => {
            const newSessions = prevSessions.map(s => s.userId === userId ? { ...s, hasUnreadAdminMessage: false } : s);
            persistState({ ...stateRef.current, liveChatSessions: newSessions });
            return newSessions;
        });
    }, [persistState]);
    
    const markAdminChatAsRead = useCallback((userId: number) => {
        setLiveChatSessions(prevSessions => {
            const newSessions = prevSessions.map(s => s.userId === userId ? { ...s, hasUnreadUserMessage: false } : s);
            persistState({ ...stateRef.current, liveChatSessions: newSessions });
            return newSessions;
        });
    }, [persistState]);
    
    const setUserTyping = useCallback((userId: number, isTyping: boolean) => {
        setLiveChatSessions(prevSessions => {
            const newSessions = prevSessions.map(s => (s.userId === userId ? { ...s, isUserTyping: isTyping } : s));
            // Do not persist typing indicators to avoid excessive saves
            return newSessions;
        });
    }, []);
    
    const setAdminTyping = useCallback((userId: number, isTyping: boolean) => {
        setLiveChatSessions(prevSessions => {
            const newSessions = prevSessions.map(s => (s.userId === userId ? { ...s, isAdminTyping: isTyping } : s));
            // Do not persist typing indicators
            return newSessions;
        });
    }, []);

    const submitContactMessage = useCallback((name: string, email: string, message: string) => {
        const newMessage: ContactMessage = { id: `cm-${Date.now()}`, name, email, message, date: getISODateString(), read: false };
        setContactMessages(prevMessages => {
            const newContactMessages = [newMessage, ...prevMessages];
            persistState({ ...stateRef.current, contactMessages: newContactMessages });
            return newContactMessages;
        });
    }, [persistState]);

    const markContactMessageAsRead = useCallback((id: string) => {
        setContactMessages(prevMessages => {
            const newContactMessages = prevMessages.map(msg => msg.id === id ? { ...msg, read: true } : msg);
            persistState({ ...stateRef.current, contactMessages: newContactMessages });
            return newContactMessages;
        });
    }, [persistState]);

    const sendAdminMessage = useCallback((userId: number, message: string) => {
        addNotification(userId, message);
    }, [addNotification]);
    
    const submitVerification = useCallback((userId: number, data: VerificationData) => {
        setAllUsers(prevUsers => {
            const newNotification: Notification = {
                id: `notif-${Date.now()}`,
                title: 'Verification Pending',
                message: 'Your verification documents have been submitted and are now pending review.',
                link: Page.Account, read: false, date: getISODateString()
            };
            const newAllUsers = updateUserInState(prevUsers, userId, (user): User => ({
                ...user,
                verificationStatus: 'Pending',
                verificationData: data,
                notifications: [newNotification, ...user.notifications]
            }));
            persistState({ ...stateRef.current, allUsers: newAllUsers });
            return newAllUsers;
        });
    }, [persistState]);

    const approveVerification = useCallback((userId: number) => {
        setAllUsers(prevUsers => {
            const newAllUsers = updateUserInState(prevUsers, userId, (user): User => ({
                ...user, verificationStatus: 'Verified', verificationData: undefined,
            }));
            addNotification(userId, 'Congratulations! Your account has been verified.', 'Verification Approved');
            persistState({ ...stateRef.current, allUsers: newAllUsers });
            return newAllUsers;
        });
    }, [addNotification, persistState]);
    
    const rejectVerification = useCallback((userId: number, reason: string) => {
        setAllUsers(prevUsers => {
            const newAllUsers = updateUserInState(prevUsers, userId, (user): User => ({
                ...user, verificationStatus: 'Rejected', verificationData: undefined,
            }));
            addNotification(userId, `Your verification was rejected. Reason: ${reason}.`, 'Verification Rejected', Page.Verification);
            persistState({ ...stateRef.current, allUsers: newAllUsers });
            return newAllUsers;
        });
    }, [addNotification, persistState]);
    
    const markNotificationAsRead = useCallback((userId: number, notificationId: string) => {
        setAllUsers(prevUsers => {
            const newAllUsers = updateUserInState(prevUsers, userId, user => ({
                ...user, notifications: user.notifications.map(n => n.id === notificationId ? { ...n, read: true } : n)
            }));
            persistState({ ...stateRef.current, allUsers: newAllUsers });
            return newAllUsers;
        });
    }, [persistState]);
    
    const deleteNotification = useCallback((userId: number, notificationId: string) => {
        setAllUsers(prevUsers => {
            const newAllUsers = updateUserInState(prevUsers, userId, user => ({
                ...user, notifications: user.notifications.filter(n => n.id !== notificationId)
            }));
            persistState({ ...stateRef.current, allUsers: newAllUsers });
            return newAllUsers;
        });
    }, [persistState]);

    const changePassword = useCallback((userId: number, currentPass: string, newPass: string): { success: boolean, message: string } => {
        let result = { success: false, message: "Current password is not correct." };
        const user = allUsers.find(u => u.id === userId);
        if (user && user.password === currentPass) {
             setAllUsers(prevUsers => {
                const finalUsers = updateUserInState(prevUsers, userId, u => ({ ...u, password: newPass }));
                persistState({ ...stateRef.current, allUsers: finalUsers });
                return finalUsers;
             });
             result = { success: true, message: "Password changed successfully." };
        }
        return result;
    }, [allUsers, persistState]);
    
    const toggle2FA = useCallback((userId: number, code?: string): { success: boolean, message: string } => {
        let result = { success: false, message: "User not found." };
        const user = allUsers.find(u => u.id === userId);
        if (user) {
            const isEnabling = !user.is2FAEnabled;
            if (isEnabling && (!code || !/^\d{6}$/.test(code))) {
                result = { success: false, message: "Invalid 6-digit code." };
            } else {
                 setAllUsers(prevUsers => {
                    const finalUsers = updateUserInState(prevUsers, userId, u => ({ ...u, is2FAEnabled: isEnabling }));
                    persistState({ ...stateRef.current, allUsers: finalUsers });
                    return finalUsers;
                 });
                 result = { success: true, message: `2FA ${isEnabling ? 'enabled' : 'disabled'} successfully.` };
            }
        }
        return result;
    }, [allUsers, persistState]);

    const deleteAccount = useCallback((userId: number) => {
        setAllUsers(prevUsers => {
            const newAllUsers = prevUsers.filter(u => u.id !== userId);
            persistState({ ...stateRef.current, allUsers: newAllUsers });
            return newAllUsers;
        });
        if (currentUserId === userId) logout();
    }, [currentUserId, logout, persistState]);

    const adminDeleteUser = useCallback((userId: number) => {
        setAllUsers(prevUsers => {
            const newAllUsers = prevUsers.filter(u => u.id !== userId);
            persistState({ ...stateRef.current, allUsers: newAllUsers });
            return newAllUsers;
        });
    }, [persistState]);

    const submitDepositRequest = useCallback((request: Omit<DepositRequest, 'id' | 'date' | 'status' | 'userName'>) => {
        const user = stateRef.current.allUsers.find(u => u.id === request.userId);
        if (!user) return;

        const newRequest: DepositRequest = {
            ...request, id: `dep-${Date.now()}`, date: getTodayDateString(), status: 'Pending', userName: user.name
        };
        const newTransaction: Transaction = {
            id: newRequest.id, type: 'Deposit', asset: request.asset, amount: request.amount,
            description: 'Crypto deposit review', status: 'Pending', date: getTodayDateString()
        };
        const newNotification: Notification = {
            id: `notif-${Date.now()}`, title: "Deposit Request Submitted",
            message: `Your deposit of ${request.amount} ${request.asset} is pending review.`,
            read: false, date: getISODateString()
        };

        setAllUsers(prevUsers => {
            const newUsers = updateUserInState(prevUsers, request.userId, u => ({
                ...u,
                transactions: [newTransaction, ...u.transactions],
                notifications: [newNotification, ...u.notifications]
            }));
            setDepositRequests(prevRequests => {
                const newRequests = [newRequest, ...prevRequests];
                persistState({ ...stateRef.current, allUsers: newUsers, depositRequests: newRequests });
                return newRequests;
            });
            return newUsers;
        });
    }, [persistState]);

    const approveDeposit = useCallback((requestId: string) => {
        const request = depositRequests.find(r => r.id === requestId);
        if (!request) return;

        setAllUsers(prevUsers => {
            const newAllUsers = updateUserInState(prevUsers, request.userId, u => ({
                ...u,
                balances: { ...u.balances, [request.asset]: u.balances[request.asset] + request.amount },
                transactions: u.transactions.map(tx => (tx.id === requestId) ? { ...tx, status: 'Completed', type: 'Deposit', description: 'Approved crypto deposit' } : tx)
            }));
            setDepositRequests(prevReqs => {
                const newDepositRequests = prevReqs.map((r): DepositRequest => r.id === requestId ? { ...r, status: 'Approved' } : r);
                addNotification(request.userId, `Your deposit of ${request.amount} ${request.asset} has been approved.`, "Deposit Approved");
                persistState({ ...stateRef.current, allUsers: newAllUsers, depositRequests: newDepositRequests });
                return newDepositRequests;
            });
            return newAllUsers;
        });
    }, [depositRequests, addNotification, persistState]);
    
    const rejectDeposit = useCallback((requestId: string, reason: string) => {
        const request = depositRequests.find(r => r.id === requestId);
        if (!request) return;

        setAllUsers(prevUsers => {
            const newAllUsers = updateUserInState(prevUsers, request.userId, u => ({
                ...u, transactions: u.transactions.map(tx => (tx.id === requestId) ? { ...tx, status: 'Rejected' } : tx)
            }));
            setDepositRequests(prevReqs => {
                const newDepositRequests = prevReqs.map((r): DepositRequest => r.id === requestId ? { ...r, status: 'Rejected' } : r);
                addNotification(request.userId, `Your deposit was rejected. Reason: ${reason}`, "Deposit Rejected");
                persistState({ ...stateRef.current, allUsers: newAllUsers, depositRequests: newDepositRequests });
                return newDepositRequests;
            });
            return newAllUsers;
        });
    }, [depositRequests, addNotification, persistState]);
    
    const markWelcomeEmailSent = useCallback((userId: number) => {
        setAllUsers(prevUsers => {
            const newAllUsers = updateUserInState(prevUsers, userId, user => ({
                ...user, welcomeEmailSent: true
            }));
            persistState({ ...stateRef.current, allUsers: newAllUsers });
            return newAllUsers;
        });
    }, [persistState]);

    const value = useMemo(() => ({
        user: currentUser, users: allUsers, withdrawalRequests, depositRequests, isLoading, login, logout, signup, createDefaultAccount, updateUserBalance,
        addTransaction, addInvestment, approveInvestment, updateUserProfile, submitWithdrawalRequest, approveWithdrawal, rejectWithdrawal, submitDepositRequest, approveDeposit,
        rejectDeposit, adminDeleteUser, checkAndResetLoginFlag, liveChatSessions, sendLiveChatMessage, sendAdminReply, markUserChatAsRead, markAdminChatAsRead,
        setUserTyping, setAdminTyping,
        contactMessages, submitContactMessage, markContactMessageAsRead, submitVerification, approveVerification, rejectVerification, sendAdminMessage,
        markNotificationAsRead, deleteNotification, changePassword, toggle2FA, deleteAccount, activePage, navigateTo, markWelcomeEmailSent,
        addNotification,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [
        currentUser, allUsers, withdrawalRequests, depositRequests, liveChatSessions, contactMessages, isLoading,
        checkAndResetLoginFlag, logout, signup, createDefaultAccount, addTransaction, updateUserBalance, addInvestment, approveInvestment, 
        updateUserProfile, submitWithdrawalRequest, approveWithdrawal, rejectWithdrawal, submitDepositRequest, approveDeposit, rejectDeposit, adminDeleteUser, sendLiveChatMessage, 
        sendAdminReply, markUserChatAsRead, markAdminChatAsRead, setUserTyping, setAdminTyping, submitContactMessage, markContactMessageAsRead,
        submitVerification, approveVerification, rejectVerification, sendAdminMessage, markNotificationAsRead,
        deleteNotification, changePassword, toggle2FA, deleteAccount, activePage, navigateTo, markWelcomeEmailSent, addNotification
    ]);


    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};