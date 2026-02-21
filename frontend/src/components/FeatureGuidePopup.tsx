import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface FeatureGuidePopupProps {
    title: string;
    description: string;
    gradientClass: string;
    icon: React.ReactNode;
    storageKey: string;
    iconBgClass?: string;
    iconColorClass?: string;
}

export const FeatureGuidePopup: React.FC<FeatureGuidePopupProps> = ({
    title,
    description,
    gradientClass,
    icon,
    storageKey,
    iconBgClass = "bg-primary/10",
    iconColorClass = "text-primary"
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only show if the user hasn't dismissed it in this session
        const hasSeen = sessionStorage.getItem(storageKey);
        if (!hasSeen) {
            // Small delay so it animates in elegantly after page load
            const timer = setTimeout(() => setIsVisible(true), 600);

            // Auto-dismiss after a generous amount of time (20s) if they ignore it
            const autoDismiss = setTimeout(() => {
                handleDismiss();
            }, 20000);

            return () => {
                clearTimeout(timer);
                clearTimeout(autoDismiss);
            };
        }
    }, [storageKey]);

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem(storageKey, 'true'); // Never show again during this browser session
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, x: 40, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20, filter: "blur(10px)" }}
                    transition={{
                        type: 'spring',
                        damping: 25,
                        stiffness: 300,
                        opacity: { duration: 0.2 }
                    }}
                    className="fixed top-8 right-8 z-[1002] w-full max-w-[360px] cursor-default group"
                >
                    {/* Ambient Glow Effect Behind the Popup */}
                    <div className={`absolute -inset-1 bg-gradient-to-br ${gradientClass} opacity-30 blur-2xl rounded-[2rem] -z-10`} />

                    {/* Beautiful Glassmorphism Container */}
                    <div className="bg-white/30 dark:bg-slate-900/40 backdrop-blur-[48px] rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.6)] border border-white/80 dark:border-slate-700/60 overflow-hidden relative">

                        {/* Decorative Top Gradient Line */}
                        <div className={`h-1.5 w-full bg-gradient-to-r ${gradientClass} opacity-90`} />

                        {/* Dismiss Button */}
                        <button
                            onClick={handleDismiss}
                            className="absolute top-5 right-5 p-2 rounded-full bg-slate-100/60 dark:bg-slate-800/60 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm border border-white/50"
                            aria-label="Dismiss"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="p-8 pb-7">
                            <div className="flex items-start gap-4 mb-4">
                                {/* Premium Feature Icon Box */}
                                <div className={`relative shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.7),0_4px_10px_rgba(0,0,0,0.05)] border border-white/70 ${iconBgClass} overflow-hidden`}>
                                    {/* Subtle internal glow matching the theme */}
                                    <div className={`absolute -inset-2 bg-gradient-to-br ${gradientClass} opacity-[0.15] blur-md`} />
                                    <div className={`relative z-10 scale-110 ${iconColorClass}`}>
                                        {icon}
                                    </div>
                                </div>

                                <div className="pt-1.5">
                                    <h2 className="text-[1.25rem] font-black text-slate-800 dark:text-white tracking-tight leading-tight">
                                        {title}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${gradientClass} animate-pulse shadow-[0_0_8px_currentColor]`} />
                                        <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">
                                            Feature Guide
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-slate-600 dark:text-slate-300 text-[0.9rem] leading-[1.65] font-medium pt-1">
                                {description}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
