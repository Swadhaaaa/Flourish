import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const QUOTES = [
    "The most important relationship you have is with yourself.",
    "Taking time to do nothing often brings everything into perspective.",
    "Self-care is how you take your power back.",
    "You owe yourself the love that you so freely give to others.",
    "Find what brings you joy and go there.",
    "A woman who knows what she brings to the table is not afraid to eat alone.",
    "Rest is not a luxury, it is a necessity.",
    "Nourishing yourself in a way that helps you blossom is attainable, and you are worth it.",
    "Invest in your rest and watch your energy bloom."
];

export default function MeTimeLoading() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((current) => (current + 1) % QUOTES.length);
        }, 3500); // Change quote every 3.5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full flex-1 min-h-[400px] flex flex-col items-center justify-center p-8 relative rounded-[2.5rem] bg-white/40 dark:bg-slate-800/40 backdrop-blur-md shadow-inner border border-white/50 dark:border-slate-700/50 overflow-hidden">
            {/* Animated background blobs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute w-72 h-72 bg-pink-300/20 dark:bg-pink-500/10 rounded-full blur-3xl -top-10 -left-10 pointer-events-none"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    rotate: [90, 0, 90]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute w-72 h-72 bg-sky-300/20 dark:bg-sky-500/10 rounded-full blur-3xl -bottom-10 -right-10 pointer-events-none"
            />

            {/* Glowing inner orb */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.8, 1, 0.8] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-48 h-48 bg-gradient-to-tr from-pink-200/40 to-yellow-200/40 dark:from-pink-800/30 dark:to-orange-800/30 rounded-full blur-2xl"
                />
            </div>

            {/* Icon */}
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 mb-8"
            >
                <div className="relative w-20 h-20 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center border p-0.5 border-slate-100 dark:border-slate-800 shadow-xl shadow-pink-500/10">
                    <div className="absolute inset-0 rounded-full border-2 border-pink-200 dark:border-pink-900 border-dashed animate-[spin_10s_linear_infinite]" />
                    <div className="w-full h-full rounded-full bg-pink-50 dark:bg-pink-950/50 flex items-center justify-center relative overflow-hidden">
                        <Sparkles className="w-8 h-8 text-pink-500 dark:text-pink-400 relative z-10" />
                        <motion.div
                            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 bg-pink-200/50 dark:bg-pink-800/50 rounded-full"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Loading Text */}
            <div className="text-center relative z-10 flex flex-col items-center max-w-xl mx-auto">
                <h3 className="text-2xl font-black text-foreground mb-8 flex items-center justify-center gap-1.5 w-full">
                    Finding your perfect escape
                    <span className="flex gap-0.5">
                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}>.</motion.span>
                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}>.</motion.span>
                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}>.</motion.span>
                    </span>
                </h3>

                <div className="h-32 w-full flex items-center justify-center relative px-4 border-t border-slate-200 dark:border-slate-700/50">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 1.05, filter: 'blur(4px)' }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <p className="text-xl md:text-2xl font-medium text-foreground/70 text-center leading-relaxed font-serif italic selection:bg-pink-200">
                                "{QUOTES[index]}"
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
