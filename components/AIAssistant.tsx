

import React, { useState, useRef, useEffect } from 'react';
import { sendMessageStream } from '../services/geminiService';
import Icon from './shared/Icon';
import { CLOSE_ICON, AI_ICON } from '../constants';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
}

interface AIAssistantProps {
    onClose: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Hello! I'm Bit, your AI assistant. How can I help you with your trading and investments today?", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);
    
    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
    
        const userMessage: Message = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
    
        const aiMessageId = Date.now() + 1;
        setMessages(prev => [...prev, { id: aiMessageId, text: '', sender: 'ai' }]);
    
        try {
            const stream = await sendMessageStream(input);
            const reader = stream.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = '';

            while(true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                accumulatedText += decoder.decode(value, { stream: true });
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === aiMessageId ? { ...msg, text: accumulatedText } : msg
                    )
                );
            }
        } catch (error) {
            console.error(error);
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === aiMessageId ? { ...msg, text: "Sorry, I'm having trouble connecting right now. Please try again later." } : msg
                )
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-basetitan-light border border-basetitan-border rounded-xl shadow-2xl">
            <header className="flex items-center justify-between p-4 border-b border-basetitan-border flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <Icon className="w-8 h-8 text-accent-primary">{AI_ICON}</Icon>
                    <div>
                        <h2 className="text-lg font-bold text-white">Bit AI Assistant</h2>
                        <p className="text-xs text-accent-secondary">Online</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-basetitan-text-secondary hover:text-white">
                    <Icon className="w-6 h-6">{CLOSE_ICON}</Icon>
                </button>
            </header>

            <main className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center flex-shrink-0"><Icon className="w-5 h-5 text-white">{AI_ICON}</Icon></div>}
                        <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-accent-primary text-white rounded-br-none' : 'bg-basetitan-dark text-basetitan-text rounded-bl-none'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}{isLoading && msg.sender === 'ai' && index === messages.length -1 && <span className="inline-block w-2 h-4 ml-1 bg-white animate-pulse"></span>}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-4 border-t border-basetitan-border flex-shrink-0">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask me anything..."
                        className="flex-1 bg-basetitan-dark border border-basetitan-border rounded-lg px-4 py-2 focus:ring-accent-primary focus:border-accent-primary"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-accent-primary text-white rounded-lg p-2 disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-accent-primary-hover">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default AIAssistant;