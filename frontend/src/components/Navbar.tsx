import { motion } from "framer-motion";
import { Sparkles, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Navbar() {
    const navigate = useNavigate();

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-6"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between rounded-full px-6 py-3 bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg">

                {/* Logo */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">Flourish</span>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-6">
                    <button className="text-muted hover:text-white transition-colors">
                        <Sun className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => navigate('/login')}
                        className="text-sm font-medium text-white hover:text-primary transition-colors hidden sm:block"
                    >
                        Log In
                    </button>

                    <button
                        onClick={() => navigate('/login')}
                        className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(238,180,180,0.3)] hover:shadow-[0_0_20px_rgba(238,180,180,0.5)]"
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </motion.header>
    );
}
