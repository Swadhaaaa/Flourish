import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronLeft, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ToneShieldMiniPopup } from '../../components/ToneShieldMiniPopup';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';

export default function ToneShield() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const [isActive, setIsActive] = useState(true);
    // --- Analysis State ---
    const [sender, setSender] = useState('');
    const [content, setContent] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            const res = await fetch(`${API_URL}/api/ai/tone-shield`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, sender })
            });
            const data = await res.json();
            setAnalysisResult({
                tone: data.tone_category,
                isToxic: data.risk_level === 'Severe' || data.risk_level === 'Moderate',
                analysis: data.analysis_text,
                rewritten: data.rewritten
            });
            // Refresh stats after manual analysis
            fetchReports();
        } catch (e) {
            console.error(e);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Check connection status on load
    const [isGmailConnected, setIsGmailConnected] = useState(false);
    useEffect(() => {
        const fetchStatus = () => {
            fetch(`${API_URL}/api/ai/tone-shield/status?user_id=${user?.uid || "1"}`)
                .then(res => res.json())
                .then(data => setIsGmailConnected(!!data.connected_email))
                .catch(() => setIsGmailConnected(false));
        };
        fetchStatus();

        // If redirected back with success, toast or alert
        if (searchParams.get('status') === 'connected') {
            alert("Gmail Connected Successfully!");
            // Remove param from URL
            navigate('/work/tone-shield', { replace: true });
        } else if (searchParams.get('status') === 'error') {
            alert("Failed to connect Gmail. Please try again.");
            navigate('/work/tone-shield', { replace: true });
        }
    }, [user, searchParams, navigate]);

    const [showDisclaimer, setShowDisclaimer] = useState(false);

    const handleToggle = () => {
        if (isActive) {
            setIsActive(false); // Can turn off anytime
        } else {
            setShowDisclaimer(true); // Must see disclaimer to turn ON
        }
    };

    const confirmActivation = () => {
        setShowDisclaimer(false);
        setIsActive(true);
    };

    // --- Reports & Sync State ---
    const [reports, setReports] = useState<any[]>([]);
    const [syncLoading, setSyncLoading] = useState(false);

    useEffect(() => {
        if (isActive) {
            fetchReports();
            // Poll for verification
            const interval = setInterval(fetchReports, 5000);
            return () => clearInterval(interval);
        }
    }, [isActive]);

    const fetchReports = async () => {
        try {
            const res = await fetch(`${API_URL}/api/ai/tone-shield/reports`);
            const data = await res.json();
            setReports(data || []);
        } catch (e) {
            console.error("Failed to fetch reports", e);
        }
    };

    const handleSync = async () => {
        if (!isGmailConnected) {
            handleConnectGmail();
            return;
        }
        setSyncLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/ai/tone-shield/sync-gmail?user_id=${user?.uid || "1"}`, { method: 'POST' });
            if (res.status === 401) {
                handleConnectGmail();
                return;
            }
            await fetchReports();
        } catch (e) {
            console.error(e);
        } finally {
            setSyncLoading(false);
        }
    };

    const handleConnectGmail = async () => {
        try {
            // New Firebase Popup Flow
            const result = await signInWithPopup(auth, googleProvider);
            const credential: any = GoogleAuthProvider.credentialFromResult(result);
            const token = credential?.accessToken;

            if (!token) {
                alert("Failed to get Google Access Token from Firebase.");
                return;
            }

            // Send token to backend
            const response = await fetch(`${API_URL}/api/auth/google/firebase-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user?.uid || "1",
                    access_token: token,
                    email: result.user.email
                })
            });

            const data = await response.json();

            if (response.ok && data.status !== 'error') {
                setIsGmailConnected(true);
                alert("Gmail Connected Securely via Firebase!");
            } else {
                alert(`Backend Error: ${data.message || "Unknown error during token save."}`);
            }
        } catch (e: any) {
            console.error("Firebase Auth Error", e);
            if (e.code === 'auth/popup-blocked') {
                alert("Popup was blocked! Please allow popups for this site.");
            } else {
                alert("Failed to connect Gmail via Firebase: " + e.message);
            }
        }
    };

    // --- Stats Aggregation ---
    const stats = {
        monitored: reports.length,
        severe: reports.filter(r => r.risk_level === 'Severe').length,
        moderate: reports.filter(r => r.risk_level === 'Moderate').length,
        mild: reports.filter(r => r.risk_level === 'Mild').length,
    };

    return (
        <div className="min-h-screen bg-[#FFFBFB] dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans -m-8 relative overflow-hidden pb-32">
            <ToneShieldMiniPopup />

            {/* DISCLAIMER MODAL */}
            <AnimatePresence>
                {showDisclaimer && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-orange-400" />
                            <h2 className="text-2xl font-black text-slate-900 mb-4">Wait a moment.</h2>
                            <p className="text-slate-600 font-medium mb-6 leading-relaxed">
                                Tone Shield uses AI to filter and rewrite incoming communication. While designed to reduce stress, it may alter the original tone or intent of messages.
                                <br /><br />
                                By activating this, you acknowledge that you are using an AI-assisted filter.
                            </p>
                            <div className="flex gap-4">
                                <button onClick={() => setShowDisclaimer(false)} className="flex-1 py-4 text-slate-500 font-black uppercase tracking-widest text-xs hover:bg-slate-50 rounded-xl">Cancel</button>
                                <button onClick={confirmActivation} className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg">I Understand, Enable</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Blobs */}
            <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100/40 rounded-full blur-[100px] -mr-40 -mt-20 pointer-events-none" />
            <motion.div animate={{ scale: [1, 1.3, 1], x: [0, 50, 0] }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose-100/30 rounded-full blur-[80px] -ml-40 -mb-20 pointer-events-none" />

            {/* Header */}
            <div className="p-8 pt-10 flex items-center gap-4 relative z-10 max-w-7xl mx-auto">
                <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 active:scale-90 transition-transform">
                    <ChevronLeft className="w-6 h-6 text-slate-500" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">Tone Shield</h1>
                    <p className="text-sm font-bold text-slate-400 flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        {isActive ? 'Stress-aware notification protection' : 'Protection Paused'}
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-4">
                    <button
                        onClick={handleToggle}
                        className={`bg-white border rounded-full px-6 py-3 font-black text-xs uppercase tracking-widest shadow-sm transition-colors ${isActive ? 'border-rose-200 text-rose-500 hover:bg-rose-50' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                    >
                        {isActive ? 'Deactivate Shield' : 'Activate Shield'}
                    </button>
                </div>
            </div>

            <main className="px-8 pb-20 relative z-10 max-w-7xl mx-auto space-y-8">

                {/* 1. STATUS GRID (Only if Active) */}
                {isActive ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Total Monitored', val: stats.monitored, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                { label: 'Severe Alerts', val: stats.severe, color: 'text-rose-600', bg: 'bg-rose-50' },
                                { label: 'Moderate Flags', val: stats.moderate, color: 'text-orange-500', bg: 'bg-orange-50' },
                                { label: 'Mild Warnings', val: stats.mild, color: 'text-blue-500', bg: 'bg-blue-50' },
                            ].map((stat) => (
                                <div key={stat.label} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{stat.label}</span>
                                    <span className={`text-4xl font-black ${stat.color}`}>{stat.val}</span>
                                </div>
                            ))}
                        </div>

                        {/* Sync / Connect Button */}
                        <div className="text-center">
                            {!isGmailConnected ? (
                                <button
                                    onClick={handleConnectGmail}
                                    className="inline-flex items-center gap-2 bg-[#DB4437] text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-red-600 transition-colors"
                                >
                                    <Mail className="w-5 h-5" />
                                    Connect Gmail for Sync
                                </button>
                            ) : (
                                <button
                                    onClick={handleSync}
                                    disabled={syncLoading}
                                    className="inline-flex items-center gap-2 bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                >
                                    <Mail className="w-5 h-5" />
                                    {syncLoading ? 'Syncing Gmail...' : 'Sync Recent Gmails'}
                                </button>
                            )}
                            {isGmailConnected && <p className="text-xs font-bold text-emerald-600 mt-2">Connected Securely</p>}
                        </div>

                        {/* Two Column Layout: Simulator & Logs */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* LEFT: SIMULATOR */}
                            {/* LEFT: SIMULATOR */}
                            <div className="bg-gradient-to-br from-[#FDEEE8] to-[#F8DDD4] rounded-[2.5rem] p-8 shadow-xl shadow-rose-200/50 border border-white/50">
                                <h2 className="text-2xl font-black text-rose-950 mb-6">Live Email Analysis Simulator</h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-rose-800/60 ml-2 mb-2 block">Sender Identity / Subject Line</label>
                                        <input
                                            type="text"
                                            value={sender}
                                            onChange={(e) => setSender(e.target.value)}
                                            placeholder="e.g., 'Boss' or 'Urgent Request'"
                                            className="w-full bg-white/60 border-none rounded-2xl p-4 font-bold text-rose-900 focus:ring-2 focus:ring-rose-500 placeholder:text-rose-300"
                                        />
                                        <p className="text-[10px] text-rose-800/50 mt-1 ml-2">Optional: Helps AI contextualize sender.</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-rose-800/60 ml-2 mb-2 block">Email Body</label>
                                        <textarea
                                            rows={6}
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="Paste email content here..."
                                            className="w-full bg-white/60 border-none rounded-2xl p-4 font-medium text-rose-900 focus:ring-2 focus:ring-rose-500 resize-none placeholder:text-rose-300"
                                        />
                                    </div>
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={isAnalyzing || !content}
                                        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-xl shadow-lg shadow-rose-200 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                                    >
                                        {isAnalyzing ? 'Analyzing...' : 'Analyze Tone'}
                                    </button>

                                    {/* Result Display */}
                                    <AnimatePresence>
                                        {analysisResult && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className={`rounded-2xl p-6 border-l-4 ${analysisResult.isToxic ? 'bg-rose-50 border-rose-500' : 'bg-emerald-50 border-emerald-500'}`}
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <h3 className={`font-black uppercase tracking-widest text-sm ${analysisResult.isToxic ? 'text-rose-700' : 'text-emerald-700'}`}>
                                                        Result: {analysisResult.tone}
                                                    </h3>
                                                    {analysisResult.isToxic && <span className="bg-rose-200 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">Toxic</span>}
                                                </div>
                                                <p className="text-sm font-bold text-slate-600 mb-3">{analysisResult.analysis}</p>

                                                {analysisResult.rewritten && (
                                                    <div className="bg-white/60 p-3 rounded-xl">
                                                        <div className="text-[10px] font-black uppercase text-indigo-400 mb-1">Rewritten Selection</div>
                                                        <p className="text-sm text-slate-800">{analysisResult.rewritten}</p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* RIGHT: RECENT ALERTS */}
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden text-white">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 blur-[100px] opacity-20" />
                                <h2 className="text-2xl font-black mb-6 relative z-10">Recent Alerts Log</h2>

                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                                    {reports.length === 0 ? (
                                        <p className="text-slate-500 font-medium italic">No alerts recorded yet.</p>
                                    ) : (
                                        [...reports].reverse().map((report, i) => (
                                            <div key={i} className="bg-white/10 p-4 rounded-2xl flex justify-between items-center hover:bg-white/20 transition-colors cursor-pointer group">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-sm">{report.sender}</span>
                                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${report.risk_level === 'Severe' ? 'bg-rose-500 text-white' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                                            {report.risk_level}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 line-clamp-1">{report.subject}</p>
                                                    <p className="text-[10px] text-slate-500 mt-1">{new Date(report.timestamp).toLocaleString()}</p>
                                                </div>
                                                <button className="text-xs font-bold text-indigo-300 group-hover:text-white uppercase tracking-widest">View</button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                        </div>
                    </motion.div>
                ) : (
                    /* INACTIVE STATE */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.01 }}
                        className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-rose-900/5 border border-amber-50 text-center space-y-8 relative overflow-hidden group max-w-2xl mx-auto mt-20"
                    >
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Shield className="w-10 h-10 text-slate-300" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800">Tone Shield is Paused</h2>
                        <p className="text-slate-500 font-medium max-w-md mx-auto">
                            Activate to enable AI-powered stress protection. We'll simulate notification interception and provide real-time rewriting.
                        </p>
                        <button
                            onClick={handleToggle}
                            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-transform hover:scale-105"
                        >
                            Enable Protection
                        </button>
                    </motion.div>
                )}
            </main>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
            `}</style>
        </div>
    );
}
