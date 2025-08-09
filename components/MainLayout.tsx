import React, { useState, useContext } from 'react';
import { Page } from '../types';
import { HOME_ICON, TRADE_ICON, INVEST_ICON, WALLET_ICON, ACCOUNT_ICON, LOGO_ICON, LOGOUT_ICON, MENU_ICON, CLOSE_ICON, AI_ICON, ADMIN_ICON, PORTFOLIO_ICON, ALT_INVEST_ICON, HISTORY_ICON, LOGIN_STREAK_ICON, SUPPORT_ICON, NOTIFICATION_ICON } from '../constants';
import Dashboard from './Dashboard';
import TradingTerminal from './TradingTerminal';
import InvestmentPlans from './InvestmentPlans';
import Wallet from './Wallet';
import AIAssistant from './AIAssistant';
import Icon from './shared/Icon';
import { AuthContext } from './auth/AuthContext';
import AccountPage from './AccountPage';
import AdminPanel from './admin/AdminPanel';
import Portfolio from './Portfolio';
import AlternativeInvestments from './AlternativeInvestments';
import InvestmentHistory from './InvestmentHistory';
import ConfirmationModal from './shared/ConfirmationModal';
import LiveChat from './shared/LiveChat';
import VerificationFlow from './verification/VerificationFlow';
import NotificationBell from './shared/NotificationBell';
import GenerateAccountPage from './admin/GenerateAccountPage';

const MainLayout: React.FC = () => {
    const auth = useContext(AuthContext);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
    const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    if (!auth || !auth.user) return null;
    const { user, logout, activePage, navigateTo } = auth;
    
    const session = auth.liveChatSessions.find(s => s.userId === user?.id);
    const hasUnreadAdminMessage = session?.hasUnreadAdminMessage ?? false;

    const handleToggleLiveChat = () => {
        setIsLiveChatOpen(prev => !prev);
        if (!isLiveChatOpen && user) { // If opening the chat
            auth.markUserChatAsRead(user.id);
        }
    }
    
    const renderPage = () => {
        switch (activePage) {
            case Page.Dashboard: return <Dashboard />;
            case Page.Trade: return user.isAdmin ? <Dashboard /> : <TradingTerminal />;
            case Page.Invest: return user.isAdmin ? <Dashboard /> : <InvestmentPlans />;
            case Page.Wallet: return <Wallet />;
            case Page.Account: return <AccountPage />;
            case Page.Admin: return user.isAdmin ? <AdminPanel /> : <Dashboard />;
            case Page.Portfolio: return user.isAdmin ? <Dashboard /> : <Portfolio />;
            case Page.AlternativeInvestments: return user.isAdmin ? <Dashboard /> : <AlternativeInvestments />;
            case Page.InvestmentHistory: return user.isAdmin ? <Dashboard /> : <InvestmentHistory />;
            case Page.Verification: return user.isAdmin ? <Dashboard /> : <VerificationFlow />;
            case Page.GenerateAccount: return user.isAdmin ? <GenerateAccountPage /> : <Dashboard />;
            default: return <Dashboard />;
        }
    };

    const NavItem: React.FC<{ page: Page; label: string; icon: React.ReactNode; }> = ({ page, label, icon }) => (
        <button
            onClick={() => {
                if (activePage === page) return;
                setIsSidebarOpen(false);
                navigateTo(page);
            }}
            className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
                activePage === page ? 'bg-accent-primary text-white' : 'text-basetitan-text-secondary hover:bg-basetitan-light hover:text-white'
            }`}
        >
            <Icon>{icon}</Icon>
            <span className="ml-4 font-semibold">{label}</span>
        </button>
    );

    const MobileNavItem: React.FC<{ page: Page; label: string; icon: React.ReactNode; }> = ({ page, label, icon }) => (
        <button
            onClick={() => {
                 if (activePage === page) return;
                 navigateTo(page);
            }}
            className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
            activePage === page ? 'text-accent-primary' : 'text-basetitan-text-secondary hover:text-accent-primary'
            }`}
        >
            <Icon className="w-6 h-6">{icon}</Icon>
            <span className="text-xs mt-1">{label}</span>
        </button>
    );

    const sidebarContent = (
        <>
            <div className="flex items-center justify-center px-4 pt-6 pb-8">
                <Icon className="w-10 h-10 text-accent-primary">{LOGO_ICON}</Icon>
                <span className="ml-3 text-2xl font-bold text-white">BitTitan</span>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                <NavItem page={Page.Dashboard} label="Dashboard" icon={HOME_ICON} />
                {user.isAdmin ? (
                    <NavItem page={Page.Admin} label="Admin Panel" icon={ADMIN_ICON} />
                ) : (
                    <>
                        <NavItem page={Page.Portfolio} label="Portfolio" icon={PORTFOLIO_ICON} />
                        <NavItem page={Page.Trade} label="Trade" icon={TRADE_ICON} />
                        <NavItem page={Page.Invest} label="Crypto Invest" icon={INVEST_ICON} />
                        <NavItem page={Page.AlternativeInvestments} label="Alt Invest" icon={ALT_INVEST_ICON} />
                        <NavItem page={Page.Wallet} label="Wallet" icon={WALLET_ICON} />
                        <NavItem page={Page.InvestmentHistory} label="Invest History" icon={HISTORY_ICON} />
                    </>
                )}
                 <NavItem page={Page.Account} label="Account" icon={ACCOUNT_ICON} />
            </nav>
            <div className="px-4 pb-4 mt-auto">
                <button onClick={() => setShowLogoutConfirm(true)} className="flex items-center w-full px-4 py-3 text-basetitan-text-secondary rounded-lg hover:bg-basetitan-light hover:text-white">
                <Icon>{LOGOUT_ICON}</Icon>
                <span className="ml-4 font-semibold">Logout</span>
                </button>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-basetitan-dark text-basetitan-text overflow-hidden">
            {showLogoutConfirm && (
                <ConfirmationModal
                    title="Confirm Logout"
                    message="Are you sure you want to log out of your account?"
                    onConfirm={logout}
                    onClose={() => setShowLogoutConfirm(false)}
                />
            )}
            {/* Sidebar for Desktop */}
            <aside className="hidden lg:flex lg:flex-col w-64 bg-basetitan-light border-r border-basetitan-border">
                {sidebarContent}
            </aside>
            {/* Mobile Sidebar (Drawer) */}
            {isSidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-40 flex">
                    <div className="fixed inset-0 bg-black opacity-50" onClick={() => setIsSidebarOpen(false)}></div>
                    <div className="relative flex flex-col w-64 max-w-xs h-full bg-basetitan-light border-r border-basetitan-border animate-notification-in">
                        <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 text-basetitan-text-secondary hover:text-white">
                            <Icon className="w-6 h-6">{CLOSE_ICON}</Icon>
                        </button>
                        {sidebarContent}
                    </div>
                </div>
            )}

            <div className="flex flex-col flex-1 w-full">
                {/* Header */}
                <header className="flex items-center justify-between h-16 px-4 md:px-8 bg-basetitan-light border-b border-basetitan-border flex-shrink-0">
                    <div className="flex items-center">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden text-basetitan-text-secondary mr-4">
                            <Icon className="w-6 h-6">{MENU_ICON}</Icon>
                        </button>
                        <h1 className="text-xl font-bold text-white">{activePage}</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        {!user.isAdmin && (
                            <>
                                <div className="pt-1">
                                    <NotificationBell />
                                </div>
                                <button 
                                    onClick={handleToggleLiveChat} 
                                    className="relative text-basetitan-text-secondary hover:text-white"
                                    aria-label="Live Support"
                                >
                                    <Icon className="w-6 h-6">{SUPPORT_ICON}</Icon>
                                    {hasUnreadAdminMessage && !isLiveChatOpen && (
                                        <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-1 ring-basetitan-light"></span>
                                    )}
                                </button>
                            </>
                        )}
                        {user.loginStreak > 0 && (
                             <div className="flex items-center space-x-1 text-orange-400">
                                <Icon className="w-5 h-5 fill-current">{LOGIN_STREAK_ICON}</Icon>
                                <span className="font-bold text-sm">{user.loginStreak}</span>
                            </div>
                        )}
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-white">{user.fullName}</p>
                            <p className="text-xs text-basetitan-text-secondary">{user.email}</p>
                        </div>
                        <button onClick={() => navigateTo(Page.Account)} className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-basetitan-light focus:ring-accent-primary rounded-full">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt="User Avatar" className="w-10 h-10 rounded-full object-cover" />
                             ) : (
                                <div className="w-10 h-10 rounded-full bg-accent-primary flex items-center justify-center text-white font-bold">
                                    <span>{user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}</span>
                                </div>
                            )}
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-basetitan-dark pb-24 lg:pb-0">
                    {renderPage()}
                </main>
                
                {/* Mobile Bottom Navigation */}
                 <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-basetitan-light border-t border-basetitan-border flex justify-around">
                    <MobileNavItem page={Page.Dashboard} label="Home" icon={HOME_ICON} />
                    {user.isAdmin ? (
                        <MobileNavItem page={Page.Admin} label="Admin" icon={ADMIN_ICON} />
                    ) : (
                        <>
                            <MobileNavItem page={Page.Portfolio} label="Portfolio" icon={PORTFOLIO_ICON} />
                            <MobileNavItem page={Page.Trade} label="Trade" icon={TRADE_ICON} />
                            <MobileNavItem page={Page.Invest} label="Invest" icon={INVEST_ICON} />
                            <MobileNavItem page={Page.Wallet} label="Wallet" icon={WALLET_ICON} />
                        </>
                    )}
                </nav>
            </div>

            {isLiveChatOpen && (
                <div className="fixed inset-0 lg:inset-auto lg:bottom-24 lg:right-6 z-20 w-full lg:w-[440px] h-full lg:h-[600px] lg:rounded-xl overflow-hidden shadow-2xl animate-fade-in-up">
                    <LiveChat onClose={() => setIsLiveChatOpen(false)} />
                </div>
            )}

            {/* AI Assistant FAB and Modal */}
            <div className="fixed bottom-24 right-6 lg:bottom-6 lg:right-6 z-30">
                <button 
                onClick={() => setIsAiAssistantOpen(!isAiAssistantOpen)}
                className="bg-accent-primary hover:bg-accent-primary-hover text-white rounded-full p-4 shadow-lg transform hover:scale-110 transition-transform duration-200"
                >
                <Icon className="w-8 h-8">{isAiAssistantOpen ? CLOSE_ICON : AI_ICON}</Icon>
                </button>
            </div>

            {isAiAssistantOpen && (
                <div className="fixed inset-0 lg:inset-auto lg:bottom-24 lg:right-6 z-20 w-full lg:w-[440px] h-full lg:h-[600px] lg:rounded-xl overflow-hidden shadow-2xl animate-fade-in-up">
                    <AIAssistant onClose={() => setIsAiAssistantOpen(false)} />
                </div>
            )}
        </div>
    );
};

export default MainLayout;