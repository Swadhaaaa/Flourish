import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PeriodTrackerMiniPopup
 * 
 * A lightweight, top-right informational popup for the Period Tracker feature.
 * Matches the reference image style (rounded corners, soft shadow, modern UI).
 * Automatically appears on mount and can be dismissed by clicking outside.
 */

interface PeriodTrackerMiniPopupProps {
    onClose?: () => void;
}

export const PeriodTrackerMiniPopup: React.FC<PeriodTrackerMiniPopupProps> = ({ onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleDismiss = () => {
        setIsVisible(false);
        if (onClose) onClose();
    };

    // Auto-dismiss after 15 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            handleDismiss();
        }, 15000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Backdrop overlay with blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1001] bg-slate-900/10 backdrop-blur-[2px] cursor-default"
                        onClick={handleDismiss}
                    />

                    {/* The Mini Popup */}
                    <motion.div
                        initial={{ opacity: 0, x: 20, y: -10 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                        className="fixed top-8 right-8 z-[1002] w-full max-w-[340px] bg-white rounded-[1.75rem] shadow-[0_15px_40px_-5px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden"
                    >
                        {/* Purple Accent Line at Top */}
                        <div className="h-1.5 w-full bg-gradient-to-r from-purple-400 to-indigo-400 opacity-60" />

                        <div className="p-7">
                            <h2 className="text-[1.1rem] font-black text-[#1e293b] tracking-tight mb-3">
                                Period Tracker
                            </h2>
                            <p className="text-[#64748b] text-[0.825rem] leading-[1.6] font-medium opacity-90">
                                The Period Tracker lets you track your cycle days while offering gentle insights into your current phase and energy levels. It predicts upcoming periods so you can prepare in advance and stay in rhythm with your body. By logging moods and symptoms, you create a clearer picture of your health patterns. This feature is designed to support balance, awareness, and everyday wellness.
                            </p>
                        </div>

                        {/* Subtle Footer indicator (No buttons) */}
                        <div className="px-7 pb-5 flex justify-end">
                            <span className="text-[0.65rem] font-bold text-slate-300 uppercase tracking-widest italic">
                                Click anywhere to dismiss
                            </span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
