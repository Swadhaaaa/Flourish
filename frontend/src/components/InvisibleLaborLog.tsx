import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, X, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

interface LaborResult {
    classification: string;
    category: string;
    impact_score: number;
    advice: string;
    script: string;
}

export default function InvisibleLaborLog({ onClose }: { onClose: () => void }) {
    const [task, setTask] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<LaborResult | null>(null);

    const handleAnalyze = async () => {
        if (!task.trim()) return;
        setLoading(true);
        try {
            // Assuming backend is on port 8000
            const response = await axios.post('http://localhost:8000/api/ai/invisible-labor', {
                task_description: task
            });
            setResult(response.data);
        } catch (error) {
            console.error("Analysis failed", error);
            // Fallback for demo if backend not running
            setResult({
                classification: "Invisible",
                category: "Office Housework",
                impact_score: 2,
                advice: "This task has low visibility. Consider delegating.",
                script: "I can't take this on right now."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-rose-100 relative">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors z-10"
                >
                    <X className="w-5 h-5 text-slate-400" />
                </button>

                <div className="p-8">
                    <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Invisible Labor Log</h2>
                    <p className="text-slate-500 mb-8">
                        Is this task helping your career? Let AI analyze its impact before you say "Yes".
                    </p>

                    {!result ? (
                        <div className="space-y-4">
                            <textarea
                                value={task}
                                onChange={(e) => setTask(e.target.value)}
                                placeholder="e.g., Organizing the team birthday party..."
                                className="w-full h-32 bg-slate-50 rounded-2xl p-4 resize-none border-2 border-transparent focus:border-rose-500/20 focus:bg-white transition-all outline-none font-medium text-slate-700"
                            />
                            <button
                                onClick={handleAnalyze}
                                disabled={loading || !task.trim()}
                                className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Analyze Impact
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className={`p-6 rounded-3xl border-2 ${result.classification === 'Promotable' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    {result.classification === 'Promotable' ? (
                                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                                    ) : (
                                        <AlertCircle className="w-6 h-6 text-amber-500" />
                                    )}
                                    <h3 className={`text-xl font-bold ${result.classification === 'Promotable' ? 'text-emerald-900' : 'text-amber-900'}`}>
                                        {result.classification} Task
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm font-bold opacity-70">
                                        <span>Category: {result.category}</span>
                                        <span>User Impact: {result.impact_score}/10</span>
                                    </div>
                                    <div className="bg-white/60 p-4 rounded-2xl text-slate-700 font-medium text-sm leading-relaxed">
                                        "{result.advice}"
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">AI Suggested Action</h4>
                                <div className="p-4 bg-white rounded-xl border border-slate-200 text-slate-600 italic text-sm">
                                    "{result.script}"
                                </div>
                                <button
                                    onClick={() => { navigator.clipboard.writeText(result.script) }}
                                    className="mt-4 w-full py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    Copy Script
                                </button>
                            </div>

                            <button
                                onClick={() => { setResult(null); setTask('') }}
                                className="w-full text-slate-400 font-bold hover:text-slate-600 transition-colors"
                            >
                                Check Another Task
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
