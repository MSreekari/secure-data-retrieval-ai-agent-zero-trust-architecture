/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect, useRef } from 'react';
import { Send, Shield, User, Bot, Loader2, AlertTriangle, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';

const ChatPage = () => { 
    const { auth } = useAuth(); 
    const [messages, setMessages] = useState([{ role: 'ai', text: 'Security Gateway Active.' }]);
    const [formData, setFormData] = useState({ prompt: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false); 
    const scrollRef = useRef(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!formData.prompt.trim()) return;

        const token = auth?.token || localStorage.getItem("access_token");
        const currentPrompt = formData.prompt;
        
        setMessages(prev => [...prev, { role: 'user', text: currentPrompt }]);
        setIsLoading(true);
        setFormData({ prompt: '' });

        try {
            const response = await fetch('http://localhost:8000/agent/request', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ prompt: currentPrompt }),
            });

            const data = await response.json();
            
            console.log("RAW DATA FROM BACKEND:", data);

            if (data.security_alert === true) {
                console.warn("!!! SECURITY THRESHOLD REACHED !!!");
                setShowAlert(true);
            }

            // Display whatever message the backend sent
            if (data.result) {
                setMessages(prev => [...prev, { role: 'ai', text: data.result }]);
            }

        } catch (error) {
            console.error("CRITICAL FETCH ERROR:", error);
            setMessages(prev => [...prev, { role: 'ai', text: "Connection Error." }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col h-screen bg-zinc-950 text-zinc-200 overflow-hidden relative -m-4 md:-m-8">
            
            {showAlert && (
                <div 
                    style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, width: '100%' }}
                    className="bg-red-600 text-white px-6 py-4 flex items-center justify-between font-sansflex shadow-2xl animate-pulse"
                >
                    <div className="flex items-center gap-3 font-bold uppercase tracking-widest text-sm">
                        <AlertTriangle size={24} />
                        <span>IDS ALERT: UNAUTHORIZED ACCESS ATTEMPT</span>
                    </div>
                    <button 
                        onClick={() => setShowAlert(false)} 
                        className="bg-white text-red-600 px-4 py-1 rounded font-sansflex text-xs hover:bg-zinc-100"
                    >
                        ACKNOWLEDGE
                    </button>
                </div>
            )}

            <header className="shrink-0 p-4 md:p-8">
                <Navbar />
            </header>

            <main className="flex-1 overflow-y-auto font-sansflex p-6 space-y-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                                m.role === 'ai' ? 'bg-indigo-400 border-indigo-400 text-indigo-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                            }`}>
                                {m.role === 'ai' ? <Bot size={20} /> : <User size={20} />}
                            </div>
                            <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-lg ${
                                m.role === 'user' ? 'bg-indigo-400 text-white rounded-tr-none' : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none'
                            }`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    <div ref={scrollRef} />
                </div>
            </main>

            <footer className="p-6 bg-zinc-950 shrink-0">
                <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
                    <input 
                        type="text"
                        value={formData.prompt}
                        onChange={(e) => setFormData({ prompt: e.target.value })}
                        placeholder="Ex: Access sales_cleaned as Analyst"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-6 pr-14 outline-none focus:border-indigo-500 text-white"
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !formData.prompt.trim()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 hover:bg-white text-white rounded-xl"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    </button>
                </form> 
            </footer>
        </div>
    );
};

export default ChatPage;