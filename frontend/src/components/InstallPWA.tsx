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
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-slate-900 text-white text-xs p-4 rounded-xl shadow-xl">
                            <div className="font-bold mb-2">How to install:</div>
                            <p className="mb-2">1. Click the <span className="font-bold">Share</span> or <span className="font-bold">Menu</span> button in your browser.</p>
                            <p>2. Select <span className="font-bold">"Add to Home Screen"</span> or <span className="font-bold">"Install App"</span>.</p>
                            <button
                                onClick={() => setShowInstructions(false)}
                                className="mt-3 w-full py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                            >
                                Got it
                            </button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </>
    );
};

export default InstallPWA;
