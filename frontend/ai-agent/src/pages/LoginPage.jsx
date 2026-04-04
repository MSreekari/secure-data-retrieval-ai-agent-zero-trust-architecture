/* eslint-disable react-refresh/only-export-components */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth'; 

export const LoginPage = () => {
    const [fields, setFields] = useState({ agent_name: '', pass: '' }); 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: fields.agent_name, // Matches 'request.username' in FastAPI
                    password: fields.pass
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // FIX: Check if detail is an object to prevent React crash
                const msg = typeof data.detail === 'object' 
                    ? (data.detail.msg || JSON.stringify(data.detail)) 
                    : (data.detail || "Authentication Failed");
                
                setError(msg);
                return;
            }

            // 1. SAVE TO GLOBAL CONTEXT
            login({ 
                name: data.username || data.agent_name, 
                role: data.role,
                token: data.access_token 
            });

            // 2. SAVE TO LOCALSTORAGE
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("username", data.username || data.agent_name);
            localStorage.setItem("user_role", data.role);

            // 3. Navigate
            navigate('/chat');

        } catch (err) {
            setError("Connection Error: Is the FastAPI server running on port 8000?");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-zinc-950 -m-4 md:-m-8 font-sansflex">
            <form onSubmit={handleLogin} className="bg-zinc-900/40 backdrop-blur-xl p-10 rounded-3xl border border-white/10 w-full max-w-md space-y-6 shadow-2xl">
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                        <Shield className="text-[#814AC8]" size={40} />
                    </div>
                    <h1 className="text-2xl text-white uppercase tracking-wider font-medium">Identity Portal</h1>
                    <p className="text-zinc-500 text-sm">Verify your credentials to access the AI Gateway</p>
                </div>

                {/* This block is now safe from the "Object as Child" crash */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-3 rounded-lg text-center animate-in fade-in duration-300">
                        {String(error)}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-zinc-500" size={18} />
                        <input 
                            required
                            type="text"
                            placeholder="Username"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-[#814AC8] transition-all"
                            value={fields.agent_name}
                            onChange={e => setFields({...fields, agent_name: e.target.value})}
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
                    className='flex justify-center w-full cursor-pointer text-white bg-[#814AC8] hover:bg-[#935ce2] transition-all font-sansflex rounded-full px-6 py-4 disabled:bg-zinc-800'
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="animate-spin" size={20} />
                            <span>Verifying...</span>
                        </div>
                    ) : "Sign In to Gateway"}
                </button>
            </form>
        </div>
    );
};

export default LoginPage;