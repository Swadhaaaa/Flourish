import { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { TrendingUp, Activity, Brain, Clock, ChevronRight, CheckCircle2, Circle, Heart, Music, Play } from "lucide-react";
import { MusicPlayer } from "../../components/MusicPlayer";

export function DashboardOverview() {
    const [userName, setUserName] = useState("Friend");
    const [workloadInsight, setWorkloadInsight] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // 1. Fetch User Name
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Try to get name from Firestore first (more reliable if we save custom data)
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists() && docSnap.data().displayName) {
                    setUserName(docSnap.data().displayName.split(' ')[0]);
                } else if (user.displayName) {
                    setUserName(user.displayName.split(' ')[0]);
                }
            }
        });

        // 2. Fetch Workload Insight
        const fetchWorkloadInsight = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
                const res = await fetch(`${API_URL}/api/ai/workload-insight`);
                const data = await res.json();
                setWorkloadInsight(data);
            } catch (error) {
                console.error("Failed to fetch workload insight:", error);
            }
        };
        fetchWorkloadInsight();

        return () => unsubscribe();
    }, []);

    const [isMusicOpen, setIsMusicOpen] = useState(false);
    const [suggestedTrack, setSuggestedTrack] = useState<string | undefined>(undefined);

    const handleOpenMusic = (track?: string) => {
        setSuggestedTrack(track);
        setIsMusicOpen(true);
        setIsModalOpen(false); // Close modal if open
    };

    return (
        <div className="space-y-8">
            <MusicPlayer
                isOpen={isMusicOpen}
                onClose={() => setIsMusicOpen(false)}
                initialTrack={suggestedTrack}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Good afternoon, {userName} <span className="text-primary">✨</span>
                    </h1>
                    <p className="text-muted">Here's your wellbeing snapshot for today</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-muted">Last sync: Just now</span>
                    <button className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-all">
                        Customize View
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Workload Balance"
                    metric="Good"
                    trend="+5%"
                    status="bg-emerald-500"
                    icon={TrendingUp}
                    progress="w-3/4 bg-gradient-to-r from-emerald-500 to-emerald-300"
                />
                <StatCard
                    title="Stress Level"
                    metric="Moderate"
                    trend="-3%"
                    status="bg-primary"
                    icon={Activity}
                    progress="w-1/2 bg-gradient-to-r from-primary to-rose-300"
                    trendDown // Good for stress
                />
                <StatCard
                    title="Mental Clarity"
                    metric="High"
                    trend="+5%"
                    status="bg-emerald-500"
                    icon={Brain}
                    progress="w-[85%] bg-gradient-to-r from-purple-500 to-primary"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (2/3) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* AI Insight / Boundary Alert (Dynamic) */}
                    {workloadInsight && (
                        <div className="p-6 rounded-3xl bg-surface/50 border border-white/10 backdrop-blur-sm relative overflow-hidden group hover:border-primary/50 transition-all">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                    <SparklesIcon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white mb-1">{workloadInsight.title}</h3>
                                    <p className="text-muted mb-4">{workloadInsight.summary}</p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setIsModalOpen(true)}
                                            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm transition-all hover:border-primary/50"
                                        >
                                            {workloadInsight.action}
                                        </button>
                                        {workloadInsight.music_recommendation && (
                                            <button
                                                onClick={() => handleOpenMusic(workloadInsight.music_recommendation.track)}
                                                className="px-5 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary font-medium text-sm transition-all flex items-center gap-2"
                                            >
                                                <Music size={14} />
                                                Play "{workloadInsight.music_recommendation.track}"
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sonic Sanctuary Card */}
                    <div className="p-1 rounded-[2rem] bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-900/10">
                        <div className="p-6 rounded-[30px] bg-[#0f0814]/90 backdrop-blur-xl h-full flex items-center justify-between relative overflow-hidden group">
                            {/* Ambient Background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-white/10 text-white">
                                        <Music size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Sonic Sanctuary</h3>
                                </div>
                                <p className="text-muted text-sm mb-4 max-w-sm">
                                    Escape into curated ambient soundscapes designed to restore your focus and calm.
                                </p>
                                <button
                                    onClick={() => handleOpenMusic()}
                                    className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-white/10"
                                >
                                    <Play size={16} fill="currentColor" />
                                    Enter Sanctuary
                                </button>
                            </div>

                            {/* Visual Decor */}
                            <div className="hidden sm:flex gap-1 items-end h-16 mr-8 opacity-60">
                                <div className="w-2 h-8 bg-indigo-400 rounded-full animate-pulse" />
                                <div className="w-2 h-12 bg-purple-400 rounded-full animate-pulse delay-75" />
                                <div className="w-2 h-16 bg-pink-400 rounded-full animate-pulse delay-150" />
                                <div className="w-2 h-10 bg-indigo-400 rounded-full animate-pulse delay-100" />
                                <div className="w-2 h-6 bg-purple-400 rounded-full animate-pulse delay-200" />
                            </div>
                        </div>
                    </div>


                    {/* Today's Focus */}
                    <div className="p-6 rounded-3xl bg-surface/50 border border-white/10 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-white">Today's Focus</h3>
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-medium text-muted">5 tasks remaining</span>
                        </div>

                        <div className="space-y-4">
                            <TaskItem
                                title="Review Q1 Presentation"
                                time="9:00 AM"
                                priority="High"
                                completed
                            />
                            <TaskItem
                                title="Team Sync Meeting"
                                time="2:00 PM"
                                priority="Medium"
                                active
                            />
                            <TaskItem
                                title="Update Project Roadmap"
                                time="4:00 PM"
                                priority="High"
                                active
                            />
                        </div>
                    </div>

                </div>

                {/* Right Column (1/3) */}
                <div className="space-y-6">

                    {/* Quick Actions */}
                    <div className="p-6 rounded-3xl bg-surface/50 border border-white/10 backdrop-blur-sm">
                        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <ActionButton icon={Clock} label="View Schedule" />
                            <ActionButton icon={Heart} label="Track Mood" />
                            <ActionButton icon={Brain} label="Mental Check-in" />
                            <button
                                onClick={() => handleOpenMusic('focus')}
                                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <Music className="w-4 h-4 text-muted group-hover:text-white transition-colors" />
                                    <span className="text-sm font-medium text-white">Focus Mode</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted/50 group-hover:text-white transition-colors" />
                            </button>
                        </div>
                    </div>

                    {/* Weekly Wellness Stats */}
                    <div className="p-6 rounded-3xl bg-surface/50 border border-white/10 backdrop-blur-sm">
                        <h3 className="text-lg font-semibold text-white mb-6">This Week</h3>

                        <div className="space-y-6">
                            <ProgressBar label="Tasks Completed" current={12} total={18} color="bg-primary" />
                            <ProgressBar label="Wellness Goals" current={4} total={5} color="bg-primary" />
                            <ProgressBar label="Boundaries Kept" current={6} total={7} color="bg-primary" />
                        </div>
                    </div>

                    {/* Affirmation */}
                    <div className="p-6 rounded-3xl bg-surface/50 border border-white/10 backdrop-blur-sm relative">
                        <div className="absolute top-6 right-6 text-primary">
                            <SparklesIcon className="w-5 h-5 fill-primary/20" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Today's Affirmation</h3>
                        <p className="text-muted/80 italic text-sm leading-relaxed">
                            "I set healthy boundaries and honor my needs. My wellbeing is a priority."
                        </p>
                    </div>
                </div>
            </div>
            {/* Recommendation Modal */}
            {isModalOpen && workloadInsight && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-surface border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                <SparklesIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">AI Recommendation</h3>
                                <p className="text-sm text-muted">Powered by Flourish Intelligence</p>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-6 mb-6">
                            <p className="text-white text-lg leading-relaxed mb-4">
                                {workloadInsight.recommendation}
                            </p>
                            {workloadInsight.music_recommendation && (
                                <div className="p-3 rounded-xl bg-black/20 border border-white/5 flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-primary/20 text-primary">
                                        <Music size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted uppercase font-bold">Suggested Ambience</p>
                                        <p className="text-white text-sm font-medium">{workloadInsight.music_recommendation.track}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 flex-col sm:flex-row">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                            >
                                Dismiss
                            </button>
                            {workloadInsight.music_recommendation ? (
                                <button
                                    onClick={() => handleOpenMusic(workloadInsight.music_recommendation.track)}
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-violet-600 text-white font-semibold hover:contrast-125 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    <Play size={18} fill="currentColor" />
                                    Listen Now
                                </button>
                            ) : (
                                <button className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                                    Apply Change
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Sub-components for cleaner code
interface StatCardProps {
    title: string;
    metric: string;
    trend: string;
    status: string;
    icon: any;
    progress: string;
    trendDown?: boolean;
}

function StatCard({ title, metric, trend, icon: Icon, progress, trendDown }: StatCardProps) {
    return (
        <div className="p-6 rounded-3xl bg-surface/50 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-white/5 text-muted">
                    <Icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${trendDown ? "text-emerald-400" : "text-emerald-400"}`}>
                    {trend}
                    {trendDown ? "↓" : "↑"}
                </div>
            </div>
            <p className="text-sm text-muted mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-white mb-4">{metric}</h3>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${progress}`} />
            </div>
        </div>
    )
}

interface TaskItemProps {
    title: string;
    time: string;
    priority: "High" | "Medium" | "Low";
    completed?: boolean;
    active?: boolean;
}

function TaskItem({ title, time, priority, completed, active }: TaskItemProps) {
    return (
        <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${active
            ? "bg-white/5 border-white/10"
            : "bg-transparent border-transparent hover:bg-white/5"
            }`}>
            {completed ? (
                <CheckCircle2 className="w-5 h-5 text-primary" />
            ) : (
                <Circle className="w-5 h-5 text-muted" />
            )}
            <div className="flex-1">
                <h4 className={`font-medium ${completed ? "text-muted line-through" : "text-white"}`}>{title}</h4>
                <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-muted" />
                    <span className="text-xs text-muted">{time}</span>
                </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${priority === "High"
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                }`}>
                {priority}
            </span>
        </div>
    )
}

function ActionButton({ icon: Icon, label }: { icon: any, label: string }) {
    return (
        <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group">
            <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-muted group-hover:text-white transition-colors" />
                <span className="text-sm font-medium text-white">{label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted/50 group-hover:text-white transition-colors" />
        </button>
    )
}

function ProgressBar({ label, current, total, color }: { label: string, current: number, total: number, color: string }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs">
                <span className="text-muted">{label}</span>
                <span className="text-white font-medium">{current}/{total}</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${(current / total) * 100}%` }}
                />
            </div>
        </div>
    )
}

function SparklesIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
    )
}
