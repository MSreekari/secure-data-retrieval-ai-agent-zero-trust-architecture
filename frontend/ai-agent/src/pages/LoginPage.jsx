/* eslint-disable react-refresh/only-export-components */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth'; 

export const LoginPage = () => {
    const [fields, setFields] = useState({ name: '', pass: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    
    // Grab the login function from our Global Context
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            console.log("Authorizing Agent:", fields.name);
            
            const response = await fetch('http://localhost:8000/agent/authenticate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agent_name: fields.name,
                    password: fields.pass
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.detail || "Authorization Failed");
                return;
            }

            console.log("Token Received:", data.access_token);

            // 1. SAVE TO GLOBAL CONTEXT
            // We store the token and role. No need to store the password in state!
            login({ 
                name: data.agent_name, 
                role: data.role,
                token: data.access_token 
            });

            // 2. SAVE TO LOCALSTORAGE (For Persistence on Page Refresh)
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("agent_name", data.agent_name);
            localStorage.setItem("agent_role", data.role);

            // 3. Navigate to the Secure Gateway
            navigate('/chat');

        } catch (err) {
            console.error("Gateway Connection Error:", err);
            setError("Security Server Unreachable. Ensure FastAPI is running on port 8000.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-zinc-950 -m-4 md:-m-8">
            <form onSubmit={handleLogin} className="bg-zinc-900/40 backdrop-blur-xl p-10 rounded-3xl border border-white/10 w-full max-w-md space-y-6 shadow-2xl">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-sansflex text-white uppercase tracking-wider">Agent Portal</h1>
                    <p className="text-zinc-500 text-sm">Secure AI Gateway Authorization</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-3 rounded-lg text-center animate-pulse">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-zinc-500" size={18} />
                        <input 
                            required
                            type="text"
                            placeholder="Agent Name"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-[#814AC8] transition-all"
                            value={fields.name}
                            onChange={e => setFields({...fields, name: e.target.value})}
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-zinc-500" size={18} />
                        <input 
                            required
                            type="password"
                            placeholder="Password"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-[#814AC8] transition-all"
                            value={fields.pass}
                            onChange={e => setFields({...fields, pass: e.target.value})}
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className='flex justify-center w-full cursor-pointer text-white bg-[#814AC8] hover:bg-white transition-all hover:text-black font-sansflex rounded-full px-6 py-4 disabled:bg-zinc-800 disabled:cursor-not-allowed'
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="animate-spin" size={20} />
                            <span>Verifying Credentials...</span>
                        </div>
                    ) : "Authorize Agent"}
                </button>
            </form>
        </div>
    );
};

export default LoginPage;