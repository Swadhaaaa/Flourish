import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, MessageCircle, Sparkles, Key, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { generateKeyPair, exportPublicKey, exportPrivateKey } from '../../utils/e2ee';
import SisterhoodChat from '../../components/SisterhoodChat';
import { doc, setDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function Sisterhood() {
    const { user, userProfile, updateUserProfile } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const [matches, setMatches] = useState<any[]>([]);
    const [loadingMatches, setLoadingMatches] = useState(false);

    // Onboarding State
    const [needsOnboarding, setNeedsOnboarding] = useState(false);
    const [onboardingData, setOnboardingData] = useState({ industry: 'Technology', role: '', company: '' });
    const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);

    // Chat State
    const [activeChat, setActiveChat] = useState<{ id: string; name: string; photo: string } | null>(null);

    // 1. Check if user needs Onboarding (Missing industry or E2EE keys)
    useEffect(() => {
        if (!userProfile) return;

        const hasKeys = userProfile.publicKey;
        const hasProfileData = userProfile.industry && userProfile.role;

        if (!hasKeys || !hasProfileData) {
            setNeedsOnboarding(true);
        } else {
            setNeedsOnboarding(false);
            fetchMatches(userProfile);
        }
    }, [userProfile]);

    const fetchMatches = async (profileData: any) => {
        setLoadingMatches(true);
        try {
            // 1. Fetch real users from Firebase to allow actual testing
            const usersRef = collection(db, 'users');
            const userSnapshot = await getDocs(usersRef);
            console.log("Total docs in users collection:", userSnapshot.size);
            const realUsers = userSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter((u: any) => {
                    const isOther = u.id !== user?.uid;
                    const hasKey = !!u.publicKey;
                    if (!hasKey && isOther) console.log(`User ${u.id} (${u.name}) found but not onboarded (no publicKey).`);
                    return isOther && hasKey;
                });

            console.log("Onboarded real users found:", realUsers.length);

            const firebaseMatches = realUsers.map((u: any) => ({
                profile: {
                    id: u.id,
                    name: u.name || 'Community Member',
                    role: u.role || 'Member',
                    company: u.company || '',
                    photo: u.photoURL || `https://ui-avatars.com/api/?name=${u.name || 'User'}&background=random`,
                    publicKey: u.publicKey
                },
                reason: "Live Network Peer",
                ai_icebreaker: `Hi ${u.name || 'there'}, I see we're both in the Sisterhood network. Let's connect!`
            }));

            // 2. Try the AI matcher, and append real users
            let finalMatches = [...firebaseMatches];
            try {
                const response = await axios.post(`${API_URL}/api/community/match`, profileData);
                if (response.data && response.data.length > 0) {
                    finalMatches = [...finalMatches, ...response.data];
                }
            } catch (error) {
                console.error("Backend AI match failed, using fallback + live users", error);
                // Fallback GenAI demo data
                finalMatches.push(
                    {
                        profile: { id: "u2", name: "Priya Patel", role: "Marketing Director", company: "CreativePulse", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80", publicKey: "bW9jaw==" },
                        reason: "Burnout Support Match",
                        ai_icebreaker: "Hey Priya, noticed we both care about burnout prevention. How do you handle it?"
                    },
                    {
                        profile: { id: "u3", name: "Elena Rodriguez", role: "VP of Engineering", company: "BuildSafe", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80", publicKey: "bW9jaw==" },
                        reason: "Industry Peer",
                        ai_icebreaker: "Hi Elena, it's great to see another woman in Tech leadership! Would love to connect."
                    }
                );
            }
            setMatches(finalMatches);
        } catch (error) {
            console.error("Failed to fetch matches", error);
        } finally {
            setLoadingMatches(false);
        }
    };

    const handleOnboardingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsGeneratingKeys(true);
        try {
            // Generate E2EE Keys
            const keyPair = await generateKeyPair();
            const pubKeyB64 = await exportPublicKey(keyPair.publicKey);
            const privKeyB64 = await exportPrivateKey(keyPair.privateKey);

            // Save private key locally ONLY
            localStorage.setItem(`e2ee_priv_${user?.uid}`, privKeyB64);

            // Save public key and profile data to Firestore
            await updateUserProfile({
                ...onboardingData,
                publicKey: pubKeyB64,
                isOnboarded: true
            });

            setNeedsOnboarding(false);
            fetchMatches({ ...userProfile, ...onboardingData });
        } catch (err) {
            console.error("Failed to setup secure profile", err);
        } finally {
            setIsGeneratingKeys(false);
        }
    };

    const handleConnect = async (match: any) => {
        if (!user) return;
        const chatId = [user.uid, match.profile.id].sort().join('_');

        // Auto-accept connection for demo
        await setDoc(doc(db, "connections", chatId), {
            users: [user.uid, match.profile.id],
            status: "accepted",
            createdAt: serverTimestamp()
        }, { merge: true });

        setActiveChat({ id: match.profile.id, name: match.profile.name, photo: match.profile.photo });
    };

    if (needsOnboarding) {
        return (
            <div className="min-h-screen bg-[#FFF0E5] dark:bg-slate-900 flex items-center justify-center p-6 -m-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl max-w-md w-full border border-amber-50 dark:border-slate-700"
                >
                    <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                        <Users className="w-8 h-8 text-amber-600" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 font-display tracking-tight">Join the Sisterhood</h2>
                    <p className="text-slate-500 mb-8 font-medium">Create your secure profile to get AI-matched with mentors and peers.</p>

                    <form onSubmit={handleOnboardingSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Your Industry</label>
                            <select
                                value={onboardingData.industry}
                                onChange={e => setOnboardingData({ ...onboardingData, industry: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-amber-200 font-medium"
                            >
                                <option>Technology</option>
                                <option>Healthcare</option>
                                <option>Finance</option>
                                <option>Education</option>
                                <option>Creative</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Current Role</label>
                            <input
                                required type="text" placeholder="e.g. Senior Developer"
                                value={onboardingData.role} onChange={e => setOnboardingData({ ...onboardingData, role: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-amber-200 font-medium placeholder:text-slate-300"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Company (Optional)</label>
                            <input
                                type="text" placeholder="e.g. InnovateInc"
                                value={onboardingData.company} onChange={e => setOnboardingData({ ...onboardingData, company: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-amber-200 font-medium placeholder:text-slate-300"
                            />
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl flex items-start gap-3 mt-6">
                            <Key className="w-5 h-5 text-green-600 mt-0.5" />
                            <p className="text-xs text-green-800 dark:text-green-400 leading-relaxed font-medium">
                                We'll generate an <strong>End-to-End Encryption Keypair</strong> for your device to ensure all your mentor chats remain completely private.
                            </p>
                        </div>

                        <button
                            disabled={isGeneratingKeys}
                            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-xl shadow-lg mt-6 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                        >
                            {isGeneratingKeys ? "Securing Profile..." : "Complete Profile & Find Matches"}
                        </button>
                    </form>
                </motion.div>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
                    .font-display { font-family: 'Outfit', sans-serif; }
                `}</style>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFF0E5] dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans p-6 pb-20 -m-8 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-200/40 rounded-full blur-[120px] -mr-40 -mt-20 pointer-events-none z-0" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-200/40 rounded-full blur-[120px] -ml-40 -mb-20 pointer-events-none z-0" />

            <div className="max-w-5xl mx-auto relative z-10">
                <header className="mb-12 flex justify-between items-end">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-100">
                            <Users className="w-8 h-8 text-amber-500" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white tracking-tight leading-tight">Sisterhood</h1>
                            <p className="text-slate-500 font-medium text-lg mt-1">Your AI-curated circle of mentors.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => fetchMatches(userProfile)}
                            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700 hover:bg-white transition-colors"
                        >
                            Refresh Matches
                        </button>
                        {userProfile?.publicKey && (
                            <div className="hidden md:flex items-center gap-1.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                                <CheckCircle2 className="w-3.5 h-3.5" /> E2EE Secured
                            </div>
                        )}
                    </div>
                </header>

                {loadingMatches ? (
                    <div className="flex flex-col items-center justify-center h-64 text-rose-400">
                        <Sparkles className="w-10 h-10 animate-bounce mb-4" />
                        <p className="font-bold">AI is finding your perfect matches...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {matches.map((match, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-7 shadow-xl shadow-rose-100/50 dark:shadow-none border border-amber-50 dark:border-slate-700 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 dark:bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="relative mb-5">
                                        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-amber-200 to-rose-200">
                                            <img src={match.profile.photo} alt={match.profile.name} className="w-full h-full rounded-full object-cover border-4 border-white dark:border-slate-800" />
                                        </div>
                                        <div className="absolute bottom-0 right-0 bg-white dark:bg-slate-700 rounded-full p-1.5 shadow-md border border-amber-50 dark:border-slate-600">
                                            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <span className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-100 dark:border-amber-800/50">
                                            {match.reason}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{match.profile.name}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-5">{match.profile.role} {match.profile.company ? `@ ${match.profile.company}` : ''}</p>

                                    <div className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 mb-6 text-left relative group-hover:bg-amber-50/50 dark:group-hover:bg-amber-900/10 transition-colors border border-slate-100 dark:border-slate-800">
                                        <Sparkles className="w-4 h-4 text-rose-400 absolute top-3 right-3" />
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">AI Suggested Icebreaker</p>
                                        <p className="text-slate-600 dark:text-slate-300 text-sm italic leading-snug">"{match.ai_icebreaker}"</p>
                                    </div>

                                    <button
                                        onClick={() => handleConnect(match)}
                                        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-rose-200 dark:shadow-none flex items-center justify-center gap-2 transition-all active:scale-95"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        Connect Privately
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Chat Overlay */}
            {activeChat && (
                <SisterhoodChat
                    peerId={activeChat.id}
                    peerName={activeChat.name}
                    peerPhoto={activeChat.photo}
                    onClose={() => setActiveChat(null)}
                />
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
                .font-display { font-family: 'Outfit', sans-serif; }
            `}</style>
        </div>
    );
}

