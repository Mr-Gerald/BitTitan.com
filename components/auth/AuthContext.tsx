

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
    refreshStateFromServer: () => Promise<void>;
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
    const isSavingRef = useRef(false); // The new, robust lock
    const stateRef = useRef({ allUsers, withdrawalRequests, depositRequests, liveChatSessions, contactMessages });
    const debouncedSaveRef = useRef<number | null>(null);

    // Keep the state ref up-to-date with any changes.
    useEffect(() => {
        stateRef.current = { allUsers, withdrawalRequests, depositRequests, liveChatSessions, contactMessages };
    }, [allUsers, withdrawalRequests, depositRequests, liveChatSessions, contactMessages]);

    // A robust, unified save function. Critical actions can call it with `immediate = true`.
    const triggerSave = useCallback((stateToPersist: any, immediate = false) => {
        if (debouncedSaveRef.current) {
            clearTimeout(debouncedSaveRef.current);
        }

        const saveAction = () => {
            if (!hasHydrated.current) return;
            
            console.log(`Persisting state via API (${immediate ? 'immediate' : 'debounced'})...`);
            
            fetch('/api/save-state', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stateToPersist),
            }).then(response => {
                if (!response.ok) console.error("Failed to persist state:", response.statusText);
                else console.log("State persisted successfully.");
            }).catch(err => console.error("Error persisting state:", err))
        };
        
        if (immediate) {
            saveAction();
        } else {
            debouncedSaveRef.current = window.setTimeout(saveAction, 1500);
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
    
    const refreshStateFromServer = useCallback(async () => {
        if (isSavingRef.current || !hasHydrated.current) return; // Check the lock
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
            let updatedUsers = allUsers;
            const today = getTodayDateString();
            if (foundUser.lastLoginDate !== today) {
                updatedUsers = updateUserInState(allUsers, foundUser.id, user => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const newStreak = user.lastLoginDate === yesterday.toISOString().split('T')[0] ? user.loginStreak + 1 : 1;
                    return { ...user, lastLoginDate: today, loginStreak: newStreak };
                });
                setAllUsers(updatedUsers);
                 triggerSave({ ...stateRef.current, allUsers: updatedUsers });
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
        triggerSave({ ...stateRef.current, allUsers: newAllUsers }, true);
        
        return { success: true };
    };

    const createDefaultAccount = (details: { fullName: string; name: string; email: string; phone: string; dateOfBirth: string; password?: string; avatarUrl: string; address?: string; }): boolean => {
         if (allUsers.some(u => u.email.toLowerCase() === details.email.toLowerCase() || u.name.toLowerCase() === details.name.toLowerCase())) {
            return false;
        }
        const newUser = generateDefaultAccount(Date.now(), details);
        const newAllUsers = [...allUsers, newUser];
        setAllUsers(newAllUsers);
        triggerSave({ ...stateRef.current, allUsers: newAllUsers }, true);
        return true;
    };
    
    const addTransaction = useCallback((userId: number, transaction: Omit<Transaction, 'id' | 'date'> & { id?: string }) => {
        const newAllUsers = updateUserInState(allUsers, userId, user => {
            const newTransaction: Transaction = { ...transaction, id: transaction.id || `tx${Date.now()}`, date: getTodayDateString() };
            return { ...user, transactions: [newTransaction, ...user.transactions] };
        });
        setAllUsers(newAllUsers);
        return newAllUsers;
    }, [allUsers]);
    
    const updateUserBalance = useCallback((userId: number, asset: 'BTC' | 'USDT' | 'ETH', amount: number, type: Transaction['type'], description: string) => {
        const newAllUsers = updateUserInState(allUsers, userId, user => {
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
        setAllUsers(newAllUsers);
        triggerSave({ ...stateRef.current, allUsers: newAllUsers }, true);
    }, [allUsers, triggerSave]);

    const addInvestment = useCallback((userId: number, investment: Omit<ActiveInvestment, 'id'>) => {
        const newAllUsers = updateUserInState(allUsers, userId, user => {
             const newInvestment: ActiveInvestment = { ...investment, id: `inv${Date.now()}` };
            return { ...user, activeInvestments: [newInvestment, ...user.activeInvestments] };
        });
        setAllUsers(newAllUsers);
        triggerSave({ ...stateRef.current, allUsers: newAllUsers }, true);
    }, [allUsers, triggerSave]);
    
    const approveInvestment = useCallback((userId: number, investmentId: string) => {
        const user = allUsers.find(u => u.id === userId);
        const investmentToApprove = user?.activeInvestments.find(inv => inv.id === investmentId);
        if (!user || !investmentToApprove) return;

        updateUserBalance(userId, investmentToApprove.asset, investmentToApprove.potentialReturn, 'Profit', `Return from ${investmentToApprove.planName}`);
        updateUserBalance(ADMIN_USER.id, investmentToApprove.asset, -investmentToApprove.potentialReturn, 'Withdrawal', `Return sent for ${investmentToApprove.planName} to ${user.name}`);

        const profitAmount = investmentToApprove.potentialReturn - investmentToApprove.amountInvested;
        addNotification(userId, `Your profit of ${profitAmount.toFixed(4)} ${investmentToApprove.asset} from the ${investmentToApprove.planName} plan has been credited to your wallet.`, "Profit Credited", Page.Wallet);

        const newAllUsers = updateUserInState(allUsers, userId, u => ({
            ...u, activeInvestments: u.activeInvestments.map(inv => inv.id === investmentId ? { ...inv, status: 'Completed' } : inv),
        }));
        setAllUsers(newAllUsers);
        triggerSave({ ...stateRef.current, allUsers: newAllUsers }, true);
    }, [allUsers, updateUserBalance, triggerSave]);

    const updateUserProfile = useCallback((userId: number, profileData: Partial<Pick<User, 'name' | 'avatarUrl' | 'phone' | 'country' | 'bio'>>) => {
        const newAllUsers = updateUserInState(allUsers, userId, user => ({ ...user, ...profileData }));
        setAllUsers(newAllUsers);
        triggerSave({ ...stateRef.current, allUsers: newAllUsers });
    }, [allUsers, triggerSave]);

    const addNotification = useCallback((userId: number, message: string, title?: string, link?: Page) => {
        let finalUsers: User[] | undefined;
        setAllUsers(prevUsers => {
            const newNotification: Notification = { id: `notif-${Date.now()}`, title, message, link, read: false, date: getISODateString() };
            finalUsers = updateUserInState(prevUsers, userId, user => ({ ...user, notifications: [newNotification, ...user.notifications] }));
            return finalUsers;
        });
        if (finalUsers) {
             triggerSave({ ...stateRef.current, allUsers: finalUsers });
        }
    }, [triggerSave]);
    
    const submitWithdrawalRequest = useCallback((request: Omit<WithdrawalRequest, 'id' | 'date' | 'status'>) => {
        const newRequest: WithdrawalRequest = { ...request, id: `wd-${Date.now()}`, date: getTodayDateString(), status: 'Pending' };
        
        const newAllUsers = addTransaction(request.userId, { id: newRequest.id, type: 'Withdrawal', asset: request.asset, amount: request.amount, description: `Request to ${request.address}`, status: 'Pending' });
        const newWithdrawalRequests = [newRequest, ...withdrawalRequests];
        setWithdrawalRequests(newWithdrawalRequests);
        triggerSave({ ...stateRef.current, allUsers: newAllUsers, withdrawalRequests: newWithdrawalRequests }, true);
    }, [addTransaction, withdrawalRequests, triggerSave]);

    const approveWithdrawal = useCallback((requestId: string) => {
        const request = withdrawalRequests.find(r => r.id === requestId);
        if (!request) return;
        
        const newAllUsers = updateUserInState(allUsers, request.userId, u => ({
            ...u,
            balances: { ...u.balances, [request.asset]: u.balances[request.asset] - request.amount },
            transactions: u.transactions.map(tx => tx.id === requestId ? { ...tx, status: 'Completed', description: `Withdrawal to ${request.address}` } : tx)
        }));
        setAllUsers(newAllUsers);
        
        const newWithdrawalRequests = withdrawalRequests.map((r): WithdrawalRequest => r.id === requestId ? { ...r, status: 'Approved' } : r);
        setWithdrawalRequests(newWithdrawalRequests);

        addNotification(request.userId, `Your withdrawal of ${request.amount} ${request.asset} has been approved.`, "Withdrawal Approved");
        triggerSave({ ...stateRef.current, allUsers: newAllUsers, withdrawalRequests: newWithdrawalRequests }, true);
    }, [allUsers, withdrawalRequests, addNotification, triggerSave]);

    const rejectWithdrawal = useCallback((requestId: string) => {
        const request = withdrawalRequests.find(r => r.id === requestId);
        if (!request) return;
        
        const newAllUsers = updateUserInState(allUsers, request.userId, u => ({
            ...u, transactions: u.transactions.map(tx => (tx.id === requestId) ? { ...tx, status: 'Rejected' } : tx)
        }));
        setAllUsers(newAllUsers);

        const newWithdrawalRequests = withdrawalRequests.map((r): WithdrawalRequest => r.id === requestId ? { ...r, status: 'Rejected' } : r);
        setWithdrawalRequests(newWithdrawalRequests);
        addNotification(request.userId, `Your withdrawal of ${request.amount} ${request.asset} was rejected. Please contact support.`, "Withdrawal Rejected");
        triggerSave({ ...stateRef.current, allUsers: newAllUsers, withdrawalRequests: newWithdrawalRequests }, true);
    }, [allUsers, withdrawalRequests, addNotification, triggerSave]);

    const sendLiveChatMessage = useCallback((userId: number, text: string) => {
        const newMessage: LiveChatMessage = { sender: 'user', text, timestamp: Date.now() };
        let newSessions: LiveChatSession[];
        const user = allUsers.find(u => u.id === userId);
        if (!user) return;
        const existingSession = liveChatSessions.find(s => s.userId === userId);
        if(existingSession) {
            newSessions = liveChatSessions.map(s => s.userId === userId ? {...s, messages: [...s.messages, newMessage], hasUnreadUserMessage: true, hasUnreadAdminMessage: false } : s);
        } else {
            const newSession: LiveChatSession = { 
                userId, 
                userName: user.name, 
                messages: [{ sender: 'admin', text: `Hi ${user.name}! How can we help you today?`, timestamp: Date.now() }, newMessage], 
                hasUnreadAdminMessage: false, 
                hasUnreadUserMessage: true 
            };
            newSessions = [...liveChatSessions, newSession];
        }
        setLiveChatSessions(newSessions);
        triggerSave({ ...stateRef.current, liveChatSessions: newSessions }, true);
    }, [allUsers, liveChatSessions, triggerSave]);

    const sendAdminReply = useCallback((userId: number, text: string) => {
        const newMessage: LiveChatMessage = { sender: 'admin', text, timestamp: Date.now() };
        const newSessions = liveChatSessions.map(s => s.userId === userId ? { ...s, messages: [...s.messages, newMessage], hasUnreadAdminMessage: true, hasUnreadUserMessage: false } : s);
        setLiveChatSessions(newSessions);
        triggerSave({ ...stateRef.current, liveChatSessions: newSessions }, true);
    }, [liveChatSessions, triggerSave]);

    const markUserChatAsRead = useCallback((userId: number) => {
         const newSessions = liveChatSessions.map(s => s.userId === userId ? { ...s, hasUnreadAdminMessage: false } : s);
         setLiveChatSessions(newSessions);
         triggerSave({ ...stateRef.current, liveChatSessions: newSessions });
    }, [liveChatSessions, triggerSave]);
    
    const markAdminChatAsRead = useCallback((userId: number) => {
         const newSessions = liveChatSessions.map(s => s.userId === userId ? { ...s, hasUnreadUserMessage: false } : s);
         setLiveChatSessions(newSessions);
         triggerSave({ ...stateRef.current, liveChatSessions: newSessions });
    }, [liveChatSessions, triggerSave]);
    
    const setUserTyping = useCallback((userId: number, isTyping: boolean) => {
        const newSessions = liveChatSessions.map(s => (s.userId === userId ? { ...s, isUserTyping: isTyping } : s));
        setLiveChatSessions(newSessions);
        triggerSave({ ...stateRef.current, liveChatSessions: newSessions }, false);
    }, [liveChatSessions, triggerSave]);
    
    const setAdminTyping = useCallback((userId: number, isTyping: boolean) => {
        const newSessions = liveChatSessions.map(s => (s.userId === userId ? { ...s, isAdminTyping: isTyping } : s));
        setLiveChatSessions(newSessions);
        triggerSave({ ...stateRef.current, liveChatSessions: newSessions }, false);
    }, [liveChatSessions, triggerSave]);

    const submitContactMessage = useCallback((name: string, email: string, message: string) => {
        const newMessage: ContactMessage = { id: `cm-${Date.now()}`, name, email, message, date: getISODateString(), read: false };
        const newContactMessages = [newMessage, ...contactMessages];
        setContactMessages(newContactMessages);
        triggerSave({ ...stateRef.current, contactMessages: newContactMessages }, true);
    }, [contactMessages, triggerSave]);

    const markContactMessageAsRead = useCallback((id: string) => {
        const newContactMessages = contactMessages.map(msg => msg.id === id ? { ...msg, read: true } : msg);
        setContactMessages(newContactMessages);
        triggerSave({ ...stateRef.current, contactMessages: newContactMessages });
    }, [contactMessages, triggerSave]);

    const sendAdminMessage = useCallback((userId: number, message: string) => {
        addNotification(userId, message);
    }, [addNotification]);
    
    const submitVerification = useCallback((userId: number, data: VerificationData) => {
        isSavingRef.current = true; // Engage lock

        // --- ATOMIC STATE CONSTRUCTION ---
        // 1. Create all new data artifacts
        const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            title: 'Verification Pending',
            message: 'Your verification documents have been submitted and are now pending review.',
            link: Page.Account, read: false, date: getISODateString()
        };

        // 2. Calculate the next state for allUsers
        const newAllUsers = stateRef.current.allUsers.map((u): User => {
            if (u.id === userId) {
                return {
                    ...u,
                    verificationStatus: 'Pending',
                    verificationData: data,
                    notifications: [newNotification, ...u.notifications]
                };
            }
            return u;
        });

        // 3. Construct the complete next state object
        const nextState = {
            ...stateRef.current,
            allUsers: newAllUsers,
        };
        // --- END ATOMIC STATE CONSTRUCTION ---

        // 4. Update UI state with the new object
        setAllUsers(nextState.allUsers);

        // 5. Persist the exact same object to the server
        fetch('/api/save-state', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nextState),
        })
        .then(response => { if (!response.ok) console.error("Failed to persist state:", response.statusText); })
        .catch(err => console.error("Error persisting state:", err))
        .finally(() => { isSavingRef.current = false; }); // Release lock
    }, []);

    const approveVerification = useCallback((userId: number) => {
        const newAllUsers = updateUserInState(allUsers, userId, (user): User => ({
            ...user, verificationStatus: 'Verified', verificationData: undefined,
        }));
        setAllUsers(newAllUsers);
        addNotification(userId, 'Congratulations! Your account has been verified.', 'Verification Approved');
        triggerSave({ ...stateRef.current, allUsers: newAllUsers }, true);
    }, [allUsers, addNotification, triggerSave]);
    
    const rejectVerification = useCallback((userId: number, reason: string) => {
        const newAllUsers = updateUserInState(allUsers, userId, (user): User => ({
            ...user, verificationStatus: 'Rejected', verificationData: undefined,
        }));
        setAllUsers(newAllUsers);
        addNotification(userId, `Your verification was rejected. Reason: ${reason}.`, 'Verification Rejected', Page.Verification);
        triggerSave({ ...stateRef.current, allUsers: newAllUsers }, true);
    }, [allUsers, addNotification, triggerSave]);
    
    const markNotificationAsRead = useCallback((userId: number, notificationId: string) => {
        const newAllUsers = updateUserInState(allUsers, userId, user => ({
            ...user, notifications: user.notifications.map(n => n.id === notificationId ? { ...n, read: true } : n)
        }));
        setAllUsers(newAllUsers);
        triggerSave({ ...stateRef.current, allUsers: newAllUsers });
    }, [allUsers, triggerSave]);
    
    const deleteNotification = useCallback((userId: number, notificationId: string) => {
        const newAllUsers = updateUserInState(allUsers, userId, user => ({
            ...user, notifications: user.notifications.filter(n => n.id !== notificationId)
        }));
        setAllUsers(newAllUsers);
        triggerSave({ ...stateRef.current, allUsers: newAllUsers });
    }, [allUsers, triggerSave]);

    const changePassword = useCallback((userId: number, currentPass: string, newPass: string): { success: boolean, message: string } => {
        let result = { success: false, message: "Current password is not correct." };
        let finalUsers = allUsers;
        const user = allUsers.find(u => u.id === userId);
        if (user && user.password === currentPass) {
             finalUsers = updateUserInState(allUsers, userId, u => ({ ...u, password: newPass }));
             setAllUsers(finalUsers);
             result = { success: true, message: "Password changed successfully." };
             triggerSave({ ...stateRef.current, allUsers: finalUsers }, true);
        }
        return result;
    }, [allUsers, triggerSave]);
    
    const toggle2FA = useCallback((userId: number, code?: string): { success: boolean, message: string } => {
        let result = { success: false, message: "User not found." };
        let finalUsers = allUsers;
        const user = allUsers.find(u => u.id === userId);
        if (user) {
            const isEnabling = !user.is2FAEnabled;
            if (isEnabling && (!code || !/^\d{6}$/.test(code))) {
                result = { success: false, message: "Invalid 6-digit code." };
            } else {
                 finalUsers = updateUserInState(allUsers, userId, u => ({ ...u, is2FAEnabled: isEnabling }));
                 setAllUsers(finalUsers);
                 result = { success: true, message: `2FA ${isEnabling ? 'enabled' : 'disabled'} successfully.` };
                 triggerSave({ ...stateRef.current, allUsers: finalUsers }, true);
            }
        }
        return result;
    }, [allUsers, triggerSave]);

    const deleteAccount = useCallback((userId: number) => {
        const newAllUsers = allUsers.filter(u => u.id !== userId);
        setAllUsers(newAllUsers);
        if (currentUserId === userId) logout();
        triggerSave({ ...stateRef.current, allUsers: newAllUsers }, true);
    }, [allUsers, currentUserId, logout, triggerSave]);

    const adminDeleteUser = useCallback((userId: number) => {
        const newAllUsers = allUsers.filter(u => u.id !== userId);
        setAllUsers(newAllUsers);
        triggerSave({ ...stateRef.current, allUsers: newAllUsers }, true);
    }, [allUsers, triggerSave]);

    const submitDepositRequest = useCallback((request: Omit<DepositRequest, 'id' | 'date' | 'status' | 'userName'>) => {
        isSavingRef.current = true; // Engage lock

        const user = stateRef.current.allUsers.find(u => u.id === request.userId);
        if (!user) {
            isSavingRef.current = false;
            return;
        }

        // --- ATOMIC STATE CONSTRUCTION ---
        // 1. Create all new data artifacts
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

        // 2. Calculate the next state for relevant slices
        const newAllUsers = stateRef.current.allUsers.map(u => {
            if (u.id === request.userId) {
                return {
                    ...u,
                    transactions: [newTransaction, ...u.transactions],
                    notifications: [newNotification, ...u.notifications]
                };
            }
            return u;
        });
        const newDepositRequests = [newRequest, ...stateRef.current.depositRequests];

        // 3. Construct the complete next state object
        const nextState = {
            ...stateRef.current,
            allUsers: newAllUsers,
            depositRequests: newDepositRequests
        };
        // --- END ATOMIC STATE CONSTRUCTION ---
        
        // 4. Update UI state with the new object
        setAllUsers(nextState.allUsers);
        setDepositRequests(nextState.depositRequests);
        
        // 5. Persist the exact same object to the server
        fetch('/api/save-state', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nextState),
        })
        .then(response => { if (!response.ok) console.error("Failed to persist state:", response.statusText); })
        .catch(err => console.error("Error persisting state:", err))
        .finally(() => { isSavingRef.current = false; }); // Release lock
    }, []);

    const approveDeposit = useCallback((requestId: string) => {
        const request = depositRequests.find(r => r.id === requestId);
        if (!request) return;

        const newAllUsers = updateUserInState(allUsers, request.userId, u => ({
            ...u,
            balances: { ...u.balances, [request.asset]: u.balances[request.asset] + request.amount },
            transactions: u.transactions.map(tx => (tx.id === requestId) ? { ...tx, status: 'Completed', type: 'Deposit', description: 'Approved crypto deposit' } : tx)
        }));
        setAllUsers(newAllUsers);

        const newDepositRequests = depositRequests.map((r): DepositRequest => r.id === requestId ? { ...r, status: 'Approved' } : r);
        setDepositRequests(newDepositRequests);
        
        addNotification(request.userId, `Your deposit of ${request.amount} ${request.asset} has been approved.`, "Deposit Approved");
        triggerSave({ ...stateRef.current, allUsers: newAllUsers, depositRequests: newDepositRequests }, true);
    }, [depositRequests, allUsers, addNotification, triggerSave]);
    
    const rejectDeposit = useCallback((requestId: string, reason: string) => {
        const request = depositRequests.find(r => r.id === requestId);
        if (!request) return;

        const newDepositRequests = depositRequests.map((r): DepositRequest => r.id === requestId ? { ...r, status: 'Rejected' } : r);
        setDepositRequests(newDepositRequests);
        
        const newAllUsers = updateUserInState(allUsers, request.userId, u => ({
            ...u, transactions: u.transactions.map(tx => (tx.id === requestId) ? { ...tx, status: 'Rejected' } : tx)
        }));
        setAllUsers(newAllUsers);
        
        addNotification(request.userId, `Your deposit was rejected. Reason: ${reason}`, "Deposit Rejected");
        triggerSave({ ...stateRef.current, allUsers: newAllUsers, depositRequests: newDepositRequests }, true);
    }, [depositRequests, allUsers, addNotification, triggerSave]);
    
    const markWelcomeEmailSent = useCallback((userId: number) => {
        const newAllUsers = updateUserInState(allUsers, userId, user => ({
            ...user, welcomeEmailSent: true
        }));
        setAllUsers(newAllUsers);
        triggerSave({ ...stateRef.current, allUsers: newAllUsers });
    }, [allUsers, triggerSave]);

    const value = useMemo(() => ({
        user: currentUser, users: allUsers, withdrawalRequests, depositRequests, isLoading, login, logout, signup, createDefaultAccount, updateUserBalance,
        addTransaction, addInvestment, approveInvestment, updateUserProfile, submitWithdrawalRequest, approveWithdrawal, rejectWithdrawal, submitDepositRequest, approveDeposit,
        rejectDeposit, adminDeleteUser, checkAndResetLoginFlag, liveChatSessions, sendLiveChatMessage, sendAdminReply, markUserChatAsRead, markAdminChatAsRead,
        setUserTyping, setAdminTyping,
        contactMessages, submitContactMessage, markContactMessageAsRead, submitVerification, approveVerification, rejectVerification, sendAdminMessage,
        markNotificationAsRead, deleteNotification, changePassword, toggle2FA, deleteAccount, activePage, navigateTo, refreshStateFromServer, markWelcomeEmailSent,
        addNotification,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [
        currentUser, allUsers, withdrawalRequests, depositRequests, liveChatSessions, contactMessages, isLoading,
        checkAndResetLoginFlag, logout, signup, createDefaultAccount, addTransaction, updateUserBalance, addInvestment, approveInvestment, 
        updateUserProfile, submitWithdrawalRequest, approveWithdrawal, rejectWithdrawal, submitDepositRequest, approveDeposit, rejectDeposit, adminDeleteUser, sendLiveChatMessage, 
        sendAdminReply, markUserChatAsRead, markAdminChatAsRead, setUserTyping, setAdminTyping, submitContactMessage, markContactMessageAsRead,
        submitVerification, approveVerification, rejectVerification, sendAdminMessage, markNotificationAsRead,
        deleteNotification, changePassword, toggle2FA, deleteAccount, activePage, navigateTo, refreshStateFromServer, markWelcomeEmailSent, addNotification
    ]);


    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};