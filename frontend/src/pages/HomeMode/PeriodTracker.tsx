import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { generateUserDailyData, type DailyData } from '../../utils/syntheticData';
import { useAuth } from '../../context/AuthContext';
import { addPeriodLog } from '../../services/firestore';
import { Calendar, Utensils, Plus, Sparkles, TrendingUp } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

const PeriodTracker = () => {
    const { user } = useAuth();
    // Simulate user being on Day 8 in the Follicular phase for the demo
    const [currentDay] = useState(8);
    const [data, setData] = useState<DailyData | null>(null);
    const [loading, setLoading] = useState(true);

    // Logging State
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [selectedMood, setSelectedMood] = useState<string>('Happy');
    const [logStatus, setLogStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    useEffect(() => {
        // Load synthetic data for the current day
        const dailyData = generateUserDailyData(currentDay);
        setData(dailyData);
        setLoading(false);
    }, [currentDay]);

    const handleSaveLog = async () => {
        if (!user) return;
        setLogStatus('saving');
        try {
            await addPeriodLog(user.uid, {
                date: Timestamp.now(),
                symptoms: selectedSymptoms,
                mood: selectedMood,
                flow: 'none', // Default for now
                energy: data?.energyLevel || 3,
                notes: 'Logged via Home Mode'
            });
            setLogStatus('saved');
            setTimeout(() => setLogStatus('idle'), 2000);
            setSelectedSymptoms([]); // Reset
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
            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2 font-display">Cycle Sync</h1>
                    <p className="text-slate-500 font-medium">Harmonize your work & life with your rhythm.</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-bold text-slate-700">Today: Oct 25</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COL: Cycle Visuals */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Main Insight Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-purple-200"
                    >
                        <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            {/* Circular Progress */}
                            <div className="w-40 h-40 rounded-full border-8 border-white/20 flex items-center justify-center shrink-0 relative">
                                <span className="text-4xl font-black">{data.dayInCycle}</span>
                                <span className="absolute bottom-8 text-xs font-medium opacity-80">Day of 28</span>
                                {/* Active Dot */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[50%] w-3 h-3 bg-white rounded-full shadow-lg" />
                            </div>

                            <div className="text-center md:text-left">
                                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold mb-3 border border-white/20">
                                    <Sparkles className="w-3 h-3" />
                                    <span>{data.phase} Phase</span>
                                </div>
                                <h2 className="text-2xl font-bold mb-3 leading-tight">
                                    "{data.dailyInsight}"
                                </h2>
                                <p className="text-white/80 text-sm font-medium leading-relaxed max-w-lg">
                                    Your energy is {data.energyLevel > 3 ? 'High' : 'Low'}. Focus on
                                    <strong className="text-white"> {data.workLife.focusAdvice}</strong>.
                                </p>
                            </div>
                        </div>
                    </motion.div>

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
            </div>
        </div>
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
