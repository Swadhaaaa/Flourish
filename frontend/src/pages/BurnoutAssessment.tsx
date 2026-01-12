import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowRight, Loader2, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export function BurnoutAssessment() {
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [reflection, setReflection] = useState("");
    const [result, setResult] = useState<any>(null);
    const [formData, setFormData] = useState({
        Age: 30,
        Gender: "Female",
        Country: "USA",
        JobRole: "Developer",
        Department: "Tech",
        YearsAtCompany: 3,
        TeamSize: 10,
        SalaryRange: "Medium",
        WorkHoursPerWeek: 40,
        RemoteWork: 1, // 1=Yes
        CommuteTime: 30,
        ScheduleFlexibilityScore: 5,
        CanAdjustWorkHours: 1, // 1=Yes
        DependentsCount: 0,
        CareHoursPerWeek: 0,
        JobSatisfaction: 7,
        StressLevel: 5,
        SleepHours: 7.0,
        PhysicalActivityHrs: 3.0,
        HasMentalHealthSupport: 1, // 1=Yes
        HasTherapyAccess: 0, // 0=No
        MentalHealthDaysTaken: 2,
        ManagerSupportScore: 7,
        FeelsSafeRaisingConcerns: 1, // 1=Yes
        WorkplaceInclusionScore: 7,
        ProductivityScore: 8,
        CareerGrowthScore: 6,
        WorkLifeBalanceScore: 6
    });

    // Load Profile Data from Firestore
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    const docRef = doc(db, "users", currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists() && docSnap.data().profile) {
                        setFormData(prev => ({
                            ...prev,
                            ...docSnap.data().profile
                        }));
                    }
                } catch (error) {
                    console.error("Error fetching profile:", error);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    const handleChange = (e: any) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' || name.includes('Score') || name.includes('Hours') || name.includes('Count') ? Number(value) : value
        }));
    };

    const handleAnalyzeReflection = async () => {
        if (!reflection.trim()) return;
        setAnalyzing(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
            const response = await fetch(`${API_URL}/api/ai/analyze-reflection`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: reflection })
            });
            const data = await response.json();

            // Smart Update - Extract metrics from the nested object
            if (data.metrics) {
                setFormData(prev => ({
                    ...prev,
                    ...data.metrics
                }));
            }

            // Visual Feedback
            const formElement = document.getElementById('assessment-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Optional: Flash the form or show a temporary success set state here if desired
            }
        } catch (error) {
            console.error("AI Analysis failed", error);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
            const response = await fetch(`${API_URL}/api/ai/burnout-prediction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error("Error predicting burnout:", error);
        } finally {
            setLoading(false);
        }
    };


    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } })
    };

    return (
        <div className="min-h-screen space-y-8 max-w-6xl mx-auto pt-4 pb-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    Burnout Check <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                </h1>
                <p className="text-muted">
                    AI-powered assessment to analyze 25+ factors of your work-life balance and predict burnout risk.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <motion.div
                    className="lg:col-span-2 space-y-8"
                    initial="hidden"
                    animate="visible"
                >
                    {/* AI Smart Fill Section - Unique Premium Design */}
                    <motion.div
                        variants={fadeInUp}
                        className="relative p-1 rounded-[2rem] bg-gradient-to-br from-[#7c3aed]/40 via-purple-500/20 to-indigo-500/30 shadow-[0_0_40px_-10px_rgba(124,58,237,0.3)] group overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-[1.5s] ease-in-out pointer-events-none" />
                        <div className="bg-[#0f0814]/95 rounded-[30px] p-8 relative overflow-hidden backdrop-blur-2xl">
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                                <Sparkles size={120} className="text-[#7c3aed] blur-lg animate-pulse" />
                            </div>
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#7c3aed] to-violet-600 shadow-lg shadow-purple-500/30">
                                        <Sparkles className="text-white" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white tracking-tight">AI Smart-Fill</h3>
                                        <p className="text-xs text-purple-300 font-medium tracking-wide uppercase">Magic Auto-Complete</p>
                                    </div>
                                </div>

                                <p className="text-sm text-muted/80 mb-6 leading-relaxed max-w-xl">
                                    Skip the manual sliders. Just describe your week—workload, stress, sleep—and our AI will instantly estimate your burnout metrics for you.
                                </p>

                                <div className="relative group/input">
                                    <textarea
                                        value={reflection}
                                        onChange={(e) => setReflection(e.target.value)}
                                        placeholder="E.g., 'I worked 60 hours this week effectively. My manager was supportive, but I couldn't sleep well due to deadlines...'"
                                        className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#7c3aed]/50 focus:ring-4 focus:ring-[#7c3aed]/10 transition-all resize-none min-h-[120px] text-sm leading-relaxed shadow-inner"
                                    />
                                    <div className="absolute bottom-4 right-4">
                                        <button
                                            onClick={handleAnalyzeReflection}
                                            disabled={analyzing || !reflection}
                                            className="px-5 py-2.5 bg-gradient-to-r from-[#7c3aed] to-violet-600 hover:to-indigo-600 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5"
                                        >
                                            {analyzing ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={16} />
                                                    <span>Analyzing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles size={16} className="fill-white/20" />
                                                    <span>Generate Metrics</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.form
                        id="assessment-form"
                        onSubmit={handleSubmit}
                        variants={{
                            hidden: {},
                            visible: { transition: { staggerChildren: 0.1 } }
                        }}
                    >
                        {/* Section 3: Well-being Metrics */}
                        <motion.div custom={2} variants={fadeInUp} className="relative p-1 rounded-[2rem] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 mb-8 overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            <div className="bg-[#0f0814]/95 rounded-[30px] p-8 backdrop-blur-2xl relative">
                                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)] font-mono text-lg font-bold">
                                        1
                                    </div>
                                    Well-being & Support
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                    <SliderField label="Stress Level" name="StressLevel" value={formData.StressLevel} onChange={handleChange} min={1} max={10} />
                                    <SliderField label="Job Satisfaction" name="JobSatisfaction" value={formData.JobSatisfaction} onChange={handleChange} min={1} max={10} />
                                    <InputField label="Sleep Hours/Night" name="SleepHours" type="number" step="0.1" value={formData.SleepHours} onChange={handleChange} />
                                    <SelectField label="Mental Health Support?" name="HasMentalHealthSupport" value={formData.HasMentalHealthSupport} onChange={handleChange} options={[{ label: "Yes", value: 1 }, { label: "No", value: 0 }]} />
                                    <SliderField label="Manager Support" name="ManagerSupportScore" value={formData.ManagerSupportScore} onChange={handleChange} min={1} max={10} />
                                    <SliderField label="Work-Life Balance" name="WorkLifeBalanceScore" value={formData.WorkLifeBalanceScore} onChange={handleChange} min={1} max={10} />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div custom={3} variants={fadeInUp} className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full md:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-violet-600 hover:to-indigo-600 text-white font-bold text-lg shadow-[0_0_30px_-5px_rgba(124,58,237,0.4)] hover:shadow-[0_0_40px_-5px_rgba(124,58,237,0.6)] transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                                {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="fill-white/20" size={22} />}
                                {loading ? "Analyzing..." : "Analyze Burnout Risk"}
                            </button>
                        </motion.div>
                    </motion.form>
                </motion.div>

                {/* Results Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-8">
                        <AnimatePresence mode="wait">
                            {!result && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-64 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center p-8 border-dashed"
                                >
                                    <div className="w-12 h-12 rounded-full bg-white/5 mx-auto mb-4 flex items-center justify-center">
                                        <Sparkles className="text-white/30" />
                                    </div>
                                    <p className="text-muted text-sm">Fill out the assessment to receive your personalized AI analysis.</p>
                                </motion.div>
                            )}

                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`p-6 rounded-3xl border backdrop-blur-sm transition-colors ${result.is_high_risk
                                        ? 'bg-rose-950/30 border-rose-500/30 shadow-lg shadow-rose-900/20'
                                        : 'bg-emerald-950/30 border-emerald-500/30 shadow-lg shadow-emerald-900/20'
                                        }`}
                                >
                                    <div className="text-center mb-6">
                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4 border ${result.is_high_risk ? 'bg-rose-500/20 text-rose-300 border-rose-500/20' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20'
                                            }`}>
                                            {result.is_high_risk ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                                            {result.is_high_risk ? 'ATTENTION NEEDED' : 'HEALTHY BALANCE'}
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-1">
                                            {result.burnout_risk} Risk
                                        </h2>
                                        <div className="text-[4rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 my-4">
                                            {(result.probability * 100).toFixed(0)}<span className="text-2xl">%</span>
                                        </div>
                                        <p className="text-xs text-muted uppercase tracking-wider font-medium">Probability Score</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-black/20 rounded-xl p-4 border border-white/10">
                                            <h4 className="text-white font-semibold mb-2 text-sm">Analysis</h4>
                                            <p className="text-sm text-muted leading-relaxed">
                                                {result.is_high_risk
                                                    ? "Your profile indicates significant strain factors. High stress combined with your current workload suggests immediate intervention is recommended."
                                                    : "You seem to be managing your work-life balance well. Keep maintaining your boundaries and support systems."
                                                }
                                            </p>
                                        </div>
                                        <button className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center justify-center gap-2 group text-sm">
                                            View Recommendations
                                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Reusable Components
const InputField = ({ label, name, type = "text", value, onChange, ...props }: any) => (
    <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted ml-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white/90 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted/30"
            {...props}
        />
    </div>
);

const SelectField = ({ label, name, value, onChange, options }: any) => (
    <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted ml-1">{label}</label>
        <div className="relative">
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white/90 text-sm appearance-none focus:outline-none focus:border-primary/50 transition-all cursor-pointer"
            >
                {options.map((opt: any) => {
                    const val = typeof opt === 'object' ? opt.value : opt;
                    const lab = typeof opt === 'object' ? opt.label : opt;
                    return <option key={val} value={val} className="bg-[#1a1025]">{lab}</option>
                })}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-muted rotate-90 pointer-events-none" size={16} />
        </div>
    </div>
);

const SliderField = ({ label, name, value, onChange, min, max }: any) => (
    <div className="space-y-3">
        <div className="flex justify-between items-end">
            <label className="text-xs font-medium text-muted ml-1">{label}</label>
            <span className="text-lg font-bold text-primary">{value}</span>
        </div>
        <input
            type="range"
            name={name}
            min={min}
            max={max}
            value={value}
            onChange={onChange}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-[10px] text-muted uppercase tracking-wider px-1">
            <span>Low</span>
            <span>High</span>
        </div>
    </div>
);
