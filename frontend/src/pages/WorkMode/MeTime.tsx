import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Heart, Users, ArrowRight, Search, Zap, Coffee, Music, Palette } from 'lucide-react';

const EVENTS = [
    {
        id: 1,
        title: "Sunset Yoga Flow",
        category: "Wellness",
        location: "Central Park, 5 mins away",
        time: "Today, 6:00 PM",
        attendees: 12,
        image: "https://images.unsplash.com/photo-1544367563-12123d8965cd?w=800&q=80",
        icon: Zap,
        color: "bg-emerald-100 text-emerald-600"
    },
    {
        id: 2,
        title: "Pottery Workshop",
        category: "Creative",
        location: "Clay Studio, 1.2 mi",
        time: "Tomorrow, 2:00 PM",
        attendees: 8,
        image: "https://images.unsplash.com/photo-1565193566173-0923d5a63126?w=800&q=80",
        icon: Palette,
        color: "bg-orange-100 text-orange-600"
    },
    {
        id: 3,
        title: "Jazz Night",
        category: "Music",
        location: "Blue Note, 0.8 mi",
        time: "Fri, 8:00 PM",
        attendees: 45,
        image: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=800&q=80",
        icon: Music,
        color: "bg-indigo-100 text-indigo-600"
    },
    {
        id: 4,
        title: "Coffee & Sketch",
        category: "Social",
        location: "Brew Haven, 3 mins away",
        time: "Sat, 10:00 AM",
        attendees: 5,
        image: "https://images.unsplash.com/photo-1511926216795-9413380e29f6?w=800&q=80",
        icon: Coffee,
        color: "bg-amber-100 text-amber-600"
    }
];

export default function MeTime() {
    const [filter, setFilter] = useState('All');

    return (
        <div className="min-h-screen p-6 pb-24 relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-100/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-black text-slate-900 tracking-tighter mb-4"
                    >
                        Find Your <span className="text-pink-500">Spark</span>.
                    </motion.h1>
                    <p className="text-xl text-slate-500 font-medium max-w-2xl">
                        Discover Hobbies & Activities happening nearby. Reconnect with yourself.
                    </p>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-6 mb-12">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search yoga, art, music..."
                            className="w-full bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl py-4 pl-12 pr-6 shadow-sm focus:ring-2 focus:ring-pink-200 outline-none font-bold text-slate-700"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        {['All', 'Wellness', 'Creative', 'Music', 'Social'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all whitespace-nowrap ${filter === cat
                                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                                        : 'bg-white/50 text-slate-500 hover:bg-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {EVENTS.filter(e => filter === 'All' || e.category === filter).map((event, i) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                        >
                            {/* Image Header */}
                            <div className="h-48 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider border border-white/20">
                                    {event.category}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-1 leading-tight">{event.title}</h3>
                                        <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                                            <MapPin className="w-4 h-4 text-pink-500" />
                                            {event.location}
                                        </div>
                                    </div>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${event.color}`}>
                                        <event.icon className="w-6 h-6" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                    <div className="flex items-center gap-4 text-sm font-bold text-slate-600">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {event.time}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Users className="w-4 h-4 text-slate-400" />
                                            {event.attendees} going
                                        </div>
                                    </div>
                                    <button className="bg-slate-900 text-white p-3 rounded-full hover:bg-pink-500 transition-colors shadow-lg">
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
