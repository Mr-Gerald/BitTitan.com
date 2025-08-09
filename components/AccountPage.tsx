import React, { useContext, useState } from 'react';
import { AuthContext } from './auth/AuthContext';
import Card from './shared/Card';
import Icon from './shared/Icon';
import { VERIFIED_BADGE_ICON, SHIELD_ICON } from '../constants';
import { Page } from '../types';
import EditProfileModal from './shared/EditProfileModal';
import ChangePasswordModal from './shared/ChangePasswordModal';
import Enable2FAModal from './shared/Enable2FAModal';
import ConfirmationModal from './shared/ConfirmationModal';

const InfoRow: React.FC<{ label: string, value?: string }> = ({ label, value }) => (
    <div className="flex justify-between py-3 border-b border-basetitan-dark">
        <p className="text-basetitan-text-secondary">{label}</p>
        <p className="text-white text-right">{value || <span className="text-basetitan-text-secondary">Not set</span>}</p>
    </div>
);

const AccountPage: React.FC = () => {
    const auth = useContext(AuthContext);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showEnable2FA, setShowEnable2FA] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const user = auth?.user;

    if (!user || !auth) {
        return <div className="p-8"><h1 className="text-3xl font-bold">User not found.</h1></div>;
    }
    
    const totalBalanceUSD = user.balances.USDT + (user.balances.BTC * 67100) + (user.balances.ETH * 3500);
    const { verificationStatus } = user;

    const handleDeleteAccount = () => {
        auth?.deleteAccount(user.id);
        // The context will handle logging out and redirecting.
    }

    return (
        <div className="p-4 md:p-8 space-y-8">
             {showEditProfile && <EditProfileModal user={user} onClose={() => setShowEditProfile(false)} />}
             {showChangePassword && <ChangePasswordModal userId={user.id} onClose={() => setShowChangePassword(false)} />}
             {showEnable2FA && <Enable2FAModal userId={user.id} onClose={() => setShowEnable2FA(false)} />}
             {showDeleteConfirm && (
                <ConfirmationModal 
                    title="Delete Account"
                    message="Are you sure you want to permanently delete your account? This action cannot be undone."
                    confirmText="Delete My Account"
                    onConfirm={handleDeleteAccount}
                    onClose={() => setShowDeleteConfirm(false)}
                />
             )}

            <Card className="max-w-4xl mx-auto">
                <div className="relative">
                    <div className="absolute top-0 right-0">
                        <button onClick={() => setShowEditProfile(true)} className="bg-basetitan-dark hover:bg-basetitan-border text-white font-bold py-2 px-4 rounded-md text-sm">Edit Profile</button>
                    </div>
                    <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="User Avatar" className="w-32 h-32 rounded-full border-4 border-basetitan-border mb-4 md:mb-0 flex-shrink-0 object-cover" />
                        ) : (
                            <div className="w-32 h-32 rounded-full border-4 border-basetitan-border mb-4 md:mb-0 bg-accent-primary flex items-center justify-center text-white font-bold text-4xl flex-shrink-0">
                                <span>{user.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}</span>
                            </div>
                        )}
                        <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
                            <h1 className="text-4xl font-bold text-white flex items-center justify-center md:justify-start">
                                {user.fullName}
                                {user.verificationStatus === 'Verified' && <span className="ml-3 w-7 h-7">{VERIFIED_BADGE_ICON}</span>}
                            </h1>
                            <p className="text-lg text-basetitan-text-secondary mt-1">@{user.name}</p>
                            <div className="flex items-center justify-center md:justify-start space-x-2 mt-4">
                                {user.badges.map(badge => (
                                    <span key={badge} className="bg-accent-primary/20 text-accent-primary text-sm font-semibold px-3 py-1 rounded-full flex items-center space-x-2">
                                        <span>{badge}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                 
                 <div className="mt-8 border-t border-basetitan-border pt-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Personal Information</h2>
                    <div className="text-sm">
                        <InfoRow label="Email Address" value={user.email} />
                        <InfoRow label="Phone Number" value={user.phone} />
                        <InfoRow label="Country" value={user.country} />
                        <InfoRow label="Date of Birth" value={user.dateOfBirth} />
                        <InfoRow label="Bio" value={user.bio} />
                    </div>
                 </div>

                <div className="mt-8 border-t border-basetitan-border pt-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Account Verification</h2>
                    {verificationStatus === 'Verified' && (
                        <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-lg flex items-center">
                            <div className="w-6 h-6 mr-3 flex-shrink-0">{VERIFIED_BADGE_ICON}</div>
                            <p className="font-semibold">Your account is verified.</p>
                        </div>
                    )}
                    {verificationStatus === 'Pending' && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 p-4 rounded-lg">
                            <p className="font-semibold">Verification Pending</p>
                            <p className="text-sm">Your documents are under review. This usually takes 1-2 business days.</p>
                        </div>
                    )}
                    {(verificationStatus === 'Not Verified' || verificationStatus === 'Rejected') && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg">
                            {verificationStatus === 'Rejected' && <p className="font-semibold">Verification Rejected. Please try again.</p>}
                            <p className="text-sm mb-4">To enable all features, including withdrawals, you need to verify your identity.</p>
                            <button onClick={() => auth.navigateTo(Page.Verification)} className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-2 px-6 rounded-md">
                                Verify Account Now
                            </button>
                        </div>
                    )}
                </div>


                <div className="mt-8 border-t border-basetitan-border pt-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Account Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-basetitan-dark p-6 rounded-lg">
                            <h3 className="text-basetitan-text-secondary font-semibold">Total Net Worth (USD)</h3>
                            <p className="text-3xl font-bold text-white mt-2">${totalBalanceUSD.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                        </div>
                        <div className="bg-basetitan-dark p-6 rounded-lg">
                            <h3 className="text-basetitan-text-secondary font-semibold">BTC Balance</h3>
                            <p className="text-3xl font-bold text-white mt-2">{user.balances.BTC.toFixed(6)}</p>
                        </div>
                         <div className="bg-basetitan-dark p-6 rounded-lg">
                            <h3 className="text-basetitan-text-secondary font-semibold">USDT Balance</h3>
                            <p className="text-3xl font-bold text-white mt-2">${user.balances.USDT.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                        </div>
                    </div>
                </div>

                 <div className="mt-8 border-t border-basetitan-border pt-8">
                     <h2 className="text-2xl font-bold text-white mb-4">Security Settings</h2>
                     <div className="space-y-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row">
                        <button onClick={() => setShowChangePassword(true)} className="w-full md:w-auto bg-basetitan-dark hover:bg-basetitan-border text-white font-bold py-2 px-6 rounded-md">Change Password</button>
                        <button onClick={() => user.is2FAEnabled ? auth.toggle2FA(user.id) : setShowEnable2FA(true)} className={`w-full md:w-auto text-white font-bold py-2 px-6 rounded-md ${user.is2FAEnabled ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-basetitan-dark hover:bg-basetitan-border'}`}>
                            {user.is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                        </button>
                        <button onClick={() => setShowDeleteConfirm(true)} className="w-full md:w-auto bg-accent-danger/80 hover:bg-accent-danger text-white font-bold py-2 px-6 rounded-md">Delete Account</button>
                     </div>
                 </div>
            </Card>
        </div>
    );
};

export default AccountPage;