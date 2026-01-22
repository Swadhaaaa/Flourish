import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, X, Music, ArrowLeft, Disc, CloudRain, Wind, Moon, Coffee, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Expanded Asset List
const TRACKS = [
    {
        id: 'rain',
        title: 'Rain Sounds',
        category: 'Calm',
        url: '/sounds/rain.mp3',
        spotifyId: '37i9dQZF1DX4sWSpwq3LiO',
        description: 'Gentle rain for deep relaxation',
        color: 'from-blue-500 to-indigo-600',
        icon: CloudRain
    },
    {
        id: 'focus',
        title: 'Deep Focus',
        category: 'Focus',
        url: '/sounds/winter.mp3',
        spotifyId: '37i9dQZF1DX4sWSpwq3LiO',
        description: 'Consistent brown noise drone',
        color: 'from-amber-600 to-orange-700',
        icon: Zap
    },
    {
        id: 'forest',
        title: 'Forest Ambience',
        category: 'Nature',
        url: '/sounds/birds.mp3',
        spotifyId: '37i9dQZF1DX4sWSpwq3LiO',
        description: 'Birds and wind for creative flow',
        color: 'from-emerald-500 to-green-600',
        icon: Wind
    },
    {
        id: 'theta',
        title: 'Theta Waves',
        category: 'Sleep',
        url: '/sounds/summer_night.mp3',
        spotifyId: '37i9dQZF1DX4sWSpwq3LiO',
        description: 'Deep meditative night sounds',
        color: 'from-indigo-900 to-purple-900',
        icon: Moon
    },
    {
        id: 'lofi',
        title: 'Lo-Fi Lounge',
        category: 'Vibes',
        url: '/sounds/people.mp3',
        spotifyId: '37i9dQZF1DX8Uebhn9wzrS',
        description: 'Chill warmth for working',
        color: 'from-orange-500 to-rose-500',
        icon: Coffee
    }
];

interface MusicPlayerProps {
    isOpen: boolean;
    onClose: () => void;
    initialTrack?: string;
}

export function MusicPlayer({ isOpen, onClose, initialTrack }: MusicPlayerProps) {
    const [view, setView] = useState<'gallery' | 'player'>('gallery');
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const [useSpotify, setUseSpotify] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Effect: Handle initial track
    useEffect(() => {
        if (initialTrack && isOpen) {
            const index = TRACKS.findIndex(t => t.title.toLowerCase().includes(initialTrack.toLowerCase()) || t.category.toLowerCase() === initialTrack.toLowerCase());
            if (index !== -1) {
                setCurrentTrackIndex(index);
                setView('player');
                setIsPlaying(true);
            }
        } else if (isOpen) {
            // Reset to gallery if opened without specific track
            // setView('gallery'); // Optional: always start at gallery
        }
    }, [initialTrack, isOpen]);

    // Effect: Audio driver
    useEffect(() => {
        if (audioRef.current && !useSpotify) {
            if (isPlaying) {
                audioRef.current.play().catch(e => console.log("Audio play error:", e));
            } else {
                audioRef.current.pause();
            }
        } else if (useSpotify && audioRef.current) {
            audioRef.current.pause();
        }
    }, [isPlaying, currentTrackIndex, useSpotify]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    const track = TRACKS[currentTrackIndex];

    const nextTrack = () => {
        setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
        setIsPlaying(true);
    };

    const prevTrack = () => {
        setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
        setIsPlaying(true);
    };

    const playTrack = (index: number) => {
        setCurrentTrackIndex(index);
        setView('player');
        setIsPlaying(true);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="relative w-full max-w-2xl bg-[#0f0814] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl h-[600px] flex flex-col"
                >
                    {/* Dynamic Ambient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${track.color} opacity-20 transition-colors duration-1000 pointer-events-none`} />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

                    {/* Header */}
                    <div className="relative p-6 flex justify-between items-center z-20 border-b border-white/5 bg-black/20 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            {view === 'player' && (
                                <button onClick={() => setView('gallery')} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                                    <ArrowLeft size={20} />
                                </button>
                            )}
                            <div className="flex items-center gap-2 text-white/90">
                                <Music size={18} className="text-[#FF8A71]" />
                                <span className="text-sm font-bold tracking-widest uppercase">Sonic Sanctuary</span>
                            </div>
                        </div>
                        <button onClick={() => { setIsPlaying(false); onClose(); }} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content View Switcher */}
                    <div className="flex-1 overflow-hidden relative z-10">
                        <AnimatePresence mode="wait">
                            {view === 'gallery' ? (
                                <motion.div
                                    key="gallery"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="h-full overflow-y-auto p-6 grid grid-cols-2 gap-4"
                                >
                                    {TRACKS.map((t, i) => (
                                        <motion.div
                                            key={t.id}
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => playTrack(i)}
                                            className={`relative group cursor-pointer overflow-hidden rounded-3xl p-6 aspect-square flex flex-col justify-between bg-gradient-to-br ${t.color}`}
                                        >
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                            <div className="relative z-10 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                                                <t.icon size={20} />
                                            </div>
                                            <div className="relative z-10">
                                                <h3 className="text-2xl font-black text-white leading-tight mb-1">{t.title}</h3>
                                                <p className="text-white/80 text-xs font-medium">{t.category}</p>
                                            </div>
                                            {/* Play overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[1px]">
                                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black shadow-xl scale-90 group-hover:scale-100 transition-transform">
                                                    <Play size={24} fill="currentColor" className="ml-1" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="player"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="h-full flex flex-col"
                                >
                                    {/* Source Toggle */}
                                    <div className="flex justify-center py-4">
                                        <div className="flex bg-white/10 p-1 rounded-full border border-white/5">
                                            <button
                                                onClick={() => setUseSpotify(false)}
                                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!useSpotify ? "bg-white text-black shadow-md" : "text-white/50 hover:text-white"}`}
                                            >
                                                Native
                                            </button>
                                            <button
                                                onClick={() => setUseSpotify(true)}
                                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${useSpotify ? "bg-[#1DB954] text-white shadow-md" : "text-white/50 hover:text-white"}`}
                                            >
                                                Spotify
                                            </button>
                                        </div>
                                    </div>

                                    {/* Player Display */}
                                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                        {useSpotify ? (
                                            <iframe
                                                style={{ borderRadius: "24px" }}
                                                src={`https://open.spotify.com/embed/playlist/${track.spotifyId}?utm_source=generator&theme=0`}
                                                width="100%"
                                                height="100%"
                                                frameBorder="0"
                                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                                loading="lazy"
                                                className="shadow-2xl"
                                            />
                                        ) : (
                                            <>
                                                {/* Album Art / Visualizer */}
                                                <div className="relative w-48 h-48 mb-8 group">
                                                    <div className={`absolute inset-0 bg-gradient-to-br ${track.color} rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse`} />
                                                    <motion.div
                                                        animate={{ rotate: isPlaying ? 360 : 0 }}
                                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                                        className="relative w-full h-full rounded-full border-4 border-white/10 bg-black flex items-center justify-center shadow-2xl overflow-hidden"
                                                    >
                                                        <div className={`absolute inset-0 bg-gradient-to-br ${track.color} opacity-40`} />
                                                        <Disc size={64} className="text-white/80 relative z-10" />
                                                    </motion.div>
                                                </div>

                                                <h2 className="text-3xl font-black text-white mb-2">{track.title}</h2>
                                                <p className="text-white/50 font-medium mb-8">{track.description}</p>

                                                {/* Controls */}
                                                <div className="w-full max-w-sm space-y-6">
                                                    {/* Progress */}
                                                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                        <motion.div
                                                            className={`h-full bg-gradient-to-r ${track.color}`}
                                                            initial={{ width: "0%" }}
                                                            animate={isPlaying ? { width: "100%" } : {}}
                                                            transition={{ duration: 120, ease: "linear" }}
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between px-8">
                                                        <button onClick={prevTrack} className="text-white/50 hover:text-white transition-colors"><SkipBack size={28} /></button>
                                                        <button
                                                            onClick={() => setIsPlaying(!isPlaying)}
                                                            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-lg shadow-white/20 hover:scale-105 active:scale-95 transition-all"
                                                        >
                                                            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                                                        </button>
                                                        <button onClick={nextTrack} className="text-white/50 hover:text-white transition-colors"><SkipForward size={28} /></button>
                                                    </div>

                                                    {/* Volume */}
                                                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                                                        <button onClick={() => setIsMuted(!isMuted)} className="text-white/50 hover:text-white">
                                                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                                        </button>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="1"
                                                            step="0.01"
                                                            value={volume}
                                                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                                                            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Hidden Audio */}
                    <audio
                        ref={audioRef}
                        src={track.url}
                        loop
                        onError={(e) => console.log("Audio load error", e)}
                    />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
