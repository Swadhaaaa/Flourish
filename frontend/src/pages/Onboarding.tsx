import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, ChevronLeft, Shield, Heart } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { useNavigate } from "react-router-dom";

const STEPS = 3;

export function Onboarding() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Form State
    const [workSchedule, setWorkSchedule] = useState({
        start: "09:00",
        end: "17:00",
        days: ["Mon", "Tue", "Wed", "Thu", "Fri"]
    });

    const [focusAreas, setFocusAreas] = useState<string[]>([]);

    const handleNext = async () => {
        if (step < STEPS) {
            setStep(step + 1);
        } else {
            // Finish Onboarding
            await saveOnboardingData();
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const saveOnboardingData = async () => {
        if (!auth.currentUser) return;
        setLoading(true);
        try {
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
                onboardingCompleted: true,
                workSchedule,
                focusAreas,
                updatedAt: new Date().toISOString()
            });
            navigate("/dashboard");
        } catch (error) {
            console.error("Error saving onboarding data:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleDay = (day: string) => {
        setWorkSchedule((prev: { days: string[]; start: string; end: string }) => ({
            ...prev,
            days: prev.days.includes(day) ? prev.days.filter((d: string) => d !== day) : [...prev.days, day]
        }));
    };

    const toggleFocus = (area: string) => {
        setFocusAreas((prev: string[]) =>
            prev.includes(area) ? prev.filter((a: string) => a !== area) : [...prev, area]
        );
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-glow-gradient opacity-30 pointer-events-none" />

            {/* Header with Progress */}
            <div className="relative z-10 w-full max-w-2xl mb-8 text-center space-y-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">Flourish</span>
                </div>

                {/* Progress Bar */}
                <div className="flex flex-col items-center gap-2">
                    <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${(step / STEPS) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <span className="text-sm text-muted">Step {step} of {STEPS}</span>
                </div>
            </div>

            {/* Main Card */}
            <motion.div
                layout
                className="w-full max-w-3xl bg-surface/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10 min-h-[500px] flex flex-col"
            >
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 flex flex-col"
                        >
                            <h2 className="text-3xl font-bold text-white mb-4">Welcome to Flourish!</h2>
                            <p className="text-muted text-lg mb-10">Let's personalize your experience to best support your wellbeing journey.</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <FeatureCard icon={Shield} title="Privacy-First" />
                                <FeatureCard icon={Sparkles} title="AI-Powered" />
                                <FeatureCard icon={Heart} title="Your Safe Space" />
                            </div>

                            <div className="mt-auto pt-8 text-center text-sm text-muted/60 max-w-xl mx-auto">
                                Flourish uses AI to help you balance work and wellbeing. All your data is encrypted and never shared.
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 flex flex-col"
                        >
                            <h2 className="text-3xl font-bold text-white mb-4">Your Work Schedule</h2>
                            <p className="text-muted text-lg mb-10">Help us understand your typical work hours so we can protect your boundaries.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-white/80">Work Start Time</label>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            value={workSchedule.start}
                                            onChange={(e) => setWorkSchedule({ ...workSchedule, start: e.target.value })}
                                            className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-white/80">Work End Time</label>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            value={workSchedule.end}
                                            onChange={(e) => setWorkSchedule({ ...workSchedule, end: e.target.value })}
                                            className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-medium text-white/80">Working Days</label>
                                <div className="flex flex-wrap gap-3">
                                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                                        <button
                                            key={day}
                                            onClick={() => toggleDay(day)}
                                            className={`w-12 h-12 rounded-full flex items-center justify-center font-medium transition-all ${workSchedule.days.includes(day)
                                                    ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(238,180,180,0.3)]"
                                                    : "bg-white/5 text-muted hover:bg-white/10"
                                                }`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 flex flex-col"
                        >
                            <h2 className="text-3xl font-bold text-white mb-4">Wellbeing Focus</h2>
                            <p className="text-muted text-lg mb-10">What areas of wellbeing matter most to you right now?</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    "Work-Life Balance", "Stress Management",
                                    "Boundary Setting", "Mental Health",
                                    "Career Growth", "Physical Wellness"
                                ].map((area) => (
                                    <button
                                        key={area}
                                        onClick={() => toggleFocus(area)}
                                        className={`p-4 rounded-xl border flex items-center gap-3 transition-all text-left group ${focusAreas.includes(area)
                                                ? "bg-primary/10 border-primary text-white"
                                                : "bg-white/5 border-white/10 text-muted hover:border-white/20 hover:text-white"
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${focusAreas.includes(area) ? "bg-primary border-primary" : "border-white/20 group-hover:border-white/40"
                                            }`}>
                                            {focusAreas.includes(area) && <Check className="w-3 h-3 text-primary-foreground" />}
                                        </div>
                                        <span className="font-medium">{area}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-12 pt-6 border-t border-white/5">
                    <button
                        onClick={handleBack}
                        disabled={step === 1}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${step === 1 ? "opacity-0 pointer-events-none" : "bg-white/5 text-white hover:bg-white/10"
                            }`}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={loading}
                        className="px-8 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(238,180,180,0.3)] hover:shadow-[0_0_25px_rgba(238,180,180,0.5)]"
                    >
                        {loading ? "Saving..." : step === STEPS ? "Get Started" : "Continue"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

function FeatureCard({ icon: Icon, title }: { icon: any, title: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-primary">
                <Icon className="w-6 h-6" />
            </div>
            <span className="font-medium text-white">{title}</span>
        </div>
    )
}
