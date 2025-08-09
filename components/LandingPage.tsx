

import React, { useState, useEffect, useMemo, useRef, useContext } from 'react';
import Icon from './shared/Icon';
import { LOGO_ICON, VERIFIED_BADGE_ICON, AI_ICON, SHIELD_ICON, MENU_ICON, CLOSE_ICON, WALLET_ICON, INVEST_ICON, USERS_ICON, HOME_ICON, TRADE_ICON, PORTFOLIO_ICON, ACCOUNT_ICON, LOGOUT_ICON, ALT_INVEST_ICON, HISTORY_ICON, SUPPORT_ICON, EMAIL_ICON } from '../constants';
import Card from './shared/Card';
import { AuthContext } from './auth/AuthContext';
import AIAssistant from './AIAssistant';

interface LandingPageProps {
    onLoginClick: () => void;
    onSignupClick: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; }> = ({ icon, title, children }) => (
    <div className="border border-basetitan-border/50 rounded-xl p-6 md:p-8 text-center bg-gradient-to-br from-basetitan-light/50 to-basetitan-light/20 backdrop-blur-sm transition-all duration-300 hover:border-accent-primary/50 hover:-translate-y-2 group">
         <div className="mx-auto bg-basetitan-light border border-basetitan-border rounded-full w-16 h-16 flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-accent-primary/20 group-hover:text-accent-primary group-hover:scale-110 text-basetitan-text-secondary">
            <Icon className="w-8 h-8">{icon}</Icon>
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="mt-2 text-basetitan-text-secondary">{children}</p>
    </div>
);

const HowItWorksStep: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; }> = ({ icon, title, children }) => (
    <div className="flex items-start space-x-6">
         <div className="w-16 h-16 rounded-full bg-basetitan-light border-2 border-accent-primary flex-shrink-0 flex items-center justify-center">
            <Icon className="w-8 h-8 text-accent-primary">{icon}</Icon>
        </div>
        <div>
            <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
            <p className="text-basetitan-text-secondary">{children}</p>
        </div>
    </div>
);

const HandPointerIcon = () => (
    <div className="absolute top-0 left-0 z-20 animate-finger-tap pointer-events-none">
        <svg width="32" height="32" fill="white" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M 13 2 C 11.355469 2 10 3.355469 10 5 L 10 16.8125 L 9.34375 16.125 L 9.09375 15.90625 C 7.941406 14.753906 6.058594 14.753906 4.90625 15.90625 C 3.753906 17.058594 3.753906 18.941406 4.90625 20.09375 L 4.90625 20.125 L 13.09375 28.21875 L 13.15625 28.25 L 13.1875 28.3125 C 14.535156 29.324219 16.253906 30 18.1875 30 L 19.90625 30 C 24.441406 30 28.09375 26.347656 28.09375 21.8125 L 28.09375 14 C 28.09375 12.355469 26.738281 11 25.09375 11 C 24.667969 11 24.273438 11.117188 23.90625 11.28125 C 23.578125 9.980469 22.394531 9 21 9 C 20.234375 9 19.53125 9.300781 19 9.78125 C 18.46875 9.300781 17.765625 9 17 9 C 16.648438 9 16.316406 9.074219 16 9.1875 L 16 5 C 16 3.355469 14.644531 2 13 2 Z M 13 4 C 13.554688 4 14 4.445313 14 5 L 14 16 L 16 16 L 16 12 C 16 11.445313 16.445313 11 17 11 C 17.554688 11 18 11.445313 18 12 L 18 16 L 20 16 L 20 12 C 20 11.445313 20.445313 11 21 11 C 21.554688 11 22 11.445313 22 12 L 22 16 L 24.09375 16 L 24.09375 14 C 24.09375 13.445313 24.539063 13 25.09375 13 C 25.648438 13 26.09375 13.445313 26.09375 14 L 26.09375 21.8125 C 26.09375 25.277344 23.371094 28 19.90625 28 L 18.1875 28 C 16.722656 28 15.457031 27.476563 14.40625 26.6875 L 6.3125 18.6875 C 5.867188 18.242188 5.867188 17.757813 6.3125 17.3125 C 6.757813 16.867188 7.242188 16.867188 7.6875 17.3125 L 12 21.625 L 12 5 C 12 4.445313 12.445313 4 13 4 Z"></path>
        </svg>
    </div>
);


const InteractiveForecaster: React.FC = () => {
    const [investment, setInvestment] = useState(10000);
    const chartData = useMemo(() => {
        const data = [];
        let value = investment;
        for(let i = 0; i < 30; i++) {
            data.push(value);
            const dailyReturn = (Math.random() - 0.4) * 0.05; // Simulate some volatility
            value *= (1 + (0.015 + dailyReturn)); // ~1.5% daily avg growth
        }
        return data;
    }, [investment]);

    const maxVal = Math.max(...chartData);
    const minVal = Math.min(...chartData);

    const LineChart = () => (
        <div className="w-full h-48 bg-basetitan-dark/50 rounded-lg p-2">
             <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
                <path
                    d={`M 0,${100 - ((chartData[0] - minVal) / (maxVal - minVal)) * 100} ` + 
                       chartData.map((d, i) => `L ${i * (300 / 29)},${100 - ((d - minVal) / (maxVal - minVal)) * 100}`).join(' ')}
                    fill="none"
                    stroke="#2f81f7"
                    strokeWidth="2"
                />
            </svg>
        </div>
    );
    
    return (
        <Card className="bg-gradient-to-br from-basetitan-light to-basetitan-dark/80 backdrop-blur-sm border-accent-primary/20">
            <h3 className="text-2xl font-bold text-white text-center">AI Profit Forecaster</h3>
            <p className="text-basetitan-text-secondary text-center mt-2 mb-6">See a projection of your potential growth. Drag the slider to adjust.</p>
            <LineChart />
            <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-basetitan-text-secondary">Initial Investment</span>
                    <span className="text-white font-bold text-2xl">${investment.toLocaleString()}</span>
                </div>
                 <input
                    type="range"
                    min="500"
                    max="100000"
                    step="500"
                    value={investment}
                    onChange={(e) => setInvestment(Number(e.target.value))}
                    className="w-full h-2 bg-basetitan-dark rounded-lg appearance-none cursor-pointer accent-accent-primary"
                />
                 <div className="flex justify-between text-xs text-basetitan-text-secondary mt-1">
                    <span>$500</span>
                    <span>$100,000</span>
                </div>
                <div className="mt-4 pt-4 border-t border-basetitan-border flex justify-between items-center">
                     <span className="text-basetitan-text-secondary">Projected 30-Day Return</span>
                    <span className="text-accent-secondary font-bold text-2xl">${chartData[29].toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
                </div>
            </div>
        </Card>
    );
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onSignupClick }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const testimonialsRef = useRef<HTMLDivElement>(null);
    const auth = useContext(AuthContext);
    const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

    // State for contact form
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactMessage, setContactMessage] = useState('');
    const [isMessageSent, setIsMessageSent] = useState(false);
    
    useEffect(() => {
        const scroller = testimonialsRef.current;
        if (!scroller) return;

        const scrollerInner = scroller.querySelector('.scroller__inner');
        if (!scrollerInner) return;

        // Prevent re-adding clones on re-renders
        if (scroller.getAttribute('data-animated')) return;

        scroller.setAttribute('data-animated', 'true');

        const testimonials = Array.from(scrollerInner.children);
        testimonials.forEach((testimonial) => {
            const duplicatedItem = (testimonial as Element).cloneNode(true);
            (duplicatedItem as HTMLElement).setAttribute('aria-hidden', 'true');
            scrollerInner.appendChild(duplicatedItem);
        });
    }, []);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        setIsMenuOpen(false);
        const element = document.getElementById(targetId);
        element?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };
    
    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (contactName && contactEmail && contactMessage && auth?.submitContactMessage) {
            auth.submitContactMessage(contactName, contactEmail, contactMessage);
            setIsMessageSent(true);
            setContactName('');
            setContactEmail('');
            setContactMessage('');
            setTimeout(() => setIsMessageSent(false), 5000); // Reset after 5s
        }
    };

    const navLinks = (
        <>
            <a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="block md:inline-block py-2 md:py-0 px-4 text-basetitan-text-secondary hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" onClick={(e) => handleNavClick(e, 'how-it-works')} className="block md:inline-block py-2 md:py-0 px-4 text-basetitan-text-secondary hover:text-white transition-colors">How It Works</a>
            <a href="#mobile" onClick={(e) => handleNavClick(e, 'mobile')} className="block md:inline-block py-2 md:py-0 px-4 text-basetitan-text-secondary hover:text-white transition-colors">Mobile</a>
            <a href="#security" onClick={(e) => handleNavClick(e, 'security')} className="block md:inline-block py-2 md:py-0 px-4 text-basetitan-text-secondary hover:text-white transition-colors">Security</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onLoginClick(); }} className="block md:inline-block py-2 md:py-0 px-4 text-basetitan-text-secondary hover:text-white transition-colors">Live Support</a>
            <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')} className="block md:inline-block py-2 md:py-0 px-4 text-basetitan-text-secondary hover:text-white transition-colors">Contact</a>
        </>
    );

    return (
        <div className="bg-basetitan-dark text-basetitan-text overflow-x-hidden">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-basetitan-dark/30 backdrop-blur-lg border-b border-basetitan-border/20">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                        <Icon className="w-10 h-10 text-accent-primary">{LOGO_ICON}</Icon>
                        <span className="ml-3 text-2xl font-bold text-white">BitTitan</span>
                    </div>
                    <nav className="hidden md:flex items-center space-x-2">
                        {navLinks}
                    </nav>
                    <div className="hidden md:flex items-center space-x-4">
                        <button onClick={onLoginClick} className="text-white font-semibold hover:text-accent-primary-hover transition-colors px-3 py-2">Login</button>
                        <button onClick={onSignupClick} className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-2 px-5 rounded-lg transition-colors">
                            Sign Up
                        </button>
                    </div>
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <Icon className="w-6 h-6 text-white">{isMenuOpen ? CLOSE_ICON : MENU_ICON}</Icon>
                        </button>
                    </div>
                </div>
                 {isMenuOpen && (
                    <div className="md:hidden bg-basetitan-light/95 backdrop-blur-md">
                        <nav className="flex flex-col items-start p-4 space-y-2">
                            {navLinks}
                            <div className="pt-4 border-t border-basetitan-border w-full flex flex-col items-stretch space-y-4">
                               <button onClick={() => { onLoginClick(); setIsMenuOpen(false); }} className="text-white text-left font-semibold w-full py-2 px-4 hover:bg-basetitan-dark rounded-md">Login</button>
                               <button onClick={() => { onSignupClick(); setIsMenuOpen(false); }} className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-2 px-5 rounded-lg transition-colors w-full">
                                   Sign Up
                               </button>
                           </div>
                        </nav>
                    </div>
                )}
            </header>

            <main>
                {/* Hero Section */}
                <section 
                    id="home"
                    className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cover bg-center py-20"
                    style={{backgroundImage: "url('https://coincu.com/wp-content/uploads/2022/08/shutterstock_1807685797.jpg')"}}
                    >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80"></div>
                    <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center pt-16 md:pt-0">
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white leading-tight animate-fade-in-up" style={{textShadow: '0 2px 8px rgba(0,0,0,0.8)'}}>
                                Your Journey to <span className="text-accent-primary">Intelligent</span> Trading Starts Here
                            </h1>
                            <p className="mt-6 text-lg text-basetitan-text-secondary max-w-xl mx-auto md:mx-0 animate-fade-in-up" style={{ animationDelay: '0.2s', textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>
                                BitTitan merges cutting-edge AI with a high-trust platform to elevate your crypto investment strategy.
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                                <button onClick={onSignupClick} className="w-full sm:w-auto bg-accent-primary text-white font-bold py-4 px-8 rounded-lg text-lg transform hover:scale-105 transition-transform animate-glow">
                                    Create Free Account
                                </button>
                                <button className="w-full sm:w-auto bg-basetitan-light/30 backdrop-blur-sm border border-basetitan-border/50 text-white font-bold py-4 px-8 rounded-lg text-lg transform hover:scale-105 hover:bg-basetitan-light/50 transition-all">
                                    Watch Demo
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-6 mt-12 md:mt-0">
                            <div className="w-full max-w-sm bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-left hover:border-white/20 transition-all animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                                <p className="text-sm text-basetitan-text-secondary">Total Volume Traded</p>
                                <p className="text-4xl font-bold text-white mt-1">$5.4B+</p>
                            </div>
                             <div className="w-full max-w-sm bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-left hover:border-white/20 transition-all animate-fade-in-up" style={{animationDelay: '0.8s'}}>
                                <p className="text-sm text-basetitan-text-secondary">Happy Investors</p>
                                <p className="text-4xl font-bold text-white mt-1">1.2M+</p>
                            </div>
                             <div className="w-full max-w-sm bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-left hover:border-white/20 transition-all animate-fade-in-up" style={{animationDelay: '1.0s'}}>
                                <p className="text-sm text-basetitan-text-secondary">Avg. Daily Profit Paid</p>
                                <p className="text-4xl font-bold text-accent-secondary mt-1">$1.2M</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Scrolling Logos */}
                 <div className="py-12 bg-basetitan-dark" data-aos="fade-up">
                    <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)]">
                        <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll text-basetitan-text-secondary text-2xl font-bold">
                           <li>Forbes</li><li>TechCrunch</li><li>Bloomberg</li><li>CoinDesk</li><li>Binance</li><li>Yahoo Finance</li>
                        </ul>
                         <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll" aria-hidden="true">
                            <li>Forbes</li><li>TechCrunch</li><li>Bloomberg</li><li>CoinDesk</li><li>Binance</li><li>Yahoo Finance</li>
                        </ul>
                    </div>
                </div>

                {/* Features Section */}
                <section id="features" className="py-16 md:py-20 bg-basetitan-light">
                    <div className="container mx-auto px-6">
                         <div className="text-center mb-16">
                            <h2 className="text-4xl font-extrabold text-white">An Unfair Advantage in a Complex Market</h2>
                            <p className="text-basetitan-text-secondary mt-4 max-w-2xl mx-auto">We've built a platform with features designed for both new and experienced investors.</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                <FeatureCard icon={AI_ICON} title="AI-Powered Assistant">
                                    Get real-time insights and help from our Gemini-powered AI, "Bit".
                                </FeatureCard>
                                 <FeatureCard icon={INVEST_ICON} title="Automated Investing">
                                    Choose from our intelligent plans and let our system work for you 24/7.
                                </FeatureCard>
                                 <FeatureCard icon={USERS_ICON} title="Social Proof Engine">
                                    See real-time profits from other investors, building a community of trust.
                                </FeatureCard>
                            </div>
                            <div className="block mt-12 md:mt-0">
                                <img src="https://citizenshipbay.com/wp-content/uploads/2025/05/Cryptocurrency-investment.png" alt="Abstract Crypto Investment Graph" className="rounded-xl shadow-2xl" />
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* How it works */}
                 <section id="how-it-works" className="py-16 md:py-24 bg-basetitan-dark">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-extrabold text-white">Launch Your Strategy in 3 Simple Steps</h2>
                             <p className="text-basetitan-text-secondary mt-4 max-w-2xl mx-auto">Go from signup to your first investment in minutes.</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div>
                                <img 
                                    src="https://cdn.prod.website-files.com/615661aaff6efe75b381961c/66c68d46915bbdb534d320c1_bitcoin-investment-growth-chart-cryptocurrency-upward-trend.jpg" 
                                    alt="Investment Growth Chart" 
                                    className="rounded-xl shadow-2xl w-full max-w-sm mx-auto md:max-w-none"
                                />
                            </div>
                            <div className="space-y-12">
                               <HowItWorksStep icon={USERS_ICON} title="Create Your Account">Sign up in minutes with just your name and email. It's secure and fast.</HowItWorksStep>
                               <HowItWorksStep icon={WALLET_ICON} title="Fund Your Wallet">Securely deposit funds using crypto or traditional payment methods.</HowItWorksStep>
                               <HowItWorksStep icon={INVEST_ICON} title="Start Investing">Choose an investment plan and put your assets to work instantly.</HowItWorksStep>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mobile Access Section */}
                <section id="mobile" className="py-16 md:py-24 bg-basetitan-light">
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-4xl font-extrabold text-white">Trade Anywhere, Anytime.</h2>
                                <p className="mt-4 text-lg text-basetitan-text-secondary">
                                    Our platform is designed to be fully responsive, giving you the complete BitTitan experience on your desktop, tablet, or smartphone. Never miss an opportunity.
                                </p>
                                <ul className="mt-6 space-y-4">
                                    <li className="flex items-start"><Icon className="w-5 h-5 text-accent-primary mr-3 mt-1 flex-shrink-0">{HOME_ICON}</Icon> Access your full dashboard and portfolio.</li>
                                    <li className="flex items-start"><Icon className="w-5 h-5 text-accent-primary mr-3 mt-1 flex-shrink-0">{TRADE_ICON}</Icon> Execute trades and monitor the market on the go.</li>
                                    <li className="flex items-start"><Icon className="w-5 h-5 text-accent-primary mr-3 mt-1 flex-shrink-0">{INVEST_ICON}</Icon> Manage your investments with a few taps.</li>
                                </ul>
                            </div>
                            <div className="relative mx-auto w-[300px] h-[600px] bg-black border-8 border-gray-800 rounded-[40px] shadow-2xl">
                                <div className="absolute top-[20px] left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-b-lg"></div>
                                <div className="w-full h-full bg-basetitan-dark rounded-[32px] overflow-hidden">
                                     <HandPointerIcon />

                                    {/* Mobile Sidebar */}
                                    <div className="absolute inset-y-0 left-0 w-[70%] bg-basetitan-light/95 backdrop-blur-sm p-4 transform -translate-x-full z-10 animate-mobile-sidebar border-r border-basetitan-border">
                                        <div className="flex items-center mb-6">
                                            <Icon className="w-6 h-6 text-accent-primary">{LOGO_ICON}</Icon><span className="ml-2 font-bold text-white">BitTitan</span>
                                        </div>
                                        <nav className="space-y-1 text-sm">
                                            <a className="flex items-center p-2 rounded-md bg-accent-primary/20 text-accent-primary"><Icon className="w-5 h-5 mr-3">{HOME_ICON}</Icon> Dashboard</a>
                                            <a className="flex items-center p-2 rounded-md text-basetitan-text-secondary hover:bg-basetitan-dark"><Icon className="w-5 h-5 mr-3">{PORTFOLIO_ICON}</Icon> Portfolio</a>
                                            <a className="flex items-center p-2 rounded-md text-basetitan-text-secondary hover:bg-basetitan-dark"><Icon className="w-5 h-5 mr-3">{TRADE_ICON}</Icon> Trade</a>
                                            <a className="flex items-center p-2 rounded-md text-basetitan-text-secondary hover:bg-basetitan-dark"><Icon className="w-5 h-5 mr-3">{INVEST_ICON}</Icon> Crypto Invest</a>
                                            <a className="flex items-center p-2 rounded-md text-basetitan-text-secondary hover:bg-basetitan-dark"><Icon className="w-5 h-5 mr-3">{ALT_INVEST_ICON}</Icon> Alt Invest</a>
                                            <a className="flex items-center p-2 rounded-md text-basetitan-text-secondary hover:bg-basetitan-dark"><Icon className="w-5 h-5 mr-3">{WALLET_ICON}</Icon> Wallet</a>
                                            <a className="flex items-center p-2 rounded-md text-basetitan-text-secondary hover:bg-basetitan-dark"><Icon className="w-5 h-5 mr-3">{HISTORY_ICON}</Icon> Invest History</a>
                                            <a className="flex items-center p-2 rounded-md text-basetitan-text-secondary hover:bg-basetitan-dark"><Icon className="w-5 h-5 mr-3">{ACCOUNT_ICON}</Icon> Account</a>
                                            <div className="pt-2 border-t border-basetitan-border/50">
                                                <a className="flex items-center p-2 rounded-md text-basetitan-text-secondary hover:bg-basetitan-dark"><Icon className="w-5 h-5 mr-3">{LOGOUT_ICON}</Icon> Log Out</a>
                                            </div>
                                        </nav>
                                    </div>
                                    
                                    {/* Mockup Dashboard Content */}
                                    <div className="p-3 text-white text-xs relative h-full overflow-hidden space-y-3">
                                        <div className="flex justify-between items-center">
                                            <Icon className="w-6 h-6 text-white">{MENU_ICON}</Icon>
                                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px]">G</div>
                                        </div>

                                        <div>
                                            <p className="text-[11px] font-bold text-basetitan-text-secondary mb-2">Portfolio</p>
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between items-baseline p-1.5 bg-basetitan-light rounded-md">
                                                    <span className="text-basetitan-text-secondary text-[10px]">USDT</span>
                                                    <span className="font-mono text-white text-sm">$344,000.00</span>
                                                </div>
                                                <div className="flex justify-between items-baseline p-1.5 bg-basetitan-light rounded-md">
                                                    <span className="text-basetitan-text-secondary text-[10px]">BTC</span>
                                                    <span className="font-mono text-white text-sm">32.8100 BTC</span>
                                                </div>
                                                <div className="flex justify-between items-baseline p-1.5 bg-basetitan-light rounded-md">
                                                    <span className="text-basetitan-text-secondary text-[10px]">ETH</span>
                                                    <span className="font-mono text-white text-sm">88.120 ETH</span>
                                                </div>
                                            </div>
                                        </div>


                                        <div className="mt-4">
                                            <p className="text-[10px] font-bold text-basetitan-text-secondary mb-1">Leaderboard</p>
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2 p-1 bg-basetitan-light rounded"><img src="https://i.pravatar.cc/150?u=alex" className="w-5 h-5 rounded-full" /><div><p className="font-semibold text-white text-[11px]">Alex T.</p><p className="text-[10px] text-accent-secondary">+5.2 BTC</p></div></div>
                                                <div className="flex items-center space-x-2 p-1 bg-basetitan-light rounded"><img src="https://i.pravatar.cc/150?u=jessica" className="w-5 h-5 rounded-full" /><div><p className="font-semibold text-white text-[11px]">Jessica W.</p><p className="text-[10px] text-accent-secondary">+4.8 BTC</p></div></div>
                                            </div>
                                        </div>

                                         <div className="mt-4">
                                            <p className="text-[10px] font-bold text-basetitan-text-secondary mb-1">Recent Activity</p>
                                            <ul className="space-y-1">
                                                <li className="opacity-0 animate-fade-in-list-item" style={{animationFillMode: 'forwards', animationDelay: '1s'}}><div className="flex justify-between items-center text-[10px] p-1 bg-basetitan-light rounded"><span>Profit Return</span><span className="text-accent-secondary">+1,250 USDT</span></div></li>
                                                <li className="opacity-0 animate-fade-in-list-item" style={{animationFillMode: 'forwards', animationDelay: '2.5s'}}><div className="flex justify-between items-center text-[10px] p-1 bg-basetitan-light rounded"><span>Investment</span><span className="text-accent-danger">-0.1 BTC</span></div></li>
                                                <li className="opacity-0 animate-fade-in-list-item" style={{animationFillMode: 'forwards', animationDelay: '4s'}}><div className="flex justify-between items-center text-[10px] p-1 bg-basetitan-light rounded"><span>Funding</span><span className="text-accent-secondary">+5,000 USDT</span></div></li>
                                                <li className="opacity-0 animate-fade-in-list-item" style={{animationFillMode: 'forwards', animationDelay: '6s'}}><div className="flex justify-between items-center text-[10px] p-1 bg-basetitan-light rounded"><span>Withdrawal</span><span className="text-accent-danger">-2.5 ETH</span></div></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Interactive Forecaster Section */}
                <section id="forecaster" className="py-16 md:py-24 bg-basetitan-dark">
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                             <div className="row-start-2 md:row-auto">
                                <h2 className="text-4xl font-extrabold text-white mb-4">Visualize Your Future</h2>
                                <p className="text-lg text-basetitan-text-secondary mb-8">Use our powerful tools to see your potential. The future of your portfolio is in your hands, right on your screen.</p>
                                <img src="https://thumbor.forbes.com/thumbor/fit-in/1290x/https://www.forbes.com/advisor/wp-content/uploads/2024/05/Cryptocurrency.jpg" alt="Crypto on phone" className="rounded-xl shadow-2xl w-full max-w-sm mx-auto md:max-w-none" />
                            </div>
                            <div className="row-start-1 md:row-auto">
                                <InteractiveForecaster />
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Security Section */}
                 <section id="security" className="py-16 md:py-24 bg-cover bg-center" style={{backgroundImage: "url('https://images.pexels.com/photos/593158/pexels-photo-593158.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')"}}>
                    <div className="absolute inset-0 bg-basetitan-dark/80"></div>
                     <div className="container mx-auto px-6 relative z-10">
                         <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-4xl font-extrabold text-white">Fortress-Grade Security</h2>
                                <p className="mt-4 text-lg text-basetitan-text-secondary">Your assets and data are protected by multi-layered, institutional-grade security protocols. We prioritize your peace of mind so you can focus on growing your portfolio.</p>
                                <ul className="mt-6 space-y-4">
                                    <li className="flex items-center"><Icon className="w-6 h-6 text-accent-secondary mr-3">{SHIELD_ICON}</Icon> Offline Cold Storage for Digital Assets</li>
                                    <li className="flex items-center"><Icon className="w-6 h-6 text-accent-secondary mr-3">{SHIELD_ICON}</Icon> AES-256 Encryption & 2FA</li>
                                    <li className="flex items-center"><Icon className="w-6 h-6 text-accent-secondary mr-3">{SHIELD_ICON}</Icon> Regular Security Audits</li>
                                </ul>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                <Card className="bg-basetitan-light/50 backdrop-blur-sm">
                                    <p className="text-4xl font-bold text-accent-primary">99.8%</p>
                                    <p className="text-basetitan-text-secondary">Assets held in secure offline cold storage.</p>
                                </Card>
                                 <Card className="bg-basetitan-light/50 backdrop-blur-sm">
                                    <p className="text-4xl font-bold text-accent-primary">24/7</p>
                                    <p className="text-basetitan-text-secondary">Threat monitoring and expert support.</p>
                                 </Card>
                            </div>
                         </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section id="testimonials" className="py-16 md:py-20 bg-basetitan-light">
                     <div className="container mx-auto px-6">
                          <div className="text-center mb-12">
                            <h2 className="text-4xl font-extrabold text-white">Join a Community of Successful Investors</h2>
                        </div>
                        <div className="scroller" ref={testimonialsRef}>
                            <div className="scroller__inner flex gap-8">
                                <Card className="w-96 flex-shrink-0">
                                    <div className="flex items-center mb-4">
                                        <img src="https://i.pravatar.cc/150?u=sarah" alt="Sarah L." className="w-12 h-12 rounded-full"/>
                                        <div className="ml-4">
                                            <p className="font-bold text-white">Sarah L.</p>
                                            <p className="text-sm text-basetitan-text-secondary">Verified Investor</p>
                                        </div>
                                    </div>
                                    <p>"The best platform I've used. The AI assistant is a game changer and my portfolio has never looked better."</p>
                                </Card>
                                <Card className="w-96 flex-shrink-0">
                                     <div className="flex items-center mb-4">
                                        <img src="https://i.pravatar.cc/150?u=mark" alt="Mark D." className="w-12 h-12 rounded-full"/>
                                        <div className="ml-4">
                                            <p className="font-bold text-white">Mark D.</p>
                                            <p className="text-sm text-basetitan-text-secondary">Diamond Hands</p>
                                        </div>
                                    </div>
                                    <p>"BitTitan makes investing simple and profitable. The transparency with the transaction history and live profits is amazing."</p>
                                </Card>
                                <Card className="w-96 flex-shrink-0">
                                     <div className="flex items-center mb-4">
                                        <img src="https://i.pravatar.cc/150?u=jessica" alt="Jessica W." className="w-12 h-12 rounded-full"/>
                                        <div className="ml-4">
                                            <p className="font-bold text-white">Jessica W.</p>
                                            <p className="text-sm text-basetitan-text-secondary">Pro Trader</p>
                                        </div>
                                    </div>
                                    <p>"Finally, a platform that feels like it was built for serious traders. The tools are top-notch and the performance is flawless."</p>
                                </Card>
                                 <Card className="w-96 flex-shrink-0">
                                     <div className="flex items-center mb-4">
                                        <img src="https://i.pravatar.cc/150?u=michael" alt="Michael C." className="w-12 h-12 rounded-full"/>
                                        <div className="ml-4">
                                            <p className="font-bold text-white">Michael C.</p>
                                            <p className="text-sm text-basetitan-text-secondary">Investor Elite</p>
                                        </div>
                                    </div>
                                    <p>"The alternative investment options are a brilliant way to diversify. I've seen great returns from the Tech Growth Fund."</p>
                                </Card>
                                 <Card className="w-96 flex-shrink-0">
                                     <div className="flex items-center mb-4">
                                        <img src="https://i.pravatar.cc/150?u=david" alt="David R." className="w-12 h-12 rounded-full"/>
                                        <div className="ml-4">
                                            <p className="font-bold text-white">David R.</p>
                                            <p className="text-sm text-basetitan-text-secondary">Early Adopter</p>
                                        </div>
                                    </div>
                                    <p>"I've been with BitTitan since the beginning. The platform just keeps getting better. The security features give me total peace of mind."</p>
                                </Card>
                                <Card className="w-96 flex-shrink-0">
                                     <div className="flex items-center mb-4">
                                        <img src="https://i.pravatar.cc/150?u=emily" alt="Emily K." className="w-12 h-12 rounded-full"/>
                                        <div className="ml-4">
                                            <p className="font-bold text-white">Emily K.</p>
                                            <p className="text-sm text-basetitan-text-secondary">New Investor</p>
                                        </div>
                                    </div>
                                    <p>"As someone new to crypto, BitTitan made it so easy to get started. The 'How It Works' section was super helpful!"</p>
                                </Card>
                            </div>
                        </div>
                        <style>{`
                            .scroller { max-width: 100%; }
                            .scroller[data-animated="true"] { overflow: hidden; -webkit-mask: linear-gradient(90deg, transparent, white 20%, white 80%, transparent); mask: linear-gradient(90deg, transparent, white 20%, white 80%, transparent); }
                            .scroller[data-animated="true"] .scroller__inner { width: max-content; flex-wrap: nowrap; animation: scroll 60s linear infinite; }
                            @keyframes scroll { to { transform: translate(calc(-50% - 1rem)); } }
                        `}</style>
                     </div>
                </section>

                {/* Contact Us Section */}
                <section id="contact" className="py-16 md:py-24 bg-basetitan-dark">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-extrabold text-white">Get In Touch</h2>
                            <p className="text-basetitan-text-secondary mt-4 max-w-2xl mx-auto">Have questions? Our team is here to help you on your investment journey.</p>
                        </div>
                        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 bg-basetitan-light p-8 rounded-xl">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-white">Send us a Message</h3>
                                {isMessageSent ? (
                                    <div className="h-full flex flex-col items-center justify-center bg-basetitan-dark rounded-lg p-8 text-center animate-fade-in">
                                        <div className="w-16 h-16 mx-auto bg-accent-secondary rounded-full flex items-center justify-center mb-4">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-white">Message Sent!</h3>
                                        <p className="text-basetitan-text-secondary mt-2">Thank you for contacting us. Our team will get back to you shortly.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleContactSubmit} className="space-y-4">
                                        <input value={contactName} onChange={(e) => setContactName(e.target.value)} required type="text" placeholder="Your Name" className="w-full bg-basetitan-dark border border-basetitan-border p-3 rounded-lg focus:ring-2 focus:ring-accent-primary focus:outline-none" />
                                        <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required type="email" placeholder="Your Email" className="w-full bg-basetitan-dark border border-basetitan-border p-3 rounded-lg focus:ring-2 focus:ring-accent-primary focus:outline-none" />
                                        <textarea value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} required placeholder="Your Message" rows={5} className="w-full bg-basetitan-dark border border-basetitan-border p-3 rounded-lg focus:ring-2 focus:ring-accent-primary focus:outline-none"></textarea>
                                        <button type="submit" className="w-full bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105">Send Message</button>
                                    </form>
                                )}
                            </div>
                            <div className="text-basetitan-text-secondary">
                                <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
                                <div className="space-y-6">
                                    <div className="flex items-start">
                                        <Icon className="w-6 h-6 mr-4 text-accent-primary flex-shrink-0 mt-1">{EMAIL_ICON}</Icon>
                                        <div>
                                            <h4 className="font-semibold text-white">Email Us</h4>
                                            <p>Our support team is available 24/7 to answer your questions.</p>
                                            <a href="mailto:support@basetitan.com" className="text-accent-primary hover:underline">support@basetitan.com</a>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <Icon className="w-6 h-6 mr-4 text-accent-primary flex-shrink-0 mt-1">{SUPPORT_ICON}</Icon>
                                         <div>
                                            <h4 className="font-semibold text-white">Call Us</h4>
                                            <p>For urgent inquiries, feel free to give us a call.</p>
                                            <a href="tel:+15551234567" className="text-accent-primary hover:underline">+1 (555) 123-4567</a>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <Icon className="w-6 h-6 mr-4 text-accent-primary flex-shrink-0 mt-1">{HOME_ICON}</Icon>
                                         <div>
                                            <h4 className="font-semibold text-white">Main Office</h4>
                                            <p>123 Crypto Lane, Suite 100<br/>Metropolis, 12345, United States</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* Final CTA */}
                <section className="py-16 md:py-24 bg-gradient-to-t from-accent-primary/10 to-basetitan-light">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-4xl font-extrabold text-white">Ready to Elevate Your Trading?</h2>
                        <p className="mt-4 text-lg text-basetitan-text-secondary max-w-xl mx-auto">
                            Access powerful tools, intelligent investment plans, and join a community of driven investors.
                        </p>
                         <div className="mt-8">
                            <button onClick={onSignupClick} className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-4 px-8 rounded-lg text-lg transform hover:scale-105 transition-transform animate-glow">
                                Start for Free
                            </button>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-basetitan-light border-t border-basetitan-border">
                    <div className="container mx-auto px-6 py-8 text-center text-basetitan-text-secondary">
                        <p>&copy; {new Date().getFullYear()} BitTitan. All Rights Reserved.</p>
                        <p className="text-xs mt-2">Investing in cryptocurrency involves risk. This platform is for demonstration purposes only. Please do your own research and do not consider this financial advice.</p>
                    </div>
                </footer>
            </main>
            
            {/* Floating Action Buttons */}
            <div className="fixed bottom-6 right-6 z-30 flex flex-col space-y-4">
                 <button 
                    onClick={() => setIsAiAssistantOpen(true)}
                    className="bg-accent-primary hover:bg-accent-primary-hover text-white rounded-full p-4 shadow-lg transform hover:scale-110 transition-transform duration-200"
                    aria-label="AI Assistant"
                    title="AI Assistant"
                >
                    <Icon className="w-8 h-8">{AI_ICON}</Icon>
                </button>
            </div>
            
            {isAiAssistantOpen && (
                <div className="fixed inset-0 lg:inset-auto lg:bottom-24 lg:right-6 z-[60] w-full lg:w-[440px] h-full lg:h-[600px] lg:rounded-xl overflow-hidden shadow-2xl animate-fade-in-up">
                    <AIAssistant onClose={() => setIsAiAssistantOpen(false)} />
                </div>
            )}
        </div>
    );
};

export default LandingPage;