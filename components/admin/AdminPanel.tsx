import React, { useContext, useState, useMemo, useRef, useEffect } from 'react';
import Card from '../shared/Card';
import { AuthContext } from '../auth/AuthContext';
import { User, ActiveInvestment, WithdrawalRequest, LiveChatSession, DepositRequest, Page } from '../../types';
import SendFundsModal from './SendFundsModal';
import Icon from '../shared/Icon';
import { SUPPORT_ICON, TRASH_ICON } from '../../constants';
import VerificationReviewModal from './VerificationReviewModal';
import DepositReviewModal from './DepositReviewModal';
import SendMessageModal from './SendMessageModal';
import ConfirmationModal from '../shared/ConfirmationModal';

interface InvestmentWithUser extends ActiveInvestment {
    userName: string;
    userId: number;
}

const AdminPanel: React.FC = () => {
    const auth = useContext(AuthContext);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isFundModalOpen, setIsFundModalOpen] = useState(false);
    const [selectedChat, setSelectedChat] = useState<LiveChatSession | null>(null);
    const [adminReply, setAdminReply] = useState('');
    const chatMessagesEndRef = useRef<HTMLDivElement>(null);
    const [reviewingUser, setReviewingUser] = useState<User | null>(null);
    const [reviewingDeposit, setReviewingDeposit] = useState<DepositRequest | null>(null);
    const [messagingUser, setMessagingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    
    if (!auth?.user?.isAdmin) {
        return <div className="p-8"><h1 className="text-3xl font-bold text-accent-danger">Access Denied.</h1></div>;
    }

    const { users, approveInvestment, approveWithdrawal, rejectWithdrawal, withdrawalRequests, liveChatSessions, markAdminChatAsRead, sendAdminReply: doSendAdminReply, contactMessages, markContactMessageAsRead, approveVerification, rejectVerification, depositRequests, approveDeposit, rejectDeposit, navigateTo, adminDeleteUser } = auth;

    const regularUsers = useMemo(() => users.filter(u => !u.isAdmin), [users]);
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u.name])), [users]);

    const allActiveInvestments = useMemo((): InvestmentWithUser[] => {
        return regularUsers
            .flatMap(user => 
                user.activeInvestments
                    .filter(inv => inv.status === 'Active')
                    .map(inv => ({ ...inv, userName: user.name, userId: user.id }))
            )
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }, [regularUsers]);
    
    const pendingWithdrawals = useMemo(() => 
        withdrawalRequests.filter(req => req.status === 'Pending'), 
    [withdrawalRequests]);
    
    const unreadContactMessages = useMemo(() => contactMessages.filter(m => !m.read), [contactMessages]);

    const pendingVerifications = useMemo(() => 
        users.filter(u => u.verificationStatus === 'Pending'),
    [users]);

    const pendingDeposits = useMemo(() =>
        depositRequests.filter(req => req.status === 'Pending'),
    [depositRequests]);


    const handleOpenFundModal = (user: User) => {
        setSelectedUser(user);
        setIsFundModalOpen(true);
    };

    const handleSendFunds = (targetUserId: number, asset: 'BTC' | 'USDT' | 'ETH', amount: number) => {
        if (!auth.user) return;
        auth.updateUserBalance(targetUserId, asset, amount, 'Deposit', 'Crypto Deposit');
        auth.updateUserBalance(auth.user.id, asset, -amount, 'Withdrawal', `Sent funds to user ID ${targetUserId}`);
        setIsFundModalOpen(false);
        setSelectedUser(null);
    };

    const handleSelectChat = (session: LiveChatSession) => {
        setSelectedChat(session);
        markAdminChatAsRead(session.userId);
    };

    const handleSendReply = () => {
        if(!adminReply.trim() || !selectedChat) return;
        doSendAdminReply(selectedChat.userId, adminReply);
        setAdminReply('');
    };
    
    const confirmDeleteUser = () => {
        if(deletingUser) {
            adminDeleteUser(deletingUser.id);
            setDeletingUser(null);
        }
    };

    useEffect(() => {
        if (selectedChat) {
            const updatedSession = liveChatSessions.find(s => s.userId === selectedChat.userId);
            setSelectedChat(updatedSession || null);
        }
    }, [liveChatSessions]);

    useEffect(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedChat?.messages]);


    return (
        <div className="p-4 md:p-8 space-y-8">
            {isFundModalOpen && selectedUser && (
                <SendFundsModal
                    user={selectedUser}
                    onClose={() => setIsFundModalOpen(false)}
                    onSend={handleSendFunds}
                />
            )}
            {reviewingUser && (
                <VerificationReviewModal
                    user={reviewingUser}
                    onClose={() => setReviewingUser(null)}
                    onApprove={approveVerification}
                    onReject={rejectVerification}
                />
            )}
             {reviewingDeposit && (
                <DepositReviewModal
                    request={reviewingDeposit}
                    onClose={() => setReviewingDeposit(null)}
                    onApprove={approveDeposit}
                    onReject={rejectDeposit}
                />
            )}
            {messagingUser && (
                <SendMessageModal
                    user={messagingUser}
                    onClose={() => setMessagingUser(null)}
                />
            )}
            {deletingUser && (
                 <ConfirmationModal
                    title={`Delete User: ${deletingUser.name}`}
                    message="Are you sure you want to permanently delete this user? This action is irreversible and will remove all their data."
                    confirmText="Permanently Delete"
                    onConfirm={confirmDeleteUser}
                    onClose={() => setDeletingUser(null)}
                />
            )}
            <h1 className="text-3xl font-bold text-white">Administrator Control Panel</h1>

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">User Management</h2>
                     <button 
                        onClick={() => navigateTo(Page.GenerateAccount)}
                        className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-2 px-4 rounded-md text-sm">
                        Generate Instant Account
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                         <thead className="text-xs text-basetitan-text-secondary uppercase bg-basetitan-dark">
                            <tr>
                                <th className="px-4 py-3">User ID</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Username</th>
                                <th className="px-4 py-3">Referred By</th>
                                <th className="px-4 py-3 text-right">USDT</th>
                                <th className="px-4 py-3 text-right">BTC</th>
                                <th className="px-4 py-3 text-right">ETH</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {regularUsers.map(user => (
                                <tr key={user.id} className="border-b border-basetitan-border hover:bg-basetitan-dark">
                                    <td className="px-4 py-3 font-semibold">{user.id}</td>
                                    <td className="px-4 py-3">{user.fullName}</td>
                                    <td className="px-4 py-3">@{user.name}</td>
                                    <td className="px-4 py-3 text-basetitan-text-secondary">{user.referredBy ? `@${userMap.get(user.referredBy)}` : 'N/A'}</td>
                                    <td className="px-4 py-3 font-mono text-right">${user.balances.USDT.toFixed(2)}</td>
                                    <td className="px-4 py-3 font-mono text-right">{user.balances.BTC.toFixed(6)}</td>
                                    <td className="px-4 py-3 font-mono text-right">{user.balances.ETH.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-center space-x-2">
                                        <button 
                                            onClick={() => setMessagingUser(user)}
                                            className="bg-accent-secondary hover:bg-accent-secondary-hover text-white font-bold py-1 px-3 rounded-md text-xs">
                                            Message
                                        </button>
                                        <button 
                                            onClick={() => handleOpenFundModal(user)}
                                            className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-1 px-3 rounded-md text-xs">
                                            Send Funds
                                        </button>
                                         <button 
                                            onClick={() => setDeletingUser(user)}
                                            className="bg-accent-danger hover:opacity-80 text-white font-bold py-1 px-3 rounded-md text-xs">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                <Card>
                    <h2 className="text-xl font-bold text-white mb-4">Deposit Requests</h2>
                    {pendingDeposits.length > 0 ? (
                        <div className="overflow-x-auto max-h-96">
                             <table className="w-full text-sm text-left">
                                <thead className="text-xs text-basetitan-text-secondary uppercase bg-basetitan-dark sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3">User</th>
                                        <th className="px-4 py-3 text-right">Amount</th>
                                        <th className="px-4 py-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingDeposits.map(req => (
                                        <tr key={req.id} className="border-b border-basetitan-border hover:bg-basetitan-dark">
                                            <td className="px-4 py-3 font-semibold">{req.userName}</td>
                                            <td className="px-4 py-3 font-mono text-right">{req.amount.toFixed(8)} {req.asset}</td>
                                            <td className="px-4 py-3 text-center">
                                                <button onClick={() => setReviewingDeposit(req)} className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-1 px-3 rounded-md text-xs">Review</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-basetitan-text-secondary text-center py-4">No pending deposit requests.</p>
                    )}
                </Card>
                <Card>
                    <h2 className="text-xl font-bold text-white mb-4">Investment Approvals</h2>
                    {allActiveInvestments.length > 0 ? (
                        <div className="overflow-x-auto max-h-96">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-basetitan-text-secondary uppercase bg-basetitan-dark sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3">User</th>
                                        <th className="px-4 py-3 text-right">Amount</th>
                                        <th className="px-4 py-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allActiveInvestments.map(inv => (
                                        <tr key={inv.id} className="border-b border-basetitan-border hover:bg-basetitan-dark">
                                            <td className="px-4 py-3 font-semibold">{inv.userName}</td>
                                            <td className="px-4 py-3 font-mono text-right">{inv.amountInvested.toFixed(2)} {inv.asset}</td>
                                            <td className="px-4 py-3 text-center">
                                                <button onClick={() => approveInvestment(inv.userId, inv.id)} className="bg-accent-secondary hover:bg-accent-secondary-hover text-white font-bold py-1 px-3 rounded-md text-xs">Approve</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-basetitan-text-secondary text-center py-4">No active investments requiring approval.</p>
                    )}
                </Card>

                <Card>
                    <h2 className="text-xl font-bold text-white mb-4">Withdrawal Requests</h2>
                    {pendingWithdrawals.length > 0 ? (
                        <div className="overflow-x-auto max-h-96">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-basetitan-text-secondary uppercase bg-basetitan-dark sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3">User</th>
                                        <th className="px-4 py-3 text-right">Amount</th>
                                        <th className="px-4 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingWithdrawals.map(req => (
                                        <tr key={req.id} className="border-b border-basetitan-border hover:bg-basetitan-dark">
                                            <td className="px-4 py-3 font-semibold" title={`Address: ${req.address}\n2FA: ${req.twoFactorCode}`}>{req.userName}</td>
                                            <td className="px-4 py-3 font-mono text-right">{req.amount.toFixed(2)} {req.asset}</td>
                                            <td className="px-4 py-3 text-center space-x-2">
                                                <button onClick={() => approveWithdrawal(req.id)} className="bg-accent-secondary hover:bg-accent-secondary-hover text-white font-bold py-1 px-2 rounded-md text-xs">Approve</button>
                                                <button onClick={() => rejectWithdrawal(req.id)} className="bg-accent-danger hover:opacity-80 text-white font-bold py-1 px-2 rounded-md text-xs">Reject</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-basetitan-text-secondary text-center py-4">No pending withdrawals.</p>
                    )}
                </Card>
                 <Card className="xl:col-span-1">
                    <h2 className="text-xl font-bold text-white mb-4">Verification Requests</h2>
                    {pendingVerifications.length > 0 ? (
                        <div className="overflow-x-auto max-h-96">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-basetitan-text-secondary uppercase bg-basetitan-dark sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3">User</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingVerifications.map(user => (
                                        <tr key={user.id} className="border-b border-basetitan-border hover:bg-basetitan-dark">
                                            <td className="px-4 py-3 font-semibold">{user.name}</td>
                                            <td className="px-4 py-3">{user.email}</td>
                                            <td className="px-4 py-3 text-center">
                                                <button onClick={() => setReviewingUser(user)} className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-1 px-3 rounded-md text-xs">
                                                    Review
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-basetitan-text-secondary text-center py-4">No pending verification requests.</p>
                    )}
                </Card>
                 <Card className="xl:col-span-2">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                        Contact Form Messages
                        {unreadContactMessages.length > 0 && (
                            <span className="ml-3 bg-accent-primary text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">{unreadContactMessages.length}</span>
                        )}
                    </h2>
                    {contactMessages.length > 0 ? (
                         <div className="overflow-x-auto max-h-96">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-basetitan-text-secondary uppercase bg-basetitan-dark sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3">From</th>
                                        <th className="px-4 py-3">Message</th>
                                        <th className="px-4 py-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contactMessages.map(msg => (
                                        <tr key={msg.id} className={`border-b border-basetitan-border ${msg.read ? 'opacity-60' : 'hover:bg-basetitan-dark'}`}>
                                            <td className="px-4 py-3 align-top">
                                                <p className="font-semibold">{msg.name}</p>
                                                <p className="text-xs text-basetitan-text-secondary">{msg.email}</p>
                                                <p className="text-xs text-basetitan-text-secondary mt-1">{msg.date}</p>
                                            </td>
                                            <td className="px-4 py-3 whitespace-pre-wrap align-top">{msg.message}</td>
                                            <td className="px-4 py-3 text-center align-top">
                                                {!msg.read && (
                                                    <button onClick={() => markContactMessageAsRead(msg.id)} className="bg-accent-secondary hover:bg-accent-secondary-hover text-white font-bold py-1 px-3 rounded-md text-xs">
                                                        Mark Read
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                    ) : (
                        <p className="text-basetitan-text-secondary text-center py-4">No contact messages.</p>
                    )}
                </Card>
            </div>

            <Card>
                <h2 className="text-xl font-bold text-white mb-4">Live Chat Support</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ minHeight: '500px' }}>
                    <div className="md:col-span-1 border-r border-basetitan-border pr-4 max-h-full overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-3">Sessions</h3>
                        <ul className="space-y-2">
                            {liveChatSessions.length === 0 && <p className="text-basetitan-text-secondary text-sm">No active chat sessions.</p>}
                            {liveChatSessions.map(session => (
                                <li key={session.userId}>
                                    <button 
                                        onClick={() => handleSelectChat(session)}
                                        className={`w-full text-left p-3 rounded-lg flex justify-between items-center ${selectedChat?.userId === session.userId ? 'bg-accent-primary/20' : 'hover:bg-basetitan-dark'}`}
                                    >
                                        <span>{session.userName}</span>
                                        {session.hasUnreadUserMessage && <span className="h-2.5 w-2.5 bg-accent-primary rounded-full animate-pulse"></span>}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="md:col-span-2 flex flex-col bg-basetitan-dark rounded-lg">
                        {selectedChat ? (
                            <>
                                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                   {selectedChat.messages.map((msg, index) => (
                                      <div key={index} className={`flex items-start gap-3 ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0 font-bold">{selectedChat.userName[0]}</div>}
                                            <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'admin' ? 'bg-accent-primary text-white rounded-br-none' : 'bg-basetitan-dark text-basetitan-text rounded-bl-none'}`}>
                                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                            </div>
                                        </div>
                                   ))}
                                   <div ref={chatMessagesEndRef} />
                                </div>
                                <div className="p-4 border-t border-basetitan-border flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={adminReply}
                                        onChange={(e) => setAdminReply(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                                        placeholder={`Reply to ${selectedChat.userName}...`}
                                        className="flex-1 bg-basetitan-light border border-basetitan-border rounded-lg px-4 py-2 focus:ring-accent-primary focus:border-accent-primary"
                                    />
                                    <button onClick={handleSendReply} disabled={!adminReply.trim()} className="bg-accent-primary text-white rounded-lg p-2 disabled:opacity-50 hover:bg-accent-primary-hover">
                                        Send
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-center text-basetitan-text-secondary">
                                <div>
                                    <Icon className="w-16 h-16 mx-auto">{SUPPORT_ICON}</Icon>
                                    <p className="mt-2">Select a session to view the chat.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

        </div>
    );
};

export default AdminPanel;