import { motion } from "framer-motion";
import { TrendingUp, ShieldCheck, Brain, Heart, Sparkles, Star } from "lucide-react";

const features = [
    {
        icon: TrendingUp,
        title: "Workload Intelligence",
        description: "AI analyzes your tasks, meetings, and deadlines to identify overwhelm before it happens."
    },
    {
        icon: ShieldCheck,
        title: "Boundary Protection",
        description: "Smart alerts for after-hours messages and pressure tactics. Your time, your rules."
    },
    {
        icon: Brain,
        title: "Mental Load Tracker",
        description: "Visualize invisible work and get AI suggestions to rebalance responsibilities."
    },
    {
        icon: Heart,
        title: "Wellness Space",
        description: "A calm sanctuary for reflection, stress tracking, and guided self-care moments."
    },
    {
        icon: Sparkles,
        title: "Smart Planning",
        description: "AI learns your energy patterns and schedules tasks when you're at your best."
    },
    {
        icon: Star,
        title: "Empowering Insights",
        description: "Weekly reports celebrating progress and offering gentle, actionable guidance."
    }
];

export function Features() {
    return (
        <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold text-white"
                    >
                        Everything You Need to Flourish
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-muted text-lg max-w-2xl mx-auto"
                    >
                        Intelligent tools that understand your unique challenges and empower you to thrive.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors group"
                        >
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                <feature.icon className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                            <p className="text-muted leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
