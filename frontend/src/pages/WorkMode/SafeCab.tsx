import { MapPin, ShieldCheck, Star, Car, Search, Bell, Filter, Users, Fuel, Gauge, Music, ArrowRight, ChevronLeft, Calendar, Clock, X, Check, BellRing, User, Users2 } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CAB_MODELS = [
    {
        id: 'car-x',
        name: 'X Car',
        category: 'electric',
        type: 'Premium Electric Sedan',
        price: 45,
        rating: 4.8,
        seats: 4,
        speed: '180mph',
        fuel: 'Electric',
        image: '/Users/ayushiranjan/.gemini/antigravity/brain/0439aea5-d328-44ca-a5b1-95811c01e4b0/luxury_cab_hero_1769030077418.png',
        color: '#FFDDC1',
    },
    {
        id: 'car-y',
        name: 'Y Car',
        category: 'luxury',
        type: 'Ultra Luxury Sedan',
        price: 55,
        rating: 4.9,
        seats: 4,
        speed: '160mph',
        fuel: 'Hybrid',
        image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=2670&auto=format&fit=crop',
        color: '#EAB308',
    }
];

const FAMILY_MEMBERS = [
    { id: 1, name: 'Spouse', phone: '+91 98765 43210', initial: 'S', color: 'rose' },
    { id: 2, name: 'Mom', phone: '+91 98765 43211', initial: 'M', color: 'blue' },
    { id: 3, name: 'Dad', phone: '+91 98765 43212', initial: 'D', color: 'purple' },
    { id: 4, name: 'Sister', phone: '+91 98765 43213', initial: 'Si', color: 'emerald' },
];

export default function SafeCab() {
    const [activeTab, setActiveTab] = useState('home');
    const [showDetails, setShowDetails] = useState<string | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(true);
    const [shareLive, setShareLive] = useState(false);

    // Scheduling states
    const [selectedDate, setSelectedDate] = useState('22 Jan 2026');
    const [selectedTime] = useState('08:30 PM');
    const [showCalendar, setShowCalendar] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showReminderPopup, setShowReminderPopup] = useState(false);
    const [pendingCabId, setPendingCabId] = useState<string | null>(null);
    const [showRideTypePopup, setShowRideTypePopup] = useState(false);

    const selectedCab = CAB_MODELS.find(cab => cab.id === showDetails);

    return (
        <div className="min-h-screen bg-[#FFF0E5] text-slate-900 font-sans selection:bg-rose-500/30 -m-8 overflow-hidden relative">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px] -mr-40 -mt-20 pointer-events-none" />

            {/* POPUPS SECTION */}
            <AnimatePresence>
                {/* Onboarding Overlay */}
                {showOnboarding && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl text-center border border-rose-50"
                        >
                            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
                                <MapPin className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-display font-bold text-slate-900 mb-3">Get Started</h2>
                            <p className="text-slate-600 mb-8 leading-relaxed">
                                To ensure your safety and provide the most accurate pickup, please allow us to track your location.
                            </p>
                            <button
                                onClick={() => setShowOnboarding(false)}
                                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-rose-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <ShieldCheck className="w-5 h-5" />
                                Allow Location Tracking
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {/* Calendar Popup (Smaller Card) */}
                {showCalendar && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCalendar(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: 50, opacity: 0, scale: 0.9 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 50, opacity: 0, scale: 0.9 }}
                            className="relative bg-white rounded-[2.5rem] p-6 shadow-2xl w-full max-w-[320px]"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-display font-bold">Select Date</h3>
                                <button onClick={() => setShowCalendar(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center"><X className="w-4 h-4 text-slate-500" /></button>
                            </div>
                            <div className="grid grid-cols-7 gap-1 mb-6 text-center">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-[10px] font-black text-rose-300 uppercase">{d}</div>)}
                                {Array.from({ length: 31 }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setSelectedDate(`${i + 1} Jan 2026`);
                                            setShowCalendar(false);
                                        }}
                                        className={`h-8 w-8 mx-auto rounded-lg flex items-center justify-center text-sm font-bold transition-all ${i + 1 === 22 ? 'bg-rose-500 text-white shadow-md' : 'hover:bg-rose-50 text-slate-600'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setShowCalendar(false)} className="w-full bg-rose-500 text-white font-bold py-3 rounded-xl">Set Date</button>
                        </motion.div>
                    </div>
                )}

                {/* Time Picker Popup (Smaller Card) */}
                {showTimePicker && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowTimePicker(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: 50, opacity: 0, scale: 0.9 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 50, opacity: 0, scale: 0.9 }}
                            className="relative bg-white rounded-[2.5rem] p-6 shadow-2xl w-full max-w-[320px]"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-display font-bold">Set Time</h3>
                                <button onClick={() => setShowTimePicker(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center"><X className="w-4 h-4 text-slate-500" /></button>
                            </div>

                            <div className="flex justify-center items-center gap-4 mb-8">
                                <div className="text-center">
                                    <div className="text-4xl font-display font-black text-slate-900">08</div>
                                </div>
                                <div className="text-3xl font-display font-black text-rose-200">:</div>
                                <div className="text-center">
                                    <div className="text-4xl font-display font-black text-slate-900">30</div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <button className="px-3 py-1 bg-rose-500 text-white rounded-lg text-xs font-bold">PM</button>
                                    <button className="px-3 py-1 bg-slate-100 text-slate-400 rounded-lg text-xs font-bold">AM</button>
                                </div>
                            </div>
                            <button onClick={() => setShowTimePicker(false)} className="w-full bg-rose-500 text-white font-bold py-3 rounded-xl">Confirm Time</button>
                        </motion.div>
                    </div>
                )}

                {/* Reminder Popup */}
                {showReminderPopup && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="relative bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl text-center border border-rose-50"
                        >
                            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <BellRing className="w-8 h-8 text-rose-500" />
                            </div>
                            <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">Turn on Reminder?</h3>
                            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                                We'll send you a notification 15 minutes before your ride arrives.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setShowReminderPopup(false)}
                                    className="py-3 px-6 rounded-xl border border-rose-100 font-bold text-slate-400 hover:bg-rose-50 transition-all"
                                >
                                    Later
                                </button>
                                <button
                                    onClick={() => setShowReminderPopup(false)}
                                    className="py-3 px-6 rounded-xl bg-rose-500 text-white font-bold shadow-lg shadow-rose-200 active:scale-95 transition-all"
                                >
                                    Turn On
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Ride Type Popup (Solo or Carpool) */}
                {showRideTypePopup && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowRideTypePopup(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="relative bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl text-center border border-rose-50"
                        >
                            <h3 className="text-2xl font-display font-bold text-slate-900 mb-6 uppercase tracking-tight">Select Ride Mode</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    onClick={() => {
                                        setShowDetails(pendingCabId);
                                        setShowRideTypePopup(false);
                                    }}
                                    className="flex items-center gap-4 p-5 rounded-2xl border-2 border-rose-50 hover:border-rose-500 hover:bg-rose-50/30 transition-all group"
                                >
                                    <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-slate-900">Solo Ride</div>
                                        <div className="text-[10px] text-slate-400 uppercase font-black">Private & Premium</div>
                                    </div>
                                    <ArrowRight className="ml-auto w-5 h-5 text-rose-200" />
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDetails(pendingCabId);
                                        setShowRideTypePopup(false);
                                    }}
                                    className="flex items-center gap-4 p-5 rounded-2xl border-2 border-rose-50 hover:border-rose-500 hover:bg-rose-50/30 transition-all group"
                                >
                                    <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all">
                                        <Users2 className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-slate-900">Carpool</div>
                                        <div className="text-[10px] text-slate-400 uppercase font-black">Sustainable & Shared</div>
                                    </div>
                                    <ArrowRight className="ml-auto w-5 h-5 text-rose-200" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {/* 1. BOOKING VIEW (HOME) */}
                {activeTab === 'home' && !showDetails && (
                    <motion.div
                        key="booking-view"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-8 pb-32 space-y-8"
                    >
                        <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-rose-900/60 text-sm">
                                    <MapPin className="w-4 h-4 text-rose-500" />
                                    <span>Work HQ, Bangalore</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center relative border border-rose-100 shadow-sm">
                                <Bell className="w-6 h-6 text-rose-500" />
                                <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight tracking-tight text-slate-900">
                                Arrive <br />
                                <span className="text-rose-500 underline decoration-rose-500/30 underline-offset-8">with Confidence.</span>
                            </h1>
                            <div className="relative flex items-center gap-3">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-300" />
                                    <input
                                        type="text"
                                        placeholder="Search Your Secure Ride"
                                        className="w-full bg-white border border-rose-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:text-rose-300 shadow-sm"
                                    />
                                </div>
                                <button className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200 group">
                                    <Filter className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg text-slate-900">Preferred Now</h3>
                                <button className="text-rose-500 text-sm font-bold">See All</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {CAB_MODELS.map(cab => (
                                    <motion.div
                                        key={cab.id}
                                        whileHover={{ y: -5 }}
                                        className="bg-white/80 backdrop-blur-md border border-rose-50 rounded-[2.5rem] p-6 relative overflow-hidden group cursor-pointer shadow-xl shadow-rose-100/50"
                                        onClick={() => {
                                            setPendingCabId(cab.id);
                                            setShowRideTypePopup(true);
                                        }}
                                    >
                                        <div className="relative z-10 flex justify-between items-start">
                                            <div>
                                                <h4 className="text-xl font-bold mb-1 text-slate-900">{cab.name}</h4>
                                                <p className="text-rose-900/40 text-xs font-medium uppercase tracking-wider">{cab.type}</p>
                                            </div>
                                            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100 group-hover:bg-rose-500 group-hover:border-rose-400 transition-colors">
                                                <ArrowRight className="w-5 h-5 text-rose-500 group-hover:text-white" />
                                            </div>
                                        </div>
                                        <img src={cab.image} alt={cab.name} className="w-full h-40 object-contain my-4 drop-shadow-[0_20px_30px_rgba(255,133,111,0.2)] transform -rotate-3 group-hover:rotate-0 transition-transform duration-500" />
                                        <div className="flex justify-between items-center relative z-10">
                                            <div className="flex items-center gap-4 text-rose-900/60 text-xs font-bold">
                                                <div className="flex items-center gap-1.5 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100/50">
                                                    <Users className="w-3 h-3" /> {cab.seats}
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100/50">
                                                    <Star className="w-3 h-3 text-rose-500 fill-rose-500" /> {cab.rating}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl font-bold text-slate-900">${cab.price}</span>
                                                <span className="text-rose-900/40 text-[10px] uppercase font-bold tracking-widest ml-1">/ trip</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 2. SCHEDULE VIEW */}
                {activeTab === 'search' && (
                    <motion.div
                        key="schedule-view"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="p-8 pb-32 space-y-8"
                    >
                        <h1 className="text-4xl font-display font-bold text-slate-900">Schedule Ride</h1>
                        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 border border-rose-50 shadow-xl shadow-rose-100/50 space-y-6">
                            <div className="space-y-4">
                                <div className="relative">
                                    <label className="text-xs text-rose-300 font-bold uppercase tracking-widest ml-4 mb-1 block">Pick up location</label>
                                    <div className="flex items-center gap-3 bg-rose-50/50 rounded-2xl p-4 border border-rose-100/50">
                                        <MapPin className="w-5 h-5 text-rose-500" />
                                        <input type="text" placeholder="Work HQ, Bangalore" className="bg-transparent w-full outline-none font-medium placeholder:text-rose-200" />
                                    </div>
                                </div>
                                <div className="relative">
                                    <label className="text-xs text-rose-300 font-bold uppercase tracking-widest ml-4 mb-1 block">Destination</label>
                                    <div className="flex items-center gap-3 bg-rose-50/50 rounded-2xl p-4 border border-rose-100/50">
                                        <Search className="w-5 h-5 text-rose-300" />
                                        <input type="text" placeholder="Where to?" className="bg-transparent w-full outline-none font-medium placeholder:text-rose-200" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    onClick={() => setShowCalendar(true)}
                                    className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100/50 flex items-center gap-3 cursor-pointer hover:bg-rose-100/50 transition-colors"
                                >
                                    <Calendar className="w-5 h-5 text-rose-500" />
                                    <span className="font-bold">{selectedDate}</span>
                                </div>
                                <div
                                    onClick={() => setShowTimePicker(true)}
                                    className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100/50 flex items-center gap-3 cursor-pointer hover:bg-rose-100/50 transition-colors"
                                >
                                    <Clock className="w-5 h-5 text-rose-500" />
                                    <span className="font-bold">{selectedTime}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowReminderPopup(true)}
                                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-5 rounded-2xl shadow-lg shadow-rose-200 transition-all active:scale-95 text-xl uppercase tracking-tight"
                            >
                                Confirm Schedule
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* 3. FAMILY VIEW */}
                {activeTab === 'profile' && (
                    <motion.div
                        key="family-view"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="p-8 pb-32 space-y-8"
                    >
                        <div className="flex justify-between items-center">
                            <h1 className="text-4xl font-display font-bold text-slate-900">Family</h1>
                            <button className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200 active:scale-95 transition-all">
                                <Star className="w-6 h-6 text-white" />
                            </button>
                        </div>

                        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-6 border border-rose-100 shadow-xl shadow-rose-100/50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-500">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold">Share trip live</h4>
                                    <p className="text-xs text-slate-400">Share status automatically</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShareLive(!shareLive)}
                                className={`w-14 h-8 rounded-full transition-all relative ${shareLive ? 'bg-rose-500' : 'bg-slate-200'}`}
                            >
                                <motion.div
                                    animate={{ x: shareLive ? 26 : 2 }}
                                    className="w-6 h-6 bg-white rounded-full absolute top-1 shadow-sm"
                                />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-lg ml-2">Trusted Contacts</h3>
                            {FAMILY_MEMBERS.map(member => (
                                <motion.div
                                    key={member.id}
                                    whileHover={{ x: 5 }}
                                    className="bg-white/60 p-4 rounded-3xl border border-rose-50 flex items-center justify-between group cursor-pointer hover:bg-white transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm ${member.color === 'rose' ? 'bg-rose-100 text-rose-500' :
                                            member.color === 'blue' ? 'bg-blue-100 text-blue-500' :
                                                member.color === 'purple' ? 'bg-purple-100 text-purple-500' : 'bg-emerald-100 text-emerald-500'
                                            }`}>
                                            {member.initial}
                                        </div>
                                        <div>
                                            <h4 className="font-bold">{member.name}</h4>
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{member.phone}</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Check className="w-5 h-5 text-rose-500" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* DETAIL VIEW (SHARED) */}
                {showDetails && (
                    <motion.div
                        key="detail-view"
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="p-8 pb-48 min-h-screen relative"
                    >
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <button onClick={() => setShowDetails(null)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-rose-100 shadow-sm transition-all active:scale-95">
                                <ChevronLeft className="w-6 h-6 text-rose-500" />
                            </button>
                            <h2 className="text-lg font-display font-black text-slate-900 tracking-tight">RIDE DETAILS</h2>
                            <div className="w-12 h-12" />
                        </div>
                        <div className="relative h-[300px] mb-8">
                            <img src={selectedCab?.image} alt={selectedCab?.name} className="w-full h-full object-contain drop-shadow-[0_40px_60px_rgba(255,133,111,0.3)]" />
                        </div>
                        <div className="space-y-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-4xl font-display font-black mb-3 text-slate-900 tracking-tighter uppercase">{selectedCab?.name}</h1>
                                    <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">Ultimate security meets pure luxury. Experience the future of secure corporate commute today.</p>
                                </div>
                                <div className="p-4 bg-rose-50 rounded-3xl border border-rose-100 shadow-xl shadow-rose-100/50">
                                    <ShieldCheck className="w-8 h-8 text-rose-500" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: Gauge, label: selectedCab?.speed, sub: 'Top Speed' },
                                    { icon: Fuel, label: selectedCab?.fuel, sub: 'Fuel Type' },
                                    { icon: Users, label: selectedCab?.seats, sub: 'Capacity' },
                                    { icon: Music, label: 'Premium', sub: 'Audio System' },
                                ].map((feat, i) => (
                                    <div key={i} className="bg-white p-5 rounded-[2rem] border border-rose-50 flex items-center gap-4 shadow-sm group hover:border-rose-200 transition-colors">
                                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all"><feat.icon className="w-6 h-6 text-rose-500 group-hover:text-white" /></div>
                                        <div>
                                            <div className="text-base font-black text-slate-900 leading-none mb-1">{feat.label}</div>
                                            <div className="text-[10px] text-rose-300 uppercase font-black tracking-widest leading-none">{feat.sub}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* FIXED FOOTER POSITIONING */}
                            <div className="fixed bottom-0 left-0 right-0 p-8 flex justify-center z-[150]">
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="bg-white/95 backdrop-blur-2xl rounded-[3rem] p-6 border border-rose-100 flex items-center justify-between shadow-[0_20px_50px_rgba(255,133,111,0.2)] max-w-md w-full"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-rose-300 text-[10px] uppercase font-black tracking-widest mb-1">Estimated Fare</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-display font-black text-slate-900">${selectedCab?.price}</span>
                                            <span className="text-rose-300 text-xs font-bold font-display">/TRIP</span>
                                        </div>
                                    </div>
                                    <button className="bg-rose-500 hover:bg-rose-600 text-white font-display font-black px-10 py-5 rounded-[2rem] transition-all active:scale-90 shadow-xl shadow-rose-200 uppercase tracking-tight text-lg">BOOK NOW</button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Global Nav */}
            <div className={`fixed bottom-0 left-1/2 -translate-x-1/2 p-8 max-w-md w-full z-[100] transition-opacity duration-500 ${showDetails || showReminderPopup || showRideTypePopup || showCalendar || showTimePicker ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-3 border border-rose-100 shadow-2xl shadow-rose-200 flex justify-between items-center overflow-hidden relative">
                    <div className="absolute inset-x-3 inset-y-3 flex pointer-events-none">
                        <motion.div
                            animate={{ x: activeTab === 'home' ? 0 : activeTab === 'search' ? '125%' : '250%' }}
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                            className="w-[28%] h-full bg-rose-500 rounded-3xl shadow-xl shadow-rose-500/20"
                        />
                    </div>

                    {[
                        { id: 'home', icon: Car },
                        { id: 'search', icon: Calendar },
                        { id: 'profile', icon: Users },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative z-10 flex-1 h-14 flex items-center justify-center transition-all duration-300 ${activeTab === tab.id ? 'text-white' : 'text-rose-200 hover:text-rose-500'}`}
                        >
                            <tab.icon className={`w-7 h-7 ${activeTab === tab.id ? 'scale-110 rotate-0' : 'scale-100'} transition-all`} />
                        </button>
                    ))}
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
                .font-display { font-family: 'Outfit', sans-serif; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
