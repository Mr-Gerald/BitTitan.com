


import React, { useState, useRef, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../auth/AuthContext';
import Icon from './Icon';
import { CLOSE_ICON, SUPPORT_ICON } from '../../constants';
import { LiveChatMessage } from '../../types';


interface LiveChatProps {
    onClose: () => void;
}

const LiveChat: React.FC<LiveChatProps> = ({ onClose }) => {
    const auth = useContext(AuthContext);
    const [input, setInput] = useState('');
    const [typingTimeout, setTypingTimeout] = useState<number | null>(null);
    const [showRefreshPrompt, setShowRefreshPrompt] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const user = auth?.user;

    const session = auth?.liveChatSessions.find(s => s.userId === user?.id);
    const messages = session?.messages || [];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const lastMessage = useMemo(() => {
        if (!messages || messages.length === 0) return null;
        const filteredMessages = messages.filter(msg => msg.text.trim() !== '');
        return filteredMessages.length > 0 ? filteredMessages[filteredMessages.length - 1] : null;
    }, [messages]);

    useEffect(() => {
        // Automatically create session if it doesn't exist when component mounts
        if (user && !session) {
            auth?.sendLiveChatMessage(user.id, ''); // Send an empty message to initialize
        }
    }, [user, session, auth]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, session?.isAdminTyping, showRefreshPrompt]);
    
    useEffect(() => {
        if (user) {
            auth?.markUserChatAsRead(user.id);
        }
    }, [user, auth]);

    // Effect to show a refresh prompt if admin hasn't responded in 3 minutes
    useEffect(() => {
        setShowRefreshPrompt(false);
        let timer: number;

        if (lastMessage?.sender === 'user') {
            timer = window.setTimeout(() => {
                // Re-check the condition before showing the prompt
                const currentSession = auth?.liveChatSessions.find(s => s.userId === user?.id);
                const currentMessages = currentSession?.messages.filter(m => m.text.trim() !== '') || [];
                if (currentMessages.length > 0 && currentMessages[currentMessages.length - 1].sender === 'user') {
                    setShowRefreshPrompt(true);
                }
            }, 180000); // 3 minutes
        }

        return () => {
            clearTimeout(timer);
        };
    }, [lastMessage, auth, user?.id]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        if (!auth?.setUserTyping || !user) return;

        if (typingTimeout) {
            clearTimeout(typingTimeout);
        } else {
            auth.setUserTyping(user.id, true);
        }

        setTypingTimeout(window.setTimeout(() => {
            auth.setUserTyping(user.id, false);
            setTypingTimeout(null);
        }, 2000)); // Consider user stopped typing after 2s
    };
    
    const handleSend = () => {
        if (!input.trim() || !user || !auth?.sendLiveChatMessage) return;

        if(typingTimeout) clearTimeout(typingTimeout);
        auth.setUserTyping?.(user.id, false);
        setTypingTimeout(null);
        
        auth.sendLiveChatMessage(user.id, input);
        setInput('');
    };

    return (
        <div className="flex flex-col h-full bg-basetitan-light border border-basetitan-border rounded-xl shadow-2xl">
            <header className="flex items-center justify-between p-4 border-b border-basetitan-border flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <Icon className="w-8 h-8 text-accent-primary">{SUPPORT_ICON}</Icon>
                    <div>
                        <h2 className="text-lg font-bold text-white">Live Support</h2>
                        <p className="text-xs text-accent-secondary">We typically reply within a few minutes.</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-basetitan-text-secondary hover:text-white">
                    <Icon className="w-6 h-6">{CLOSE_ICON}</Icon>
                </button>
            </header>

            <main className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.filter(msg => msg.text.trim() !== '').map((msg: LiveChatMessage, index: number) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'admin' && <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0"><Icon className="w-5 h-5 text-white">{SUPPORT_ICON}</Icon></div>}
                        <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-accent-primary text-white rounded-br-none' : 'bg-basetitan-dark text-basetitan-text rounded-bl-none'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                         {msg.sender === 'user' && user?.avatarUrl && <img src={user.avatarUrl} className="w-8 h-8 rounded-full"/> }
                         {msg.sender === 'user' && !user?.avatarUrl && <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center flex-shrink-0 font-bold text-white text-sm"><span>{user?.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}</span></div> }
                    </div>
                ))}
                {lastMessage?.sender === 'user' && !session?.hasUnreadUserMessage && (
                    <div className="flex justify-end pr-12">
                        <span className="text-xs text-basetitan-text-secondary">Seen</span>
                    </div>
                )}
                {session?.isAdminTyping && (
                    <div className="flex justify-start items-center">
                         <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0"><Icon className="w-5 h-5 text-white">{SUPPORT_ICON}</Icon></div>
                         <div className="text-xs text-basetitan-text-secondary italic px-4 py-2">
                             Admin is typing...
                         </div>
                    </div>
                )}
                {showRefreshPrompt && (
                    <div className="flex justify-center my-4 animate-fade-in">
                        <div className="text-center text-xs bg-basetitan-dark p-3 rounded-lg border border-basetitan-border max-w-sm">
                            <p className="font-semibold text-white">Not seeing a reply?</p>
                            <p className="text-basetitan-text-secondary mt-1">
                                If 3 minutes have passed, please <a href="#" onClick={(e) => { e.preventDefault(); window.location.reload(); }} className="text-accent-primary font-bold hover:underline">refresh the page</a> to sync with our support team. You won't lose your place.
                            </p>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-4 border-t border-basetitan-border flex-shrink-0">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your message..."
                        className="flex-1 bg-basetitan-dark border border-basetitan-border rounded-lg px-4 py-2 focus:ring-accent-primary focus:border-accent-primary"
                    />
                    <button onClick={handleSend} disabled={!input.trim()} className="bg-accent-primary text-white rounded-lg p-2 disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-accent-primary-hover">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default LiveChat;