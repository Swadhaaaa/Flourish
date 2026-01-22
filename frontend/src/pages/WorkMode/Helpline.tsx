import { Phone, Shield, MapPin, Settings, Trash2, Map as MapIcon, PhoneCall, User, Signal, Ambulance, Flame, Baby, HeartPulse, ShieldAlert, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HELPLINE_NUMBERS = [
    { id: 1, name: 'Police', number: '100', icon: Shield, color: 'bg-[#E8F5E9]', iconColor: 'text-emerald-600' },
    { id: 2, name: 'Pregnancy Medic', number: '102', icon: HeartPulse, color: 'bg-[#E8EAF6]', iconColor: 'text-indigo-600' },
    { id: 3, name: 'Ambulance', number: '108', icon: Ambulance, color: 'bg-[#FCE4EC]', iconColor: 'text-rose-600' },
    { id: 4, name: 'Fire Service', number: '101', icon: Flame, color: 'bg-[#FFF9C4]', iconColor: 'text-amber-600' },
    { id: 5, name: 'Women Helpline', number: '1091', icon: ShieldAlert, color: 'bg-[#F3E5F5]', iconColor: 'text-purple-600' },
    { id: 6, name: 'Child Helpline', number: '1098', icon: Baby, color: 'bg-[#FFF3E0]', iconColor: 'text-orange-600' },
];

export default function Helpline() {
    const [activeTab, setActiveTab] = useState('numbers');

    return (
        <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="min-h-screen bg-[#F3E5F5] text-slate-900 font-sans -m-8 relative overflow-hidden flex flex-col"
        >
            {/* Header Area */}
            <div className="p-8 pb-4 flex justify-between items-center relative z-10">
                <button className="w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center border border-purple-100 shadow-sm">
                    <ChevronLeft className="w-5 h-5 text-purple-600" />
                </button>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                    {activeTab === 'numbers' ? 'Helpline Numbers' :
                        activeTab === 'tracker' ? 'Location Tracker' : 'Saved Guardians'}
                </h1>
                <button className="w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center border border-purple-100 shadow-sm">
                    <Settings className="w-5 h-5 text-purple-600" />
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32">
                <AnimatePresence mode="wait">
                    {activeTab === 'numbers' && (
                        <motion.div
                            key="numbers"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4 pt-4"
                        >
                            {HELPLINE_NUMBERS.map((item) => (
                                <div
                                    key={item.id}
                                    className={`${item.color} p-5 rounded-[2rem] flex items-center justify-between shadow-sm border border-white/40 ring-1 ring-black/[0.02]`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                            <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-slate-800 leading-tight">{item.number}</div>
                                            <div className="text-xs font-bold text-slate-500">{item.name}</div>
                                        </div>
                                    </div>
                                    <button className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                                        <Phone className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'tracker' && (
                        <motion.div
                            key="tracker"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="h-full pt-4 relative"
                        >
                            <div className="w-full h-[550px] bg-slate-200 rounded-[3rem] overflow-hidden shadow-inner border-4 border-white/50 relative">
                                <img
                                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2674&auto=format&fit=crop"
                                    className="w-full h-full object-cover opacity-60 grayscale"
                                    alt="map"
                                />
                                <div className="absolute inset-0 bg-purple-500/10 pointer-events-none" />

                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <div className="w-6 h-6 bg-purple-600 rounded-full border-4 border-white shadow-xl animate-pulse" />
                                    <div className="absolute inset-0 w-6 h-6 bg-purple-400 rounded-full animate-ping opacity-50" />
                                </div>

                                <div className="absolute top-6 right-6 flex flex-col gap-3">
                                    <button className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center border border-purple-50">
                                        <MapIcon className="w-5 h-5 text-purple-600" />
                                    </button>
                                    <button className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center border border-purple-50">
                                        <Signal className="w-5 h-5 text-purple-600" />
                                    </button>
                                </div>

                                <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                                    <button className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.4)] border-4 border-white active:scale-95 transition-all group">
                                        <Signal className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'guardians' && (
                        <motion.div
                            key="guardians"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6 pt-4"
                        >
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white/40 border border-white/60 backdrop-blur-md p-6 rounded-[2rem] flex justify-between items-center shadow-sm">
                                        <div className="w-2/3 h-4 bg-purple-200/50 rounded-full animate-pulse" />
                                        <button className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-xl transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full bg-purple-900 text-white font-black py-5 rounded-2xl shadow-xl shadow-purple-900/20 uppercase tracking-widest text-sm hover:bg-purple-800 active:scale-[0.98] transition-all mt-8">
                                Add Your Trusted Contacts
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Simplified Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center z-[100]">
                <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] px-12 py-4 border border-purple-100 shadow-2xl flex items-center justify-between w-full max-w-sm">
                    <button onClick={() => setActiveTab('tracker')} className={`${activeTab === 'tracker' ? 'text-purple-600 scale-110' : 'text-slate-400'} transition-all`}>
                        <MapPin className="w-7 h-7" />
                    </button>

                    <button onClick={() => setActiveTab('numbers')} className={`${activeTab === 'numbers' ? 'text-purple-600 scale-110' : 'text-slate-400'} transition-all`}>
                        <PhoneCall className="w-7 h-7" />
                    </button>

                    <button onClick={() => setActiveTab('guardians')} className={`${activeTab === 'guardians' ? 'text-purple-600 scale-110' : 'text-slate-400'} transition-all`}>
                        <User className="w-7 h-7" />
                    </button>
                </div>
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </motion.div>
    );
}
