import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AssistantMiniPopup
 * 
 * A lightweight, top-right informational popup for the Assistant feature.
 * Matches the requested style: modern UI, rounded corners, soft shadow, smooth animation.
 * Features a glassmorphism feel and a backdrop blur overlay.
 */

interface AssistantMiniPopupProps {
    onClose?: () => void;
}

export const AssistantMiniPopup: React.FC<AssistantMiniPopupProps> = ({ onClose }) => {
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

                    {/* The Mini Popup - Top-right position */}
                    <motion.div
                        initial={{ opacity: 0, x: 20, y: -10 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                        className="fixed top-8 right-8 z-[1002] w-full max-w-[340px] bg-white/90 backdrop-blur-md rounded-[1.75rem] shadow-[0_15px_40px_-5px_rgba(0,0,0,0.12)] border border-white/50 overflow-hidden"
                    >
                        {/* Decorative Gradient Line (Blue/Cyan for Assistant theme) */}
                        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-cyan-400 opacity-60" />

                        <div className="p-7">
                            <h2 className="text-[1.1rem] font-black text-[#1e293b] tracking-tight mb-3">
                                Assistant
                            </h2>
                            <p className="text-[#64748b] text-[0.825rem] leading-[1.6] font-medium opacity-90">
                                The Assistant is your always-available AI companion designed to help you chat, plan, and stay organized throughout the day. It allows you to schedule meetings, manage reminders, and have natural conversations in one place. You can use it to quickly get support, organize your day, or simply talk things through. This feature is built to improve productivity, clarity, and everyday flow.
                            </p>
                        </div>

                        {/* Subtle Dismiss Hint */}
                        <div className="px-7 pb-5 flex justify-end">
                            <span className="text-[0.65rem] font-bold text-slate-400/60 uppercase tracking-widest italic">
                                Click anywhere to dismiss
                            </span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
