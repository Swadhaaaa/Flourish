import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, MessageCircle, Sparkles } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function Sisterhood() {
    const { userProfile } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMatches = async () => {
            // Mock user data if profile is empty
            const userData = {
                industry: userProfile?.industry || 'Technology',
                burnout_level: 'Medium',
                interests: ['Mentorship', 'Growth']
            };

            try {
                const response = await axios.post(`${API_URL}/api/community/match`, userData);
                setMatches(response.data);
            } catch (error) {
                console.error("Failed to fetch matches", error);
                // Fallback demo data
                setMatches([
                    {
                        profile: { name: "Sarah Chen", role: "VP Engineering", company: "TechFlow", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80" },
                        reason: "Mentor Match",
                        ai_icebreaker: "Hi Sarah, I see you're leading engineering at TechFlow. I'd love to learn about your journey."
                    },
                    {
                        profile: { name: "Priya Patel", role: "Product Lead", company: "Create", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80" },
                        reason: "Industry Peer",
                        ai_icebreaker: "Hey Priya, noticed we both care about burnout prevention. How do you handle it?"
                    }

                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchMatches();
    }, [userProfile]);

    return (
        <div className="min-h-screen bg-[#FFF0E5] dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans p-6 pb-20 -m-8 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[120px] -mr-40 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-200/40 rounded-full blur-[120px] -ml-40 -mb-20 pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <header className="mb-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-100">
                            <Users className="w-8 h-8 text-purple-500" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight">Sisterhood</h1>
                            <p className="text-slate-500 font-medium text-lg">Your AI-curated circle of mentors and peers.</p>
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {matches.map((match, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-purple-100/50 border border-purple-50 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-2xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="relative mb-4">
                                        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-purple-200 to-rose-200">
                                            <img src={match.profile.photo} alt={match.profile.name} className="w-full h-full rounded-full object-cover border-4 border-white" />
                                        </div>
                                        <div className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md border border-purple-50">
                                            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                                        </div>
                                    </div>

                                    <div className="mb-1">
                                        <span className="bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-purple-100">
                                            {match.reason}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 mb-1">{match.profile.name}</h3>
                                    <p className="text-slate-500 text-sm font-medium mb-4">{match.profile.role} @ {match.profile.company}</p>

                                    <div className="w-full bg-slate-50 rounded-2xl p-4 mb-6 text-left relative group-hover:bg-purple-50/50 transition-colors">
                                        <Sparkles className="w-4 h-4 text-purple-400 absolute top-3 right-3" />
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">AI Icebreaker</p>
                                        <p className="text-slate-600 text-sm italic leading-snug">"{match.ai_icebreaker}"</p>
                                    </div>

                                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-200 flex items-center justify-center gap-2 transition-all active:scale-95">
                                        <MessageCircle className="w-5 h-5" />
                                        Connect
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
                .font-display { font-family: 'Outfit', sans-serif; }
            `}</style>
        </div>
    );
}
