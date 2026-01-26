import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useMode } from '../context/ModeContext';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle, X, ChevronRight } from 'lucide-react';

const MainLayout = () => {
    const { mode, switchMode } = useMode();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showProfilePopup, setShowProfilePopup] = useState(false);
    const [showHomeModal, setShowHomeModal] = useState(false);
    const [homeStep, setHomeStep] = useState(1);

    // Only show sidebar in specific modes or profile
    const showSidebar = mode === 'home' || mode === 'work' || location.pathname.startsWith('/profile');

    useEffect(() => {
        // 1. Initial Profile Onboarding Prompt
        if (showSidebar && !sessionStorage.getItem('profile-popup-shown') && !localStorage.getItem('work-setup-complete')) {
            const timer = setTimeout(() => {
                setShowProfilePopup(true);
            }, 1000);
            return () => clearTimeout(timer);
        }

        // 2. Orchestration: Auto-switch to Home Mode after Work Setup
        if (mode === 'work' && localStorage.getItem('work-setup-complete') === 'true' && !localStorage.getItem('home-setup-complete')) {
            const timer = setTimeout(() => {
                switchMode('home');
                navigate('/home/dashboard');
                setShowHomeModal(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [showSidebar, mode, switchMode, navigate]);

    const dismissPopup = () => {
        setShowProfilePopup(false);
        sessionStorage.setItem('profile-popup-shown', 'true');
    };

    const nextHomeStep = () => {
        if (homeStep < 4) setHomeStep(homeStep + 1);
        else {
            setShowHomeModal(false);
            localStorage.setItem('home-setup-complete', 'true');
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            {showSidebar && <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}

            {/* Full-Page Blurred Profile Onboarding Modal */}
            <AnimatePresence>
                {showProfilePopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-orange-950/10 backdrop-blur-xl"
                    >
                        <div className="absolute inset-0" onClick={dismissPopup} />

                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="bg-white/95 w-full max-w-[400px] p-10 rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] border border-white/50 relative overflow-hidden text-center z-10"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/40 blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            <div className="w-20 h-20 bg-orange-50 rounded-[2rem] flex items-center justify-center text-[#FF8A71] shadow-inner mx-auto mb-8">
                                <UserCircle className="w-10 h-10" />
                            </div>
                            <div className="mb-8">
                                <h4 className="text-3xl font-black text-slate-800 tracking-tighter mb-4">Complete Profile</h4>
                                <p className="text-sm font-bold text-slate-500 leading-relaxed max-w-[280px] mx-auto">
                                    Unlock your full Flourish journey by completing your profile in a few clicks.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <button
                                    onClick={() => { dismissPopup(); navigate('/profile/setup'); }}
                                    className="w-full bg-[#FF8A71] text-white py-5 rounded-[1.8rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-slate-900 transition-all active:scale-95 shadow-2xl shadow-orange-200"
                                >
                                    <span>Complete Now</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <button onClick={dismissPopup} className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-600 transition-colors">Skip for later</button>
                            </div>
                            <button onClick={dismissPopup} className="absolute top-8 right-8 text-slate-300 hover:text-slate-500 transition-colors"><X className="w-5 h-5" /></button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Home Profile Multi-Step Modal */}
            <AnimatePresence>
                {showHomeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-purple-950/10 backdrop-blur-2xl"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 40, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 40, opacity: 0 }}
                            className="bg-white/95 w-full max-w-[440px] p-12 rounded-[3.5rem] shadow-[0_50px_120px_rgba(0,0,0,0.15)] border border-white relative overflow-hidden z-10"
                        >
                            <div className="absolute top-0 left-0 w-32 h-32 bg-purple-100/40 blur-3xl -ml-16 -mt-16 pointer-events-none" />

                            <div className="text-center mb-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-[9px] font-black uppercase tracking-widest mb-4">
                                    Home Setup Phase {homeStep}/4
                                </div>
                                <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-2 italic">Start Flourishing</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Answer questions to start</p>
                            </div>

                            <div className="min-h-[220px]">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={homeStep}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        {homeStep === 1 && (
                                            <div className="space-y-4">
                                                <p className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">What kind of home do you have?</p>
                                                <div className="grid gap-3">
                                                    {['Bachelor', 'Mini Family', 'Pet Family'].map(type => (
                                                        <button
                                                            key={type}
                                                            onClick={nextHomeStep}
                                                            className="w-full py-5 px-6 bg-slate-50 hover:bg-purple-50 hover:text-purple-600 rounded-2xl border-2 border-transparent hover:border-purple-100 transition-all font-bold text-slate-700 text-left flex items-center justify-between group"
                                                        >
                                                            {type}
                                                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {homeStep === 2 && (
                                            <div className="space-y-4">
                                                <p className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Immediate Person Details</p>
                                                <textarea placeholder="Tell us about the people you live with..." className="w-full bg-slate-50 border-2 border-transparent focus:border-purple-100 focus:bg-white rounded-3xl p-6 h-32 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 resize-none" />
                                            </div>
                                        )}

                                        {homeStep === 3 && (
                                            <div className="space-y-4">
                                                <p className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Househelps Info</p>
                                                <input type="text" placeholder="Number of helps, frequency..." className="w-full bg-slate-50 border-2 border-transparent focus:border-purple-100 focus:bg-white rounded-2xl p-5 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300" />
                                            </div>
                                        )}

                                        {homeStep === 4 && (
                                            <div className="space-y-4">
                                                <p className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Your Hobbies</p>
                                                <input type="text" placeholder="Painting, Running, Reading..." className="w-full bg-slate-50 border-2 border-transparent focus:border-purple-100 focus:bg-white rounded-2xl p-5 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300" />
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {homeStep > 1 && (
                                <button
                                    onClick={nextHomeStep}
                                    className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.8rem] mt-10 shadow-2xl shadow-slate-200 active:scale-[0.98] transition-all text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 group"
                                >
                                    <span>{homeStep === 4 ? 'Let\'s Start' : 'Continue'}</span>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}

                            <div className="flex justify-center gap-1.5 mt-8">
                                {[1, 2, 3, 4].map(s => (
                                    <div key={s} className={cn("h-1.5 rounded-full transition-all duration-500", homeStep === s ? "w-6 bg-purple-500" : "w-1.5 bg-slate-100")} />
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => { setIsSidebarOpen(!isSidebarOpen); }}
                    className="p-3 bg-white/80 backdrop-blur-md shadow-lg rounded-xl border border-white/50 text-slate-600"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
            </div>

            <main className={cn(
                "min-h-screen transition-all duration-500 ease-in-out",
                showSidebar ? (isSidebarOpen ? "lg:pl-72" : "lg:pl-24") : "pl-0"
            )}>
                <div className="p-4 md:p-8 max-w-7xl mx-auto h-full pt-20 lg:pt-8 min-h-screen">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
