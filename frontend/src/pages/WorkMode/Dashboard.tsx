import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Shield, Activity, Calendar, AlertTriangle, Phone, Truck, User, Save, Loader2, ArrowRight, Sparkles, Music, Heart, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { checkBoundary, getWorkloadInsight } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { MusicPlayer } from '../../components/MusicPlayer';
import InvisibleLaborLog from '../../components/InvisibleLaborLog';
import { Bar, Tooltip, ResponsiveContainer, Cell, Line, ComposedChart, XAxis, YAxis } from 'recharts';
import { db } from '../../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { format, subDays, startOfDay } from 'date-fns';

// Tilt Card Component for extra "Wow" factor
function TiltCard({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className={cn("relative transition-all duration-200 ease-out cursor-pointer", className)}
        >
            <div style={{ transform: "translateZ(75px)" }} className="absolute inset-4 rounded-[2rem] shadow-2xl opacity-0 group-hover:opacity-20 transition-opacity bg-black blur-xl -z-10" />
            {children}
        </motion.div>
    );
}

// Mood mapping to energy score
const MOOD_SCORES: Record<string, number> = {
    'Great': 100,
    'Good': 80,
    'Okay': 60,
    'Low': 40,
    'Stressed': 20
};

export default function WorkDashboard() {
    const { user, userProfile, updateUserProfile } = useAuth();
    const [boundaryCheck, setBoundaryCheck] = useState<any>(null);
    const [workloadInsight, setWorkloadInsight] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Profile Modal State
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    // Music Player State
    const [showMusicPlayer, setShowMusicPlayer] = useState(false);

    const [weeklyStats, setWeeklyStats] = useState<any[]>([]);
    const [showLaborLog, setShowLaborLog] = useState(false);

    // Fetch Moods and Reminders for the last 7 days
    useEffect(() => {
        if (!user) return;

        const sevenDaysAgo = startOfDay(subDays(new Date(), 7));

        // 1. Listen to Moods
        const moodQuery = query(
            collection(db, `users/${user.uid}/mood_checkins`),
            where('date', '>=', format(sevenDaysAgo, 'yyyy-MM-dd')),
            orderBy('date', 'asc')
        );

        // 2. Listen to Reminders (Fetch last 7 days, filter/sort in JS to avoid composite index)
        const remindersQuery = query(
            collection(db, `users/${user.uid}/reminders`),
            where('date', '>=', format(sevenDaysAgo, 'yyyy-MM-dd'))
        );

        const unsubMoods = onSnapshot(moodQuery, (moodSnap) => {
            const unsubReminders = onSnapshot(remindersQuery, (remSnap) => {
                const moodsByDay = moodSnap.docs.reduce((acc: any, d) => {
                    const data = d.data();
                    acc[data.date] = MOOD_SCORES[data.mood] || 50;
                    return acc;
                }, {});

                const tasksByDay = remSnap.docs.reduce((acc: any, d) => {
                    const data = d.data();
                    if (data.completed) {
                        acc[data.date] = (acc[data.date] || 0) + 1;
                    }
                    return acc;
                }, {});

                // Generate 7-day stats
                const stats = [];
                let totalTasks = 0;
                for (let i = 6; i >= 0; i--) {
                    const date = subDays(new Date(), i);
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const taskCount = tasksByDay[dateStr] || 0;
                    totalTasks += taskCount;
                    stats.push({
                        date: dateStr,
                        day: format(date, 'EEE'),
                        energy: moodsByDay[dateStr] || 0, // 0 if not logged
                        productivity: taskCount * 20, // scale for chart visibility
                        rawProductivity: taskCount
                    });
                }
                setWeeklyStats(stats);
            });
            return () => unsubReminders();
        });

        return () => unsubMoods();
    }, [user]);

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

    return (
        <div className="min-h-screen text-foreground font-sans p-6 pb-20 relative overflow-hidden">
            {/* Ambient Noise overlay for texture */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-multiply" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-rose-100/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-100/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Section */}
                <header className="mb-12 flex justify-between items-end">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-6xl font-black text-foreground tracking-tighter mb-2 flex flex-wrap items-center"
                        >
                            {"Hello, Ayushi!".split("").map((char, index) => (
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
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-muted-foreground font-medium"
                        >
                            Your workspace is ready. Energy levels look good.
                        </motion.p>
                    </div>
                    <div className="hidden md:block">
                        <div className="bg-white/50 backdrop-blur-md border border-white/60 p-2 rounded-2xl flex gap-2">
                            <div className="px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-bold text-muted-foreground">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Grid (Bento Box Layout) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[180px]">

                    {/* 1. Main Feature: Tone Shield (Large Card) */}
                    <Link to="/work/tone-shield" className="md:col-span-2 row-span-2 group perspective-1000">
                        <TiltCard className="h-full bg-gradient-to-br from-[#FDEEE8] to-[#F8DDD4] rounded-[2.5rem] p-6 md:p-8 text-rose-950 shadow-2xl shadow-rose-200/50 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl -mr-16 -mt-16" />
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-16 h-16 bg-white/60 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-sm">
                                    <Shield className="w-8 h-8 text-rose-500" />
                                </div>
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-black mb-2 text-rose-950">Tone Shield</h3>
                                    <p className="text-rose-800/80 font-medium text-base md:text-lg leading-relaxed max-w-xs">
                                        Detect & diffuse conflict before it starts. AI-powered communication armor.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-rose-900 opacity-80 group-hover:gap-4 transition-all">
                                    <span>Activate Shield</span>
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </TiltCard>
                    </Link>

                    {/* 2. Sonic Sanctuary (Music) - NEW */}
                    <div className="md:col-span-1 md:row-span-2 group perspective-1000" onClick={() => setShowMusicPlayer(true)}>
                        <TiltCard className="h-full bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/50 overflow-hidden relative cursor-pointer">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
                            {/* Visualizer bars simulation */}
                            <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-between px-8 pb-8 gap-1 opacity-30">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="w-full bg-pink-500 rounded-t-lg h-full animate-pulse" style={{ animationDelay: `${i * 0.1}s`, height: `${Math.random() * 100}%` }} />
                                ))}
                            </div>

                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                                    <Music className="w-7 h-7 text-pink-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black mb-1">Sonic Sanctuary</h3>
                                    <p className="text-slate-400 text-sm font-medium">Focus & Calm Audio</p>
                                </div>
                            </div>
                        </TiltCard>
                    </div>

                    <div className="md:col-span-1 md:row-span-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2.5rem] p-6 shadow-sm relative overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 dark:text-white">Inner Progress</h3>
                            <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-500 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">Flow State</div>
                        </div>
                        <div className="flex-1 w-full h-[120px] -ml-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={weeklyStats.length > 0 ? weeklyStats : [
                                    { day: 'M', energy: 40, productivity: 20 },
                                    { day: 'T', energy: 60, productivity: 40 },
                                    { day: 'W', energy: 30, productivity: 70 },
                                ]}>
                                    <XAxis dataKey="day" hide />
                                    <YAxis hide domain={[0, 100]} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ 
                                            borderRadius: '16px', 
                                            border: 'none', 
                                            boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            padding: '12px'
                                        }}
                                        itemStyle={{ padding: '2px 0' }}
                                    />
                                    <Bar dataKey="energy" radius={[6, 6, 6, 6]} barSize={8}>
                                        {(weeklyStats.length > 0 ? weeklyStats : []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.energy > 60 ? '#fb7185' : '#e2e8f0'} />
                                        ))}
                                    </Bar>
                                    <Line 
                                        type="monotone" 
                                        dataKey="productivity" 
                                        stroke="#f43f5e" 
                                        strokeWidth={3} 
                                        dot={{ r: 3, fill: '#f43f5e' }}
                                        activeDot={{ r: 5, strokeWidth: 0 }}
                                        animationDuration={1500}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Energy</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-rose-600 rounded-sm"></div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Tasks</span>
                            </div>
                        </div>
                    </div>

                    {/* 4. Me Time (Hobbies) - NEW */}
                    <Link to="/work/me-time" className="md:col-span-1 md:row-span-1 group perspective-1000">
                        <TiltCard className="h-full bg-pink-50 border border-pink-100 rounded-[2.5rem] p-6 hover:shadow-xl transition-all relative overflow-hidden group-hover:-translate-y-1">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-pink-200 rounded-full blur-xl opacity-50" />
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <Heart className="w-8 h-8 text-pink-500" />
                                <div>
                                    <h3 className="text-xl font-black text-slate-800">Me Time</h3>
                                    <p className="text-xs font-bold text-pink-400 uppercase tracking-widest mt-1">Hobbies Nearby</p>
                                </div>
                            </div>
                        </TiltCard>
                    </Link>

                    {/* 5. Helpline (Square) */}
                    <Link to="/work/helpline" className="md:col-span-1 md:row-span-1 group perspective-1000">
                        <div className="h-full bg-slate-900 rounded-[2.5rem] p-6 hover:shadow-xl transition-all relative overflow-hidden group-hover:-translate-y-1">
                            <div className="absolute right-0 bottom-0 w-32 h-32 bg-amber-500 rounded-full blur-3xl -mr-10 -mb-10 opacity-20" />
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <Phone className="w-8 h-8 text-purple-400" />
                                <div>
                                    <h3 className="text-xl font-black text-white">Helpline</h3>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">24/7 Support</p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* 6. Auto Scheuler (Horizontal) */}
                    <Link to="/work/auto-schedule" className="md:col-span-2 md:row-span-1 group perspective-1000">
                        <div className="h-full bg-[#FF8A71] rounded-[2.5rem] p-6 flex items-center justify-between hover:shadow-lg transition-all group-hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 pointer-events-none" />
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-sm text-white">
                                    <Calendar className="w-8 h-8" />
                                </div>
                                <div className="text-white">
                                    <h3 className="text-2xl font-black">Auto Schedule</h3>
                                    <p className="text-white/80 font-medium">Smart AI planning</p>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center group-hover:bg-white group-hover:text-[#FF8A71] transition-all text-white relative z-10">
                                <ArrowRight className="w-6 h-6" />
                            </div>
                        </div>
                    </Link>

                    {/* 7. Burnout Watch (Square) */}
                    <Link to="/work/burnout" className="md:col-span-1 md:row-span-1 group perspective-1000">
                        <div className="h-full bg-card border border-border rounded-[2.5rem] p-6 hover:shadow-xl transition-all relative overflow-hidden group-hover:-translate-y-1">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-rose-100 rounded-full blur-2xl -mr-10 -mt-10 opacity-50" />
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <Activity className="w-8 h-8 text-rose-500" />
                                <div>
                                    <h3 className="text-xl font-black text-card-foreground">Burnout</h3>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Check Levels</p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* 8. Safe Cab (Square) */}
                    <Link to="/work/cab" className="md:col-span-1 md:row-span-1 group perspective-1000">
                        <div className="h-full bg-emerald-50 border border-emerald-100 rounded-[2.5rem] p-6 hover:shadow-xl transition-all relative overflow-hidden group-hover:-translate-y-1">
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <Truck className="w-8 h-8 text-emerald-500" />
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-emerald-900">Safe Cab</h3>
                                    <p className="text-xs font-bold text-slate-400 dark:text-emerald-800 uppercase tracking-widest mt-1">Ride Safe</p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* 9. invisible Labor Log (Square) - NEW */}
                    <div className="md:col-span-1 md:row-span-1 group perspective-1000" onClick={() => setShowLaborLog(true)}>
                        <TiltCard className="h-full bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 hover:shadow-xl transition-all relative overflow-hidden cursor-pointer group-hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl -mr-10 -mt-10 opacity-20" />
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <Sparkles className="w-8 h-8 text-indigo-400" />
                                <div>
                                    <h3 className="text-xl font-black text-white">Invisible Labor</h3>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Log & Highlight</p>
                                </div>
                            </div>
                        </TiltCard>
                    </div>

                    {/* 10. Sisterhood (Square) - NEW */}
                    <Link to="/work/sisterhood" className="md:col-span-1 md:row-span-1 group perspective-1000">
                        <TiltCard className="h-full bg-amber-50 border border-purple-100 rounded-[2.5rem] p-6 hover:shadow-xl transition-all relative overflow-hidden group-hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-purple-100/30" />
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <Users className="w-8 h-8 text-amber-500" />
                                <div>
                                    <h3 className="text-xl font-black text-slate-800">Sisterhood</h3>
                                    <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mt-1">Find your Tribe</p>
                                </div>
                            </div>
                        </TiltCard>
                    </Link>

                    {/* 11. Dynamic Insight Widget */}
                    <div className="md:col-span-2 md:row-span-1 bg-card border border-border rounded-[2.5rem] p-6 flex items-center gap-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-secondary/50 -z-10" />
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-500 shrink-0">
                            {boundaryCheck?.status === 'red' ? <AlertTriangle className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                        </div>
                        <div>
                            <h4 className="font-bold text-card-foreground mb-1">{workloadInsight?.title || "Mindfulness Moment"}</h4>
                            <p className="text-sm text-muted-foreground leading-snug max-w-md">
                                {workloadInsight?.recommendation || "Take a deep breath. You're doing great."}
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Profile Modal */}
            {showProfileModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-[#FF8A71] mb-6 shadow-sm">
                                <User className="w-8 h-8" />
                            </div>

                            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Complete Profile</h2>
                            <p className="text-slate-500 text-sm font-bold mb-8">We noticed your profile is missing a name.</p>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Name</label>
                                    <input
                                        type="text"
                                        value={nameInput}
                                        onChange={(e) => setNameInput(e.target.value)}
                                        placeholder="e.g. Your Name"
                                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#FF8A71] text-slate-900 font-bold placeholder:text-slate-300 transition-all"
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

            {/* Global Music Player Triggered by Dashboard Card */}
            <MusicPlayer isOpen={showMusicPlayer} onClose={() => setShowMusicPlayer(false)} />

            {/* Invisible Labor Log Modal */}
            <AnimatePresence>
                {showLaborLog && <InvisibleLaborLog onClose={() => setShowLaborLog(false)} />}
            </AnimatePresence>
        </div>
    );
}
