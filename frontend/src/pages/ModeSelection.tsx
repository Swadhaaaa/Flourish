import { motion } from 'framer-motion';
import { Home, Briefcase, ArrowRight } from 'lucide-react';
import { useMode } from '../context/ModeContext';

const ModeSelection = () => {
    const { switchMode } = useMode();

    const handleSelect = (mode: 'home' | 'work') => {
        switchMode(mode);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFF8F5] p-4 relative overflow-y-auto overflow-x-hidden py-20 md:py-0">
            <div className="fixed inset-0 bg-gradient-to-br from-[#FFF8F5] via-[#FFF8F5] to-[#F5F3FF] pointer-events-none" />

            {/* Soft Peachy-Purple Blossoms */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 20, repeat: Infinity }}
                className="absolute -top-20 -right-20 w-96 h-96 bg-purple-100/50 rounded-full blur-[100px] pointer-events-none"
            />
            <motion.div
                animate={{ scale: [1, 1.3, 1], x: [0, 50, 0] }}
                transition={{ duration: 15, repeat: Infinity }}
                className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-100/50 rounded-full blur-[80px] pointer-events-none"
            />

            <div className="z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

                {/* Home Mode Card */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="group relative cursor-pointer"
                    onClick={() => handleSelect('home')}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-300 to-purple-400 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                    <div className="relative h-auto min-h-[360px] md:h-[500px] bg-card border border-border rounded-3xl p-6 md:p-8 flex flex-col justify-between overflow-hidden hover:scale-[1.02] transition-transform duration-300">
                        <div className="absolute top-0 right-0 p-24 md:p-32 bg-pink-500/10 rounded-full blur-3xl -mr-12 -mt-12 md:-mr-16 md:-mt-16" />

                        <div>
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4 md:mb-6">
                                <Home className="w-6 h-6 md:w-8 md:h-8 text-pink-500" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3 md:mb-4">Home Mode</h2>
                            <p className="text-muted-foreground text-base md:text-lg">
                                Focus on personal well-being, cycle tracking, and nutritional balance.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-pink-500 font-semibold group-hover:translate-x-2 transition-transform mt-6 md:mt-0">
                            Enter Sanctuary <ArrowRight className="w-5 h-5" />
                        </div>
                    </div>
                </motion.div>

                {/* Work Mode Card */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="group relative cursor-pointer"
                    onClick={() => handleSelect('work')}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                    <div className="relative h-auto min-h-[360px] md:h-[500px] bg-card border border-border rounded-3xl p-6 md:p-8 flex flex-col justify-between overflow-hidden hover:scale-[1.02] transition-transform duration-300">
                        <div className="absolute top-0 right-0 p-24 md:p-32 bg-blue-500/10 rounded-full blur-3xl -mr-12 -mt-12 md:-mr-16 md:-mt-16" />

                        <div>
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 md:mb-6">
                                <Briefcase className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3 md:mb-4">Work Mode</h2>
                            <p className="text-muted-foreground text-base md:text-lg">
                                Manage professional boundaries, scheduling, and workplace resilience.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-blue-500 font-semibold group-hover:translate-x-2 transition-transform mt-6 md:mt-0">
                            Enter Office <ArrowRight className="w-5 h-5" />
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default ModeSelection;
