import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Briefcase, Clock, Heart, Home,
    Shield, MapPin, Users, DollarSign,
    Activity, HeartHandshake, Sparkles, Edit2, Save, X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

const ProfileDashboard = () => {
    const { userProfile, updateUserProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (userProfile) {
            setEditForm(userProfile);
        }
    }, [userProfile]);

    const handleEditToggle = () => {
        if (!isEditing) {
            setEditForm(userProfile || {});
        }
        setIsEditing(!isEditing);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateUserProfile(editForm);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setSaving(false);
        }
    };

    // Helper to safely get profile data
    const p = (key: string, def = 'N/A') => userProfile?.[key] || def;

    const profileSections = [
        {
            title: "Personal Information",
            icon: User,
            color: "text-amber-500",
            bg: "bg-amber-50",
            items: [
                { label: "Age", value: p('age'), key: 'age', icon: Clock },
                { label: "Gender", value: p('gender'), key: 'gender', icon: Heart },
                { label: "Country", value: p('country'), key: 'country', icon: MapPin },
                { label: "Dependents", value: p('dependents'), key: 'dependents', icon: Users }
            ]
        },
        {
            title: "Professional Details",
            icon: Briefcase,
            color: "text-blue-500",
            bg: "bg-blue-50",
            items: [
                { label: "Job Role", value: p('jobRole'), key: 'jobRole', icon: Shield },
                { label: "Department", value: p('department'), key: 'department', icon: Briefcase },
                { label: "Exp", value: `${p('yearsExp')} Years`, key: 'yearsExp', icon: Clock },
                { label: "Salary", value: p('salaryRange'), key: 'salaryRange', icon: DollarSign }
            ]
        },
        {
            title: "Work-Life Metrics",
            icon: Activity,
            color: "text-orange-500",
            bg: "bg-orange-50",
            items: [
                { label: "Work Hours", value: `${p('workHours')} / week`, key: 'workHours', icon: Clock },
                { label: "Avg Commute", value: `${p('commute')} min`, key: 'commute', icon: MapPin },
                { label: "Mode", value: p('remoteMode'), key: 'remoteMode', icon: Home },
                { label: "Caregiving", value: `${p('caregiving')} hrs / day`, key: 'caregiving', icon: HeartHandshake }
            ]
        },
        {
            title: "Home & Lifestyle",
            icon: Home,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
            items: [
                { label: "Hobbies", value: p('hobbies', '-'), key: 'hobbies', icon: Sparkles },
                { label: "Team Size", value: p('teamSize'), key: 'teamSize', icon: Users },
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
            <header className="mb-12 relative">
                <div className="overflow-hidden">
                    <h2 className="text-4xl font-black text-foreground tracking-tighter italic uppercase flex">
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
                        className="text-muted-foreground font-bold mt-2"
                    >
                        Comprehensive overview of your personal and professional profile.
                    </motion.p>
                </div>
                <button
                    onClick={handleEditToggle}
                    className="absolute top-0 right-0 p-3 bg-white/50 hover:bg-white rounded-2xl shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-orange-500"
                >
                    <Edit2 className="w-5 h-5" />
                </button>
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
                        className="bg-card/70 backdrop-blur-xl border border-border rounded-[3rem] p-8 shadow-[0_30px_60px_rgba(255,138,113,0.06)] hover:shadow-[0_40px_80px_rgba(255,138,113,0.1)] transition-all group"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner", section.bg, section.color)}>
                                <section.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-black text-card-foreground tracking-tight">{section.title}</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {section.items.map((item, i) => (
                                <div key={i} className="space-y-1">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 leading-none">
                                        <item.icon className="w-3 h-3" />
                                        {item.label}
                                    </p>
                                    <p className="text-base font-black text-foreground tracking-tight group-hover:text-primary transition-colors truncate">
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {isEditing && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-2xl font-black text-slate-800">Edit Profile</h3>
                                <button onClick={handleEditToggle} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Map fields for editing */}
                                    {['age', 'gender', 'country', 'dependents', 'jobRole', 'department', 'yearsExp', 'salaryRange', 'workHours', 'commute', 'remoteMode', 'caregiving', 'hobbies', 'teamSize'].map((field) => (
                                        <div key={field} className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                                {field.replace(/([A-Z])/g, ' $1').trim()}
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm[field] || ''}
                                                onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                                                className="w-full bg-slate-50 border-none rounded-2xl py-3 px-5 focus:ring-2 focus:ring-orange-200 font-bold text-slate-800"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                                <button
                                    onClick={handleEditToggle}
                                    className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-8 py-3 rounded-xl bg-[#FF8A71] hover:bg-orange-500 text-white font-black shadow-lg shadow-orange-200 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {saving ? <Sparkles className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileDashboard;
