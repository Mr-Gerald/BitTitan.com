
import React, { useContext, useState, useMemo, useRef, useEffect } from 'react';
import Card from '../shared/Card';
import { AuthContext } from '../auth/AuthContext';
import { User, ActiveInvestment, WithdrawalRequest, LiveChatSession, DepositRequest, Page } from '../../types';
import SendFundsModal from './SendFundsModal';
import Icon from '../shared/Icon';
import { SUPPORT_ICON, TRASH_ICON, EMAIL_ICON, LOGO_ICON } from '../../constants';
import VerificationReviewModal from './VerificationReviewModal';
import DepositReviewModal from './DepositReviewModal';
import SendMessageModal from './SendMessageModal';
import ConfirmationModal from '../shared/ConfirmationModal';

interface InvestmentWithUser extends ActiveInvestment {
    userName: string;
    userId: number;
}

const generateWelcomeEmail = (user: User) => {
    const logoSvg = `<svg width="50" height="50" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#2f81f7" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`;

    const htmlBody = `
        <body style="margin: 0; padding: 0; background-color: #0d1117; font-family: Arial, sans-serif;">
            <div style="background-color: #0d1117; color: #c9d1d9; padding: 40px 20px; border-radius: 8px; max-width: 600px; margin: auto; border: 1px solid #30363d;">
                <div style="text-align: center; margin-bottom: 20px;">
                    ${logoSvg}
                </div>
                <h1 style="color: #ffffff; text-align: center; font-size: 24px;">Welcome to BitTitan, ${user.fullName}!</h1>
                <p style="font-size: 16px; line-height: 1.6; color: #8b949e; text-align: center; max-width: 450px; margin: 10px auto;">
                    We are thrilled to have you join our community of investors and traders. Your account has been successfully created.
                </p>
                <div style="background-color: #161b22; padding: 20px; border-radius: 5px; margin-top: 30px;">
                  <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">What's next?</h2>
                  <p style="font-size: 16px; line-height: 1.6;">
                      You can log in to your account immediately and start exploring. Here are a few things you can do to get started:
                  </p>
                  <ul style="list-style: none; padding: 0; margin: 20px 0 0 0;">
                      <li style="margin-bottom: 10px;"><strong>› Explore Investment Plans:</strong> Discover our AI-powered crypto and alternative investment options.</li>
                      <li style="margin-bottom: 10px;"><strong>› Fund Your Wallet:</strong> Securely add funds to your account to start investing.</li>
                      <li style="margin-bottom: 10px;"><strong>› Visit the Trading Terminal:</strong> Monitor the market with our live trading tools.</li>
                  </ul>
                </div>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="https://bit-titan-com.vercel.app/" style="background-color: #2f81f7; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Go to My Dashboard</a>
                </div>
                <p style="font-size: 12px; text-align: center; color: #8b949e; margin-top: 30px;">
                    If you have any questions, don't hesitate to use our 24/7 Live Support or ask our AI Assistant.
                    <br><br>
                    &copy; ${new Date().getFullYear()} BitTitan. All rights reserved.
                </p>
            </div>
        </body>
    `;
    const subject = "Welcome to BitTitan!";
    window.location.href = `mailto:${user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(htmlBody)}`;
};


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

    const { users, approveInvestment, approveWithdrawal, rejectWithdrawal, withdrawalRequests, liveChatSessions, markAdminChatAsRead, sendAdminReply: doSendAdminReply, contactMessages, markContactMessageAsRead, approveVerification, rejectVerification, depositRequests, approveDeposit, rejectDeposit, navigateTo, adminDeleteUser, markWelcomeEmailSent } = auth;

    const regularUsers = useMemo(() => users.filter(u => !u.isAdmin), [users]);
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u.name])), [users]);
    
    const usersNeedingWelcomeEmail = useMemo(() => regularUsers.filter(u => !u.welcomeEmailSent), [regularUsers]);

    const allActiveInvestments = useMemo((): InvestmentWithUser[] => {
        return regularUsers.flatMap(user => user.activeInvestments.filter(inv => inv.status === 'Active').map(inv => ({ ...inv, userName: user.name, userId: user.id }))).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }, [regularUsers]);
    
    const pendingWithdrawals = useMemo(() => withdrawalRequests.filter(req => req.status === 'Pending'), [withdrawalRequests]);
    const unreadContactMessages = useMemo(() => contactMessages.filter(m => !m.read), [contactMessages]);
    const pendingVerifications = useMemo(() => users.filter(u => u.verificationStatus === 'Pending'), [users]);
    const pendingDeposits = useMemo(() => depositRequests.filter(req => req.status === 'Pending'), [depositRequests]);

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
        chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedChat?.messages]);


    return (
        <div className="p-4 md:p-8 space-y-8">
            {isFundModalOpen && selectedUser && <SendFundsModal user={selectedUser} onClose={() => setIsFundModalOpen(false)} onSend={handleSendFunds} />}
            {reviewingUser && <VerificationReviewModal user={reviewingUser} onClose={() => setReviewingUser(null)} onApprove={approveVerification} onReject={rejectVerification} />}
            {reviewingDeposit && <DepositReviewModal request={reviewingDeposit} onClose={() => setReviewingDeposit(null)} onApprove={approveDeposit} onReject={rejectDeposit} />}
            {messagingUser && <SendMessageModal user={messagingUser} onClose={() => setMessagingUser(null)} />}
            {deletingUser && <ConfirmationModal title={`Delete User: ${deletingUser.name}`} message="Are you sure you want to permanently delete this user? This action is irreversible." confirmText="Permanently Delete" onConfirm={confirmDeleteUser} onClose={() => setDeletingUser(null)} />}
            
            <h1 className="text-3xl font-bold text-white">Administrator Control Panel</h1>

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">User Management</h2>
                     <button onClick={() => navigateTo(Page.GenerateAccount)} className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-2 px-4 rounded-md text-sm">Generate Instant Account</button>
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
                                        <button onClick={() => setMessagingUser(user)} className="bg-accent-secondary hover:bg-accent-secondary-hover text-white font-bold py-1 px-3 rounded-md text-xs">Message</button>
                                        <button onClick={() => handleOpenFundModal(user)} className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-1 px-3 rounded-md text-xs">Send Funds</button>
                                        <button onClick={() => setDeletingUser(user)} className="bg-accent-danger hover:opacity-80 text-white font-bold py-1 px-3 rounded-md text-xs">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                <Card>
                    <h2 className="text-xl font-bold text-white mb-4">Welcome Email Queue</h2>
                    {usersNeedingWelcomeEmail.length > 0 ? (
                        <div className="overflow-x-auto max-h-96">
                             <table className="w-full text-sm text-left">
                                <thead className="text-xs text-basetitan-text-secondary uppercase bg-basetitan-dark sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3">User</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usersNeedingWelcomeEmail.map(user => (
                                        <tr key={user.id} className="border-b border-basetitan-border hover:bg-basetitan-dark">
                                            <td className="px-4 py-3 font-semibold">{user.name}</td>
                                            <td className="px-4 py-3 font-mono">{user.email}</td>
                                            <td className="px-4 py-3 text-center space-x-2">
                                                <button onClick={() => generateWelcomeEmail(user)} className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-1 px-3 rounded-md text-xs">Send</button>
                                                <button onClick={() => markWelcomeEmailSent(user.id)} className="bg-basetitan-dark hover:bg-basetitan-border text-white font-bold py-1 px-3 rounded-md text-xs">Mark Sent</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-basetitan-text-secondary text-center py-4">No users are waiting for a welcome email.</p>
                    )}
                </Card>
                <Card>
                    <h2 className="text-xl font-bold text-white mb-4">Deposit Requests</h2>
                    {pendingDeposits.length > 0 ? (
                        <div className="overflow-x-auto max-h-96">
                             <table className="w-full text-sm text-left">
                                <thead className="text-xs text-basetitan-text-secondary uppercase bg-basetitan-dark sticky top-0"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-center">Action</th></tr></thead>
                                <tbody>{pendingDeposits.map(req => (<tr key={req.id} className="border-b border-basetitan-border hover:bg-basetitan-dark"><td className="px-4 py-3 font-semibold">{req.userName}</td><td className="px-4 py-3 font-mono text-right">{req.amount.toFixed(8)} {req.asset}</td><td className="px-4 py-3 text-center"><button onClick={() => setReviewingDeposit(req)} className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-1 px-3 rounded-md text-xs">Review</button></td></tr>))}</tbody>
                            </table>
                        </div>
                    ) : <p className="text-basetitan-text-secondary text-center py-4">No pending deposit requests.</p>}
                </Card>
                <Card>
                    <h2 className="text-xl font-bold text-white mb-4">Investment Approvals</h2>
                    {allActiveInvestments.length > 0 ? (
                        <div className="overflow-x-auto max-h-96">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-basetitan-text-secondary uppercase bg-basetitan-dark sticky top-0"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-center">Action</th></tr></thead>
                                <tbody>{allActiveInvestments.map(inv => (<tr key={inv.id} className="border-b border-basetitan-border hover:bg-basetitan-dark"><td className="px-4 py-3 font-semibold">{inv.userName}</td><td className="px-4 py-3 font-mono text-right">{inv.amountInvested.toFixed(2)} {inv.asset}</td><td className="px-4 py-3 text-center"><button onClick={() => approveInvestment(inv.userId, inv.id)} className="bg-accent-secondary hover:bg-accent-secondary-hover text-white font-bold py-1 px-3 rounded-md text-xs">Approve</button></td></tr>))}</tbody>
                            </table>
                        </div>
                    ) : <p className="text-basetitan-text-secondary text-center py-4">No active investments.</p>}
                </Card>
                <Card>
                    <h2 className="text-xl font-bold text-white mb-4">Withdrawal Requests</h2>
                    {pendingWithdrawals.length > 0 ? (
                        <div className="overflow-x-auto max-h-96">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-basetitan-text-secondary uppercase bg-basetitan-dark sticky top-0"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-center">Actions</th></tr></thead>
                                <tbody>{pendingWithdrawals.map(req => (<tr key={req.id} className="border-b border-basetitan-border hover:bg-basetitan-dark"><td className="px-4 py-3 font-semibold" title={`Address: ${req.address}\n2FA: ${req.twoFactorCode}`}>{req.userName}</td><td className="px-4 py-3 font-mono text-right">{req.amount.toFixed(2)} {req.asset}</td><td className="px-4 py-3 text-center space-x-2"><button onClick={() => approveWithdrawal(req.id)} className="bg-accent-secondary hover:bg-accent-secondary-hover text-white font-bold py-1 px-2 rounded-md text-xs">Approve</button><button onClick={() => rejectWithdrawal(req.id)} className="bg-accent-danger hover:opacity-80 text-white font-bold py-1 px-2 rounded-md text-xs">Reject</button></td></tr>))}</tbody>
                            </table>
                        </div>
                    ) : <p className="text-basetitan-text-secondary text-center py-4">No pending withdrawals.</p>}
                </Card>
                 <Card>
                    <h2 className="text-xl font-bold text-white mb-4">Verification Requests</h2>
                    {pendingVerifications.length > 0 ? (
                        <div className="overflow-x-auto max-h-96">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-basetitan-text-secondary uppercase bg-basetitan-dark sticky top-0"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Email</th><th className="px-4 py-3 text-center">Action</th></tr></thead>
                                <tbody>{pendingVerifications.map(user => (<tr key={user.id} className="border-b border-basetitan-border hover:bg-basetitan-dark"><td className="px-4 py-3 font-semibold">{user.name}</td><td className="px-4 py-3">{user.email}</td><td className="px-4 py-3 text-center"><button onClick={() => setReviewingUser(user)} className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-1 px-3 rounded-md text-xs">Review</button></td></tr>))}</tbody>
                            </table>
                        </div>
                    ) : <p className="text-basetitan-text-secondary text-center py-4">No pending verification requests.</p>}
                </Card>
                 <Card>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center">Contact Messages {unreadContactMessages.length > 0 && <span className="ml-3 bg-accent-primary text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">{unreadContactMessages.length}</span>}</h2>
                    {contactMessages.length > 0 ? (
                         <div className="overflow-x-auto max-h-96">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-basetitan-text-secondary uppercase bg-basetitan-dark sticky top-0"><tr><th className="px-4 py-3">From</th><th className="px-4 py-3">Message</th><th className="px-4 py-3 text-center">Action</th></tr></thead>
                                <tbody>{contactMessages.map(msg => (<tr key={msg.id} className={`border-b border-basetitan-border ${msg.read ? 'opacity-60' : 'hover:bg-basetitan-dark'}`}><td className="px-4 py-3 align-top"><p className="font-semibold">{msg.name}</p><p className="text-xs text-basetitan-text-secondary">{msg.email}</p><p className="text-xs text-basetitan-text-secondary mt-1">{msg.date}</p></td><td className="px-4 py-3 whitespace-pre-wrap align-top">{msg.message}</td><td className="px-4 py-3 text-center align-top">{!msg.read && <button onClick={() => markContactMessageAsRead(msg.id)} className="bg-accent-secondary hover:bg-accent-secondary-hover text-white font-bold py-1 px-3 rounded-md text-xs">Mark Read</button>}</td></tr>))}</tbody>
                            </table>
                         </div>
                    ) : <p className="text-basetitan-text-secondary text-center py-4">No contact messages.</p>}
                </Card>
            </div>

            <Card>
                <h2 className="text-xl font-bold text-white mb-4">Live Chat Support</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ minHeight: '500px' }}>
                    <div className="md:col-span-1 border-r border-basetitan-border pr-4 max-h-[500px] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-3">Sessions</h3>
                        <ul className="space-y-2">
                            {liveChatSessions.length === 0 && <p className="text-basetitan-text-secondary text-sm">No active chat sessions.</p>}
                            {liveChatSessions.map(session => (
                                <li key={session.userId}><button onClick={() => handleSelectChat(session)} className={`w-full text-left p-3 rounded-lg flex justify-between items-center ${selectedChat?.userId === session.userId ? 'bg-accent-primary/20' : 'hover:bg-basetitan-dark'}`}><span>{session.userName}</span>{session.hasUnreadUserMessage && <span className="h-2.5 w-2.5 bg-accent-primary rounded-full animate-pulse"></span>}</button></li>
                            ))}
                        </ul>
                    </div>
                    <div className="md:col-span-2 flex flex-col bg-basetitan-dark rounded-lg">
                        {selectedChat ? (
                            <><div className="flex-1 p-4 overflow-y-auto space-y-4">{selectedChat.messages.map((msg, index) => (<div key={index} className={`flex items-start gap-3 ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>{msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0 font-bold">{selectedChat.userName[0]}</div>}<div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'admin' ? 'bg-accent-primary text-white rounded-br-none' : 'bg-basetitan-dark text-basetitan-text rounded-bl-none'}`}><p className="text-sm whitespace-pre-wrap">{msg.text}</p></div></div>))}<div ref={chatMessagesEndRef} /></div><div className="p-4 border-t border-basetitan-border flex items-center space-x-2"><input type="text" value={adminReply} onChange={(e) => setAdminReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendReply()} placeholder={`Reply to ${selectedChat.userName}...`} className="flex-1 bg-basetitan-light border border-basetitan-border rounded-lg px-4 py-2 focus:ring-accent-primary focus:border-accent-primary" /><button onClick={handleSendReply} disabled={!adminReply.trim()} className="bg-accent-primary text-white rounded-lg p-2 disabled:opacity-50 hover:bg-accent-primary-hover">Send</button></div></>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-center text-basetitan-text-secondary"><div><Icon className="w-16 h-16 mx-auto">{SUPPORT_ICON}</Icon><p className="mt-2">Select a session to view the chat.</p></div></div>
                        )}
                    </div>
                </div>
            </Card>

        </div>
    );
};

export default AdminPanel;