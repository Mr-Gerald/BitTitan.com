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
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);

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

  // Handle email verification link
   useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('verifyToken');
    if (token && auth?.verifyEmail) {
      const result = auth.verifyEmail(token);
      if (result.success) {
        setShowVerificationSuccess(true);
        // Clean the URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [auth]);
  
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

  const VerificationSuccessModal = () => (
     <div className="fixed inset-0 bg-black bg-opacity-70 z-[70] flex items-center justify-center animate-fade-in p-4">
        <Card className="w-full max-w-md relative animate-fade-in-up text-center">
            <div className="w-16 h-16 mx-auto bg-accent-secondary rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Email Verified!</h2>
            <p className="text-basetitan-text-secondary mt-2">Your email has been successfully verified. You can now log in to your account.</p>
            <div className="mt-6">
                <button onClick={() => {
                    setShowVerificationSuccess(false);
                    handleOpenLogin();
                }} className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-2 px-6 rounded-md">
                    Proceed to Login
                </button>
            </div>
        </Card>
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
        {showVerificationSuccess && <VerificationSuccessModal />}
        {(isLoginModalOpen || isSignupModalOpen) && (
            <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center animate-fade-in">
                 <LoginPage 
                    isLoginDefault={isLoginModalOpen} 
                    onClose={handleCloseModals}
                    onSwitchToSignup={handleOpenSignup}
                    onSwitchToLogin={handleOpenLogin}
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