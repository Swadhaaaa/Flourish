import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Briefcase, Clock, Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export function ProfilePage() {
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        Age: 30,
        Gender: "Female",
        Country: "USA",
        JobRole: "Developer",
        Department: "Tech",
        YearsAtCompany: 3,
        TeamSize: 10,
        SalaryRange: "Medium",
        WorkHoursPerWeek: 40,
        RemoteWork: 1,
        CommuteTime: 30,
        DependentsCount: 0,
        CareHoursPerWeek: 0
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    const docRef = doc(db, "users", currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists() && docSnap.data().profile) {
                        setFormData(prev => ({ ...prev, ...docSnap.data().profile }));
                    }
                } catch (error) {
                    console.error("Error fetching profile:", error);
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleChange = (e: any) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleSave = async (e: any) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        try {
            const docRef = doc(db, "users", user.uid);
            await setDoc(docRef, { profile: formData }, { merge: true });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error("Error saving profile:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-white text-center pt-20">Loading profile...</div>;

    return (
        <div className="min-h-screen pt-4 pb-12 space-y-8 max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
                <p className="text-muted">Manage your professional details. We'll verify this once and use it across the platform.</p>
            </motion.div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* Personal Info */}
                <Section title="Personal Information" icon={User}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Age" name="Age" type="number" value={formData.Age} onChange={handleChange} />
                        <SelectField label="Gender" name="Gender" value={formData.Gender} onChange={handleChange} options={["Female", "Male", "Other"]} />
                        <SelectField label="Country" name="Country" value={formData.Country} onChange={handleChange} options={["USA", "India", "UK", "Germany", "Canada"]} />
                        <InputField label="Dependents" name="DependentsCount" type="number" value={formData.DependentsCount} onChange={handleChange} />
                    </div>
                </Section>

                {/* Professional Info */}
                <Section title="Professional Role" icon={Briefcase}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SelectField label="Job Role" name="JobRole" value={formData.JobRole} onChange={handleChange} options={["Developer", "Analyst", "Manager", "HR", "Designer"]} />
                        <SelectField label="Department" name="Department" value={formData.Department} onChange={handleChange} options={["Tech", "Finance", "HR", "Operations"]} />
                        <InputField label="Years at Company" name="YearsAtCompany" type="number" value={formData.YearsAtCompany} onChange={handleChange} />
                        <InputField label="Team Size" name="TeamSize" type="number" value={formData.TeamSize} onChange={handleChange} />
                        <SelectField label="Salary Range" name="SalaryRange" value={formData.SalaryRange} onChange={handleChange} options={["Low", "Medium", "High"]} />
                    </div>
                </Section>

                {/* Logistics */}
                <Section title="Work Logistics" icon={Clock}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Standard Work Hours/Week" name="WorkHoursPerWeek" type="number" value={formData.WorkHoursPerWeek} onChange={handleChange} />
                        <InputField label="Avg Commute (mins)" name="CommuteTime" type="number" value={formData.CommuteTime} onChange={handleChange} />
                        <SelectField label="Remote Work Mode" name="RemoteWork" value={formData.RemoteWork.toString()} onChange={handleChange} options={[{ label: "Remote/Hybrid", value: 1 }, { label: "On-Site", value: 0 }]} />
                        <InputField label="Caregiving Hours/Week" name="CareHoursPerWeek" type="number" value={formData.CareHoursPerWeek} onChange={handleChange} />
                    </div>
                </Section>

                <div className="flex items-center gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {saving ? "Saving..." : "Save Profile"}
                    </button>
                    {saved && <span className="text-emerald-400 font-medium animate-pulse flex items-center gap-2">Saved Successfully!</span>}
                </div>
            </form>
        </div>
    );
}

const Section = ({ title, icon: Icon, children }: any) => (
    <div className="p-1 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
        <div className="bg-[#0f0814]/90 rounded-[22px] p-6 md:p-8 backdrop-blur-xl">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg border border-white/5">
                    <Icon size={20} className="text-primary" />
                </div>
                {title}
            </h3>
            {children}
        </div>
    </div>
);

const InputField = ({ label, name, type = "text", value, onChange }: any) => (
    <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted ml-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white/90 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted/30"
        />
    </div>
);

const SelectField = ({ label, name, value, onChange, options }: any) => (
    <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted ml-1">{label}</label>
        <div className="relative">
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white/90 text-sm appearance-none focus:outline-none focus:border-primary/50 transition-all cursor-pointer"
            >
                {options.map((opt: any) => {
                    const val = typeof opt === 'object' ? opt.value : opt;
                    const lab = typeof opt === 'object' ? opt.label : opt;
                    return <option key={val} value={val} className="bg-[#1a1025]">{lab}</option>
                })}
            </select>
            {/* Simple chevron using border/transform if icon not available, or just styled select */}
        </div>
    </div>
);
