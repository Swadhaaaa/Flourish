import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity, Calendar, Zap, AlertTriangle, CheckCircle, Clock, Phone, Truck, User, Save, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { checkBoundary, getWorkloadInsight } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';;

export default function WorkDashboard() {
    const { user, userProfile, updateUserProfile } = useAuth();
    const [boundaryCheck, setBoundaryCheck] = useState<any>(null);
    const [workloadInsight, setWorkloadInsight] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Profile Modal State
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        if (!loading && user && userProfile) {
            if (!userProfile.name || userProfile.name.trim() === '') {
                setShowProfileModal(true);
            }
        }
    }, [user, userProfile, loading]);

    const handleSaveProfile = async () => {
        if (!nameInput.trim()) return;
        setSavingProfile(true);
        try {
            await updateUserProfile({ name: nameInput });
            setShowProfileModal(false);
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setSavingProfile(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            // ... existing fetchData logic ...
            try {
                const [boundary, workload] = await Promise.all([
                    checkBoundary(),
                    getWorkloadInsight()
                ]);
                setBoundaryCheck(boundary);
                setWorkloadInsight(workload);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // ... statCards definition ...
    const statCards = [
        {
            title: "Tone Shield",
            icon: Shield,
            desc: "Protect your peace",
            path: "/work/tone-shield",
            color: "text-indigo-500",
            bg: "bg-indigo-100 dark:bg-indigo-900/20"
        },
        {
            title: "Helpline",
            icon: Phone,
            desc: "Emergency contacts",
            path: "/work/helpline",
            color: "text-purple-500",
            bg: "bg-purple-100 dark:bg-purple-900/20"
        },
        {
            title: "Burnout Watch",
            icon: Activity,
            desc: "Monitor risk levels",
            path: "/work/burnout",
            color: "text-rose-500",
            bg: "bg-rose-100 dark:bg-rose-900/20"
        },
        {
            title: "Safe Cab",
            icon: Truck,
            desc: "Premium ride scheduling",
            path: "/work/cab",
            color: "text-teal-500",
            bg: "bg-teal-100 dark:bg-teal-900/20"
        },
        {
            title: "Auto Scheduler",
            icon: Calendar,
            desc: "Energy-based planning",
            path: "/work/auto-schedule",
            color: "text-amber-500",
            bg: "bg-amber-100 dark:bg-amber-900/20"
        },
    ];

    return (
        <div className="space-y-8 relative min-h-[calc(100vh-4rem)]">
            {/* ... background elements ... */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
            >
                <h1 className="text-4xl font-display font-black text-foreground tracking-tighter flex items-center">
                    {`Hello ${userProfile?.name?.split(' ')[0] || 'Friend'}`.split("").map((char, index) => (
                        <motion.span
                            key={index}
                            initial={{ y: -120, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{
                                type: "spring",
                                damping: 7,
                                stiffness: 200,
                                delay: index * 0.08,
                                mass: 1.5
                            }}
                            className={cn(char === " " ? "mr-3" : "")}
                        >
                            {char}
                        </motion.span>
                    ))}
                </h1>
                <p className="text-muted-foreground mt-4 text-lg font-bold">Your AI assistant is monitoring your workload.</p>
            </motion.div>

            {/* Alert Section */}
            {loading ? (
                <div className="h-40 bg-accent/20 rounded-3xl animate-pulse relative z-10" />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    {/* Boundary Alert */}
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className={cn(
                            "p-6 rounded-3xl border flex items-start gap-4 transition-all hover:shadow-2xl hover:border-black/5 backdrop-blur-md",
                            boundaryCheck?.status === 'red' ? "bg-red-50/80 dark:bg-red-900/10 border-red-200 dark:border-red-900"
                                : boundaryCheck?.status === 'amber' ? "bg-amber-50/80 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900"
                                    : "bg-emerald-50/80 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900"
                        )}
                    >
                        <div className={cn(
                            "p-3 rounded-xl",
                            boundaryCheck?.status === 'red' ? "bg-red-100 text-red-600" :
                                boundaryCheck?.status === 'amber' ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                        )}>
                            {boundaryCheck?.status === 'red' ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-1 text-slate-800">{boundaryCheck?.title}</h3>
                            <p className="text-sm opacity-80 mb-2 leading-relaxed text-slate-600">{boundaryCheck?.message}</p>
                            {boundaryCheck?.can_automate_reply && (
                                <button className="text-xs font-bold uppercase tracking-wider bg-white/70 px-3 py-1 rounded-lg border border-black/5 hover:bg-white transition-colors">
                                    Enable Auto-Response
                                </button>
                            )}
                        </div>
                    </motion.div>

                    {/* Workload Insight */}
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                        className="bg-white/70 backdrop-blur-md border border-white/50 p-6 rounded-3xl shadow-sm hover:shadow-2xl transition-all flex items-start gap-4"
                    >
                        <div className="p-3 bg-primary/10 text-primary rounded-xl">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-1 text-slate-800">{workloadInsight?.title}</h3>
                            <p className="text-sm text-slate-600 mb-3 leading-relaxed">{workloadInsight?.recommendation}</p>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white/50 px-3 py-1.5 rounded-lg inline-flex border border-white/30 truncate">
                                <Clock className="w-3 h-3" /> {workloadInsight?.summary}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Quick Actions */}
            <motion.h2
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-2xl font-black mt-8 tracking-tight relative z-10 text-slate-800"
            >
                Personalized Tools
            </motion.h2>
            <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10"
                initial="hidden"
                animate="visible"
                variants={{
                    visible: {
                        transition: {
                            staggerChildren: 0.15
                        }
                    }
                }}
            >
                {statCards.map((card) => (
                    <Link to={card.path} key={card.title}>
                        <motion.div
                            variants={{
                                hidden: { opacity: 0, y: 80, scale: 0.9 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                    transition: { type: 'spring', damping: 15, stiffness: 100 }
                                }
                            }}
                            whileHover={{ scale: 1.05, y: -10, rotate: 1 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-white/60 backdrop-blur-xl border border-white/40 p-8 rounded-[2.5rem] h-full hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] transition-all group overflow-hidden relative"
                        >
                            <div className={cn("w-14 h-14 rounded-[1.25rem] flex items-center justify-center mb-5 transition-all group-hover:scale-110 shadow-lg", card.bg, card.color)}>
                                <card.icon className="w-7 h-7" />
                            </div>
                            <h3 className="font-black text-xl mb-1.5 text-slate-800 tracking-tight">{card.title}</h3>
                            <p className="text-slate-500 text-xs font-bold leading-relaxed">{card.desc}</p>

                            {/* Animated light flare on hover */}
                            <motion.div
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '100%' }}
                                transition={{ duration: 1 }}
                                className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 opacity-0 group-hover:opacity-100"
                            />
                        </motion.div>
                    </Link>
                ))}
            </motion.div>
            {/* Profile Completion Modal */}
            {showProfileModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-[#FF8A71] mb-6 shadow-sm">
                                <User className="w-8 h-8" />
                            </div>

                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Complete Profile</h2>
                            <p className="text-slate-500 text-sm font-bold mb-8">We noticed your profile is missing a name. Let's fix that to personalize your experience.</p>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Name</label>
                                    <input
                                        type="text"
                                        value={nameInput}
                                        onChange={(e) => setNameInput(e.target.value)}
                                        placeholder="e.g. Your Name"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#FF8A71] text-slate-900 dark:text-white font-bold placeholder:text-slate-300 transition-all"
                                    />
                                </div>

                                <button
                                    onClick={handleSaveProfile}
                                    disabled={savingProfile || !nameInput.trim()}
                                    className="w-full bg-[#FF8A71] hover:bg-[#ff7a5c] text-white font-black py-4 rounded-xl shadow-lg shadow-orange-200 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    {savingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    <span>Save Profile</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
