import React, { useState, useEffect, useRef } from "react";
import { Send, User, Bot, Loader2, AlertTriangle, Activity, ShieldAlert, Maximize2, Minimize2 } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const ChatPage = () => {
  const { auth } = useAuth();
  const [messages, setMessages] = useState([{ role: "ai", text: "Security Gateway Active." }]);
  const [formData, setFormData] = useState({ prompt: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  
  const [riskScore, setRiskScore] = useState(0); 
  const [riskHistory, setRiskHistory] = useState([{time: '00:00', score: 0}]);
  const [isExpanded, setIsExpanded] = useState(false);

  const scrollRef = useRef(null);
  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!formData.prompt.trim()) return;
    
    const token = auth?.token || localStorage.getItem("access_token");
    const p = formData.prompt;
    
    setMessages(prev => [...prev, { role: "user", text: p }]);
    setIsLoading(true);
    setFormData({ prompt: "" });

    try {
      // DYNAMIC URL: Uses Vercel environment variable or falls back to local
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      
      const response = await fetch(`${apiUrl}/agent/request`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ prompt: p }),
      });
      
      const data = await response.json();
      
      // Update Score and History
      if (data.risk_score !== undefined) setRiskScore(data.risk_score);
      if (data.risk_history) setRiskHistory(data.risk_history);
      if (data.security_alert) setShowAlert(true);
      if (data.result) setMessages(prev => [...prev, { role: "ai", text: data.result }]);
      
    } catch (err) {
      // Fixed: Variable 'err' is now used to satisfy Vercel's build rules
      console.error("Connection error to security gateway:", err);
      setMessages(prev => [...prev, { role: "ai", text: "Connection Error. Check if backend is live." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-200 overflow-hidden relative">
      
      {/* GLOBAL ALERT BANNER */}
      {showAlert && (
        <div className="fixed top-0 left-0 w-full z-50 bg-red-600 text-white p-4 flex justify-between items-center animate-pulse shadow-2xl">
          <div className="flex items-center gap-2 font-bold uppercase tracking-tighter">
            <AlertTriangle size={20}/> IDS ALERT: CRITICAL THREAT DETECTED
          </div>
          <button onClick={() => setShowAlert(false)} className="bg-white text-red-600 px-4 py-1 rounded text-[10px] font-black hover:bg-zinc-100 transition-colors">ACKNOWLEDGE</button>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex flex-1 w-full overflow-hidden">
        
        {/* CHAT SECTION */}
        <div className="flex flex-col flex-1 min-w-0 bg-zinc-950">
          <header className="p-4 border-b border-white/5"><Navbar /></header>
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${m.role === "ai" ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" : "bg-zinc-800 border-zinc-700 text-zinc-400"}`}>
                    {m.role === "ai" ? <Bot size={18} /> : <User size={18} />}
                  </div>
                  <div className={`p-4 rounded-2xl max-w-[85%] text-sm shadow-xl ${m.role === "user" ? "bg-indigo-600 text-white" : "bg-zinc-900 border border-white/5 text-zinc-300"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          </main>
          <footer className="p-6">
            <form onSubmit={handleSend} className="max-w-3xl mx-auto relative">
              <input 
                type="text" 
                value={formData.prompt} 
                onChange={(e) => setFormData({ prompt: e.target.value })} 
                placeholder="Access table as Role..." 
                className="w-full bg-zinc-900 border border-white/10 rounded-xl py-4 px-6 outline-none focus:border-indigo-500 text-white transition-all shadow-2xl" 
              />
              <button type="submit" disabled={isLoading} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              </button>
            </form>
          </footer>
        </div>

        {/* --- MONITORING SIDEBAR --- */}
        <div 
          style={{ 
            width: isExpanded ? '480px' : '320px', 
            minWidth: isExpanded ? '480px' : '320px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 40
          }}
          className="h-full bg-zinc-900 border-l border-white/10 flex flex-col p-6 gap-6 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]"><ShieldAlert size={14}/> Monitor</div>
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 bg-zinc-800 rounded hover:bg-zinc-700 text-white transition-all shadow-lg">
              {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>

          {/* RISK BOX */}
          <div className="bg-black/50 rounded-3xl border border-white/5 p-8 flex flex-col items-center justify-center shadow-inner group">
            <span className="text-[10px] text-zinc-600 font-bold uppercase mb-2 tracking-widest group-hover:text-indigo-400 transition-colors">Anomaly Score</span>
            <div className={`text-7xl font-mono font-black ${riskScore >= 70 ? 'text-red-500 animate-pulse' : 'text-indigo-400'}`}>
              {riskScore}<span className="text-2xl opacity-20 ml-1">%</span>
            </div>
          </div>

          {/* GRAPH AREA */}
          <div className={`bg-zinc-950 rounded-2xl p-4 border border-white/5 shadow-2xl overflow-hidden ${isExpanded ? 'flex-1' : 'h-48'}`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskHistory}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fill="url(#scoreColor)" isAnimationActive={true} animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <div className="flex justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-[10px] text-zinc-500 font-bold uppercase">System</span>
              <span className="text-[10px] text-green-500 font-black animate-pulse uppercase tracking-widest">● Active</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChatPage;