import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    User, Briefcase, Clock, ChevronRight, ArrowLeft,
    Check, MapPin, Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';

import { useAuth } from '../../context/AuthContext';

const ProfileSetup = () => {
    const navigate = useNavigate();
    const { updateUserProfile } = useAuth();
    const [step, setStep] = useState(1);
    const [isComplete, setIsComplete] = useState(false);
    const [formData, setFormData] = useState({
        age: '', gender: 'Female', country: '', dependents: '0',
        jobRole: '', department: '', yearsExp: '', salaryRange: '< 50k', teamSize: '',
        workHours: '', commute: '', remoteMode: 'Fully Remote', caregiving: ''
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const nextStep = async () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            setIsComplete(true);
            try {
                await updateUserProfile(formData);
                localStorage.setItem('work-setup-complete', 'true');
                setTimeout(() => {
                    navigate('/work/dashboard');
                }, 2000);
            } catch (error) {
                console.error("Failed to save profile:", error);
                // Optionally handle error UI here
            }
        }
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <div className="min-h-screen bg-[#FFF8F5] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 50, 0] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], x: [0, 60, 0] }}
                    transition={{ duration: 18, repeat: Infinity }}
                    className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-orange-100/40 rounded-full blur-[80px]"
                />
            </div>

            <div className="w-full max-w-xl z-10">
                {/* Header */}
                <div className="mb-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 border border-orange-100 text-[#FF8A71] text-[10px] font-black uppercase tracking-widest mb-4 backdrop-blur-sm"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        Onboarding Phase {step}/3
                    </motion.div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tighter mb-2 italic">Work Profile Setup</h1>
                    <p className="text-slate-500 font-bold">Help us personalize your work experience</p>
                </div>

                {/* Progress Bar */}
                <div className="flex gap-3 mb-12">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex-1 h-2 rounded-full bg-white border border-slate-100 overflow-hidden relative">
                            <motion.div
                                initial={false}
                                animate={{
                                    width: step >= s ? '100%' : '0%',
                                    backgroundColor: step === s ? '#FF8A71' : step > s ? '#1e293b' : '#f1f5f9'
                                }}
                                className="absolute inset-0 transition-colors"
                            />
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {!isComplete ? (
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -20, scale: 0.95 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="bg-white/90 backdrop-blur-xl border border-white rounded-[3rem] p-10 shadow-[0_40px_80px_rgba(255,138,113,0.08)] relative"
                        >
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Personal Details</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField label="Age" placeholder="e.g. 28" value={formData.age} onChange={(v) => handleChange('age', v)} />
                                        <SelectField label="Gender" options={['Female', 'Male', 'Non-binary', 'Other']} value={formData.gender} onChange={(v) => handleChange('gender', v)} />
                                    </div>
                                    <InputField label="Country" placeholder="e.g. India" icon={<MapPin className="w-4 h-4" />} value={formData.country} onChange={(v) => handleChange('country', v)} />
                                    <SelectField label="Dependents" options={['0', '1', '2', '3+']} value={formData.dependents} onChange={(v) => handleChange('dependents', v)} />
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                                            <Briefcase className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Professional Info</h3>
                                    </div>

                                    <InputField label="Job Role" placeholder="e.g. Product Manager" value={formData.jobRole} onChange={(v) => handleChange('jobRole', v)} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField label="Department" placeholder="e.g. Engineering" value={formData.department} onChange={(v) => handleChange('department', v)} />
                                        <InputField label="Years at Company" placeholder="e.g. 3" value={formData.yearsExp} onChange={(v) => handleChange('yearsExp', v)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <SelectField label="Salary Range" options={['< 50k', '50k - 100k', '100k - 200k', '200k+']} value={formData.salaryRange} onChange={(v) => handleChange('salaryRange', v)} />
                                        <InputField label="Team Size" placeholder="e.g. 12" value={formData.teamSize} onChange={(v) => handleChange('teamSize', v)} />
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 bg-orange-50 text-[#FF8A71] rounded-2xl flex items-center justify-center">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Work Details</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField label="Work Hours / Week" placeholder="e.g. 40" value={formData.workHours} onChange={(v) => handleChange('workHours', v)} />
                                        <InputField label="Avg Commute (min)" placeholder="e.g. 45" value={formData.commute} onChange={(v) => handleChange('commute', v)} />
                                    </div>
                                    <SelectField label="Remote Work Mode" options={['Fully Remote', 'Hybrid', 'On-site']} value={formData.remoteMode} onChange={(v) => handleChange('remoteMode', v)} />
                                    <InputField label="Caregiving Hours / Day" placeholder="e.g. 2" value={formData.caregiving} onChange={(v) => handleChange('caregiving', v)} />
                                </div>
                            )}

                            <div className="flex items-center gap-4 mt-12 pt-8 border-t border-slate-50">
                                {step > 1 && (
                                    <button
                                        onClick={prevStep}
                                        className="h-14 px-8 rounded-2xl border-2 border-slate-100 text-slate-400 font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                        Back
                                    </button>
                                )}
                                <button
                                    onClick={nextStep}
                                    className="h-14 flex-1 bg-gradient-to-r from-[#FF8A71] to-orange-500 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-orange-200 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                                >
                                    {step === 3 ? 'Complete Setup' : 'Continue'}
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-emerald-50 border border-emerald-100 rounded-[3rem] p-16 text-center shadow-2xl shadow-emerald-100"
                        >
                            <div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-200">
                                <Check className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-4">You're All Set!</h2>
                            <p className="text-slate-500 font-bold">Redirecting you to your personalized dashboard...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const InputField = ({ label, placeholder, icon, value, onChange }: { label: string, placeholder: string, icon?: React.ReactNode, value?: string, onChange?: (val: string) => void }) => (
    <div className="space-y-1.5 flex-1 group">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative">
            {icon && <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>}
            <input
                type="text"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                className={cn(
                    "w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 pr-6 focus:bg-white focus:border-[#FF8A71]/10 focus:ring-4 focus:ring-orange-100/50 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300",
                    icon ? "pl-14" : "pl-6"
                )}
            />
        </div>
    </div>
);

const SelectField = ({ label, options, value, onChange }: { label: string, options: string[], value?: string, onChange?: (val: string) => void }) => (
    <div className="space-y-1.5 flex-1 group">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 px-6 focus:bg-white focus:border-[#FF8A71]/10 focus:ring-4 focus:ring-orange-100/50 outline-none transition-all font-bold text-slate-800 appearance-none cursor-pointer"
        >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

export default ProfileSetup;
