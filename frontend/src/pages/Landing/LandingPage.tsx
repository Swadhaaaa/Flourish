import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Chrome, X, User, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Heart, Activity, Calendar as CalendarIcon, Car, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LandingPage = () => {
    const navigate = useNavigate();
    const { signIn, signUp, googleSignIn } = useAuth();
    const [showAuth, setShowAuth] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [showPassword, setShowPassword] = useState(false);

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [showTerms, setShowTerms] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const handleAuthAction = async () => {
        if (!agreedToTerms) {
            setError('Please agree to the Terms & Conditions');
            return;
        }
        setError('');
        setLoading(true);
        try {
            if (authMode === 'login') {
                await signIn(email, password);
            } else {
                await signUp(email, password, name, { termsAccepted: true, termsAcceptedAt: new Date().toISOString() });
            }
            setShowAuth(false);
            navigate('/mode-select');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (!agreedToTerms) {
            setError('Please agree to the Terms & Conditions');
            return;
        }
        setError('');
        try {
            await googleSignIn({ termsAccepted: true, termsAcceptedAt: new Date().toISOString() });
            setShowAuth(false);
            navigate('/mode-select');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Google Sign In failed');
        }
    };

    return (
        // FIXED POSITIONING to break out of MainLayout's padding and enforce 100vh
        <div className="fixed inset-0 z-50 overflow-hidden bg-[#FDFDFD] font-sans selection:bg-blue-100">
            {/* Dot Grid Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-60"
                style={{
                    backgroundImage: 'radial-gradient(#CBD5E1 1.5px, transparent 1.5px)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* 1. Sticky Note Group (Top Left) */}
            <motion.div
                initial={{ scale: 0, rotate: -15, y: -50 }}
                animate={{ scale: 1, rotate: -6, y: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="absolute top-8 left-8 md:top-12 md:left-12 lg:top-16 lg:left-24 hidden md:block group z-20"
            >
                {/* The Note */}
                <div className="w-48 aspect-square bg-[#FFEBA4] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.12)] transform -rotate-2 relative">
                    {/* Red Pin */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-rose-500 shadow-sm border-2 border-white/40 z-20" />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black/10 blur-[2px] transform translate-y-1 z-10" />

                    <p className="font-display font-bold text-slate-800 text-xl leading-tight text-left mt-4">
                        Take notes to keep track of details!
                    </p>
                </div>

                {/* Floating Blue Check Button (Outside) */}
                <div className="absolute -bottom-6 -left-6 w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.15)] z-30 transform rotate-12 transition-transform group-hover:rotate-0">
                    <div className="w-7 h-7 bg-[#3B82F6] rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                </div>
            </motion.div>

            {/* 2. Safe Cab Group (Top Right) */}
            <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute top-8 right-8 md:top-12 md:right-12 lg:top-16 lg:right-24 hidden md:block z-20"
            >
                <div className="relative bg-white rounded-[2rem] p-6 pr-10 shadow-[0_30px_60px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center gap-6 min-w-[280px]">
                    {/* Floating Car Button (Top Left Outside) */}
                    <div className="absolute -top-6 -left-6 w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-[0_20px_40px_rgba(0,0,0,0.2)] z-30">
                        <Car className="w-8 h-8" />
                    </div>

                    {/* Spacer for the overlapping icon */}
                    <div className="w-8 shrink-0" />

                    <div className="text-left flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-black text-slate-900 font-display">Safe Cab</span>
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100/50">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
                            <div>
                                <div className="text-[10px] font-bold text-slate-700 leading-tight">Verified Ride</div>
                                <div className="text-[9px] font-medium text-slate-400">Arriving in 2 min</div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* 3. Tasks Card (Bottom Left) */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="absolute bottom-8 left-8 md:bottom-12 md:left-12 lg:bottom-16 lg:left-24 hidden md:block z-20"
            >
                <div className="bg-white rounded-[2rem] p-6 shadow-[0_30px_60px_rgba(0,0,0,0.08)] w-72 text-left border border-slate-100 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                    <div className="text-sm font-black text-slate-900 mb-5 font-display pl-1">Today's tasks</div>
                    <div className="space-y-3">
                        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow">
                            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-[10px] font-bold text-orange-600 shrink-0">6</div>
                            <span className="text-xs font-bold text-slate-700">New Ideas for campaign</span>
                        </div>
                        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm relative overflow-hidden group">
                            <div className="flex items-center gap-3 mb-3 relative z-10">
                                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-[10px] font-bold text-emerald-600 shrink-0">3</div>
                                <span className="text-xs font-bold text-slate-700">Design PPT #4</span>
                            </div>
                            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-400 w-3/4 rounded-full group-hover:w-full transition-all duration-1000" />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* 4. Period Tracker (Bottom Right) */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute bottom-8 right-8 md:bottom-12 md:right-12 lg:bottom-16 lg:right-24 hidden md:block z-20"
            >
                <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.08)] w-80 text-left border border-slate-100 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                    <div className="mb-6">
                        <div className="text-sm font-black text-slate-900 font-display">Period Tracker</div>
                        <div className="text-xs font-medium text-slate-400 leading-tight mt-1">Track cycles, symptoms, and wellbeing insights.</div>
                    </div>
                    <div className="flex items-center justify-between px-2">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 rounded-[1.2rem] bg-rose-50 flex items-center justify-center text-rose-500 shadow-sm border border-rose-100">
                                <Heart className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 rounded-[1.2rem] bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-100">
                                <Activity className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 rounded-[1.2rem] bg-pink-50 flex items-center justify-center text-pink-500 shadow-sm border border-pink-100">
                                <CalendarIcon className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Central Content */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                <main className="text-center max-w-4xl mx-auto px-4 pointer-events-auto">
                    {/* Center Logo Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring' }}
                        className="w-24 h-24 bg-white rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] flex items-center justify-center mx-auto mb-10 border border-slate-50 relative"
                    >
                        {/* Glow */}
                        <div className="absolute inset-0 bg-blue-500/5 blur-2xl rounded-full -z-10" />
                        <div className="grid grid-cols-2 gap-2.5">
                            <div className="w-3.5 h-3.5 rounded-full bg-slate-800" />
                            <div className="w-3.5 h-3.5 rounded-full bg-slate-800" />
                            <div className="w-3.5 h-3.5 rounded-full bg-[#3B82F6]" />
                            <div className="w-3.5 h-3.5 rounded-full bg-slate-800" />
                        </div>
                    </motion.div>

                    <h1 className="font-display font-black text-slate-900 tracking-tight mb-8 leading-[1.05] drop-shadow-sm
                        text-[clamp(3rem,5vw,5.5rem)]">
                        Thrive at Work,<br />
                        <span className="text-[#94A3B8]">Without the Overwhelm</span>
                    </h1>

                    <p className="text-slate-500 font-medium text-sm md:text-base max-w-xl mx-auto mb-12 leading-relaxed tracking-wide">
                        An AI companion designed for women professionals.
                        Balance your workload, protect your boundaries, and
                        nurture your wellbeing—all in one empowering platform.
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(37,99,235,0.5)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAuth(true)}
                        className="bg-[#2563EB] text-white px-12 py-5 rounded-full font-bold text-lg shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] transition-all font-display hover:bg-[#1d4ed8]"
                    >
                        Start your journey
                    </motion.button>
                </main>
            </div>

            {/* Invezto Inspired Login Popup (Preserved) */}
            <AnimatePresence>
                {showAuth && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <div className="absolute inset-0" onClick={() => setShowAuth(false)} />

                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-[400px] p-8 shadow-2xl relative overflow-hidden z-20"
                        >
                            <button
                                onClick={() => setShowAuth(false)}
                                className="absolute top-6 right-6 w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all z-30"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <div className="relative z-10 text-center mb-8 pt-2">
                                <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight mb-2">
                                    {authMode === 'login' ? 'Welcome Back' : 'Get Started'}
                                </h2>
                                <p className="text-xs font-bold text-slate-500 tracking-wide">
                                    Your personal growth ecosystem awaits.
                                </p>
                            </div>

                            {error && (
                                <div className="bg-rose-50 border border-rose-100 text-rose-500 text-[10px] font-bold p-3 rounded-xl mb-4 text-center">
                                    {error}
                                </div>
                            )}

                            {/* Terms Checkbox */}
                            <div className="flex items-start gap-3 mb-6 relative z-10 px-1 p-3 rounded-xl bg-slate-50/50">
                                <div className="relative flex items-center mt-0.5">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={agreedToTerms}
                                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                                        className="peer h-4 w-4 cursor-pointer appearance-none rounded-md border-2 border-slate-200 transition-all hover:border-blue-500 checked:border-blue-500 checked:bg-blue-500"
                                    />
                                    <Sparkles className="pointer-events-none absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                                </div>
                                <label htmlFor="terms" className="text-[10px] font-bold text-slate-500 leading-tight cursor-pointer select-none">
                                    I agree to the <button onClick={(e) => { e.preventDefault(); setShowTerms(true); }} className="text-blue-600 hover:underline font-black">Terms & Conditions</button>.
                                </label>
                            </div>

                            <button
                                onClick={handleGoogleLogin}
                                disabled={!agreedToTerms}
                                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl text-xs flex items-center justify-center gap-3 transition-all hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed mb-6 shadow-xl shadow-slate-200"
                            >
                                <Chrome className="w-4 h-4" />
                                <span>Continue with Google</span>
                            </button>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-px flex-1 bg-slate-100" />
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Or via Email</span>
                                <div className="h-px flex-1 bg-slate-100" />
                            </div>

                            <div className="space-y-3">
                                {authMode === 'signup' && (
                                    <div className="relative">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-slate-50 border border-transparent focus:border-blue-500/50 focus:bg-white rounded-xl py-3.5 pl-12 pr-4 text-xs font-bold text-slate-900 outline-none transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                )}
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-50 border border-transparent focus:border-blue-500/50 focus:bg-white rounded-xl py-3.5 pl-12 pr-4 text-xs font-bold text-slate-900 outline-none transition-all placeholder:text-slate-400"
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-transparent focus:border-blue-500/50 focus:bg-white rounded-xl py-3.5 pl-12 pr-12 text-xs font-bold text-slate-900 outline-none transition-all placeholder:text-slate-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                <button
                                    onClick={handleAuthAction}
                                    disabled={loading || !agreedToTerms}
                                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-all text-xs flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 uppercase tracking-widest font-display"
                                >
                                    <span>{loading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}</span>
                                    {!loading && <ArrowRight className="w-3.5 h-3.5" />}
                                </button>
                            </div>

                            <div className="text-center mt-6">
                                <button
                                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                                    className="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-wider"
                                >
                                    {authMode === 'login' ? "New here? Create an account" : "Already have an account? Sign In"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Terms Modal (Preserved) */}
            {
                showTerms && (
                    <div className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
                        <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto relative">
                            <button onClick={() => setShowTerms(false)} className="absolute top-4 right-4"><X className="w-5 h-5 text-slate-400" /></button>
                            <h3 className="text-xl font-bold mb-4 font-display">Terms & Conditions</h3>
                            <div className="prose prose-sm text-slate-600 font-medium">
                                <p>By using Flourish, you agree to our terms of service regarding data privacy, user conduct, and liability.</p>
                                {/* ... (Shortened for brevity) ... */}
                            </div>
                            <button onClick={() => { setAgreedToTerms(true); setShowTerms(false); }} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl mt-6">
                                I Agree
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default LandingPage;
