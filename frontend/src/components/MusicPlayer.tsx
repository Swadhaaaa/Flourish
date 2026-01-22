import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, X, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock tracks - using Local Assets (Guaranteed playback, no Network/CORS issues)
// Note: Some tracks may be placeholders if downloads failed. You can replace files in 'public/sounds/' manually.
const TRACKS = [
    {
        id: 'rain',
        title: 'Rain Sounds',
        category: 'Calm',
        url: '/sounds/rain.mp3',
        spotifyId: '37i9dQZF1DX4sWSpwq3LiO',
        description: 'Gentle rain for deep relaxation',
        color: 'from-blue-500 to-indigo-600'
    },
    {
        id: 'focus',
        title: 'Deep Focus (Brown Noise)',
        category: 'Focus',
        url: '/sounds/winter.mp3',
        spotifyId: '37i9dQZF1DX4sWSpwq3LiO',
        description: 'Consistent drone for concentration',
        color: 'from-purple-500 to-violet-600'
    },
    {
        id: 'forest',
        title: 'Forest Ambience',
        category: 'Flow',
        url: '/sounds/birds.mp3',
        spotifyId: '37i9dQZF1DX4sWSpwq3LiO',
        description: 'Birds and nature for creative flow',
        color: 'from-emerald-500 to-green-600'
    },
    {
        id: 'theta',
        title: 'Theta Waves (Night)',
        category: 'Sleep',
        url: '/sounds/summer_night.mp3',
        spotifyId: '37i9dQZF1DX4sWSpwq3LiO',
        description: 'Deep meditative state',
        color: 'from-indigo-900 to-purple-900'
    },
    {
        id: 'lofi',
        title: 'Lo-Fi (Coffee Shop)',
        category: 'Flow',
        url: '/sounds/people.mp3',
        spotifyId: '37i9dQZF1DX8Uebhn9wzrS',
        description: 'Chill ambience for working',
        color: 'from-orange-500 to-rose-500'
    }
];

interface MusicPlayerProps {
    isOpen: boolean;
    onClose: () => void;
    initialTrack?: string; // 'rain', 'focus', etc.
}

export function MusicPlayer({ isOpen, onClose, initialTrack }: MusicPlayerProps) {
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const [useSpotify, setUseSpotify] = useState(false); // Toggle state
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initial track effect
    useEffect(() => {
        if (initialTrack) {
            const index = TRACKS.findIndex(t => t.title.toLowerCase().includes(initialTrack.toLowerCase()) || t.category.toLowerCase() === initialTrack.toLowerCase());
            if (index !== -1) {
                setCurrentTrackIndex(index);
                setIsPlaying(true); // Auto-play if opened with a suggestion
            }
        }
    }, [initialTrack, isOpen]);

    // Handle audio play/pause when state changes (Only for Native Player)
    useEffect(() => {
        if (audioRef.current && !useSpotify) {
            if (isPlaying) {
                audioRef.current.play().catch(e => console.log("Audio play error:", e));
            } else {
                audioRef.current.pause();
            }
        } else if (useSpotify && audioRef.current) {
            audioRef.current.pause(); // Stop native audio if switching to Spotify
        }
    }, [isPlaying, currentTrackIndex, useSpotify]);

    // Handle volume
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

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg bg-[#0f0814] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                >
                    {/* Background Ambient Glow */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${track.color} opacity-20 transition-colors duration-1000`} />

                    {/* Header */}
                    <div className="relative p-6 flex justify-between items-center z-10 text-white">
                        <div className="flex items-center gap-2">
                            <Music size={18} />
                            <span className="text-sm font-medium tracking-wide uppercase">Sonic Sanctuary</span>
                        </div>

                        {/* Source Toggle */}
                        <div className="flex items-center gap-3 bg-white/10 rounded-full p-1 border border-white/5">
                            <button
                                onClick={() => setUseSpotify(false)}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${!useSpotify ? "bg-white text-black" : "text-white/50 hover:text-white"}`}
                            >
                                Native
                            </button>
                            <button
                                onClick={() => setUseSpotify(true)}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${useSpotify ? "bg-[#1DB954] text-black" : "text-white/50 hover:text-white"}`}
                            >
                                Spotify
                            </button>
                        </div>

                        <button onClick={() => { setIsPlaying(false); onClose(); }} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="relative z-10">
                        {useSpotify ? (
                            // SPOTIFY EMBED MODE
                            <div className="p-4 h-[380px] flex flex-col justify-center">
                                <iframe
                                    style={{ borderRadius: "12px" }}
                                    src={`https://open.spotify.com/embed/playlist/${track.spotifyId}?utm_source=generator&theme=0`}
                                    width="100%"
                                    height="352"
                                    frameBorder="0"
                                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                    loading="lazy"
                                />
                            </div>
                        ) : (
                            // NATIVE PLAYER MODE
                            <>
                                {/* Visualizer Area (Simulated) */}
                                <div className="relative h-48 flex items-center justify-center z-10">
                                    <div className="flex items-center gap-1 h-32">
                                        {[...Array(10)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                animate={isPlaying ? {
                                                    height: [20, Math.random() * 100 + 20, 20],
                                                    opacity: [0.5, 1, 0.5]
                                                } : { height: 10, opacity: 0.3 }}
                                                transition={{
                                                    repeat: Infinity,
                                                    duration: 0.5 + Math.random() * 0.5,
                                                    ease: "easeInOut"
                                                }}
                                                className={`w-2 rounded-full bg-gradient-to-t ${track.color}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Track Info */}
                                <div className="relative p-8 z-10">
                                    <div className="mb-8 text-center">
                                        <h2 className="text-2xl font-bold text-white mb-2">{track.title}</h2>
                                        <p className="text-muted text-sm">{track.description}</p>
                                        <span className="inline-block mt-3 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs text-white/70">
                                            {track.category}
                                        </span>
                                    </div>

                                    {/* Controls */}
                                    <div className="space-y-6">
                                        {/* Progress (Fake for now) */}
                                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full bg-gradient-to-r ${track.color}`}
                                                initial={{ width: "0%" }}
                                                animate={isPlaying ? { width: "100%" } : {}}
                                                transition={{ duration: 120, ease: "linear" }}
                                            />
                                        </div>

                                        <div className="flex items-center justify-center gap-8">
                                            <button onClick={prevTrack} className="text-white/70 hover:text-white transition-colors">
                                                <SkipBack size={24} />
                                            </button>
                                            <button
                                                onClick={() => setIsPlaying(!isPlaying)}
                                                className={`w-14 h-14 rounded-full flex items-center justify-center bg-white text-black hover:scale-105 transition-all shadow-lg shadow-white/20`}
                                            >
                                                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                                            </button>
                                            <button onClick={nextTrack} className="text-white/70 hover:text-white transition-colors">
                                                <SkipForward size={24} />
                                            </button>
                                        </div>

                                        {/* Volume */}
                                        <div className="flex items-center gap-3 px-4">
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
                                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Audio Element - REMOVED crossOrigin to allow opaque playback */}
                                <audio
                                    ref={audioRef}
                                    src={track.url}
                                    loop
                                    onError={(e) => console.log("Audio load error", e)}
                                />
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence >
    );
}
