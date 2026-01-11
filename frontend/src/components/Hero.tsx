import { motion } from "framer-motion";
import { Sparkles, Play, Shield, Heart } from "lucide-react";
import { Link } from "react-router-dom";


export function Hero() {
    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 pt-20 pb-32 overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-glow-gradient opacity-60 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto space-y-8">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary/90">AI-Powered Wellbeing</span>
                </motion.div>

                {/* Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]"
                >
                    Thrive at Work, <br />
                    <span className="text-primary/90">Without the Overwhelm</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed"
                >
                    An AI companion designed for women professionals. Balance your workload, protect your boundaries, and nurture your wellbeing—all in one empowering platform.
                </motion.p>

                {/* Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                >
                    <Link to="/login" className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(238,180,180,0.3)] hover:shadow-[0_0_30px_rgba(238,180,180,0.5)]">
                        Start Your Journey
                    </Link>
                    <button className="px-8 py-3 rounded-full bg-surface border border-white/10 text-white font-medium hover:bg-white/5 transition-all flex items-center gap-2">
                        <Play className="w-4 h-4 fill-current" />
                        Watch Demo
                    </button>
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="flex flex-wrap items-center justify-center gap-8 pt-12 text-muted text-sm font-medium"
                >
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span>Privacy-First</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Ethical AI</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        <span>Secure by Design</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
