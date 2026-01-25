import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Shield, Sparkles, ChevronLeft, Info, Mail, X, ShieldCheck, User, Fingerprint, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', damping: 20, stiffness: 100 }
    }
};

export default function ToneShield() {
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(true);
    const [showGmailPopup, setShowGmailPopup] = useState(false);
    const [isGmailConnected, setIsGmailConnected] = useState(false);
    const [showConsent, setShowConsent] = useState(false);

    // AI Analysis Form State
    const [sender, setSender] = useState('');
    const [content, setContent] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const handleAnalyze = async () => {
        if (!sender || !content) return;
        setIsAnalyzing(true);
        try {
            // Call Backend API
            const response = await fetch('http://localhost:8000/api/ai/tone-shield', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sender, content })
            });
            const data = await response.json();

            setAnalysisResult({
                sender: data.sender || sender,
                tone: data.tone_category || 'Neutral',
                analysis: data.analysis || 'Analysis complete.',
                rewritten: data.rewritten,
                isToxic: data.is_toxic,
                isInvisibleLabor: data.is_invisible_labor
            });
        } catch (error) {
            console.error('Analysis failed:', error);
            // Fallback for demo if API fails
            setTimeout(() => {
                setAnalysisResult({
                    sender: sender,
                    tone: 'Analysis Failed',
                    analysis: 'Could not connect to AI Neural Net.',
                    rewritten: content,
                    status: 'Error'
                });
            }, 1000);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetForm = () => {
        setSender('');
        setContent('');
        setAnalysisResult(null);
    };

    return (
        <div className="min-h-screen bg-[#FFFBFB] text-slate-900 font-sans -m-8 relative overflow-hidden pb-32">
            {/* Animated Background Blobs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[100px] -mr-40 -mt-20 pointer-events-none"
            />
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    x: [0, 50, 0],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose-100/30 rounded-full blur-[80px] -ml-40 -mb-20 pointer-events-none"
            />

            {/* Header */}
            <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="p-8 pt-10 flex items-center gap-4 relative z-10"
            >
                <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 active:scale-90 transition-transform">
                    <ChevronLeft className="w-6 h-6 text-slate-500" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Tone Shield</h1>
                    <p className="text-sm font-bold text-slate-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Stress-aware notification protection
                    </p>
                </div>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="px-8 space-y-8 relative z-10 max-w-xl mx-auto"
            >
                {/* 1. Main Protection Card */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-purple-900/5 border border-purple-50 space-y-10 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 blur-3xl -mr-10 -mt-10" />

                    <div className="flex justify-between items-start relative">
                        <div className="flex gap-5">
                            <motion.div
                                animate={{ rotate: isActive ? [0, 5, -5, 0] : 0 }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-indigo-200"
                            >
                                <Shield className="w-10 h-10 text-white" />
                            </motion.div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">Tone Shield Active</h2>
                                <p className="text-xs font-bold text-slate-400 leading-relaxed mt-2 max-w-[220px]">
                                    AI-powered linguistic softening synchronized with your real-time stress levels.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsActive(!isActive)}
                            className={`w-16 h-9 rounded-full p-1.5 transition-colors duration-500 ${isActive ? 'bg-slate-900 shadow-xl shadow-slate-200' : 'bg-slate-100'}`}
                        >
                            <motion.div
                                animate={{ x: isActive ? 28 : 0 }}
                                className="w-6 h-6 bg-white rounded-full shadow-md"
                            />
                        </button>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-indigo-50/40 border border-indigo-100 rounded-[2rem] p-8 flex gap-5 backdrop-blur-sm"
                    >
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                            <Info className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2 font-mono">Shield Statistics</h3>
                            <p className="text-base font-bold text-slate-700 leading-tight">
                                Currently protecting you from <span className="text-indigo-600 font-black text-2xl mx-1 tabular-nums">47</span> stressful notifications today.
                            </p>
                        </div>
                    </motion.div>
                </motion.div>

                {/* 2. Your Current Status Section */}
                <div className="space-y-6 pt-4">
                    <motion.h3 variants={itemVariants} className="text-2xl font-black text-slate-800 tracking-tight ml-2">Vital Signs</motion.h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Stress Level', val: 'Moderate', emoji: '😐', color: 'orange', text: 'Moderate' },
                            { label: 'Burnout Risk', val: '45%', emoji: null, color: 'rose', text: '45%' },
                            { label: 'Period Cycle', val: '8 days', emoji: null, color: 'pink', text: '8 Days In' },
                        ].map((item) => (
                            <motion.div
                                key={item.label}
                                variants={itemVariants}
                                whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,1)' }}
                                className="bg-white/60 p-7 rounded-[2.5rem] border border-white shadow-sm flex items-center justify-between group transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full bg-${item.color}-400 group-hover:scale-150 transition-transform`} />
                                    <span className="text-slate-500 font-black tracking-tight">{item.label}</span>
                                </div>
                                <div className={`bg-${item.color}-50 text-${item.color}-600 px-6 py-3 rounded-2xl border border-${item.color}-100 flex items-center gap-3 shadow-sm`}>
                                    {item.emoji && <span className="text-2xl">{item.emoji}</span>}
                                    <span className="font-black text-sm uppercase tracking-widest">{item.text}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* AI Tip Footer */}
                <motion.div
                    variants={itemVariants}
                    className="bg-rose-50/50 p-7 rounded-[2.5rem] border border-rose-100 flex gap-5 backdrop-blur-sm"
                >
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-rose-500 shadow-sm shrink-0"
                    >
                        <Sparkles className="w-6 h-6 fill-rose-500/20" />
                    </motion.div>
                    <p className="text-sm font-bold text-slate-600 leading-relaxed">
                        Tone Shield is actively adaptive. Based on your moderate stress, we're applying a <span className="text-rose-600">Softened-Professional filter</span> to all incoming enterprise comms.
                    </p>
                </motion.div>
            </motion.div>

            {/* AI Gmail Icon (Floating) */}
            <div className="fixed bottom-10 right-10 z-[100]">
                <motion.button
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                        if (isGmailConnected) {
                            setShowGmailPopup(true);
                            resetForm();
                        } else {
                            setShowConsent(true);
                        }
                    }}
                    className="w-20 h-20 bg-[#FF8A71] rounded-full flex items-center justify-center shadow-[0_20px_40px_rgba(255,138,113,0.3)] border-4 border-white group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    {isGmailConnected ? (
                        <Mail className="w-10 h-10 text-white relative z-10" />
                    ) : (
                        <Sparkles className="w-10 h-10 text-white relative z-10" />
                    )}
                </motion.button>
            </div>

            {/* CONSENT MODAL (Privacy & Why) */}
            <AnimatePresence>
                {showConsent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <div className="absolute inset-0" onClick={() => setShowConsent(false)} />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[3rem] max-w-lg w-full p-8 md:p-10 shadow-2xl relative z-20 overflow-hidden"
                        >
                            {/* Decorative Background */}
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-rose-50 to-orange-50" />

                            <div className="relative">
                                {/* Header Icon */}
                                <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 mx-auto relative group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-orange-400 rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
                                    <Mail className="w-10 h-10 text-[#FF8A71]" />
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                                        <div className="w-3 h-3 bg-white rounded-full" />
                                    </div>
                                </div>

                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-3">Connect Your Inbox</h2>
                                    <p className="text-slate-500 font-medium leading-relaxed">
                                        Enable Tone Shield to analyze incoming emails for aggression and invisible labor before they drain your energy.
                                    </p>
                                </div>

                                {/* Privacy Features */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    {[
                                        { icon: ShieldCheck, label: 'Read-Only', desc: 'No write access' },
                                        { icon: Lock, label: 'Encrypted', desc: 'Bank-grade security' },
                                        { icon: Sparkles, label: 'AI Powered', desc: 'Running locally' },
                                    ].map((item, i) => (
                                        <div key={i} className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                                            <item.icon className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                                            <div className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1">{item.label}</div>
                                            <div className="text-[10px] text-slate-400">{item.desc}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Why we need this */}
                                <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-100 mb-8 flex gap-4">
                                    <div className="shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center text-rose-500 shadow-sm">
                                        <Info className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-xs font-black text-rose-800 uppercase tracking-widest mb-1">Why Integration?</h4>
                                        <p className="text-xs font-bold text-rose-600/80 leading-relaxed">
                                            To provide real-time protection, Tone Shield needs to "read" the sentiment of emails as they arrive. We never store your raw email content.
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <button
                                        onClick={() => {
                                            // Mock Connection Delay
                                            const btn = document.getElementById('connect-btn');
                                            if (btn) btn.innerText = 'Connecting Securely...';
                                            setTimeout(() => {
                                                setIsGmailConnected(true);
                                                setShowConsent(false);
                                                setShowGmailPopup(true);
                                                resetForm();
                                            }, 1500);
                                        }}
                                        id="connect-btn"
                                        className="w-full bg-[#FF8A71] text-white font-black py-5 rounded-2xl shadow-xl shadow-orange-200 active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-[#ff7a5c]"
                                    >
                                        <Mail className="w-5 h-5" />
                                        <span>Grant Secure Access</span>
                                    </button>
                                    <button
                                        onClick={() => setShowConsent(false)}
                                        className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 text-sm"
                                    >
                                        Not Now
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI Gmail Analysis Popup - INTERACTIVE FORM */}
            <AnimatePresence>
                {showGmailPopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-orange-950/40 backdrop-blur-md flex items-end justify-center"
                    >
                        <div className="absolute inset-0" onClick={() => setShowGmailPopup(false)} />
                        {/* Overlay closer handles */}

                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="bg-white rounded-t-[4rem] w-full max-w-xl p-10 pb-16 shadow-2xl relative z-20"
                        >
                            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-slate-100 rounded-full" />

                            <div className="flex justify-between items-center mb-10 pt-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 shadow-inner">
                                        <Mail className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-800 tracking-tighter">AI Tone Insight</h3>
                                </div>
                                <button onClick={() => setShowGmailPopup(false)} className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {!analysisResult ? (
                                    <motion.div
                                        key="form-view"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex items-center gap-3 mb-6">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                            <span className="text-xs font-bold text-emerald-700">Gmail Connected Securely</span>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400 ml-2">Sender's Identity</label>
                                            <div className="relative">
                                                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-300" />
                                                <input
                                                    type="text"
                                                    value={sender}
                                                    onChange={(e) => setSender(e.target.value)}
                                                    placeholder="Who sent the email?"
                                                    className="w-full bg-orange-50/40 border-none rounded-3xl py-6 pl-14 pr-6 focus:ring-4 focus:ring-[#FF8A71]/10 text-slate-800 placeholder:text-orange-200 font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400 ml-2">Email Content</label>
                                            <textarea
                                                rows={5}
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                                placeholder="Paste the message context here..."
                                                className="w-full bg-orange-50/40 border-none rounded-[2.5rem] p-8 focus:ring-4 focus:ring-[#FF8A71]/10 text-slate-800 placeholder:text-orange-200 font-bold resize-none"
                                            />
                                        </div>

                                        <button
                                            onClick={handleAnalyze}
                                            disabled={isAnalyzing || !sender || !content}
                                            className="w-full bg-[#FF8A71] text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-orange-200 flex items-center justify-center gap-4 active:scale-95 transition-all text-sm uppercase tracking-[0.2em] disabled:opacity-50"
                                        >
                                            {isAnalyzing ? (
                                                <>
                                                    <Sparkles className="w-5 h-5 animate-spin" />
                                                    <span>Analyzing Sentiment...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Shield & Analyze</span>
                                                    <Fingerprint className="w-5 h-5" />
                                                </>
                                            )}
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="results-view"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-6"
                                    >
                                        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2.5rem] text-center space-y-2">
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                                                <ShieldCheck className="w-8 h-8 text-emerald-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-emerald-900 leading-none mb-1">Shield Active</h4>
                                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Content Softened</p>
                                            </div>
                                        </div>

                                        {/* Analysis Breakdown */}
                                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-white space-y-4">
                                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                                <span className="text-slate-400 font-black text-xs uppercase tracking-widest">Detected Tone</span>
                                                <span className={`font-black ${analysisResult.isToxic ? 'text-rose-500' : 'text-slate-800'}`}>
                                                    {analysisResult.tone}
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold text-slate-600 italic">
                                                "{analysisResult.analysis}"
                                            </p>
                                        </div>

                                        {/* Rewritten Content */}
                                        <div className="bg-white p-6 rounded-[2rem] border-2 border-emerald-100 shadow-lg shadow-emerald-50/50">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Sparkles className="w-4 h-4 text-emerald-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Rewritten for Clarity</span>
                                            </div>
                                            <p className="text-slate-800 font-medium leading-relaxed">
                                                {analysisResult.rewritten || content}
                                            </p>
                                        </div>

                                        <button
                                            onClick={resetForm}
                                            className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] active:scale-95 transition-all text-sm uppercase tracking-[0.2em]"
                                        >
                                            Process Next Email
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
