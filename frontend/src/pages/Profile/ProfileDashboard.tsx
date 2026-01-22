import { motion } from 'framer-motion';
import {
    User, Briefcase, Clock, Heart, Home,
    Shield, MapPin, Users, DollarSign,
    Activity, Coffee, HeartHandshake, Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';

const ProfileDashboard = () => {
    // Dynamic data rendering (Mocking stored values)
    const profileSections = [
        {
            title: "Personal Information",
            icon: User,
            color: "text-purple-500",
            bg: "bg-purple-50",
            items: [
                { label: "Age", value: "24", icon: Clock },
                { label: "Gender", value: "Female", icon: Heart },
                { label: "Country", value: "India", icon: MapPin },
                { label: "Dependents", value: "0", icon: Users }
            ]
        },
        {
            title: "Professional Details",
            icon: Briefcase,
            color: "text-blue-500",
            bg: "bg-blue-50",
            items: [
                { label: "Job Role", value: "Product Manager", icon: Shield },
                { label: "Department", value: "Engineering", icon: Briefcase },
                { label: "Exp", value: "3 Years", icon: Clock },
                { label: "Salary", value: "100k - 200k", icon: DollarSign }
            ]
        },
        {
            title: "Work-Life Metrics",
            icon: Activity,
            color: "text-orange-500",
            bg: "bg-orange-50",
            items: [
                { label: "Work Hours", value: "45 / week", icon: Clock },
                { label: "Avg Commute", value: "30 min", icon: MapPin },
                { label: "Mode", value: "Hybrid", icon: Home },
                { label: "Caregiving", value: "2 hrs / day", icon: HeartHandshake }
            ]
        },
        {
            title: "Home & Lifestyle",
            icon: Home,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
            items: [
                { label: "Home Type", value: "Pet Family", icon: Home },
                { label: "People", value: "3 Immediate", icon: Users },
                { label: "Helps", value: "1 Full-time", icon: Coffee },
                { label: "Hobbies", value: "Running, Cooking", icon: Sparkles }
            ]
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: -50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring" as const,
                damping: 20,
                stiffness: 100
            }
        }
    };

    return (
        <div className="min-h-full py-8">
            <header className="mb-12">
                <div className="overflow-hidden">
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase flex">
                        {"ABOUT YOU".split("").map((char, index) => (
                            <motion.span
                                key={index}
                                initial={{ y: -60, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{
                                    type: "spring",
                                    damping: 12,
                                    stiffness: 150,
                                    delay: index * 0.05
                                }}
                                className={cn(char === " " ? "mr-4" : "")}
                            >
                                {char}
                            </motion.span>
                        ))}
                    </h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="text-slate-500 font-bold mt-2"
                    >
                        Comprehensive overview of your personal and professional profile.
                    </motion.p>
                </div>
            </header>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
                {profileSections.map((section, idx) => (
                    <motion.div
                        key={idx}
                        variants={cardVariants}
                        className="bg-white/70 backdrop-blur-xl border border-white rounded-[3rem] p-8 shadow-[0_30px_60px_rgba(255,138,113,0.06)] hover:shadow-[0_40px_80px_rgba(255,138,113,0.1)] transition-all group"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner", section.bg, section.color)}>
                                <section.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{section.title}</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {section.items.map((item, i) => (
                                <div key={i} className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                                        <item.icon className="w-3 h-3" />
                                        {item.label}
                                    </p>
                                    <p className="text-base font-black text-slate-700 tracking-tight group-hover:text-slate-900 transition-colors">
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default ProfileDashboard;
