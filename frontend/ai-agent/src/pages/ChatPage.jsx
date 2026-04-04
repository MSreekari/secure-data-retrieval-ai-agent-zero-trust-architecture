import React, { useState, useEffect, useRef } from "react";
import { Send, User, Bot, Loader2, AlertTriangle, ShieldAlert, Maximize2, Minimize2 } from "lucide-react";
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
  
  // Auto-scroll to latest message
  useEffect(() => { 
    scrollRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages]);

  // FIX: Automatically trigger the IDS Alert Banner if the risk score hits 100
  useEffect(() => {
    if (riskScore >= 100) {
      setShowAlert(true);
    }
  }, [riskScore]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!formData.prompt.trim()) return;
    
    const token = auth?.token || localStorage.getItem("access_token");
    const p = formData.prompt;
    
    setMessages(prev => [...prev, { role: "user", text: p }]);
    setIsLoading(true);
    setFormData({ prompt: "" });

    try {
      // DYNAMIC URL: Prioritizes the Render production URL
      const apiUrl = import.meta.env.VITE_API_URL || "https://secure-data-retrieval-ai-agent-zero.onrender.com";
      
      const response = await fetch(`${apiUrl}/agent/request`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ prompt: p }),
      });
      
      const data = await response.json();
      
      // Update UI with backend security metrics
      if (data.risk_score !== undefined) setRiskScore(data.risk_score);
      if (data.risk_history) setRiskHistory(data.risk_history);
      
      // If the backend explicitly sends a security alert flag
      if (data.security_alert) setShowAlert(true);
      
      if (data.result) {
        setMessages(prev => [...prev, { role: "ai", text: data.result }]);
      }
      
    } catch (err) {
      console.error("Connection error to security gateway:", err);
      setMessages(prev => [...prev, { role: "ai", text: "Connection Error. Check if backend is live." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-200 overflow-hidden relative">
      
      {/* GLOBAL ALERT BANNER - Brought to front with z-50 and backdrop blur */}
      {showAlert && (
        <div className="fixed top-0 left-0 w-full z-[100] bg-red-600/95 backdrop-blur-md text-white p-4 flex justify-between items-center animate-pulse shadow-[0_0_50px_rgba(220,38,38,0.5)] border-b border-red-400/30">
          <div className="flex items-center gap-3 font-black uppercase tracking-tighter text-lg">
            <AlertTriangle size={24} className="text-white fill-white/20"/> 
            IDS ALERT: CRITICAL THREAT DETECTED - UNAUTHORIZED ROLE ESCALATION
          </div>
          <button 
            onClick={() => setShowAlert(false)} 
            className="bg-white text-red-600 px-6 py-2 rounded-lg text-xs font-black hover:bg-zinc-100 transition-all active:scale-95 shadow-lg"
          >
            ACKNOWLEDGE THREAT
          </button>
        </div>
      )}

      <div className="flex flex-1 w-full overflow-hidden">
        
        {/* CHAT SECTION */}
        <div className="flex flex-col flex-1 min-w-0 bg-zinc-950">
          <header className="p-4 border-b border-white/5"><Navbar /></header>
          
          <main className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${m.role === "ai" ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400" : "bg-zinc-800 border-zinc-700 text-zinc-400"}`}>
                    {m.role === "ai" ? <Bot size={20} /> : <User size={20} />}
                  </div>
                  <div className={`p-4 rounded-2xl max-w-[85%] text-sm shadow-2xl leading-relaxed ${m.role === "user" ? "bg-indigo-600 text-white font-medium" : "bg-zinc-900 border border-white/10 text-zinc-300"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          </main>

          <footer className="p-6 bg-gradient-to-t from-zinc-950 to-transparent">
            <form onSubmit={handleSend} className="max-w-3xl mx-auto relative group">
              <input 
                type="text" 
                value={formData.prompt} 
                onChange={(e) => setFormData({ prompt: e.target.value })} 
                placeholder="Access table as Role... (e.g. Access employees as HR)" 
                className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-5 px-8 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 text-white transition-all shadow-2xl placeholder:text-zinc-600" 
              />
              <button 
                type="submit" 
                disabled={isLoading} 
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              </button>
            </form>
          </footer>
        </div>

        {/* MONITORING SIDEBAR */}
        <div 
          style={{ 
            width: isExpanded ? '520px' : '340px', 
            minWidth: isExpanded ? '520px' : '340px',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 40
          }}
          className="h-full bg-zinc-900/50 backdrop-blur-xl border-l border-white/10 flex flex-col p-8 gap-8 shadow-[-30px_0_60px_rgba(0,0,0,0.8)]"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-zinc-500 text-[11px] font-black uppercase tracking-[0.3em]"><ShieldAlert size={16} className="text-indigo-500"/> IDS Live Monitor</div>
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 bg-zinc-800/50 rounded-lg hover:bg-zinc-700 text-white transition-all border border-white/5">
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>

          {/* ANOMALY SCORE CARD */}
          <div className="bg-black/40 rounded-[2.5rem] border border-white/10 p-10 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group">
            <div className={`absolute inset-0 opacity-10 transition-opacity duration-1000 ${riskScore >= 70 ? 'bg-red-600 opacity-20 animate-pulse' : 'bg-indigo-600'}`} />
            <span className="text-[11px] text-zinc-500 font-bold uppercase mb-4 tracking-widest relative z-10 group-hover:text-white transition-colors">Risk Probability</span>
            <div className={`text-8xl font-mono font-black relative z-10 tracking-tighter ${riskScore >= 70 ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'text-indigo-400'}`}>
              {riskScore}<span className="text-3xl opacity-30 ml-1">%</span>
            </div>
          </div>

          {/* REAL-TIME ANALYSIS GRAPH */}
          <div className={`bg-black/60 rounded-3xl p-6 border border-white/5 shadow-inner transition-all duration-500 ${isExpanded ? 'flex-1' : 'h-56'}`}>
            <div className="flex items-center gap-2 mb-4 opacity-40">
              <Activity size={12} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Temporal Analysis</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskHistory}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={riskScore >= 70 ? "#ef4444" : "#6366f1"} stopOpacity={0.5}/>
                    <stop offset="95%" stopColor={riskScore >= 70 ? "#ef4444" : "#6366f1"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke={riskScore >= 70 ? "#ef4444" : "#6366f1"} 
                  strokeWidth={4} 
                  fill="url(#scoreColor)" 
                  isAnimationActive={true} 
                  animationDuration={1500} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* STATUS INDICATOR */}
          <div className="mt-auto">
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex flex-col">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">IDS Engine</span>
                <span className="text-xs text-zinc-200 font-bold">V-Zero Trust v2.1</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-green-500 font-black uppercase tracking-widest animate-pulse">Online</span>
                <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChatPage;