import React, { useState, useEffect, useRef } from 'react';
import { Send, Shield, User, Bot } from 'lucide-react';

export const ChatPage = () => {
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Security Gateway Active. Please enter your Agent credentials and a prompt to begin.' }
    ]);
    const [formData, setFormData] = useState({
        agent_name: '',
        password: '',
        prompt: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    // Auto-scroll to the bottom when messages update
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!formData.prompt.trim()) return;

        // 1. Add User message to the UI
        const userMsg = { role: 'user', text: formData.prompt };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8000/agent/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                // Success: Show the result from handle_request
                setMessages(prev => [...prev, { role: 'ai', text: data.result }]);
            } else {
                // Backend Error: Show the detail from HTTPException
                setMessages(prev => [...prev, { role: 'ai', text: `Access Denied: ${data.detail}` }]);
            }
        } catch (error) {
            console.error("Connection Error:", error);
            setMessages(prev => [...prev, { role: 'ai', text: "Critical: Could not connect to the Security Enforcement Point." }]);
        } finally {
            setIsLoading(false);
            // Clear prompt but keep agent_name and password for the next request
            setFormData(prev => ({ ...prev, prompt: '' }));
        }
    };

    return (
        <div className="flex flex-col h-screen bg-zinc-950 text-zinc-200 font-sans">
            
            {/* Header / Auth Bar */}
            <header className="p-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Shield className="text-indigo-500" size={24} />
                    <h1 className="font-bold text-xl text-white">Secure AI Gateway</h1>
                </div>
                
                <div className="flex gap-2">
                    <input 
                        type="text"
                        placeholder="Agent Name"
                        value={formData.agent_name}
                        onChange={(e) => setFormData({...formData, agent_name: e.target.value})}
                        className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-500 transition-colors"
                    />
                    <input 
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-500 transition-colors"
                    />
                </div>
            </header>

            {/* Chat History Area */}
            <main className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                                m.role === 'ai' ? 'bg-indigo-950 border-indigo-500 text-indigo-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                            }`}>
                                {m.role === 'ai' ? <Bot size={20} /> : <User size={20} />}
                            </div>
                            
                            <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-lg ${
                                m.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none'
                            }`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-2 items-center text-zinc-500 text-xs animate-pulse">
                            <Shield size={14} className="animate-spin" /> Verifying policy enforcement...
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </main>

            {/* Input Form */}
            <footer className="p-6 bg-zinc-950">
                <form 
                    onSubmit={handleSend} 
                    className="max-w-4xl mx-auto relative group"
                >
                    <input 
                        type="text"
                        value={formData.prompt}
                        onChange={(e) => setFormData({...formData, prompt: e.target.value})}
                        placeholder="Enter system prompt (e.g., [Admin] Request access to User_DB)..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-6 pr-14 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-zinc-600"
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !formData.prompt.trim()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl transition-all"
                    >
                        <Send size={20} />
                    </button>
                </form>
                <p className="text-center text-[10px] text-zinc-600 mt-4 uppercase tracking-widest">
                    Policy Enforcement Point: Local Node v1.0.4
                </p>
            </footer>
        </div>
    );
};

export default ChatPage;