import { motion } from "framer-motion";

export function CTA() {
    return (
        <section className="py-20 px-4">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative rounded-3xl overflow-hidden bg-surface border border-white/10 px-6 py-16 md:py-24 text-center"
                >
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />

                    <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                            Ready to Transform Your Work Life?
                        </h2>
                        <p className="text-lg text-muted">
                            Join thousands of women professionals who've taken control of their wellbeing.
                        </p>
                        <button className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(238,180,180,0.3)] hover:shadow-[0_0_30px_rgba(238,180,180,0.5)] transform hover:-translate-y-1">
                            Get Started Free
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
