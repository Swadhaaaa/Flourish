import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateUserDailyData, type DailyData } from '../../utils/syntheticData';
import { useAuth } from '../../context/AuthContext';
import { addPeriodLog } from '../../services/firestore';
import { Utensils, Plus, Sparkles, TrendingUp } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import PeriodCalendar from '../../components/PeriodCalendar';

const PeriodTracker = () => {
    const { user } = useAuth();

    // View Mode State
    const [viewMode, setViewMode] = useState<'tracker' | 'calendar'>('tracker');

    // Calendar State
    const [startDate, setStartDate] = useState<Date | null>(() => {
        const d = new Date();
        d.setDate(d.getDate() - 8);
        return d;
    });

    // Derived State
    const [currentDay, setCurrentDay] = useState(1);
    const [data, setData] = useState<DailyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [aiInsight, setAiInsight] = useState<string | null>(null);

    // Logging State
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [selectedMood, setSelectedMood] = useState<string>('Happy');
    const [logStatus, setLogStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    // Effect: Calculate Day & Fetch Data
    useEffect(() => {
        if (!startDate) return;

        // Normalize dates to midnight to avoid time-of-day offsets
        const todayAtMidnight = new Date();
        todayAtMidnight.setHours(0, 0, 0, 0);

        const startAtMidnight = new Date(startDate);
        startAtMidnight.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(todayAtMidnight.getTime() - startAtMidnight.getTime());
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        const currentCycleDay = diffDays + 1;
        const cycleDay = ((currentCycleDay - 1) % 28) + 1;

        setCurrentDay(cycleDay);

        const dailyData = generateUserDailyData(cycleDay);
        setData(dailyData);
        setLoading(false); // Show UI immediately

        const fetchAI = async () => {
            try {
                // Assuming backend is running on 8000
                const res = await fetch('http://localhost:8000/api/ai/period-insight', {
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
            } catch (e) {
                console.error("AI Fetch failed. Ensure backend is running.");
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

    if (loading || !data) return <div className="p-10 text-center">Loading Cycles...</div>;

    return (
        <div className="min-h-screen bg-[#FFF8F5] p-6 md:p-10 font-sans">

            {/* Top Toggle */}
            <div className="flex justify-start mb-8">
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
            </div>

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
                            onSelect={setStartDate}
                            onLogPeriod={() => {
                                setViewMode('tracker');
                                // Could add logic to save this start date to backend too
                            }}
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

                            {/* Main Insight Card */}
                            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-purple-200">
                                <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                                    {/* Left Side: Visuals (Stack of Circle + Next Period) */}
                                    <div className="flex flex-col items-center gap-6 shrink-0">
                                        {/* Circular Progress */}
                                        <div className="w-40 h-40 rounded-full border-4 border-white/30 flex flex-col items-center justify-center relative bg-white/10 backdrop-blur-sm shadow-inner shadow-white/20">
                                            <span className="text-5xl font-black leading-none mb-1 shadow-black/10 drop-shadow-sm">{data.dayInCycle}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">Cycle Day</span>
                                            <span className="text-[9px] font-medium text-white/60">of 28 Days</span>

                                            {/* Progress Indicator Dot */}
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[50%] w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] border-2 border-purple-500" />
                                        </div>

                                        {/* Next Period Info (Static Flow below circle) */}
                                        <div className="text-center w-64">
                                            <div className="inline-block px-3 py-1 rounded-full bg-black/20 backdrop-blur-md border border-white/10 mb-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-white/90">Next Period Likely</span>
                                            </div>
                                            <div className="text-xl font-black text-white tracking-tight drop-shadow-md">
                                                {startDate && (
                                                    <>
                                                        {format(new Date(startDate.getTime() + 28 * 24 * 60 * 60 * 1000), 'MMM d')} - {format(new Date(startDate.getTime() + 32 * 24 * 60 * 60 * 1000), 'MMM d')}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Side: Text Content */}
                                    <div className="text-center md:text-left mt-8 md:mt-0 flex-1">
                                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold mb-3 border border-white/20">
                                            <Sparkles className="w-3 h-3" />
                                            <span>{data.phase} Phase</span>
                                        </div>
                                        <h2 className="text-xl md:text-2xl font-bold mb-3 leading-tight">
                                            "{aiInsight || data.dailyInsight}"
                                        </h2>
                                        <p className="text-white/80 text-sm font-medium leading-relaxed max-w-lg">
                                            Your energy is {data.energyLevel > 3 ? 'High' : 'Low'}. Focus on
                                            <strong className="text-white"> {data.workLife.focusAdvice}</strong>.
                                        </p>
                                    </div>
                                </div>
                            </div>


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Nutrition Card */}
                                <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                                            <Utensils className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">Cravings & Fuel</h3>
                                            <div className="text-xs text-slate-400">Tailored to your metabolism</div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Eat More</span>
                                            <div className="flex flex-wrap gap-2">
                                                {data.nutrition.recommendedFoods.map(food => (
                                                    <span key={food} className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100">
                                                        {food}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                                            <div className="flex-1">
                                                <div className="text-xs font-bold text-slate-500 mb-1">Key Nutrients</div>
                                                <div className="text-sm font-bold text-slate-800">{data.nutrition.keyNutrients.slice(0, 2).join(', ')}</div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs font-bold text-slate-500 mb-1">Hydration Goal</div>
                                                <div className="text-sm font-bold text-blue-600">{data.nutrition.hydrationGoal} Liters</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Work-Life Card */}
                                <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                            <BriefcaseIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">Work Mode</h3>
                                            <div className="text-xs text-slate-400">Optimize your schedule</div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <TrendingUp className="w-4 h-4 text-slate-400" />
                                                <span className="text-xs font-bold text-slate-500">Best For</span>
                                            </div>
                                            <p className="text-sm font-bold text-slate-800">{data.workLife.focusAdvice}</p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-1 h-8 bg-blue-500 rounded-full" />
                                            <p className="text-xs font-medium text-slate-600 italic">
                                                "{data.workLife.mentalHealthTip}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* RIGHT COL: Logger */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-50 h-full">
                                <h3 className="text-xl font-bold text-slate-900 mb-6 font-display">Daily Log</h3>

                                <div className="space-y-8">
                                    {/* Mood Selector */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Mood</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['Happy', 'Calm', 'Tired', 'Anxious', 'Irritable'].map(m => (
                                                <button
                                                    key={m}
                                                    onClick={() => setSelectedMood(m)}
                                                    className={`py-2 rounded-xl text-xs font-bold transition-all ${selectedMood === m ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Symptom Chips */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Symptoms</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['Cramps', 'Headache', 'Bloating', 'Acne', 'Back Pain', 'Insomnia'].map(sym => (
                                                <button
                                                    key={sym}
                                                    onClick={() => toggleSymptom(sym)}
                                                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${selectedSymptoms.includes(sym) ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}`}
                                                >
                                                    {selectedSymptoms.includes(sym) ? <CheckCircle2 className="w-3 h-3 inline mr-1" /> : <Plus className="w-3 h-3 inline mr-1" />}
                                                    {sym}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Save Button */}
                                    <button
                                        onClick={handleSaveLog}
                                        disabled={logStatus === 'saving'}
                                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg shadow-slate-200 hover:shadow-xl transition-all disabled:opacity-70"
                                    >
                                        {logStatus === 'saving' ? 'Saving...' : (logStatus === 'saved' ? 'Saved!' : 'Save Log')}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

// Helper Icon
function BriefcaseIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    )
}

function CheckCircle2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}

export default PeriodTracker;
