import { useState } from "react";
import { Sparkles, Calendar, Clock, Battery, BatteryLow, Zap, CheckCircle2 } from "lucide-react";

export function SchedulePage() {
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [schedule, setSchedule] = useState<any>(null);

    const handleGenerate = async () => {
        if (!input.trim()) return;
        setIsLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
            const res = await fetch(`${API_URL}/api/ai/auto-schedule`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: input }),
            });
            const data = await res.json();
            setSchedule(data.schedule);
        } catch (error) {
            console.error("Failed to generate schedule", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    AI Auto-Scheduler <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                </h1>
                <p className="text-muted">
                    Dump your tasks, meetings, and goals below. Our AI will restructure your day based on your **Peak Energy Cycles**.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="p-1 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
                        <div className="bg-surface/90 rounded-[22px] p-6 backdrop-blur-xl">
                            <label className="block text-sm font-medium text-white mb-3">
                                What's on your mind? (Brain Dump)
                            </label>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="e.g. I need to finish the Q1 report, have a sync with the dev team at 2pm, want to hit the gym, and need to call my mom..."
                                className="w-full h-40 bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-all resize-none mb-4"
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading || !input}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <span className="animate-pulse">Optimizing Energy...</span>
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5 fill-white" /> Generate Optimized Day
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Features List */}
                    <div className="grid grid-cols-2 gap-4">
                        <FeatureCard
                            icon={Battery}
                            title="Energy Matching"
                            desc="Deep work assigned to peak focus hours."
                        />
                        <FeatureCard
                            icon={Clock}
                            title="Smart Buffers"
                            desc="Auto-inserted breaks to prevent burnout."
                        />
                    </div>
                </div>

                {/* Output Section */}
                <div className="relative min-h-[500px] p-6 rounded-3xl bg-surface/50 border border-white/10 backdrop-blur-sm">
                    {!schedule ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 opacity-50">
                            <Calendar className="w-16 h-16 text-muted mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">Your Timeline Awaits</h3>
                            <p className="text-muted">Generate a schedule to see the AI magic.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">Your Optimized Timeline</h3>
                                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                    ● 94% Efficiency
                                </span>
                            </div>

                            <div className="relative space-y-0">
                                {/* Vertical Line */}
                                <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-white/5" />

                                {schedule.map((block: any, index: number) => (
                                    <TimelineItem key={index} block={block} />
                                ))}
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <button className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 text-muted hover:text-white transition-all text-sm font-medium">
                                    Export to Google Calendar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function TimelineItem({ block }: { block: any }) {
    const isFocus = block.type === "focus";
    const isBreak = block.type === "break";
    const isMeeting = block.type === "meeting";

    let icon = Calendar;
    let colorClass = "text-white";
    let bgClass = "bg-white/5";
    let borderClass = "border-white/10";

    if (isFocus) {
        icon = Zap;
        colorClass = "text-amber-400";
        bgClass = "bg-amber-500/10";
        borderClass = "border-amber-500/20";
    } else if (isBreak) {
        icon = Battery;
        colorClass = "text-emerald-400";
        bgClass = "bg-emerald-500/10";
        borderClass = "border-emerald-500/20";
    } else if (isMeeting) {
        icon = BatteryLow;
        colorClass = "text-blue-400";
        bgClass = "bg-blue-500/10";
        borderClass = "border-blue-500/20";
    } else {
        icon = CheckCircle2;
        colorClass = "text-purple-400";
        bgClass = "bg-purple-500/10";
        borderClass = "border-purple-500/20";
    }

    const IconComp = icon;

    return (
        <div className="relative flex gap-6 group hover:translate-x-1 transition-transform cursor-pointer pb-6 last:pb-0">
            {/* Time Column */}
            <div className="w-14 pt-1 text-right text-xs font-medium text-muted shrink-0">
                {block.time}
            </div>

            {/* Icon Node */}
            <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${bgClass} ${borderClass} ${colorClass} shadow-lg shadow-black/20`}>
                <IconComp className="w-5 h-5" />
            </div>

            {/* Content Card */}
            <div className={`flex-1 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all ${isFocus ? "bg-amber-500/5" : ""}`}>
                <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-white">{block.task}</h4>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-50">{block.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-md ${bgClass} ${colorClass} bg-opacity-50`}>
                        {block.energy} Energy
                    </span>
                    {isFocus && <span className="text-xs text-muted flex items-center gap-1"> <Zap className="w-3 h-3" /> Flow State</span>}
                </div>
            </div>
        </div>
    )
}

function FeatureCard({ icon: Icon, title, desc }: any) {
    return (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <Icon className="w-5 h-5 text-primary mb-2" />
            <h4 className="font-medium text-white text-sm mb-1">{title}</h4>
            <p className="text-xs text-muted leading-relaxed">{desc}</p>
        </div>
    )
}
