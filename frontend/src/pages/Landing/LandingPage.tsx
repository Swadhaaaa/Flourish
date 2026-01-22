import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Mail, Lock, User, Github, Chrome, Facebook, X, Fingerprint, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

const LandingPage = () => {
    const navigate = useNavigate();
    const [showAuth, setShowAuth] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [showPassword, setShowPassword] = useState(false);

    const handleAuthAction = () => {
        // Mocking successful auth
        navigate('/mode-select');
    };

    return (
        <div className="h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#FFF8F5]">
            {/* Peachy-Purple Cloud Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 45, 0],
                        x: [0, 100, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                    className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -30, 0],
                        x: [0, -50, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-orange-100/40 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        y: [0, 100, 0]
                    }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    className="absolute -bottom-40 right-1/4 w-[700px] h-[700px] bg-rose-100/30 rounded-full blur-[150px]"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center z-10 space-y-8 max-w-2xl px-4"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-orange-100 text-[#FF8A71] text-sm font-black mb-4 backdrop-blur-sm shadow-sm">
                    <Sparkles className="w-4 h-4 fill-[#FF8A71]/20" />
                    <span className="uppercase tracking-[0.2em] text-[10px]">Embrace Balance</span>
                </div>

                <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-slate-800 flex justify-center">
                    {"Flourish".split("").map((char, index) => (
                        <motion.span
                            key={index}
                            initial={{ y: -200, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{
                                type: "spring",
                                damping: 10,
                                stiffness: 200,
                                delay: index * 0.1,
                                mass: 1.2
                            }}
                        >
                            {char}
                        </motion.span>
                    ))}
                </h1>

                <p className="text-xl text-slate-500 font-bold leading-relaxed max-w-lg mx-auto">
                    A holistic ecosystem designed to harmonies your personal well-being
                    with your professional ambitions.
                </p>

                <motion.button
                    initial={{ scale: 0, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{
                        type: "spring",
                        damping: 12,
                        stiffness: 200,
                        delay: 1.2
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAuth(true)}
                    className="mt-8 px-10 py-5 bg-[#FF8A71] text-white rounded-[2rem] font-black text-lg flex items-center gap-4 mx-auto shadow-2xl shadow-orange-200 transition-all uppercase tracking-widest text-sm"
                >
                    Get Started <ArrowRight className="w-6 h-6" />
                </motion.button>
            </motion.div>

            {/* Invezto Inspired Login Popup */}
            <AnimatePresence>
                {showAuth && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-orange-950/20 backdrop-blur-xl flex items-center justify-center p-6"
                    >
                        <div className="absolute inset-0" onClick={() => setShowAuth(false)} />

                        <motion.div
                            initial={{ scale: 0.9, y: 40, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 40, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white/95 rounded-[3.5rem] w-full max-w-[440px] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.12)] border border-white/50 relative overflow-hidden z-20"
                        >
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-100/40 blur-3xl -mr-20 -mt-20 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-100/40 blur-3xl -ml-20 -mb-20 pointer-events-none" />

                            <button
                                onClick={() => setShowAuth(false)}
                                className="absolute top-10 right-10 w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-[#FF8A71] hover:bg-white transition-all z-30 active:scale-90"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="relative z-10 text-center mb-10">
                                <h2 className="text-4xl font-black text-slate-800 tracking-tighter mb-3">
                                    {authMode === 'login' ? 'Welcome' : 'Join Us'}
                                </h2>
                                <p className="text-sm font-bold text-slate-400 max-w-[240px] mx-auto leading-relaxed">
                                    {authMode === 'login' ? 'Ready to continue your transformation?' : 'Experience the harmony of flourishing.'}
                                </p>
                            </div>

                            {/* Auth Animated Toggler */}
                            <div className="bg-slate-100/50 p-1.5 rounded-[1.5rem] flex relative z-10 mb-10 items-center justify-between border border-white">
                                <button
                                    onClick={() => setAuthMode('login')}
                                    className={cn(
                                        "flex-1 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all relative z-10",
                                        authMode === 'login' ? "text-slate-800" : "text-slate-400"
                                    )}
                                >
                                    Login
                                    {authMode === 'login' && (
                                        <motion.div
                                            layoutId="auth-bg"
                                            className="absolute inset-0 bg-white rounded-2xl shadow-sm -z-10"
                                        />
                                    )}
                                </button>
                                <button
                                    onClick={() => setAuthMode('signup')}
                                    className={cn(
                                        "flex-1 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all relative z-10",
                                        authMode === 'signup' ? "text-slate-800" : "text-slate-400"
                                    )}
                                >
                                    Sign Up
                                    {authMode === 'signup' && (
                                        <motion.div
                                            layoutId="auth-bg"
                                            className="absolute inset-0 bg-white rounded-2xl shadow-sm -z-10"
                                        />
                                    )}
                                </button>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={authMode}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-4"
                                    >
                                        {authMode === 'signup' && (
                                            <div className="relative group">
                                                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#FF8A71] transition-colors" />
                                                <input
                                                    type="text"
                                                    placeholder="Full Name"
                                                    className="w-full bg-slate-50/50 border-2 border-transparent focus:border-[#FF8A71]/20 rounded-[1.5rem] py-5 pl-16 pr-6 focus:ring-4 focus:ring-orange-100/50 transition-all font-bold text-slate-700 outline-none placeholder:text-slate-300"
                                                />
                                            </div>
                                        )}
                                        <div className="relative group">
                                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#FF8A71] transition-colors" />
                                            <input
                                                type="email"
                                                placeholder="Email Address"
                                                className="w-full bg-slate-50/50 border-2 border-transparent focus:border-[#FF8A71]/20 rounded-[1.5rem] py-5 pl-16 pr-6 focus:ring-4 focus:ring-orange-100/50 transition-all font-bold text-slate-700 outline-none placeholder:text-slate-300"
                                            />
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#FF8A71] transition-colors" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Password"
                                                className="w-full bg-slate-50/50 border-2 border-transparent focus:border-[#FF8A71]/20 rounded-[1.5rem] py-5 pl-16 pr-16 focus:ring-4 focus:ring-orange-100/50 transition-all font-bold text-slate-700 outline-none placeholder:text-slate-300"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#FF8A71] transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {authMode === 'login' && (
                                <div className="text-right mt-4 mb-2">
                                    <button className="text-[10px] font-black text-[#FF8A71] uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">Forgot Pasword?</button>
                                </div>
                            )}

                            <button
                                onClick={handleAuthAction}
                                className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.8rem] mt-8 shadow-2xl shadow-slate-200 active:scale-[0.98] transition-all text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 group"
                            >
                                <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                                <Fingerprint className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            </button>

                            <div className="flex items-center gap-6 my-10">
                                <div className="h-px flex-1 bg-slate-100" />
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] shrink-0">Social Connect</span>
                                <div className="h-px flex-1 bg-slate-100" />
                            </div>

                            <div className="flex gap-4">
                                <button className="flex-1 h-16 bg-slate-50 rounded-[1.2rem] flex items-center justify-center border-2 border-transparent hover:border-[#FF8A71]/10 hover:bg-white transition-all group active:scale-95 shadow-sm">
                                    <Chrome className="w-6 h-6 text-slate-400 group-hover:text-[#FF8A71] group-hover:scale-110 transition-all" />
                                </button>
                                <button className="flex-1 h-16 bg-slate-50 rounded-[1.2rem] flex items-center justify-center border-2 border-transparent hover:border-[#FF8A71]/10 hover:bg-white transition-all group active:scale-95 shadow-sm">
                                    <Github className="w-6 h-6 text-slate-400 group-hover:text-[#FF8A71] group-hover:scale-110 transition-all" />
                                </button>
                                <button className="flex-1 h-16 bg-slate-50 rounded-[1.2rem] flex items-center justify-center border-2 border-transparent hover:border-[#FF8A71]/10 hover:bg-white transition-all group active:scale-95 shadow-sm">
                                    <Facebook className="w-6 h-6 text-slate-400 group-hover:text-[#FF8A71] group-hover:scale-110 transition-all" />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LandingPage;
