import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Chrome, X, User, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
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
        <div className="h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#FFF8F5]">
            {/* Peachy-Purple Cloud Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {/* Same background divs... */}
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
                {/* ... Main Page Content ... */}
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
                            className="bg-white/95 rounded-[2.5rem] w-full max-w-[360px] p-8 shadow-[0_40px_100px_rgba(0,0,0,0.12)] border border-white/50 relative overflow-hidden z-20"
                        >
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-100/40 blur-3xl -mr-20 -mt-20 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-100/40 blur-3xl -ml-20 -mb-20 pointer-events-none" />

                            <button
                                onClick={() => setShowAuth(false)}
                                className="absolute top-6 right-6 w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-[#FF8A71] hover:bg-white transition-all z-30 active:scale-90"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <div className="relative z-10 text-center mb-6 mt-2">
                                <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-2">
                                    {authMode === 'login' ? 'Welcome Back' : 'Get Started'}
                                </h2>
                                <p className="text-xs font-bold text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                                    Your personal growth ecosystem awaits.
                                </p>
                            </div>

                            {/* ERROR MESSAGE */}
                            {error && (
                                <div className="bg-rose-50 border border-rose-100 text-rose-500 text-[10px] font-bold p-3 rounded-xl mb-4 text-center">
                                    {error}
                                </div>
                            )}

                            {/* Terms Checkbox */}
                            <div className="flex items-start gap-2 mb-4 relative z-10 px-1">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={agreedToTerms}
                                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                                        className="peer h-4 w-4 cursor-pointer appearance-none rounded-md border-2 border-slate-200 transition-all hover:border-[#FF8A71] checked:border-[#FF8A71] checked:bg-[#FF8A71]"
                                    />
                                    <Sparkles className="pointer-events-none absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                                </div>
                                <label htmlFor="terms" className="text-[10px] font-bold text-slate-500 leading-tight cursor-pointer select-none">
                                    I agree to the <button onClick={(e) => { e.preventDefault(); setShowTerms(true); }} className="text-[#FF8A71] hover:underline">Terms & Conditions</button> and Privacy Policy.
                                </label>
                            </div>

                            {/* Google First */}
                            <button
                                onClick={handleGoogleLogin}
                                disabled={!agreedToTerms}
                                className="w-full bg-slate-900 text-white font-black py-4 rounded-[1.5rem] shadow-xl shadow-slate-200 active:scale-[0.98] transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 group mb-6 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Chrome className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                                <span>Continue with Google</span>
                            </button>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-px flex-1 bg-slate-100" />
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] shrink-0">Or via Email</span>
                                <div className="h-px flex-1 bg-slate-100" />
                            </div>

                            {/* Toggle for Email Form */}
                            <div className="space-y-3 relative z-10">
                                {authMode === 'signup' && (
                                    <div className="relative group">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#FF8A71] transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-slate-50/50 border-2 border-transparent focus:border-[#FF8A71]/20 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-orange-100/50 transition-all font-bold text-slate-700 text-xs outline-none placeholder:text-slate-300"
                                        />
                                    </div>
                                )}
                                <div className="relative group">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#FF8A71] transition-colors" />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-50/50 border-2 border-transparent focus:border-[#FF8A71]/20 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-orange-100/50 transition-all font-bold text-slate-700 text-xs outline-none placeholder:text-slate-300"
                                    />
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#FF8A71] transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50/50 border-2 border-transparent focus:border-[#FF8A71]/20 rounded-2xl py-3.5 pl-12 pr-12 focus:ring-2 focus:ring-orange-100/50 transition-all font-bold text-slate-700 text-xs outline-none placeholder:text-slate-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#FF8A71] transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                <button
                                    onClick={handleAuthAction}
                                    disabled={loading || !agreedToTerms}
                                    className="w-full bg-[#FF8A71] text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-200 active:scale-[0.98] transition-all text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 group mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span>{loading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}</span>
                                </button>

                                <div className="text-center mt-4">
                                    <button
                                        onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#FF8A71] transition-colors"
                                    >
                                        {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Terms Modal inside LandingPage for simplicity */}
                {showTerms && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] bg-white/80 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <div className="absolute inset-0" onClick={() => setShowTerms(false)} />
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl border border-slate-100 relative h-[80vh] flex flex-col"
                        >
                            <button onClick={() => setShowTerms(false)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full hover:bg-slate-100">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                            <h3 className="text-2xl font-black text-slate-800 mb-6">Privacy & Terms</h3>
                            <div className="flex-1 overflow-y-auto no-scrollbar prose prose-sm prose-slate pr-2">
                                <h4 className="font-extrabold text-slate-700 mt-0">1. Privacy Policy</h4>
                                <p className="text-xs leading-relaxed text-slate-500 mb-4">
                                    <strong>Data Collection:</strong> We collect your name, email, and task data to provide personalized scheduling. Your data is stored securely using Google Firebase.<br />
                                    <strong>AI Usage:</strong> Your task descriptions are processed by our AI algorithms to generate schedules. We do not share your personal identifiers with third-party AI models for training purposes.<br />
                                    <strong>Security:</strong> We implement industry-standard encryption. However, no method of transmission is 100% secure.
                                </p>

                                <h4 className="font-extrabold text-slate-700">2. Terms of Service</h4>
                                <p className="text-xs leading-relaxed text-slate-500 mb-4">
                                    <strong>Usage:</strong> Tea Hack is a productivity tool. The schedules generated are suggestions. You are responsible for managing your actual commitments.<br />
                                    <strong>Account:</strong> You are responsible for maintaining the confidentiality of your account credentials.<br />
                                    <strong>Liability:</strong> Tea Hack is not liable for any missed deadlines, lost data, or productivity losses resulting from the use of this app.
                                </p>

                                <h4 className="font-extrabold text-slate-700">3. User Conduct</h4>
                                <p className="text-xs leading-relaxed text-slate-500 mb-4">
                                    You agree not to misuse the services or attempt to access data that does not belong to you. We reserve the right to terminate accounts that violate these terms.
                                </p>

                                <h4 className="font-extrabold text-slate-700">4. Updates</h4>
                                <p className="text-xs leading-relaxed text-slate-500">
                                    We may update these terms occasionally. Continued use of the app constitutes acceptance of the new terms.
                                </p>
                            </div>
                            <button onClick={() => { setAgreedToTerms(true); setShowTerms(false); }} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl mt-6">
                                I Understand & Agree
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


export default LandingPage;
