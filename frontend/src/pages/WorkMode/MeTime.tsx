import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users, ArrowRight, Search, Zap, Coffee, Music, Palette, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import { API_URL } from '../../services/api';

export default function MeTime() {
    const [filter, setFilter] = useState('All');
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [city, setCity] = useState('Mumbai');
    const [searchInput, setSearchInput] = useState('');
    const [cityInput, setCityInput] = useState('Mumbai');
    const hasFetchedRef = useRef(false);

    const fetchEvents = async (cityVal: string, cat: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ city: cityVal });
            if (cat && cat !== 'All') params.set('category', cat);
            const res = await fetch(`${API_URL}/api/events/scrape?${params}`);
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            }
        } catch (err) {
            console.error("Failed to fetch events", err);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        if (!hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchEvents(city, filter);
        }
    }, []);

    const handleSearch = () => {
        setCity(cityInput);
        fetchEvents(cityInput, filter);
    };

    const handleFilterChange = (cat: string) => {
        setFilter(cat);
        fetchEvents(city, cat);
    };

    const filteredEvents = searchInput
        ? events.filter(e => e.title.toLowerCase().includes(searchInput.toLowerCase()))
        : events;

    const getIcon = (cat: string) => {
        switch (cat) {
            case 'Wellness': return Zap;
            case 'Creative': return Palette;
            case 'Music': return Music;
            default: return Coffee;
        }
    };

    const getColor = (cat: string) => {
        switch (cat) {
            case 'Wellness': return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400";
            case 'Creative': return "bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400";
            case 'Music': return "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400";
            case 'Dance': return "bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-400";
            case 'Workshop': return "bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400";
            case 'Food': return "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400";
            default: return "bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400";
        }
    };

    const getSourceBadgeStyle = (source: string) => {
        if (source === 'meetup') return 'bg-red-500/80 text-white';
        if (source === 'insider.in') return 'bg-purple-500/80 text-white';
        return 'bg-slate-500/50 text-white';
    };

    return (
        <div className="min-h-screen p-6 pb-24 relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-100/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-black text-foreground tracking-tighter mb-2"
                    >
                        Find Your <span className="text-pink-500">Spark</span>.
                    </motion.h1>
                    <p className="text-lg text-foreground/60 font-medium">
                        Real hobby &amp; activity events near you — updated live 🔴
                    </p>
                </div>

                {/* Search & Location Row */}
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                        <input
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            type="text"
                            placeholder="Filter: yoga, art, music..."
                            className="w-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/50 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-6 shadow-sm focus:ring-2 focus:ring-pink-200 outline-none font-bold text-foreground placeholder:text-foreground/40"
                        />
                    </div>
                    <div className="relative w-full md:w-56">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400" />
                        <input
                            value={cityInput}
                            onChange={e => setCityInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            type="text"
                            placeholder="City (e.g. Pune)"
                            className="w-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/50 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-6 shadow-sm focus:ring-2 focus:ring-pink-200 outline-none font-bold text-foreground placeholder:text-foreground/40"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-black px-6 py-4 rounded-2xl shadow-lg shadow-pink-200 transition-all disabled:opacity-60 whitespace-nowrap"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        {loading ? 'Searching...' : 'Find Events'}
                    </button>
                </div>

                {/* Category Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-10">
                    {['All', 'Wellness', 'Creative', 'Music', 'Social', 'Dance', 'Workshop'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => handleFilterChange(cat)}
                            className={`px-5 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all whitespace-nowrap ${filter === cat
                                ? 'bg-slate-900 text-white shadow-lg dark:bg-white dark:text-slate-900'
                                : 'bg-white/50 dark:bg-slate-800/50 text-foreground/70 hover:bg-white dark:hover:bg-slate-700'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Current city badge */}
                {!loading && events.length > 0 && (
                    <div className="flex items-center gap-2 mb-6 text-sm font-bold text-foreground/60">
                        <MapPin className="w-4 h-4 text-pink-500" />
                        Showing {filteredEvents.length} events in <span className="text-pink-500">{city}</span>
                        <span className="ml-2 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-green-600 font-bold">Live</span>
                    </div>
                )}

                {/* Events Grid */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-white/50 dark:bg-slate-800/50 rounded-[2.5rem] h-64 animate-pulse" />
                            ))}
                        </motion.div>
                    ) : filteredEvents.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 text-foreground/50"
                        >
                            <Sparkles className="w-12 h-12 mx-auto mb-4 text-pink-300" />
                            <p className="text-xl font-bold">No events found in {city}.</p>
                            <p className="text-sm mt-2">Try a different city or category!</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8"
                        >
                            {filteredEvents.map((event, i) => {
                                const Icon = getIcon(event.category || 'Social');
                                const colorClass = getColor(event.category || 'Social');
                                return (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, y: 40 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.07 }}
                                        className="group relative bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                                    >
                                        {/* Image Header */}
                                        <div className="h-48 overflow-hidden relative">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                                            <img
                                                src={event.image || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=400&fit=crop'}
                                                alt={event.title}
                                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=400&fit=crop'; }}
                                            />
                                            <div className="absolute top-4 right-4 z-20 flex gap-2">
                                                {event.source && (
                                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20 backdrop-blur-md ${getSourceBadgeStyle(event.source)}`}>
                                                        {event.source}
                                                    </div>
                                                )}
                                                <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider border border-white/20">
                                                    {event.category}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-7">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1 pr-3">
                                                    <h3 className="text-xl font-black text-foreground mb-1 leading-tight">{event.title}</h3>
                                                    <div className="flex items-center gap-1.5 text-foreground/50 font-medium text-sm">
                                                        <MapPin className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                                                        {event.location}
                                                    </div>
                                                </div>
                                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-700">
                                                <div className="flex items-center gap-4 text-sm font-bold text-foreground/60">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-4 h-4" />
                                                        {event.time}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Users className="w-4 h-4" />
                                                        {event.attendees} going
                                                    </div>
                                                </div>
                                                <a
                                                    href={event.url || '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-xl hover:bg-pink-500 dark:hover:bg-pink-500 dark:hover:text-white transition-colors shadow font-bold text-sm"
                                                >
                                                    Register <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
