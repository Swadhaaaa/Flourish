import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download } from 'lucide-react';

const InstallPWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);

        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            setShowInstructions(true);
            return;
        }
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        setShowInstructions(false);
    };

    if (isInstalled) return null;

    return (
        <>
            <AnimatePresence>
                <motion.div className="relative z-50">
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleInstallClick}
                        className="mt-4 md:mt-0 md:ml-4 bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-full font-bold text-sm shadow-sm hover:shadow-md hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <Download className="w-4 h-4 text-blue-600" />
                        <span>Install App</span>
                    </motion.button>

                    {showInstructions && (
                        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                            <div
                                className="absolute inset-0"
                                onClick={() => setShowInstructions(false)}
                            />
                            <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl w-full max-w-xs text-center border border-slate-100 dark:border-slate-800">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                                    <Download className="w-6 h-6" />
                                </div>
                                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">Install App</h3>
                                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                                    To install, tap the <span className="font-bold text-slate-900 dark:text-slate-300">Share</span> button <span className="inline-block bg-slate-100 px-1 rounded">⎋</span> or <span className="font-bold text-slate-900 dark:text-slate-300">Menu</span>, then select <span className="font-bold text-blue-600">"Add to Home Screen"</span>.
                                </p>
                                <button
                                    onClick={() => setShowInstructions(false)}
                                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                                >
                                    Got it
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </>
    );
};

export default InstallPWA;
