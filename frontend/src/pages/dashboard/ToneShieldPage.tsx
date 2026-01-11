import { useState } from "react";
import { Shield, Mail, AlertTriangle, RefreshCw, CheckCircle2, MessageSquare } from "lucide-react";

export function ToneShieldPage() {
    const [emailContent, setEmailContent] = useState("");
    const [senderName, setSenderName] = useState("Boss");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);

    const handleAnalyze = async () => {
        if (!emailContent.trim()) return;
        setIsAnalyzing(true);

        try {
            const res = await fetch("http://localhost:8000/api/ai/tone-shield", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: emailContent,
                    sender: senderName
                }),
            });
            const data = await res.json();
            setAnalysis(data);
        } catch (error) {
            console.error("Analysis failed", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    Tone Shield <Shield className="w-8 h-8 text-primary animate-pulse" />
                </h1>
                <p className="text-muted">
                    Protect your mental peace. Detect incoming toxicity and rewrite emails to be neutral and professional.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Column */}
                <div className="space-y-6">
                    <div className="p-1 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
                        <div className="bg-surface/90 rounded-[22px] p-6 backdrop-blur-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <Mail className="w-5 h-5 text-muted" />
                                <h3 className="text-lg font-semibold text-white">Incoming Email</h3>
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-medium text-muted mb-1.5">Sender Name</label>
                                <input
                                    type="text"
                                    value={senderName}
                                    onChange={(e) => setSenderName(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white/90 text-sm focus:outline-none focus:border-primary/50"
                                />
                            </div>

                            <label className="block text-xs font-medium text-muted mb-1.5">Email Body</label>
                            <textarea
                                value={emailContent}
                                onChange={(e) => setEmailContent(e.target.value)}
                                placeholder="Paste the stressful email here..."
                                className="w-full h-64 bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder:text-muted/50 focus:outline-none focus:border-primary/50 transition-all resize-none mb-6 font-mono text-sm leading-relaxed"
                            />

                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !emailContent}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${isAnalyzing
                                    ? "bg-white/10 text-muted cursor-wait"
                                    : "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/25"
                                    }`}
                            >
                                {isAnalyzing ? (
                                    <span className="animate-pulse">Scanning Tone...</span>
                                ) : (
                                    <>
                                        <Shield className="w-5 h-5" /> Activate Shield
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Analysis Result Column */}
                <div className="relative min-h-[500px]">
                    {!analysis ? (
                        <div className="h-full rounded-3xl bg-surface/30 border border-white/5 flex flex-col items-center justify-center text-center p-8 border-dashed">
                            <Shield className="w-20 h-20 text-white/5 mb-6" />
                            <h3 className="text-xl font-semibold text-white/40 mb-2">Shield Standby</h3>
                            <p className="text-muted/40 max-w-xs">Waiting for input to analyze toxicity and invisible labor markers.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            {/* Score Card */}
                            <div className={`p-6 rounded-3xl border backdrop-blur-sm transition-colors ${analysis.is_toxic
                                ? "bg-rose-950/30 border-rose-500/30 shadow-lg shadow-rose-900/20"
                                : "bg-emerald-950/30 border-emerald-500/30"
                                }`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${analysis.is_toxic ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                                            <AlertTriangle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className={`text-lg font-bold ${analysis.is_toxic ? "text-rose-200" : "text-emerald-200"}`}>
                                                {analysis.is_toxic ? "Toxicity Detected" : "Safe Tone"}
                                            </h3>
                                            <p className={`text-xs ${analysis.is_toxic ? "text-rose-300/70" : "text-emerald-300/70"}`}>
                                                Aggression Score: {analysis.aggression_score}%
                                            </p>
                                        </div>
                                    </div>
                                    {analysis.is_invisible_labor && (
                                        <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-semibold border border-orange-500/20">
                                            Invisible Labor Alert
                                        </span>
                                    )}
                                </div>
                                <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${analysis.is_toxic ? "bg-rose-500" : "bg-emerald-500"}`}
                                        style={{ width: `${analysis.aggression_score}%` }}
                                    />
                                </div>
                            </div>

                            {/* Rewritten Version */}
                            <div className="p-1 rounded-3xl bg-gradient-to-br from-primary/20 to-purple-600/20 border border-primary/20">
                                <div className="bg-[#0f0814]/90 rounded-[22px] p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <SparklesIcon className="w-32 h-32 text-primary" />
                                    </div>

                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4 text-primary" /> Rewritten for Sanity
                                    </h3>

                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 font-medium text-white/90 leading-relaxed whitespace-pre-wrap">
                                        {analysis.rewritten}
                                    </div>

                                    <div className="mt-4 flex gap-3">
                                        <button className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-colors flex items-center justify-center gap-2">
                                            <MessageSquare className="w-4 h-4" /> Draft Reply
                                        </button>
                                        <button className="flex-1 py-3 rounded-xl bg-primary/20 hover:bg-primary/30 text-sm font-medium text-primary transition-colors flex items-center justify-center gap-2 border border-primary/20">
                                            <CheckCircle2 className="w-4 h-4" /> Copy Text
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SparklesIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
    )
}
