import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import Icon from '../shared/Icon';
import { LOGO_ICON, CLOSE_ICON, COUNTRIES } from '../../constants';

interface LoginPageProps {
    isLoginDefault: boolean;
    onClose: () => void;
    onSwitchToSignup: () => void;
    onSwitchToLogin: () => void;
}

const SignupStatusFeedback: React.FC<{
    status: 'loading' | 'success';
    onProceed: () => void;
}> = ({ status, onProceed }) => {
    return (
        <div className="text-center p-8">
            {status === 'loading' ? (
                <>
                    <div className="w-16 h-16 mx-auto border-4 border-accent-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <h2 className="text-2xl font-bold text-white">Creating Your Account...</h2>
                    <p className="text-basetitan-text-secondary mt-2">Please wait while we set things up.</p>
                </>
            ) : (
                <>
                    <div className="w-16 h-16 mx-auto bg-accent-secondary rounded-full flex items-center justify-center mb-4 animate-fade-in-up">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Account Created Successfully!</h2>
                    <p className="text-basetitan-text-secondary mt-2">You can now log in with your new credentials.</p>
                    <div className="mt-6">
                        <button 
                            onClick={onProceed}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-primary hover:bg-accent-primary-hover">
                            Proceed to Login
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};


const LoginPage: React.FC<LoginPageProps> = ({ isLoginDefault, onClose, onSwitchToSignup, onSwitchToLogin }) => {
    const [isLoginView, setIsLoginView] = useState(isLoginDefault);
    const [signupStatus, setSignupStatus] = useState<'form' | 'loading' | 'success'>('form');
    
    // Shared state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    // Signup-specific state
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [country, setCountry] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);

    const auth = useContext(AuthContext);

    useEffect(() => {
        setIsLoginView(isLoginDefault);
        clearFormState();
    }, [isLoginDefault]);

    const clearFormState = () => {
        setUsername('');
        setPassword('');
        setFullName('');
        setEmail('');
        setPhone('');
        setCountry('');
        setDateOfBirth('');
        setConfirmPassword('');
        setTermsAccepted(false);
        setError('');
        setSignupStatus('form');
    }

    const handleLogin = async () => {
        const result = auth?.login(username, password);
        if (!result?.success) {
            setError('Invalid username or password.');
        }
        // On success, the modal will be closed by the App component's useEffect
    };

    const handleSignup = async () => {
        if (!fullName || !username || !email || !password || !country || !dateOfBirth || !phone) {
            setError('All fields are required.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
         if (!termsAccepted) {
            setError('You must accept the terms and conditions.');
            return;
        }

        setSignupStatus('loading');

        if (auth?.signup) {
            // Simulate network delay for better UX
            setTimeout(async () => {
                const result = await auth.signup(fullName, username, email, password, country, dateOfBirth, phone);
                if(result.success) {
                    setSignupStatus('success');
                } else {
                    setError(result.error || 'An unexpected error occurred.');
                    setSignupStatus('form');
                }
            }, 1500);
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (isLoginView) {
           handleLogin();
        } else {
           handleSignup();
        }
    };

    const handleSwitchView = () => {
        clearFormState();
        if (isLoginView) {
            onSwitchToSignup();
        } else {
            onSwitchToLogin();
        }
    }

    const handleProceedToLogin = () => {
        clearFormState();
        onSwitchToLogin();
    }

    if (!isLoginView && signupStatus !== 'form') {
        return (
             <div className="relative w-full max-w-md p-6 md:p-8 space-y-6 bg-basetitan-light rounded-xl shadow-2xl animate-fade-in-up">
                <SignupStatusFeedback status={signupStatus} onProceed={handleProceedToLogin} />
             </div>
        )
    }


    return (
        <div className="relative w-full max-w-md p-6 md:p-8 space-y-6 bg-basetitan-light rounded-xl shadow-2xl animate-fade-in-up">
            <button onClick={onClose} className="absolute top-4 right-4 text-basetitan-text-secondary hover:text-white">
                <Icon>{CLOSE_ICON}</Icon>
            </button>
            <div className="text-center">
                <Icon className="w-12 h-12 md:w-16 md:h-16 text-accent-primary mx-auto">{LOGO_ICON}</Icon>
                <h2 className="mt-4 text-2xl md:text-3xl font-extrabold text-white">
                    {isLoginView ? 'Welcome Back' : 'Create an Account'}
                </h2>
                <p className="mt-2 text-sm text-basetitan-text-secondary">
                    {isLoginView ? "Sign in to access your dashboard" : 'Join us and start your investment journey'}
                </p>
            </div>
            <form className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-2" onSubmit={handleSubmit}>
                {!isLoginView && (
                    <>
                         <div>
                            <label htmlFor="fullName" className="sr-only">Full Name</label>
                            <input id="fullName" name="fullName" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-3 py-2 border border-basetitan-border rounded-md bg-basetitan-dark placeholder-basetitan-text-secondary focus:outline-none focus:ring-accent-primary focus:border-accent-primary"
                                placeholder="Full Name" />
                        </div>
                         <div>
                            <label htmlFor="country" className="sr-only">Country</label>
                            <select id="country" name="country" required value={country} onChange={(e) => setCountry(e.target.value)}
                                className="w-full px-3 py-2 border border-basetitan-border rounded-md bg-basetitan-dark placeholder-basetitan-text-secondary focus:outline-none focus:ring-accent-primary focus:border-accent-primary text-white">
                                <option value="" disabled>Select your country</option>
                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="dateOfBirth" className="text-sm text-basetitan-text-secondary px-1">Date of Birth</label>
                            <input id="dateOfBirth" name="dateOfBirth" type="date" required value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)}
                                className="w-full px-3 py-2 border border-basetitan-border rounded-md bg-basetitan-dark placeholder-basetitan-text-secondary focus:outline-none focus:ring-accent-primary focus:border-accent-primary"
                                placeholder="Date of Birth" />
                        </div>
                        <div>
                             <label htmlFor="email" className="sr-only">Email address</label>
                            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-basetitan-border rounded-md bg-basetitan-dark placeholder-basetitan-text-secondary focus:outline-none focus:ring-accent-primary focus:border-accent-primary"
                                placeholder="Email address" />
                        </div>
                        <div>
                             <label htmlFor="phone" className="sr-only">Phone Number</label>
                            <input id="phone" name="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-3 py-2 border border-basetitan-border rounded-md bg-basetitan-dark placeholder-basetitan-text-secondary focus:outline-none focus:ring-accent-primary focus:border-accent-primary"
                                placeholder="Phone Number" />
                        </div>
                    </>
                )}
                <div>
                    <label htmlFor="username" className="sr-only">Username</label>
                    <input id="username" name="username" type="text" autoComplete={isLoginView ? "username" : "off"} required value={username} onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 border border-basetitan-border rounded-md bg-basetitan-dark placeholder-basetitan-text-secondary focus:outline-none focus:ring-accent-primary focus:border-accent-primary"
                        placeholder="Username" />
                </div>
                <div>
                    <label htmlFor="password" className="sr-only">Password</label>
                    <input id="password" name="password" type="password" autoComplete={isLoginView ? "current-password" : "new-password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-basetitan-border rounded-md bg-basetitan-dark placeholder-basetitan-text-secondary focus:outline-none focus:ring-accent-primary focus:border-accent-primary"
                        placeholder="Password" />
                </div>
                 {!isLoginView && (
                    <>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                            <input id="confirmPassword" name="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-basetitan-border rounded-md bg-basetitan-dark placeholder-basetitan-text-secondary focus:outline-none focus:ring-accent-primary focus:border-accent-primary"
                                placeholder="Confirm Password" />
                        </div>
                        <div className="flex items-center">
                            <input id="terms" name="terms" type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}
                                className="h-4 w-4 text-accent-primary bg-basetitan-dark border-basetitan-border rounded focus:ring-accent-primary" />
                            <label htmlFor="terms" className="ml-2 block text-sm text-basetitan-text-secondary">
                                I agree to the <a href="#" className="font-medium text-accent-primary hover:underline">Terms and Conditions</a>
                            </label>
                        </div>
                    </>
                 )}
                {error && <p className="text-sm text-accent-danger text-center">{error}</p>}
                <div>
                    <button type="submit"
                        disabled={!isLoginView && !termsAccepted}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-primary hover:bg-accent-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-basetitan-light focus:ring-accent-primary disabled:bg-gray-500 disabled:cursor-not-allowed">
                        {isLoginView ? 'Sign In' : 'Sign Up'}
                    </button>
                </div>
            </form>
            <div className="text-sm text-center">
                <button onClick={handleSwitchView} className="font-medium text-accent-primary hover:text-accent-primary-hover">
                    {isLoginView ? 'Don\'t have an account? Sign Up' : 'Already have an account? Sign In'}
                </button>
            </div>
        </div>
    );
};

export default LoginPage;