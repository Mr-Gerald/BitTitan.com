import React, { useState, useContext, useEffect, useLayoutEffect } from 'react';
import { LiveNotificationData } from './types';
import { LIVE_PROFIT_NOTIFICATIONS, LOGO_ICON } from './constants';
import { AuthContext } from './components/auth/AuthContext';
import LoginPage from './components/auth/LoginPage';
import LiveNotification from './components/shared/LiveNotification';
import LandingPage from './components/LandingPage';
import MainLayout from './components/MainLayout';
import InviteBonusModal from './components/shared/InviteBonusModal';
import Icon from './components/shared/Icon';
import Card from './components/shared/Card';

const App: React.FC = () => {
  const auth = useContext(AuthContext);
  const [notification, setNotification] = useState<LiveNotificationData | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [showInviteBonus, setShowInviteBonus] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  
  useEffect(() => {
    // This effect runs for all visitors, logged in or not.
    const interval = setInterval(() => {
      const randomNotification = LIVE_PROFIT_NOTIFICATIONS[Math.floor(Math.random() * LIVE_PROFIT_NOTIFICATIONS.length)];
      setNotification(randomNotification);
      setTimeout(() => setNotification(null), 5000); // Notification stays for 5s
    }, 10000); // New notification every 10s

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check for referral code in URL on initial load
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      setIsSignupModalOpen(true); // Automatically open signup modal
    }
  }, []);

  useEffect(() => {
    if (auth?.user) {
      // Close modals on successful login/signup
      setIsLoginModalOpen(false);
      setIsSignupModalOpen(false);
      
      const wasJustLoggedIn = auth.checkAndResetLoginFlag?.();
      if (wasJustLoggedIn) {
          setShowInviteBonus(true);
      }
    }
  }, [auth, auth?.user]);
  
  const handleOpenLogin = () => {
    setIsSignupModalOpen(false);
    setIsLoginModalOpen(true);
  };
  
  const handleOpenSignup = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(false);
  }

  const NotificationComponent = (
     <div className="fixed top-6 right-6 z-50">
        {notification && <LiveNotification data={notification} onClose={() => setNotification(null)} />}
     </div>
  );

  if (auth?.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-basetitan-dark">
        <div className="text-center">
            <Icon className="w-16 h-16 text-accent-primary mx-auto animate-pulse">{LOGO_ICON}</Icon>
            <p className="text-basetitan-text-secondary mt-4">Syncing with secure cloud...</p>
        </div>
      </div>
    );
  }

  if (!auth?.user) {
    return (
      <>
        <LandingPage onLoginClick={handleOpenLogin} onSignupClick={handleOpenSignup} />
        {(isLoginModalOpen || isSignupModalOpen) && (
            <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center animate-fade-in">
                 <LoginPage 
                    isLoginDefault={isLoginModalOpen} 
                    onClose={handleCloseModals}
                    onSwitchToSignup={handleOpenSignup}
                    onSwitchToLogin={handleOpenLogin}
                    referralCode={referralCode}
                 />
            </div>
        )}
        {NotificationComponent}
      </>
    );
  }

  return (
    <>
      <MainLayout />
      {showInviteBonus && <InviteBonusModal onClose={() => setShowInviteBonus(false)} referralCode={auth.user.referralCode} />}
      {NotificationComponent}
    </>
  );
};

export default App;