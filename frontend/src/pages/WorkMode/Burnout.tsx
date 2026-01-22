import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Sparkles, Zap
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { analyzeReflection, predictBurnout } from '../../services/api';

const InputRange = ({ label, value, onChange, min = 1, max = 10, isDark }: any) => (
    <div className="space-y-3">
        <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
            <span className={cn("text-xl font-black", isDark ? "text-purple-400" : "text-rose-400")}>{value}</span>
        </div>
        <input
            type="range" min={min} max={max} value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className={cn(
                "w-full h-1.5 rounded-lg appearance-none cursor-pointer transition-all",
                isDark ? "bg-slate-800 accent-purple-500 hover:accent-purple-400" : "bg-slate-200 accent-rose-400 hover:accent-rose-500"
            )}
        />
        <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-tighter">
            <span>Low</span>
            <span>High</span>
        </div>
    </div>
);

const CustomSelect = ({ label, options, value, onChange, isDark }: any) => (
    <div className="space-y-3 text-left">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block ml-1">{label}</span>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
                "w-full border rounded-2xl p-4 outline-none font-bold transition-all appearance-none cursor-pointer",
                isDark
                    ? "bg-slate-900 border-slate-800 text-slate-300 focus:border-purple-500/50"
                    : "bg-white border-orange-100 text-slate-700 focus:border-orange-300"
            )}
        >
            {options.map((opt: any) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

export default function BurnoutPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [smartFillText, setSmartFillText] = useState("");
    const [metrics, setMetrics] = useState({
        stress: 5,
        satisfaction: 7,
        sleep: "7",
        mentalHealth: "Yes",
        managerSupport: 7,
        workLifeBalance: 6
    });

    const [isLoading, setIsLoading] = useState(false);

    const [result, setResult] = useState<{ risk: string, probability: number, isHigh: boolean } | null>(null);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring" as const,
                damping: 25,
                stiffness: 120
            }
        },
        floating: {
            y: [0, -10, 0],
            transition: {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut" as const
            }
        }
    };

    const handleSmartFill = async () => {
        if (!smartFillText) return;
        setIsLoading(true);
        try {
            const data = await analyzeReflection(smartFillText);
            setMetrics({
                ...metrics,
                ...data.metrics,
                // Map API response keys to local state keys if different
                stress: data.metrics.StressLevel,
                satisfaction: data.metrics.JobSatisfaction,
                sleep: String(data.metrics.SleepHours),
                workLifeBalance: data.metrics.WorkLifeBalanceScore,
                managerSupport: data.metrics.PersonalAccomplishment // heuristic mapping
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Access profile for enrichment
    const { userProfile } = useAuth(); // Assuming this is available from context imported above

    const handlePrediction = async () => {
        setIsLoading(true);
        try {
            // Helper to safe parse int
            const val = (v: any, def: number) => parseInt(v, 10) || def;

            // Construct Full Payload matching Backend Schema
            const payload = {
                // 1. Profile / Demographics (from UserProfile or Defaults)
                Age: val(userProfile?.age, 30),
                Gender: userProfile?.gender || "Female",
                Country: userProfile?.country || "USA",
                JobRole: userProfile?.jobRole || "Developer",
                Department: userProfile?.department || "Tech",
                YearsAtCompany: val(userProfile?.yearsExp, 2),
                TeamSize: val(userProfile?.teamSize, 5),
                SalaryRange: userProfile?.salaryRange || "Medium",

                // 2. Work Metrics (Profile or Defaults)
                WorkHoursPerWeek: val(userProfile?.workHours, 40),
                RemoteWork: userProfile?.remoteMode === 'Remote' ? 1 : 0,
                CommuteTime: val(userProfile?.commute, 30),
                DependentsCount: val(userProfile?.dependents, 0),
                CareHoursPerWeek: val(userProfile?.caregiving, 0),

                // 3. User Inputs (The 6 manual sliders)
                StressLevel: metrics.stress,
                JobSatisfaction: metrics.satisfaction,
                SleepHours: parseFloat(metrics.sleep) || 7.0,
                HasMentalHealthSupport: metrics.mentalHealth === "Yes" ? 1 : 0,
                ManagerSupportScore: metrics.managerSupport, // Corrected Key Name
                WorkLifeBalanceScore: metrics.workLifeBalance,

                // 4. Safe Defaults for Missing Backend Fields (To prevent KeyErrors)
                PhysicalActivityHrs: 3.0,
                ScheduleFlexibilityScore: 5,
                CanAdjustWorkHours: 1,
                HasTherapyAccess: 0,
                MentalHealthDaysTaken: 0,
                FeelsSafeRaisingConcerns: 1,
                WorkplaceInclusionScore: 7,
                ProductivityScore: 7,
                CareerGrowthScore: 5
            };

            console.log("Sending Prediction Payload:", payload); // Debug log

            const data = await predictBurnout(payload);
            setResult({
                risk: data.is_high_risk ? "High Risk" : "Low Risk",
                probability: data.probability,
                isHigh: data.is_high_risk
            });

            // Scroll to show results
            setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }, 100);

        } catch (error) {
            console.error("Prediction failed:", error);
            alert("Failed to calculate prediction. Server might be busy.");
        } finally {
            setIsLoading(false);
        }
    };

    // Generate dynamic recommendations based on metrics
    const getRecommendations = () => {
        const recs = [];
        const sleepVal = parseFloat(metrics.sleep);

        if (sleepVal < 6) {
            recs.push({
                title: "Zombie Mode 🧟‍♂️",
                desc: "Your brain needs a reboot. Try a 'Digital Sunset' at 9 PM—no screens, just vibes."
            });
        }

        if (metrics.stress > 7) {
            recs.push({
                title: "Cortisol Spike 📈",
                desc: "You're running on fumes. Schedule a 'Do Not Disturb' block or a 15-min walk NOW."
            });
        }

        if (metrics.workLifeBalance < 4) {
            recs.push({
                title: "Boundary Breach 🚧",
                desc: "Work is invading your life. Turn on 'Tone Shield' and ghost those after-hours emails."
            });
        }

        if (metrics.managerSupport < 4) {
            recs.push({
                title: "Lone Wolf Syndrome 🐺",
                desc: "You need backup. Book a sync with your lead and simply ask: 'What is priority #1?'"
            });
        }

        if (metrics.satisfaction < 5) {
            recs.push({
                title: "Joy Deficit 📉",
                desc: "The spark is fading. Plan one 'Passion Project' hour this week or reconnect with a mentor."
            });
        }

        if (metrics.mentalHealth === "No") {
            recs.push({
                title: "Support Void 🕳️",
                desc: "Don't tough it out alone. Check your company's EAP or chat with a friend today."
            });
        }

        if (recs.length === 0) {
            recs.push({
                title: "Thriving Mode ✨",
                desc: "You're crushing it! Keep this rhythm, but don't forget to celebrate the small wins."
            });
        }

        return recs.slice(0, 4); // Limit to top 4 to fit UI nicely
    };

    return (
        <div className="min-h-full py-10 px-4 max-w-5xl mx-auto">
            {/* Header Area */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-12"
            >
                <div className={cn(
                    "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4",
                    isDark ? "bg-purple-900/30 text-purple-400" : "bg-[#FF8A71]/10 text-[#FF8A71]"
                )}>
                    <Activity className="w-3.5 h-3.5" />
                    Burnout Watch
                </div>
                <h1 className={cn("text-4xl font-black tracking-tighter italic uppercase", isDark ? "text-white" : "text-slate-800")}>
                    Mental Battery Check
                </h1>
                <p className="text-slate-500 font-bold mt-2">Early detection is the first step towards recovery.</p>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
                {/* AI Smart-Fill Card */}
                <motion.div
                    variants={cardVariants}
                    animate={["visible", "floating"]}
                    className={cn(
                        "lg:col-span-12 xl:col-span-5 rounded-[3.5rem] p-10 relative overflow-hidden transition-all duration-500 border",
                        isDark
                            ? "bg-[#0F0F13] border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.3)]"
                            : "bg-white/70 backdrop-blur-xl border-white shadow-[0_40px_100px_rgba(255,138,113,0.08)]"
                    )}
                >
                    <div className={cn(
                        "absolute top-0 right-0 w-64 h-64 blur-[100px] pointer-events-none",
                        isDark ? "bg-purple-600/10" : "bg-[#FF8A71]/5"
                    )} />
                    <div className="flex items-start gap-5 mb-8">
                        <div className={cn(
                            "p-4 rounded-3xl transition-all duration-500",
                            isDark ? "bg-purple-600/20 text-purple-400 shadow-[0_10px_30px_rgba(147,51,234,0.2)]" : "bg-[#FF8A71]/10 text-[#FF8A71] shadow-[0_10px_30px_rgba(255,138,113,0.15)]"
                        )}>
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className={cn("text-3xl font-black tracking-tighter", isDark ? "text-white" : "text-slate-800")}>AI Smart-Fill</h2>
                            <p className={cn(
                                "text-[10px] font-black uppercase tracking-[0.3em] mt-1",
                                isDark ? "text-purple-400" : "text-[#FF8A71]"
                            )}>Magic Auto-Complete</p>
                        </div>
                    </div>

                    <p className={cn("font-bold text-sm leading-relaxed mb-8", isDark ? "text-slate-400" : "text-slate-500")}>
                        Skip the manual sliders. Just describe your week—workload, stress, sleep—and our AI will instantly estimate your burnout metrics for you.
                    </p>

                    <div className={cn(
                        "rounded-[2.5rem] p-6 border transition-all duration-500 space-y-6",
                        isDark ? "bg-[#16161D] border-white/5" : "bg-slate-50/50 border-orange-100"
                    )}>
                        <textarea
                            value={smartFillText}
                            onChange={(e) => setSmartFillText(e.target.value)}
                            placeholder="E.g., 'I worked 60 hours this week effectively. My manager was supportive, but I couldn't sleep well due to deadlines...'"
                            className={cn(
                                "w-full bg-transparent outline-none h-32 font-bold placeholder:text-slate-600 resize-none leading-relaxed transition-colors",
                                isDark ? "text-slate-300" : "text-slate-700"
                            )}
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={handleSmartFill}
                                disabled={isLoading}
                                className={cn(
                                    "px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 shadow-xl group",
                                    isDark
                                        ? "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/20"
                                        : "bg-[#FF8A71] hover:bg-slate-900 text-white shadow-orange-200"
                                )}>
                                <Zap className={cn("w-4 h-4 transition-transform", isLoading ? "animate-spin" : "group-hover:scale-125")} />
                                <span>{isLoading ? 'Generating...' : 'Generate Metrics'}</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Manual Metrics Card */}
                <motion.div
                    variants={cardVariants}
                    animate={["visible", "floating"]}
                    className={cn(
                        "lg:col-span-12 xl:col-span-7 rounded-[3.5rem] p-12 relative overflow-hidden transition-all duration-500 border",
                        isDark
                            ? "bg-[#0F0F12] border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.3)]"
                            : "bg-white/70 backdrop-blur-xl border-white shadow-[0_40px_100px_rgba(255,138,113,0.08)]"
                    )}
                >
                    <div className={cn(
                        "absolute top-0 left-0 w-64 h-64 blur-[120px] pointer-events-none",
                        isDark ? "bg-emerald-600/5" : "bg-[#FF8A71]/5"
                    )} />

                    <div className="flex items-center gap-5 mb-12">
                        <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border transition-all duration-500",
                            isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-[#FF8A71]/10 text-[#FF8A71] border-[#FF8A71]/20"
                        )}>
                            1
                        </div>
                        <h3 className={cn("text-2xl font-black tracking-tight", isDark ? "text-white" : "text-slate-800")}>Well-being & Support</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        <InputRange label="Stress Level" value={metrics.stress} onChange={(v: number) => setMetrics({ ...metrics, stress: v })} isDark={isDark} />
                        <InputRange label="Job Satisfaction" value={metrics.satisfaction} onChange={(v: number) => setMetrics({ ...metrics, satisfaction: v })} isDark={isDark} />
                        <CustomSelect label="Sleep Hours/Night" options={["4", "5", "6", "7", "8", "9+"]} value={metrics.sleep} onChange={(v: string) => setMetrics({ ...metrics, sleep: v })} isDark={isDark} />
                        <CustomSelect label="Mental Health Support?" options={["Yes", "No", "Planning To"]} value={metrics.mentalHealth} onChange={(v: string) => setMetrics({ ...metrics, mentalHealth: v })} isDark={isDark} />
                        <InputRange label="Manager Support" value={metrics.managerSupport} onChange={(v: number) => setMetrics({ ...metrics, managerSupport: v })} isDark={isDark} />
                        <InputRange label="Work-Life Balance" value={metrics.workLifeBalance} onChange={(v: number) => setMetrics({ ...metrics, workLifeBalance: v })} isDark={isDark} />
                    </div>

                    <div className="mt-16 flex justify-end">
                        <button
                            onClick={handlePrediction}
                            disabled={isLoading}
                            className={cn(
                                "px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center gap-4 transition-all active:scale-95 shadow-2xl group",
                                isDark
                                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/40"
                                    : "bg-gradient-to-r from-[#FF8A71] to-orange-400 hover:from-slate-800 hover:to-slate-900 text-white shadow-orange-100"
                            )}>
                            <Sparkles className={cn("w-5 h-5 transition-transform", isLoading ? "animate-spin" : "group-hover:rotate-12")} />
                            <span>{isLoading ? "Analyzing..." : "Analyze Burnout Risk"}</span>
                        </button>
                    </div>
                </motion.div>
            </motion.div>

            {/* RESULTS SECTION */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={cn(
                            "mt-8 rounded-[3.5rem] p-12 text-center border overflow-hidden relative",
                            isDark
                                ? "bg-[#0F0F12] border-white/10"
                                : "bg-white/80 border-orange-100"
                        )}
                    >
                        <div className={cn(
                            "absolute inset-0 opacity-20 pointer-events-none",
                            result.isHigh
                                ? "bg-gradient-to-r from-rose-500/20 to-orange-500/20"
                                : "bg-gradient-to-r from-emerald-500/20 to-teal-500/20"
                        )} />

                        <div className="relative z-10 flex flex-col items-center">
                            <div className={cn(
                                "inline-block px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest mb-6",
                                result.isHigh
                                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                                    : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                            )}>
                                {result.risk}
                            </div>

                            <h2 className={cn("text-6xl md:text-8xl font-black tracking-tighter mb-4", isDark ? "text-white" : "text-slate-800")}>
                                {(result.probability * 100).toFixed(0)}%
                            </h2>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-12">Calculated Probability Impact</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl text-left">
                                {getRecommendations().map((rec, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className={cn(
                                            "p-6 rounded-3xl border",
                                            isDark
                                                ? "bg-white/5 border-white/5"
                                                : "bg-white border-orange-50"
                                        )}
                                    >
                                        <h4 className={cn("font-black text-lg mb-2", isDark ? "text-white" : "text-slate-800")}>{rec.title}</h4>
                                        <p className="text-sm font-bold text-slate-500 leading-relaxed">{rec.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Subtle Footer */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-12"
            >
                Secure • Private • Confidential
            </motion.p>
        </div>
    );
}
