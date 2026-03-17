import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Heart, MessageCircle, Sparkles, CheckCircle2, UserPlus, Inbox, Check, X, Bell, Lock } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { generateKeyPair, exportPublicKey, exportPrivateKey } from '../../utils/e2ee';
import SisterhoodChat from '../../components/SisterhoodChat';
import { doc, setDoc, serverTimestamp, collection, getDocs, query, where, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function Sisterhood() {
    const { user, userProfile, updateUserProfile } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const [view, setView] = useState<'suggested' | 'requests'>('suggested');
    const [matches, setMatches] = useState<any[]>([]);
    const [loadingMatches, setLoadingMatches] = useState(false);

    // Connections & Requests State
    const [connections, setConnections] = useState<string[]>([]); // Array of peer UIDs
    const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
    const [sentRequests, setSentRequests] = useState<string[]>([]); // Array of recipient UIDs

    // Onboarding State
    const [needsOnboarding, setNeedsOnboarding] = useState(false);
    const [onboardingData, setOnboardingData] = useState({ industry: 'Technology', role: '', company: '' });
    const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);
    const [isRegeneratingKeys, setIsRegeneratingKeys] = useState(false);

    // Chat State
    const [activeChat, setActiveChat] = useState<{ id: string; name: string; photo: string } | null>(null);

    // Auto-regenerate keys if user already has profile data but keys are missing
    const regenerateKeys = async () => {
        if (!user) return;
        setIsRegeneratingKeys(true);
        try {
            const keyPair = await generateKeyPair();
            const pubKeyB64 = await exportPublicKey(keyPair.publicKey);
            const privKeyB64 = await exportPrivateKey(keyPair.privateKey);
            localStorage.setItem(`e2ee_priv_${user.uid}`, privKeyB64);
            await updateUserProfile({ publicKey: pubKeyB64 });
            console.log("E2EE keys regenerated successfully");
        } catch (err) {
            console.error("Key regeneration failed", err);
        } finally {
            setIsRegeneratingKeys(false);
        }
    };

    // 1. Initial Profile & Onboarding Check
    useEffect(() => {
        if (!userProfile || !user) return;

        // E2EE check: both public key in Firestore AND private key in LocalStorage
        const hasPublicKey = !!userProfile.publicKey;
        const hasLocalStorageKey = !!localStorage.getItem(`e2ee_priv_${user.uid}`);

        const hasProfileData = userProfile.industry && userProfile.role;

        if (hasProfileData && (!hasPublicKey || !hasLocalStorageKey)) {
            // User already onboarded but keys are missing — auto-regenerate
            regenerateKeys();
            setNeedsOnboarding(false);
            fetchMatches(userProfile);
        } else if (!hasProfileData) {
            // First-time user — show full onboarding
            setNeedsOnboarding(true);
        } else {
            setNeedsOnboarding(false);
            fetchMatches(userProfile);
        }
    }, [userProfile, user]);

    // 2. Real-time Connection & Request Sync
    useEffect(() => {
        if (!user) return;

        // Listen for accepted connections
        const connQuery = query(collection(db, "connections"), where("users", "array-contains", user.uid));
        const unsubConn = onSnapshot(connQuery, (snapshot) => {
            const peerIds = snapshot.docs.map(doc => {
                const data = doc.data();
                return data.users.find((id: string) => id !== user.uid);
            });
            setConnections(peerIds);
        });

        // Listen for received pending requests
        const reqQuery = query(collection(db, "connection_requests"), where("toId", "==", user.uid), where("status", "==", "pending"));
        const unsubReq = onSnapshot(reqQuery, (snapshot) => {
            const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReceivedRequests(reqs);
        });

        // Listen for sent pending requests
        const sentQuery = query(collection(db, "connection_requests"), where("fromId", "==", user.uid), where("status", "==", "pending"));
        const unsubSent = onSnapshot(sentQuery, (snapshot) => {
            const ids = snapshot.docs.map(doc => doc.data().toId);
            setSentRequests(ids);
        });

        return () => {
            unsubConn();
            unsubReq();
            unsubSent();
        };
    }, [user]);

    const fetchMatches = async (profileData: any) => {
        setLoadingMatches(true);
        try {
            const usersRef = collection(db, 'users');
            const userSnapshot = await getDocs(usersRef);
            const realUsers = userSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter((u: any) => u.id !== user?.uid && u.publicKey);

            const firebaseMatches = realUsers.map((u: any) => ({
                profile: {
                    id: u.id, name: u.name || 'Member', role: u.role || 'Professional', company: u.company || '',
                    photo: u.photoURL || `https://ui-avatars.com/api/?name=${u.name || 'User'}&background=random`,
                    publicKey: u.publicKey, email: u.email
                },
                reason: "Community Peer",
                ai_icebreaker: `Hi ${u.name || 'there'}, I'm ${userProfile?.name}. noticed we're both in the Sisterhood network. Let's connect!`
            }));

            let finalMatches = [...firebaseMatches];
            try {
                const response = await axios.post(`${API_URL}/api/community/match`, profileData);
                if (response.data && response.data.length > 0) finalMatches = [...finalMatches, ...response.data];
            } catch (error) { console.error("AI fetch failed, using community results"); }
            setMatches(finalMatches);
        } catch (error) { console.error("Failed to fetch matches", error); } finally { setLoadingMatches(false); }
    };

    const handleSendRequest = async (match: any) => {
        if (!user || !userProfile) return;
        try {
            const requestId = `${user.uid}_${match.profile.id}`;
            await setDoc(doc(db, "connection_requests", requestId), {
                fromId: user.uid,
                fromName: userProfile.name,
                fromRole: userProfile.role,
                fromPhoto: userProfile.photoURL || `https://ui-avatars.com/api/?name=${userProfile.name}`,
                toId: match.profile.id,
                toEmail: match.profile.email,
                status: "pending",
                createdAt: serverTimestamp()
            });

            // Trigger Email Notification via Backend
            if (match.profile.email) {
                await axios.post(`${API_URL}/api/notifications/connection-request`, {
                    recipient_email: match.profile.email,
                    sender_name: userProfile.name,
                    sender_role: userProfile.role
                });
            }
        } catch (err) { console.error("Failed to send request", err); }
    };

    const handleAcceptRequest = async (request: any) => {
        if (!user) return;
        try {
            const chatId = [user.uid, request.fromId].sort().join('_');
            // 1. Update request status
            await updateDoc(doc(db, "connection_requests", request.id), { status: "accepted" });
            // 2. Create the connection
            await setDoc(doc(db, "connections", chatId), {
                users: [user.uid, request.fromId],
                status: "accepted",
                createdAt: serverTimestamp()
            });
        } catch (err) { console.error("Accept failed", err); }
    };

    const handleRejectRequest = async (request: any) => {
        try {
            await updateDoc(doc(db, "connection_requests", request.id), { status: "rejected" });
        } catch (err) { console.error("Reject failed", err); }
    };

    const handleOnboardingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsGeneratingKeys(true);
        try {
            const keyPair = await generateKeyPair();
            const pubKeyB64 = await exportPublicKey(keyPair.publicKey);
            const privKeyB64 = await exportPrivateKey(keyPair.privateKey);
            localStorage.setItem(`e2ee_priv_${user?.uid}`, privKeyB64);
            await updateUserProfile({ ...onboardingData, publicKey: pubKeyB64, isOnboarded: true });
            setNeedsOnboarding(false);
            fetchMatches({ ...userProfile, ...onboardingData });
        } catch (err) { console.error("Setup failed", err); } finally { setIsGeneratingKeys(false); }
    };

    if (needsOnboarding) {
        return (
            <div className="min-h-screen bg-[#FFF0E5] dark:bg-slate-900 flex items-center justify-center p-6 -m-8">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl max-w-md w-full border border-amber-50 dark:border-slate-700">
                    <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6"><Users className="w-8 h-8 text-amber-600" /></div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 font-display tracking-tight">Join the Sisterhood</h2>
                    <p className="text-slate-500 mb-8 font-medium text-sm leading-relaxed">Create your secure profile and get AI-matched with mentors. Your data is protected by E2E encryption.</p>
                    <form onSubmit={handleOnboardingSubmit} className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Your Industry</label>
                            <select value={onboardingData.industry} onChange={e => setOnboardingData({ ...onboardingData, industry: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 mt-1 outline-none font-medium">
                                <option>Technology</option><option>Healthcare</option><option>Finance</option><option>Education</option><option>Creative</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Current Role</label>
                            <input required type="text" placeholder="e.g. Senior Architect" value={onboardingData.role} onChange={e => setOnboardingData({ ...onboardingData, role: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 mt-1 outline-none font-medium placeholder:text-slate-300" />
                        </div>
                        <button disabled={isGeneratingKeys} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-xl shadow-lg mt-6 flex items-center justify-center gap-2 transition-all disabled:opacity-70">
                            {isGeneratingKeys ? "Securing Profile..." : "Find My Matches"}
                        </button>
                    </form>
                </motion.div>
                <style>{`.font-display { font-family: 'Outfit', sans-serif; }`}</style>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFF0E5] dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans p-6 pb-20 -m-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-200/30 rounded-full blur-[120px] -mr-40 -mt-20 pointer-events-none z-0" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-200/30 rounded-full blur-[120px] -ml-40 -mb-20 pointer-events-none z-0" />

            <div className="max-w-6xl mx-auto relative z-10">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-xl shadow-rose-100/50 dark:shadow-none border border-rose-50 dark:border-slate-700">
                            <Users className="w-8 h-8 text-rose-500" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white tracking-tight">Sisterhood</h1>
                            <div className="flex gap-4 mt-2">
                                <button onClick={() => setView('suggested')} className={`text-sm font-bold uppercase tracking-wider transition-colors ${view === 'suggested' ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'}`}>Suggested</button>
                                <button onClick={() => setView('requests')} className="relative text-sm font-bold uppercase tracking-wider transition-colors text-slate-400 hover:text-slate-600">
                                    Requests
                                    {receivedRequests.length > 0 && <span className="absolute -top-1 -right-3 w-4 h-4 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center animate-pulse">{receivedRequests.length}</span>}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => fetchMatches(userProfile)} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700 hover:bg-rose-50 transition-colors">Refresh</button>
                        <div className="hidden md:flex items-center gap-1.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200 dark:border-green-800/50"><CheckCircle2 className="w-3.5 h-3.5" /> E2EE Secure</div>
                    </div>
                </header>

                {isRegeneratingKeys && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 flex items-center gap-3">
                        <Lock className="w-5 h-5 text-amber-500 animate-pulse" />
                        <div>
                            <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Regenerating encryption keys...</p>
                            <p className="text-xs text-amber-500 dark:text-amber-500/70">Your secure chat profile is being restored.</p>
                        </div>
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {view === 'requests' ? (
                        <motion.div key="reqs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Inbox className="w-5 h-5 text-rose-500" /> Connection Requests</h2>
                            {receivedRequests.length === 0 ? (
                                <div className="bg-white dark:bg-slate-800 p-12 rounded-[2.5rem] text-center border border-dashed border-slate-200 dark:border-slate-700">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4"><Bell className="w-8 h-8 text-slate-300" /></div>
                                    <p className="text-slate-400 font-bold">No pending requests at the moment.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {receivedRequests.map(req => (
                                        <div key={req.id} className="bg-white dark:bg-slate-800 border border-amber-50 dark:border-slate-700 p-4 rounded-3xl flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <img src={req.fromPhoto} className="w-14 h-14 rounded-2xl object-cover" alt="" />
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white">{req.fromName}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{req.fromRole}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleAcceptRequest(req)} className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-100 dark:shadow-none"><Check className="w-5 h-5" /></button>
                                                <button onClick={() => handleRejectRequest(req)} className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div key="suggested" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            {loadingMatches ? (
                                <div className="flex flex-col items-center justify-center h-64 text-rose-400"><Sparkles className="w-10 h-10 animate-bounce mb-4" /><p className="font-black uppercase tracking-[.2em] text-xs">AI is fetching matches...</p></div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {matches.map((match, idx) => {
                                        const isConnected = connections.includes(match.profile.id);
                                        const isPending = sentRequests.includes(match.profile.id);
                                        return (
                                            <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                                                className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-7 shadow-xl shadow-rose-100/50 dark:shadow-none border border-rose-50/50 dark:border-slate-700 relative overflow-hidden group">
                                                <div className="relative z-10 flex flex-col items-center text-center">
                                                    <div className="relative mb-5">
                                                        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-amber-200 to-rose-400">
                                                            <img src={match.profile.photo} className="w-full h-full rounded-full object-cover border-4 border-white dark:border-slate-800" alt="" />
                                                        </div>
                                                        <Heart className="w-5 h-5 text-rose-500 absolute bottom-0 right-0 fill-rose-500 cursor-pointer hover:scale-110 transition-transform" />
                                                    </div>
                                                    <span className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[9px] font-black uppercase tracking-[.2em] px-4 py-1.5 rounded-full mb-3 border border-rose-100 dark:border-rose-800/50">{match.reason}</span>
                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 leading-tight">{match.profile.name}</h3>
                                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">{match.profile.role}</p>
                                                    <div className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 mb-8 text-left relative border border-slate-100 dark:border-slate-800 group-hover:bg-rose-50/50 transition-colors">
                                                        <Sparkles className="w-4 h-4 text-rose-400 absolute top-3 right-3" />
                                                        <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest mb-1.5">AI Icebreaker</p>
                                                        <p className="text-slate-600 dark:text-slate-300 text-sm italic leading-relaxed">"{match.ai_icebreaker}"</p>
                                                    </div>
                                                    {isConnected ? (
                                                        <button onClick={() => setActiveChat({ id: match.profile.id, name: match.profile.name, photo: match.profile.photo })}
                                                            className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all">
                                                            <MessageCircle className="w-5 h-5 fill-slate-900" /> Chat Securely
                                                        </button>
                                                    ) : isPending ? (
                                                        <button disabled className="w-full bg-slate-100 dark:bg-slate-700 text-slate-400 font-black py-4 rounded-2xl flex items-center justify-center gap-2">
                                                            <Bell className="w-5 h-5" /> Request Sent
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleSendRequest(match)}
                                                            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-rose-200 dark:shadow-none flex items-center justify-center gap-2 transition-all">
                                                            <UserPlus className="w-5 h-5" /> Send Request
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {activeChat && <SisterhoodChat apiUrl={API_URL} peerId={activeChat.id} peerName={activeChat.name} peerPhoto={activeChat.photo} onClose={() => setActiveChat(null)} />}
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap'); .font-display { font-family: 'Outfit', sans-serif; }`}</style>
        </div>
    );
}

