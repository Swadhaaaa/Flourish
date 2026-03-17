import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateUserDailyData, type DailyData } from '../../utils/syntheticData';
import { useAuth } from '../../context/AuthContext';
import { addPeriodLog, getPeriodProfile, updatePeriodProfile, getPeriodLogs, type PeriodLog } from '../../services/firestore';
import { Utensils, Sparkles, Settings } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { PeriodTrackerMiniPopup } from '../../components/PeriodTrackerMiniPopup';
import PeriodCalendar from '../../components/PeriodCalendar';

const PeriodTracker = () => {
    const { user } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    // View Mode State
    const [viewMode, setViewMode] = useState<'tracker' | 'calendar'>('tracker');

    // Calendar State
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [logs, setLogs] = useState<PeriodLog[]>([]);

    // Derived State
    const [data, setData] = useState<DailyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [aiDiet, setAiDiet] = useState<any>(null);

    // Settings State
    const [cycleLength, setCycleLength] = useState<number>(28);
    const [periodLength, setPeriodLength] = useState<number>(5);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [tempCycle, setTempCycle] = useState(28);
    const [tempPeriod, setTempPeriod] = useState(5);

    // Logging State
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [selectedMood, setSelectedMood] = useState<string>('Happy');
    const [logStatus, setLogStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    // Initial Load: Fetch Profile & Logs
    useEffect(() => {
        if (!user) return;

        getPeriodProfile(user.uid).then(profile => {
            if (profile) {
                if (profile.startDate) setStartDate(profile.startDate.toDate());
                if (profile.cycleLength) setCycleLength(profile.cycleLength);
                if (profile.periodLength) setPeriodLength(profile.periodLength);
                setTempCycle(profile.cycleLength || 28);
                setTempPeriod(profile.periodLength || 5);
            } else {
                const d = new Date();
                d.setDate(d.getDate() - 8);
                setStartDate(d);
            }
        });

        getPeriodLogs(user.uid).then(setLogs);
    }, [user]);

    // Effect: Calculate Day & Fetch AI Insights
    useEffect(() => {
        if (!startDate) return;

        const todayAtMidnight = new Date();
        todayAtMidnight.setHours(0, 0, 0, 0);

        const startAtMidnight = new Date(startDate);
        startAtMidnight.setHours(0, 0, 0, 0);

        const diffTime = todayAtMidnight.getTime() - startAtMidnight.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        const currentCycleDay = diffDays + 1;
        // If the date is in the future, we treat it as Day 1 or show 0? 
        // For a tracker, Day 1 is usually the start.
        const cycleDay = currentCycleDay > 0 ? ((currentCycleDay - 1) % cycleLength) + 1 : 1;

        const dailyData = generateUserDailyData(cycleDay, periodLength, cycleLength);
        setData({ ...dailyData, dayInCycle: cycleDay }); // Ensure dayInCycle matches our calc
        setLoading(false);

        const fetchAI = async () => {
            try {
                const res = await fetch(`${API_URL}/api/ai/period-insight`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        day: cycleDay,
                        phase: dailyData.phase,
                        symptoms: selectedSymptoms,
                        mood: selectedMood
                    })
                });
                const json = await res.json();
                if (json.insight) {
                    setAiInsight(json.insight);
                }
                if (json.diet_tip || json.recommended_foods) {
                    setAiDiet(json);
                }
            } catch (e) {
                console.error("AI Fetch failed:", e);
            }
        };
        fetchAI();

    }, [startDate, selectedSymptoms, selectedMood]);

    const handleSaveLog = async () => {
        if (!user) return;
        setLogStatus('saving');
        try {
            await addPeriodLog(user.uid, {
                date: Timestamp.now(),
                symptoms: selectedSymptoms,
                mood: selectedMood,
                flow: 'none',
                energy: data?.energyLevel || 3,
                notes: 'Logged via Home Mode'
            });
            setLogStatus('saved');
            // Refresh logs
            getPeriodLogs(user.uid).then(setLogs);
            setTimeout(() => setLogStatus('idle'), 2000);
            setSelectedSymptoms([]);
        } catch (err) {
            console.error(err);
            setLogStatus('idle');
        }
    };

    const toggleSymptom = (symptom: string) => {
        if (selectedSymptoms.includes(symptom)) {
            setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
        } else {
            setSelectedSymptoms(prev => [...prev, symptom]);
        }
    };

    const handleSaveSettings = () => {
        if (!user) return;
        setCycleLength(tempCycle);
        setPeriodLength(tempPeriod);
        updatePeriodProfile(user.uid, {
            cycleLength: tempCycle,
            periodLength: tempPeriod
        });
        setIsSettingsOpen(false);
    };

    if (loading || !data) return <div className="p-10 text-center">Loading Cycles...</div>;

    return (
        <div className="min-h-screen bg-[#FFF8F5] dark:bg-slate-900 dark:text-slate-100 p-6 md:p-10 font-sans relative overflow-hidden">
            <PeriodTrackerMiniPopup />

            {/* Top Toggle & Settings */}
            <div className="flex justify-between items-start mb-8">
                <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 inline-flex">
                    <button
                        onClick={() => setViewMode('tracker')}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'tracker' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Tracker
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-rose-500 text-white shadow-md shadow-rose-200' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Log Dates
                    </button>
                </div>
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-3 bg-white hover:bg-slate-50 text-slate-400 hover:text-rose-500 rounded-full shadow-sm border border-slate-100 transition-colors"
                    title="Cycle Settings"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>

            {/* Settings Modal */}
            <AnimatePresence>
                {isSettingsOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSettingsOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-8 max-w-sm w-full relative z-10 shadow-2xl">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 font-display">Cycle Settings</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Cycle Length (Days)</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="21"
                                            max="35"
                                            value={tempCycle}
                                            onChange={(e) => setTempCycle(parseInt(e.target.value))}
                                            className="flex-1 accent-rose-500"
                                        />
                                        <span className="w-8 text-center font-bold text-slate-700">{tempCycle}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">Typical: 28 days</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Period Length (Days)</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="2"
                                            max="8"
                                            value={tempPeriod}
                                            onChange={(e) => setTempPeriod(parseInt(e.target.value))}
                                            className="flex-1 accent-rose-500"
                                        />
                                        <span className="w-8 text-center font-bold text-slate-700">{tempPeriod}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">Typical: 5 days</p>
                                </div>
                                <div className="flex gap-3 mt-8">
                                    <button onClick={() => setIsSettingsOpen(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors">Cancel</button>
                                    <button onClick={handleSaveSettings} className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-md shadow-rose-200 transition-colors">Save</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {viewMode === 'calendar' ? (
                    <motion.div
                        key="calendar"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <PeriodCalendar
                            selectedDate={startDate}
                            logs={logs}
                            periodLength={periodLength}
                            onSelect={(date) => {
                                setStartDate(date);
                                if (user && date) {
                                    updatePeriodProfile(user.uid, { startDate: Timestamp.fromDate(date) });
                                }
                            }}
                            onLogPeriod={() => setViewMode('tracker')}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="tracker"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        {/* LEFT COL: Cycle Visuals */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-gradient-to-br from-[#FDEEE8] to-[#F8DDD4] rounded-3xl p-8 text-rose-950 relative overflow-hidden shadow-xl shadow-rose-200/50">
                                <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                                    <div className="flex flex-col items-center gap-6 shrink-0">
                                        <div className="w-40 h-40 rounded-full border-4 border-rose-300/50 flex flex-col items-center justify-center relative bg-white/40 backdrop-blur-sm shadow-inner shadow-rose-200/30">
                                            <span className="text-5xl font-black text-rose-950">{data.dayInCycle}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-800/90">Cycle Day</span>
                                            <span className="text-[9px] font-medium text-rose-700/60">of {cycleLength} Days</span>
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[50%] w-4 h-4 bg-rose-400 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.4)] border-2 border-white" />
                                        </div>
                                        <div className="text-center w-64">
                                            <div className="inline-block px-3 py-1 rounded-full bg-rose-900/80 backdrop-blur-md border border-rose-800/30 mb-2 text-[10px] font-bold uppercase text-white">Next Period Likely</div>
                                            <div className="text-xl font-black">
                                                {startDate && format(new Date(startDate.getTime() + cycleLength * 24 * 60 * 60 * 1000), 'MMM d')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center md:text-left flex-1">
                                        <div className="inline-flex items-center gap-2 bg-rose-100/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold mb-3 border border-rose-200/40 text-rose-800">
                                            <Sparkles className="w-3 h-3" />
                                            <span>{data.phase} Phase</span>
                                        </div>
                                        <h2 className="text-xl md:text-2xl font-bold mb-3 leading-tight italic">
                                            "{aiInsight || data.dailyInsight}"
                                        </h2>
                                        <p className="text-rose-800/80 text-sm font-medium">
                                            Focus on <strong className="text-rose-950">{data.workLife.focusAdvice}</strong> today.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Nutrition Card */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                                            <Utensils className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">Cravings & Fuel</h3>
                                            <div className="text-xs text-slate-400">AI Personalized Nutrition</div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Recommended Foods</span>
                                            <div className="flex flex-wrap gap-2">
                                                {(aiDiet?.recommended_foods || data.nutrition.recommendedFoods).map((food: string) => (
                                                    <span key={food} className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100">
                                                        {food}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 italic text-sm text-slate-600 shadow-inner">
                                            {aiDiet?.diet_tip || "Eat a balanced meal today."}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                            <BriefcaseIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">Work Mode</h3>
                                            <div className="text-xs text-slate-400">Tactical Focus</div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                            <p className="text-xs font-bold text-slate-500 mb-1">Best For Today</p>
                                            <p className="text-sm font-bold text-slate-800">{data.workLife.focusAdvice}</p>
                                        </div>
                                        <p className="text-xs font-medium text-slate-600 italic">"{data.workLife.mentalHealthTip}"</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COL: Logger */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900 mb-6 font-display">Daily Log</h3>
                                <div className="space-y-8">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Mood</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['Happy', 'Calm', 'Tired', 'Anxious', 'Irritable'].map(m => (
                                                <button
                                                    key={m}
                                                    onClick={() => setSelectedMood(m)}
                                                    className={`py-2 rounded-xl text-xs font-bold transition-all ${selectedMood === m ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Symptoms</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['Cramps', 'Headache', 'Bloating', 'Acne', 'Back Pain', 'Insomnia'].map(sym => (
                                                <button
                                                    key={sym}
                                                    onClick={() => toggleSymptom(sym)}
                                                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${selectedSymptoms.includes(sym) ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}`}
                                                >
                                                    {sym}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSaveLog}
                                        disabled={logStatus === 'saving'}
                                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                                    >
                                        {logStatus === 'saving' ? 'Saving...' : (logStatus === 'saved' ? 'Saved!' : 'Save Log')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

function BriefcaseIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    )
}

export default PeriodTracker;
