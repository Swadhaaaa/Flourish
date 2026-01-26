import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Phone,
    Mail,
    Calendar as CalendarIcon,
    Footprints,
    Check,
    Bell,
    Plus,
    Minus,
    Pencil
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { cn } from '../../lib/utils';
import { format, addDays, startOfWeek, startOfMonth, endOfMonth, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { RemindersMiniPopup } from '../../components/RemindersMiniPopup';

export default function Appointments() {
    // --- State ---
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>("11.00 AM - 12.00 PM");

    // --- Health Widget State ---
    const [weight, setWeight] = useState(73);
    const [isEditingWeight, setIsEditingWeight] = useState(false);
    const [tempWeight, setTempWeight] = useState("73");
    const weightInputRef = useRef<HTMLInputElement>(null);

    const [hydration, setHydration] = useState(1.8);
    const [stepsCount, setStepsCount] = useState(10500);

    // --- Booking Flow State ---
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [bookingStep, setBookingStep] = useState<'name' | 'reminder'>('name');
    const [patientName, setPatientName] = useState('');

    // --- Mock Data ---
    const sleepData = [
        { name: 'Feb', hours: 5, deep: 1.2 },
        { name: 'Mar', hours: 6, deep: 1.5 },
        { name: 'Apr', hours: 7, deep: 2 },
        { name: 'May', hours: 8, deep: 2.5 },
        { name: 'Jun', hours: 6.5, deep: 1.8 },
        { name: 'Jul', hours: 7.5, deep: 2.2 },
    ];

    const stepsData = [
        { name: '1', steps: 6500 }, { name: '2', steps: 8000 }, { name: '3', steps: 7200 },
        { name: '4', steps: 10500 }, { name: '5', steps: 9000 }, { name: '6', steps: 5000 },
        { name: '7', steps: 11000 }, { name: '8', steps: 9500 }, { name: '9', steps: 8500 },
    ];

    const bloodData = [
        { x: 1, y: 160, z: 100 }, { x: 2, y: 150, z: 120 }, { x: 3, y: 170, z: 150 },
        { x: 4, y: 165, z: 110 }, { x: 5, y: 160, z: 130 }, { x: 6, y: 180, z: 140 },
        { x: 7, y: 175, z: 160 }, { x: 8, y: 170, z: 110 }
    ];

    // Focus input when editing starts
    useEffect(() => {
        if (isEditingWeight && weightInputRef.current) {
            weightInputRef.current.focus();
        }
    }, [isEditingWeight]);

    // --- Handlers ---
    const handleBookClick = () => {
        setIsBookingOpen(true);
        setBookingStep('name');
        setPatientName('');
    };

    const handleNameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (patientName.trim()) {
            setBookingStep('reminder');
        }
    };

    const handleAddReminder = () => {
        // Mock action
        alert(`Reminder added for ${patientName} on ${format(selectedDate, 'MMM d')} at ${selectedTime}!`);
        setIsBookingOpen(false);
    };

    const handleWeightBlur = () => {
        setIsEditingWeight(false);
        const val = parseFloat(tempWeight);
        if (!isNaN(val) && val > 0 && val < 300) {
            setWeight(val);
        } else {
            setTempWeight(weight.toString());
        }
    };

    const handleWeightKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleWeightBlur();
        }
    };

    const updateHydration = (change: number) => {
        setHydration(prev => Math.max(0, Math.round((prev + change) * 100) / 100));
    };

    // --- Calendar Helper ---
    const renderCalendar = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, "d");
                const cloneDay = day;
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);

                days.push(
                    <div
                        key={day.toString()}
                        className={cn(
                            "h-10 w-10 flex items-center justify-center rounded-full text-sm cursor-pointer transition-all mb-1",
                            !isCurrentMonth ? "text-slate-300" : "text-slate-600",
                            isSelected
                                ? "bg-rose-500 text-white font-bold shadow-lg shadow-rose-200 transform scale-105"
                                : "hover:bg-rose-50 hover:text-rose-600"
                        )}
                        onClick={() => setSelectedDate(cloneDay)}
                    >
                        {formattedDate}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div key={day.toString()} className="flex justify-between">
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="space-y-1">{rows}</div>;
    };


    return (
        <div className="min-h-screen bg-[#FFF0E5] dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-4 lg:p-8 font-sans overflow-y-auto relative">
            <RemindersMiniPopup />
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-rose-950">Reminders</h1>
                    <p className="text-rose-800/60">Schedule & Health Tracking</p>
                </div>

                <div className="flex items-center gap-6">
                    {/* Search */}
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
                        <input
                            type="text"
                            placeholder="Search doctors..."
                            className="bg-white rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 w-64 shadow-sm border border-rose-100"
                        />
                    </div>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* --- LEFT COLUMN: Appointment / Calendar --- */}
                <div className="lg:col-span-4 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-xl shadow-rose-900/5 border border-white relative overflow-hidden"
                    >
                        {/* Title */}
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-rose-950">Book Reminder</h2>
                            <p className="text-slate-400 text-sm">Select date for consultation</p>
                        </div>

                        {/* Calendar Header */}
                        <div className="flex justify-between items-center mb-6">
                            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-rose-50 rounded-full transition-colors">
                                <ChevronLeft className="w-5 h-5 text-rose-400" />
                            </button>
                            <span className="font-bold text-lg text-slate-700">{format(currentDate, "MMMM yyyy")}</span>
                            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-rose-50 rounded-full transition-colors">
                                <ChevronRight className="w-5 h-5 text-rose-400" />
                            </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="mb-8">
                            <div className="grid grid-cols-7 mb-2">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                    <div key={d} className="text-center text-xs text-rose-300 font-bold py-1">{d}</div>
                                ))}
                            </div>
                            {renderCalendar()}
                        </div>

                        {/* Time Slots */}
                        <div className="mb-8">
                            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3 pl-1">Available slots</h3>
                            <div className="space-y-2">
                                {[
                                    "10.00 AM - 11.00 AM",
                                    "11.00 AM - 12.00 PM",
                                    "01.00 PM - 02.00 PM"
                                ].map((slot) => (
                                    <label key={slot} className={cn(
                                        "flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border",
                                        selectedTime === slot
                                            ? "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-200"
                                            : "bg-slate-50 border-transparent hover:bg-rose-50 text-slate-600"
                                    )}>
                                        <input
                                            type="radio"
                                            name="time"
                                            checked={selectedTime === slot}
                                            onChange={() => setSelectedTime(slot)}
                                            className={cn(
                                                "w-4 h-4",
                                                selectedTime === slot ? "accent-white" : "accent-rose-500"
                                            )}
                                        />
                                        <span className="text-sm font-medium">{slot}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Doctor Profile */}
                        <div className="flex items-center gap-4 mb-6 bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
                            <div className="w-12 h-12 rounded-xl bg-rose-200 overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150" alt="Doctor" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg leading-tight text-rose-950">Dr. A. Phina</h4>
                                <p className="text-rose-500 text-xs font-medium">Orthopedic</p>
                            </div>
                            <div className="ml-auto flex gap-2">
                                <button className="p-2 bg-white rounded-full text-rose-400 hover:text-rose-600 shadow-sm"><Phone className="w-4 h-4" /></button>
                                <button className="p-2 bg-white rounded-full text-rose-400 hover:text-rose-600 shadow-sm"><Mail className="w-4 h-4" /></button>
                            </div>
                        </div>

                        {/* Book CTA */}
                        <button
                            onClick={handleBookClick}
                            className="w-full bg-rose-950 hover:bg-rose-900 text-white font-bold rounded-2xl py-4 transition-all shadow-xl shadow-rose-900/20 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <CalendarIcon className="w-5 h-5" />
                            Book Appointment
                        </button>
                    </motion.div>
                </div>

                {/* --- RIGHT COLUMN: Health Dashboard --- */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-display font-bold text-rose-950">Health Overview</h2>
                            <div className="flex items-center gap-2 text-rose-800/60 text-sm mt-1">
                                <CalendarIcon className="w-4 h-4" />
                                <span>Today, {format(new Date(), 'd MMMM yyyy')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Top Row Widgets */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Weight Balance - EDITABLE */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-[2.5rem] p-5 relative overflow-hidden flex flex-col justify-between h-48 border border-white shadow-lg shadow-rose-900/5 group hover:shadow-xl transition-all"
                        >
                            <div className="flex justify-between items-start z-10">
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Weight</span>
                                <button
                                    onClick={() => {
                                        setIsEditingWeight(true);
                                        setTempWeight(weight.toString());
                                    }}
                                    className="p-1 rounded-full hover:bg-slate-50 text-slate-300 hover:text-rose-500 transition-colors"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-baseline gap-1 h-10">
                                    {isEditingWeight ? (
                                        <input
                                            ref={weightInputRef}
                                            type="number"
                                            value={tempWeight}
                                            onChange={(e) => setTempWeight(e.target.value)}
                                            onBlur={handleWeightBlur}
                                            onKeyDown={handleWeightKeyDown}
                                            className="w-24 text-4xl font-bold text-slate-800 bg-transparent border-b-2 border-rose-200 focus:outline-none focus:border-rose-500 p-0 m-0"
                                        />
                                    ) : (
                                        <h3
                                            className="text-4xl font-bold text-slate-800 cursor-pointer hover:text-rose-500 transition-colors"
                                            onClick={() => {
                                                setIsEditingWeight(true);
                                                setTempWeight(weight.toString());
                                            }}
                                        >
                                            {weight}
                                        </h3>
                                    )}
                                    <span className="text-sm text-slate-400 font-medium">kg</span>
                                </div>
                                <div className="inline-block bg-teal-50 text-teal-700 text-[10px] font-bold px-2 py-1 rounded-full mt-2">Target: 70kg</div>
                            </div>

                            {/* Mock Wave Graphic */}
                            <div className="absolute inset-x-0 bottom-0 h-20 opacity-30 group-hover:opacity-40 transition-opacity pointer-events-none">
                                <svg viewBox="0 0 100 25" className="w-full h-full fill-rose-300">
                                    <path d="M0 10 Q 25 25 50 10 T 100 10 V 25 H 0 Z" />
                                </svg>
                            </div>
                        </motion.div>

                        {/* Steps Tracker */}
                        {/* Steps Tracker */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-emerald-500 rounded-[2.5rem] p-5 text-white flex flex-col justify-between h-48 relative shadow-lg shadow-emerald-500/20"
                        >
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Steps</span>
                                <div className="p-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                                    <Footprints className="w-3 h-3 text-white" />
                                </div>
                            </div>

                            <div className="flex items-baseline gap-1 mt-2">
                                <h3 className="text-4xl font-bold">{stepsCount.toLocaleString()}</h3>
                                <span className="text-sm opacity-80">steps</span>
                            </div>

                            <div className="h-16 mt-auto">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={stepsData}
                                        onMouseMove={(state: any) => {
                                            if (state.activePayload && state.activePayload.length > 0) {
                                                setStepsCount(state.activePayload[0].payload.steps);
                                            }
                                        }}
                                        onMouseLeave={() => setStepsCount(10500)}
                                    >
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                            itemStyle={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}
                                            cursor={{ fill: 'rgba(255,255,255,0.1)', radius: 4 }}
                                        />
                                        <Bar
                                            dataKey="steps"
                                            fill="rgba(255,255,255,0.4)"
                                            radius={[2, 2, 2, 2]}
                                            barSize={4}
                                            activeBar={{ fill: '#fff' }}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Hydration Level - EDITABLE */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-[2.5rem] p-5 text-slate-800 flex flex-col justify-between h-48 relative border border-white shadow-lg shadow-rose-900/5 group"
                        >
                            {/* Decorative Blob */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full mix-blend-multiply filter blur-2xl opacity-50" />

                            <div className="flex justify-between items-start relative z-10">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hydration</span>
                                <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
                                    {Math.round((hydration / 2.2) * 100)}%
                                </span>
                            </div>

                            <div className="relative z-10 flex flex-col items-start gap-1">
                                <div className="flex items-end gap-1">
                                    <h3 className="text-4xl font-bold text-slate-800">{hydration.toFixed(1)}</h3>
                                    <span className="text-base text-slate-400 font-normal mb-1">L</span>
                                </div>
                                <p className="text-[10px] text-slate-400">Daily Goal: 2.2L</p>

                                {/* Edit Controls */}
                                <div className="flex items-center gap-2 mt-2">
                                    <button
                                        onClick={() => updateHydration(-0.25)}
                                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-400 hover:text-blue-500 flex items-center justify-center transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => updateHydration(0.25)}
                                        className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-sm active:scale-95"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-1.5 h-2.5 mt-auto relative z-10 w-full">
                                {[...Array(6)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "flex-1 rounded-full transition-colors duration-500",
                                            i < (hydration / 2.2 * 6) ? "bg-blue-400" : "bg-slate-100"
                                        )}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Middle: Sleep Periodic */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-[2.5rem] p-8 border border-white shadow-lg shadow-rose-900/5 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8"
                    >
                        {/* Stats */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                                    <span className="text-lg">☾</span>
                                </div>
                                <h3 className="font-bold text-lg text-slate-800">Sleep Quality</h3>
                            </div>

                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Average</p>
                            <h2 className="text-5xl font-display font-bold text-slate-800 mb-1">6.5</h2>
                            <span className="text-sm text-slate-500 block mb-6">Hours / Night</span>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="flex items-center gap-2 text-slate-600">
                                        <span className="w-2 h-2 rounded-full bg-indigo-400" /> Deep Sleep
                                    </span>
                                    <span className="font-bold text-slate-800">2h 10m</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="flex items-center gap-2 text-slate-600">
                                        <span className="w-2 h-2 rounded-full bg-rose-300" /> REM
                                    </span>
                                    <span className="font-bold text-slate-800">1h 45m</span>
                                </div>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="h-full min-h-[180px] bg-slate-50/50 rounded-3xl p-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sleepData} barGap={8}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                        itemStyle={{ color: '#1e293b', fontSize: '12px' }}
                                        cursor={{ fill: '#f1f5f9' }}
                                    />
                                    <Bar dataKey="hours" fill="#818cf8" radius={[6, 6, 6, 6]} barSize={24} activeBar={{ fill: '#4f46e5' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Bottom: Blood Tracking */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-[2.5rem] p-8 border border-white shadow-lg shadow-rose-900/5"
                    >
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">Blood Pressure</h3>
                                <p className="text-sm text-slate-400 mt-1">Weekly Trends</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400"><span className="w-2 h-2 rounded-full bg-rose-400" /> Systolic</span>
                                <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400"><span className="w-2 h-2 rounded-full bg-slate-300" /> Diastolic</span>
                            </div>
                        </div>

                        <div className="h-40 relative px-4">
                            {/* Custom Scatter Visual */}
                            <div className="grid grid-cols-8 gap-4 h-full items-end pb-8">
                                {bloodData.map((d, i) => (
                                    <div key={i} className="flex flex-col items-center gap-3 h-full justify-end relative group">

                                        {/* The connection line */}
                                        <div className="w-0.5 h-full bg-slate-100 absolute top-0 z-0 group-hover:bg-rose-50 transition-colors rounded-full" />

                                        {/* Dot 1 (Diastolic) */}
                                        <div
                                            className={cn(
                                                "w-3 h-3 rounded-full z-10 transition-all relative border-2 border-white shadow-sm",
                                                i === 5 ? "bg-slate-800 scale-125" : "bg-slate-300 group-hover:bg-slate-400"
                                            )}
                                            style={{ marginBottom: `${d.z / 3}px` }}
                                        />

                                        {/* Dot 2 (Systolic - Main) */}
                                        <div
                                            className={cn(
                                                "w-4 h-4 rounded-full z-10 transition-all border-2 border-white shadow-md",
                                                i === 5 ? "bg-rose-500 scale-125 shadow-rose-200" : "bg-rose-300 group-hover:bg-rose-400"
                                            )}
                                            style={{ marginBottom: `${d.y / 6}px` }}
                                        />

                                    </div>
                                ))}
                            </div>
                            {/* X Axis Labels */}
                            <div className="flex justify-between text-[10px] text-slate-400 font-medium px-2 absolute bottom-0 left-0 right-0">
                                <span>Mon</span>
                                <span>Tue</span>
                                <span>Wed</span>
                                <span>Thu</span>
                                <span>Fri</span>
                                <span>Sat</span>
                                <span>Sun</span>
                                <span>Avg</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* --- BOOKING POPUP MODAL --- */}
            <AnimatePresence>
                {isBookingOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 rounded-[inherit]"
                            onClick={() => setIsBookingOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white p-6 rounded-[2rem] shadow-2xl z-50 border border-white"
                        >
                            {bookingStep === 'name' ? (
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-rose-950 mb-2">Patient Details</h3>
                                    <p className="text-slate-500 text-sm mb-6">Who is this appointment for?</p>

                                    <form onSubmit={handleNameSubmit}>
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Enter patient name"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center font-bold text-slate-800 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-200 mb-6"
                                            value={patientName}
                                            onChange={(e) => setPatientName(e.target.value)}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!patientName.trim()}
                                            className="w-full bg-rose-950 hover:bg-rose-900 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Continue
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                        <Check className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-rose-950 mb-2">All Set!</h3>
                                    <p className="text-slate-500 text-sm mb-6">
                                        Appointment for <span className="font-bold text-slate-800">{patientName}</span> booked on <br />
                                        <span className="text-rose-500 font-bold">{format(selectedDate, 'MMM d')}</span> at <span className="text-rose-500 font-bold">{selectedTime}</span>
                                    </p>

                                    <button
                                        onClick={handleAddReminder}
                                        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
                                    >
                                        <Bell className="w-5 h-5" />
                                        Add Reminder
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
