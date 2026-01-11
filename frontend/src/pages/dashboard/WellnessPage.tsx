import { useState } from "react";
import { Smile, Meh, Frown, Sparkles, Wind, PenLine } from "lucide-react";

export function WellnessPage() {
    const [mood, setMood] = useState<string | null>(null);
    const [reflection, setReflection] = useState("");

    const moods = [
        { icon: Smile, label: "Great", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
        { icon: Smile, label: "Good", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" }, // Reusing smile for good
        { icon: Meh, label: "Okay", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
        { icon: Frown, label: "Low", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
        { icon: Frown, label: "Stressed", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            {/* Left Column (2/3) */}
            <div className="lg:col-span-2 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Mental Wellness Space</h1>
                    <p className="text-muted">A calm sanctuary for reflection and self-care</p>
                </div>

                {/* Mood Check-in */}
                <div className="p-8 rounded-3xl bg-surface/50 border border-white/10 backdrop-blur-sm">
                    <h2 className="text-xl font-semibold text-white mb-6">How are you feeling right now?</h2>
                    <div className="grid grid-cols-5 gap-4">
                        {moods.map((m) => (
                            <button
                                key={m.label}
                                onClick={() => setMood(m.label)}
                                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${mood === m.label
                                    ? `${m.bg} ${m.border} ring-2 ring-primary/20`
                                    : "bg-white/5 border-white/5 hover:bg-white/10"
                                    }`}
                            >
                                <m.icon className={`w-8 h-8 ${m.color}`} />
                                <span className="text-sm font-medium text-white">{m.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Guided Reflection */}
                <div className="p-8 rounded-3xl bg-surface/50 border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white">Guided Reflection</h2>
                        <div className="flex gap-2">
                            <TabButton label="Gratitude" active />
                            <TabButton label="Stress" />
                            <TabButton label="Wins" />
                        </div>
                    </div>

                    <p className="text-muted mb-4">What are you grateful for today?</p>

                    <div className="relative">
                        <textarea
                            value={reflection}
                            onChange={(e) => setReflection(e.target.value)}
                            placeholder="Take a moment to reflect..."
                            className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-muted/50 focus:ring-2 focus:ring-primary/50 outline-none resize-none transition-all"
                        />
                        <div className="absolute bottom-4 right-4">
                            <PenLine className="w-4 h-4 text-muted" />
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button className="px-6 py-2 rounded-full bg-primary/20 text-primary border border-primary/20 hover:bg-primary/30 transition-all font-medium text-sm">
                            Save Reflection
                        </button>
                    </div>
                </div>

                {/* Grounding Exercise */}
                <div className="p-6 rounded-3xl bg-surface/50 border border-white/10 backdrop-blur-sm flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center">
                        <Wind className="w-8 h-8 text-rose-300" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">Quick Grounding Exercise</h3>
                        <p className="text-muted text-sm mb-3">Take 2 minutes for a calming breathing exercise</p>
                        <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium transition-all">
                            Start Exercise
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column (1/3) */}
            <div className="space-y-6 lg:pt-20">
                {/* Weekly Mood Tracker */}
                <div className="p-6 rounded-3xl bg-surface/50 border border-white/10 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold text-white mb-6">This Week's Mood</h3>
                    <div className="space-y-6">
                        <MoodRow day="Mon" icon={Smile} color="text-primary" />
                        <MoodRow day="Tue" icon={Smile} color="text-emerald-400" />
                        <MoodRow day="Wed" icon={Meh} color="text-yellow-400" />
                        <MoodRow day="Thu" icon={Smile} color="text-primary" />
                        <MoodRow day="Today" icon={Smile} color="text-emerald-400" highlight />
                    </div>
                </div>

                {/* Daily Affirmation */}
                <div className="p-6 rounded-3xl bg-surface/50 border border-white/10 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-20">
                        <Sparkles className="w-24 h-24 text-primary rotate-12" />
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold text-white">Daily Affirmation</h3>
                    </div>

                    <blockquote className="text-lg text-white/90 italic leading-relaxed mb-4 relative z-10">
                        "I am worthy of rest and rejuvenation. My feelings are valid, and I honor them."
                    </blockquote>
                </div>

                {/* Tips Grid */}
                <div className="p-6 rounded-3xl bg-surface/50 border border-white/10 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold text-white mb-4">Wellness Tips</h3>
                    <ul className="space-y-4">
                        <TipItem icon="💧" text="Stay hydrated - aim for 8 glasses today" />
                        <TipItem icon="🚶‍♀️" text="Take a 10-minute walk to reset" />
                        <TipItem icon="😴" text="Aim for 7-8 hours of sleep tonight" />
                    </ul>
                </div>
            </div>
        </div>
    );
}

function TabButton({ label, active }: any) {
    return (
        <button className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${active
            ? "bg-white/10 text-white"
            : "text-muted hover:text-white hover:bg-white/5"
            }`}>
            {label}
        </button>
    )
}

function MoodRow({ day, icon: Icon, color, highlight }: any) {
    return (
        <div className={`flex items-center justify-between ${highlight ? "opacity-100" : "opacity-70"}`}>
            <span className="text-white font-medium text-sm">{day}</span>
            <Icon className={`w-5 h-5 ${color}`} />
        </div>
    )
}

function TipItem({ icon, text }: any) {
    return (
        <li className="flex items-start gap-3 text-sm text-muted">
            <span className="text-lg not-italic">{icon}</span>
            <span>{text}</span>
        </li>
    )
}
