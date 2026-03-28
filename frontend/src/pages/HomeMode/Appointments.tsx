import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Mail,
    Check,
    Bell,
    Plus,
    Home,
    Users,
    Heart,
    Trash2,
    Send,
    Clock,
    Flame,
    Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format, startOfWeek, startOfMonth, endOfMonth, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, addDays } from 'date-fns';
import { RemindersMiniPopup } from '../../components/RemindersMiniPopup';
import { collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export default function Appointments() {
    // --- State ---
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // --- Life Reminders State ---
    const { user, userProfile } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    type ReminderCategory = 'Home' | 'Family' | 'Self-Care';
    const [activeCategory, setActiveCategory] = useState<ReminderCategory>('Home');
    const [lifeReminders, setLifeReminders] = useState<any[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newReminder, setNewReminder] = useState({ title: '', notes: '', date: format(new Date(), 'yyyy-MM-dd'), time: format(new Date(), 'HH:mm'), sendEmail: false });
    const [addingReminder, setAddingReminder] = useState(false);

    // --- Mood Check-in State ---
    const MOODS = [
        { emoji: '😊', label: 'Great', color: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700' },
        { emoji: '😌', label: 'Good', color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700' },
        { emoji: '😐', label: 'Okay', color: 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700' },
        { emoji: '😔', label: 'Low', color: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700' },
        { emoji: '😩', label: 'Stressed', color: 'bg-rose-100 dark:bg-rose-900/30 border-rose-300 dark:border-rose-700' },
    ];
    const [todayMood, setTodayMood] = useState<string | null>(null);
    const [moodHistory, setMoodHistory] = useState<{date: string; mood: string}[]>([]);

    // --- Affirmation Quotes ---
    const AFFIRMATIONS = [
        "You are capable of amazing things. Keep going! 💪",
        "Progress, not perfection, is what matters today. 🌱",
        "You deserve every bit of rest and joy you allow yourself. ✨",
        "Small steps lead to big changes. You've got this! 🦋",
        "Your energy is precious — invest it wisely today. 🌸",
        "Believe in the power of showing up, even when it's hard. 🌟",
        "You are enough, exactly as you are right now. 💖",
        "Take a deep breath. You're doing better than you think. 🍃",
    ];
    const todayQuote = AFFIRMATIONS[new Date().getDate() % AFFIRMATIONS.length];

    // --- Computed: Reminders by date (for calendar dots) ---
    const reminderDates = lifeReminders.reduce((acc: Record<string, {home: number; family: number; selfCare: number}>, r: any) => {
        if (!r.date || r.completed) return acc;
        if (!acc[r.date]) acc[r.date] = { home: 0, family: 0, selfCare: 0 };
        if (r.category === 'Home') acc[r.date].home++;
        else if (r.category === 'Family') acc[r.date].family++;
        else if (r.category === 'Self-Care') acc[r.date].selfCare++;
        return acc;
    }, {} as Record<string, {home: number; family: number; selfCare: number}>);

    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    const selectedDateReminders = lifeReminders.filter(r => r.date === selectedDateStr && !r.completed);
    const selectedDateCompleted = lifeReminders.filter(r => r.date === selectedDateStr && r.completed);

    // --- Mood Check-in Logic ---
    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, `users/${user.uid}/mood_checkins`),
            orderBy('date', 'desc')
        );
        const unsub = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(d => ({ date: d.data().date, mood: d.data().mood }));
            setMoodHistory(items.slice(0, 7));
            const today = format(new Date(), 'yyyy-MM-dd');
            const todayEntry = items.find(i => i.date === today);
            if (todayEntry) setTodayMood(todayEntry.mood);
        });
        return () => unsub();
    }, [user]);

    const handleMoodSelect = async (mood: string) => {
        if (!user) return;
        const today = format(new Date(), 'yyyy-MM-dd');
        setTodayMood(mood);
        try {
            // Use today's date as doc ID for upsert behavior
            const { setDoc } = await import('firebase/firestore');
            await setDoc(doc(db, `users/${user.uid}/mood_checkins`, today), {
                mood, date: today, createdAt: serverTimestamp()
            });
        } catch (err) { console.error('Mood save failed:', err); }
    };

    // --- Computed Stats ---
    const reminderStats = {
        total: lifeReminders.length,
        completed: lifeReminders.filter(r => r.completed).length,
        home: lifeReminders.filter(r => r.category === 'Home' && !r.completed).length,
        family: lifeReminders.filter(r => r.category === 'Family' && !r.completed).length,
        selfCare: lifeReminders.filter(r => r.category === 'Self-Care' && !r.completed).length,
    };
    const completionPercent = reminderStats.total > 0 ? Math.round((reminderStats.completed / reminderStats.total) * 100) : 0;

    // Streak calculation (consecutive days with at least 1 completed reminder)
    const getStreak = () => {
        const completed = lifeReminders.filter(r => r.completed);
        if (completed.length === 0) return 0;
        const dates = [...new Set(completed.map(r => r.date))].sort().reverse();
        let streak = 0;
        const today = format(new Date(), 'yyyy-MM-dd');
        let checkDate = today;
        for (const d of dates) {
            if (d === checkDate) {
                streak++;
                // move to previous day
                const prev = new Date(checkDate);
                prev.setDate(prev.getDate() - 1);
                checkDate = format(prev, 'yyyy-MM-dd');
            }
        }
        return streak;
    };
    const streak = getStreak();

    // Upcoming reminders (next 5 across all categories, not completed, sorted by date/time)
    const upcomingReminders = lifeReminders
        .filter(r => !r.completed)
        .sort((a, b) => {
            if (a.date !== b.date) return a.date < b.date ? -1 : 1;
            return (a.time || '').localeCompare(b.time || '');
        })
        .slice(0, 5);

    // Today's due reminders
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayReminders = lifeReminders.filter(r => r.date === todayStr && !r.completed);

    // --- Life Reminders Data ---
    const CATEGORY_CONFIG: Record<ReminderCategory, { icon: any; color: string; bg: string; border: string; presets: string[] }> = {
        'Home': {
            icon: Home,
            color: 'text-amber-600',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            border: 'border-amber-200 dark:border-amber-800/50',
            presets: ['Groceries Shopping', 'House Cleaning', 'Pay Utility Bills', 'Laundry Day', 'Cook Meal Prep', 'Water Plants', 'Organize Closet', 'Fix Appliance']
        },
        'Family': {
            icon: Users,
            color: 'text-violet-600',
            bg: 'bg-violet-50 dark:bg-violet-900/20',
            border: 'border-violet-200 dark:border-violet-800/50',
            presets: ['Birthday Reminder', 'School Pickup', 'Call Parents', 'Family Outing', 'Anniversary', 'Doctor Visit', 'PTA Meeting', 'Kids Activity']
        },
        'Self-Care': {
            icon: Heart,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            border: 'border-emerald-200 dark:border-emerald-800/50',
            presets: ['Meditation Session', 'Skincare Routine', 'Journaling Time', 'Evening Walk', 'Read a Book', 'Yoga Class', 'Digital Detox', 'Spa Day']
        }
    };

    // Firestore listener for life reminders
    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, `users/${user.uid}/life_reminders`),
            orderBy('createdAt', 'desc')
        );
        const unsub = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setLifeReminders(items);
        });
        return () => unsub();
    }, [user]);

    const handleAddLifeReminder = async (title: string, fromPreset = false) => {
        if (!user || !title.trim()) return;
        setAddingReminder(true);
        try {
            const reminderData = {
                title: title.trim(),
                notes: fromPreset ? '' : newReminder.notes,
                category: activeCategory,
                date: fromPreset ? format(new Date(), 'yyyy-MM-dd') : newReminder.date,
                time: fromPreset ? format(new Date(), 'HH:mm') : newReminder.time,
                completed: false,
                createdAt: serverTimestamp()
            };
            await addDoc(collection(db, `users/${user.uid}/life_reminders`), reminderData);

            // Send email notification
            if (userProfile?.email) {
                const shouldSendEmail = fromPreset || newReminder.sendEmail;
                if (shouldSendEmail) {
                    try {
                        await axios.post(`${API_URL}/api/notifications/reminder`, {
                            recipient_email: userProfile.email,
                            reminder_title: title.trim(),
                            reminder_category: activeCategory,
                            reminder_date: fromPreset ? format(new Date(), 'yyyy-MM-dd') : newReminder.date,
                            reminder_time: fromPreset ? format(new Date(), 'HH:mm') : newReminder.time,
                            user_name: userProfile.name || 'User',
                            notes: fromPreset ? null : (newReminder.notes || null)
                        });
                    } catch (emailErr) {
                        console.error('Email notification failed:', emailErr);
                    }
                }
            }

            // Reset form
            setNewReminder({ title: '', notes: '', date: format(new Date(), 'yyyy-MM-dd'), time: format(new Date(), 'HH:mm'), sendEmail: false });
            setShowAddForm(false);
        } catch (err) {
            console.error('Failed to add life reminder:', err);
        } finally {
            setAddingReminder(false);
        }
    };

    const toggleReminderComplete = async (reminderId: string, currentStatus: boolean) => {
        if (!user) return;
        try {
            await updateDoc(doc(db, `users/${user.uid}/life_reminders`, reminderId), { completed: !currentStatus });
        } catch (err) { console.error('Toggle failed:', err); }
    };

    const deleteLifeReminder = async (reminderId: string) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, `users/${user.uid}/life_reminders`, reminderId));
        } catch (err) { console.error('Delete failed:', err); }
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
                const dayStr = format(day, 'yyyy-MM-dd');
                const dayReminders = reminderDates[dayStr];
                const isToday = isSameDay(day, new Date());

                days.push(
                    <div
                        key={day.toString()}
                        className={cn(
                            "h-10 w-10 flex flex-col items-center justify-center rounded-full text-sm cursor-pointer transition-all mb-1 relative",
                            !isCurrentMonth ? "text-slate-300 dark:text-slate-600" : "text-slate-600 dark:text-slate-300",
                            isSelected
                                ? "bg-rose-500 text-white font-bold shadow-lg shadow-rose-200 dark:shadow-rose-900/50 transform scale-105"
                                : isToday
                                    ? "ring-2 ring-rose-300 dark:ring-rose-700 font-bold"
                                    : "hover:bg-rose-50 dark:hover:bg-slate-700 hover:text-rose-600 dark:hover:text-rose-400"
                        )}
                        onClick={() => setSelectedDate(cloneDay)}
                    >
                        {formattedDate}
                        {/* Reminder dots */}
                        {dayReminders && (
                            <div className="flex gap-[2px] absolute -bottom-0.5">
                                {dayReminders.home > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                                {dayReminders.family > 0 && <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />}
                                {dayReminders.selfCare > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                            </div>
                        )}
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
        <div className="min-h-screen bg-[#FFF0E5] dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-4 lg:p-8 font-sans overflow-y-auto overflow-x-hidden relative">
            <RemindersMiniPopup />
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-rose-950 dark:text-white">Reminders</h1>
                    <p className="text-rose-800/60 dark:text-white/80">Schedule & Life Tracking</p>
                </div>

                <div className="flex items-center gap-6">
                    {/* Search */}
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
                        <input
                            type="text"
                            placeholder="Search reminders..."
                            className="bg-white dark:bg-slate-800 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 w-64 shadow-sm border border-rose-100 dark:border-slate-700 dark:text-white placeholder:text-slate-400"
                        />
                    </div>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* --- LEFT COLUMN: Smart Reminder Calendar --- */}
                <div className="lg:col-span-4 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 lg:p-8 shadow-xl shadow-rose-900/5 dark:shadow-none border border-white dark:border-slate-700 relative overflow-hidden"
                    >
                        {/* Title */}
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-rose-950 dark:text-white">My Calendar</h2>
                            <p className="text-slate-400 text-sm">Track your reminders by date</p>
                        </div>

                        {/* Calendar Header */}
                        <div className="flex justify-between items-center mb-6">
                            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <ChevronLeft className="w-5 h-5 text-rose-400" />
                            </button>
                            <span className="font-bold text-lg text-slate-700 dark:text-white">{format(currentDate, "MMMM yyyy")}</span>
                            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <ChevronRight className="w-5 h-5 text-rose-400" />
                            </button>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-3 mb-4 px-1 flex-wrap">
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><span className="w-2 h-2 rounded-full bg-amber-400" /> Home</span>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><span className="w-2 h-2 rounded-full bg-violet-400" /> Family</span>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Care</span>
                        </div>

                        {/* Calendar Grid */}
                        <div className="mb-6">
                            <div className="grid grid-cols-7 mb-2">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                    <div key={`${d}-${i}`} className="text-center text-xs text-rose-300 font-bold py-1">{d}</div>
                                ))}
                            </div>
                            {renderCalendar()}
                        </div>

                        {/* Selected Date Reminders */}
                        <div className="border-t border-slate-100 dark:border-slate-700 pt-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold text-slate-700 dark:text-white">
                                    {isSameDay(selectedDate, new Date()) ? 'Today' : format(selectedDate, 'MMM d, yyyy')}
                                </h3>
                                <span className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-full">
                                    {selectedDateReminders.length} pending
                                </span>
                            </div>

                            {selectedDateReminders.length === 0 && selectedDateCompleted.length === 0 ? (
                                <div className="text-center py-5 bg-slate-50/50 dark:bg-slate-700/30 rounded-2xl">
                                    <p className="text-2xl mb-1">📋</p>
                                    <p className="text-xs text-slate-400">No reminders for this date</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                    {selectedDateReminders.map((r) => {
                                        const catConfig = CATEGORY_CONFIG[r.category as ReminderCategory];
                                        return (
                                            <div key={r.id}
                                                className={cn('flex items-center gap-2 p-2.5 rounded-xl text-sm border transition-all',
                                                    catConfig?.bg || 'bg-slate-50',
                                                    catConfig?.border || 'border-slate-200'
                                                )}
                                            >
                                                <button
                                                    onClick={() => toggleReminderComplete(r.id, false)}
                                                    className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-500 hover:border-emerald-400 flex-shrink-0 transition-colors"
                                                />
                                                <span className="font-medium text-slate-700 dark:text-slate-200 truncate text-xs flex-1">{r.title}</span>
                                                <span className={cn('text-[9px] font-bold', catConfig?.color)}>{r.time}</span>
                                                <button onClick={() => deleteLifeReminder(r.id)} className="text-slate-300 hover:text-rose-400 transition-colors">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                    {/* Completed for this date */}
                                    {selectedDateCompleted.length > 0 && (
                                        <p className="text-[10px] text-emerald-500 font-bold text-center pt-1">
                                            ✓ {selectedDateCompleted.length} completed
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Quick Add for selected date */}
                        <button
                            onClick={() => {
                                setNewReminder(prev => ({ ...prev, date: format(selectedDate, 'yyyy-MM-dd') }));
                                setShowAddForm(true);
                            }}
                            className="w-full mt-5 bg-rose-950 hover:bg-rose-900 text-white font-bold rounded-2xl py-4 transition-all shadow-xl shadow-rose-900/20 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Reminder for {isSameDay(selectedDate, new Date()) ? 'Today' : format(selectedDate, 'MMM d')}
                        </button>
                    </motion.div>
                </div>

                {/* --- RIGHT COLUMN: Dynamic Dashboard --- */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-display font-bold text-rose-950 dark:text-white">Dashboard</h2>
                            <div className="flex items-center gap-2 text-rose-800/60 dark:text-white/80 text-sm mt-1">
                                <CalendarIcon className="w-4 h-4" />
                                <span>Today, {format(new Date(), 'd MMMM yyyy')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Top Row: Stats + Streak + Mood */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* Reminder Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl p-4 relative overflow-hidden flex flex-col justify-between min-h-[180px] border border-white dark:border-slate-700 shadow-lg shadow-rose-900/5 dark:shadow-none"
                        >
                            <div className="flex justify-between items-start z-10">
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Progress</span>
                                <span className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/30 px-2 py-1 rounded-full">
                                    {completionPercent}%
                                </span>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-4xl font-bold text-slate-800 dark:text-white">{reminderStats.completed}<span className="text-lg text-slate-400 font-medium">/{reminderStats.total}</span></h3>
                                <p className="text-xs text-slate-400 mt-1">Reminders completed</p>
                            </div>
                            <div className="flex gap-2 z-10">
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                                    <span className="text-[10px] text-slate-400 font-bold">{reminderStats.home}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-violet-400" />
                                    <span className="text-[10px] text-slate-400 font-bold">{reminderStats.family}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                    <span className="text-[10px] text-slate-400 font-bold">{reminderStats.selfCare}</span>
                                </div>
                            </div>
                            {/* Progress bar */}
                            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-100 dark:bg-slate-700">
                                <div className="h-full bg-gradient-to-r from-rose-400 to-rose-500 transition-all duration-700" style={{ width: `${completionPercent}%` }} />
                            </div>
                        </motion.div>

                        {/* Streak Tracker */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-orange-500 to-rose-500 rounded-3xl p-4 text-white flex flex-col justify-between min-h-[180px] relative shadow-lg shadow-orange-500/20 overflow-hidden"
                        >
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Streak</span>
                                <div className="p-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                                    <Flame className="w-3.5 h-3.5 text-white" />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-baseline gap-1">
                                    <h3 className="text-5xl font-bold">{streak}</h3>
                                    <span className="text-sm opacity-80">days</span>
                                </div>
                                <p className="text-xs opacity-70 mt-1">{streak > 0 ? 'Keep the momentum going! 🔥' : 'Complete a reminder to start!'}</p>
                            </div>
                            {/* Decorative circles */}
                            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                            <div className="absolute -bottom-2 -right-2 w-14 h-14 rounded-full bg-white/10" />
                        </motion.div>

                        {/* Daily Mood Check-in */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl p-4 flex flex-col justify-between min-h-[180px] relative border border-white dark:border-slate-700 shadow-lg shadow-rose-900/5 dark:shadow-none overflow-hidden"
                        >
                            <div className="flex justify-between items-start">
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Mood</span>
                                {todayMood && <span className="text-lg">{todayMood}</span>}
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 mb-2">How are you feeling?</p>
                                <div className="flex gap-1">
                                    {MOODS.map((m) => (
                                        <button
                                            key={m.label}
                                            onClick={() => handleMoodSelect(m.emoji)}
                                            className={cn(
                                                'w-8 h-8 rounded-full flex items-center justify-center text-base transition-all hover:scale-110 border-2',
                                                todayMood === m.emoji
                                                    ? m.color + ' scale-110 shadow-sm'
                                                    : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-700'
                                            )}
                                            title={m.label}
                                        >
                                            {m.emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* 7-day mood history */}
                            <div className="flex gap-1 items-center">
                                <span className="text-[9px] text-slate-300 font-medium mr-0.5">7d</span>
                                {[...Array(7)].map((_, i) => (
                                    <div key={i} className="w-4 h-4 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-[9px]">
                                        {moodHistory[6 - i]?.mood || '·'}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Today's Snapshot + Affirmation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 lg:p-8 border border-white dark:border-slate-700 shadow-lg shadow-rose-900/5 dark:shadow-none grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {/* Today's Due */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
                                    <Bell className="w-4 h-4 text-rose-500" />
                                </div>
                                <h3 className="font-bold text-slate-800 dark:text-white">Due Today</h3>
                                <span className="text-xs font-black bg-rose-100 dark:bg-rose-900/30 text-rose-500 px-2 py-0.5 rounded-full ml-auto">{todayReminders.length}</span>
                            </div>
                            {todayReminders.length === 0 ? (
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 text-center">
                                    <p className="text-sm text-slate-400">Nothing due today! 🎉</p>
                                    <p className="text-xs text-slate-300 dark:text-slate-500 mt-1">Enjoy your free time</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {todayReminders.slice(0, 4).map((r) => (
                                        <div key={r.id}
                                            className={cn('flex items-center gap-2 p-2.5 rounded-xl text-sm transition-all',
                                                CATEGORY_CONFIG[r.category as ReminderCategory]?.bg || 'bg-slate-50',
                                                CATEGORY_CONFIG[r.category as ReminderCategory]?.border || 'border-slate-200',
                                                'border'
                                            )}
                                        >
                                            <button
                                                onClick={() => toggleReminderComplete(r.id, false)}
                                                className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-500 hover:border-emerald-400 flex-shrink-0 flex items-center justify-center transition-colors"
                                            />
                                            <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{r.title}</span>
                                            <span className="text-[10px] text-slate-400 ml-auto flex-shrink-0">{r.time}</span>
                                        </div>
                                    ))}
                                    {todayReminders.length > 4 && (
                                        <p className="text-xs text-slate-400 text-center mt-1">+{todayReminders.length - 4} more</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Affirmation */}
                        <div className="flex flex-col justify-between">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-full bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-violet-500" />
                                </div>
                                <h3 className="font-bold text-slate-800 dark:text-white">Daily Affirmation</h3>
                            </div>
                            <div className="bg-gradient-to-br from-violet-50 to-rose-50 dark:from-violet-900/20 dark:to-rose-900/20 rounded-2xl p-5 border border-violet-100 dark:border-violet-800/50 flex-1 flex items-center">
                                <p className="text-slate-700 dark:text-slate-200 font-medium text-base leading-relaxed italic">
                                    "{todayQuote}"
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Upcoming Next */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 lg:p-8 border border-white dark:border-slate-700 shadow-lg shadow-rose-900/5 dark:shadow-none"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                </div>
                                <h3 className="font-bold text-slate-800 dark:text-white">Coming Up Next</h3>
                            </div>
                            <span className="text-xs text-slate-400">All categories</span>
                        </div>

                        {upcomingReminders.length === 0 ? (
                            <div className="text-center py-6">
                                <p className="text-sm text-slate-400">No upcoming reminders</p>
                                <p className="text-xs text-slate-300 dark:text-slate-500 mt-1">Add some reminders to see them here</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingReminders.map((r, i) => {
                                    const catConfig = CATEGORY_CONFIG[r.category as ReminderCategory];
                                    const CatIcon = catConfig?.icon || Bell;
                                    return (
                                        <div key={r.id} className="flex items-center gap-4 group">
                                            {/* Timeline dot */}
                                            <div className="flex flex-col items-center">
                                                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', catConfig?.bg || 'bg-slate-50')}>
                                                    <CatIcon className={cn('w-4 h-4', catConfig?.color || 'text-slate-400')} />
                                                </div>
                                                {i < upcomingReminders.length - 1 && <div className="w-0.5 h-6 bg-slate-100 dark:bg-slate-700 mt-1" />}
                                            </div>
                                            {/* Content */}
                                            <div className="flex-1 py-1">
                                                <p className="font-bold text-sm text-slate-800 dark:text-white">{r.title}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-slate-400 font-medium">{r.date}</span>
                                                    <span className="text-[10px] text-slate-300">·</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">{r.time}</span>
                                                </div>
                                            </div>
                                            {/* Category tag */}
                                            <span className={cn('text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full', catConfig?.bg, catConfig?.color)}>{r.category}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* ═══════════════════════ LIFE REMINDERS SECTION ═══════════════════════ */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8"
            >
                {/* Section Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-display font-bold text-rose-950 dark:text-white">Life Reminders</h2>
                        <p className="text-rose-800/60 dark:text-white/60 text-sm mt-1">Home, Family & Self-Care</p>
                    </div>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-rose-200/50 dark:shadow-none transition-all hover:scale-[1.02] text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        {showAddForm ? 'Close' : 'New Reminder'}
                    </button>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-3 mb-6">
                    {(Object.keys(CATEGORY_CONFIG) as ReminderCategory[]).map((cat) => {
                        const config = CATEGORY_CONFIG[cat];
                        const Icon = config.icon;
                        const count = lifeReminders.filter(r => r.category === cat && !r.completed).length;
                        return (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border',
                                    activeCategory === cat
                                        ? `${config.bg} ${config.color} ${config.border} shadow-sm`
                                        : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {cat}
                                {count > 0 && (
                                    <span className={cn('text-[10px] font-black px-1.5 py-0.5 rounded-full', activeCategory === cat ? 'bg-white/80 dark:bg-slate-900/50' : 'bg-slate-100 dark:bg-slate-700')}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Quick Presets */}
                <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 border border-white dark:border-slate-700 shadow-lg shadow-rose-900/5 dark:shadow-none mb-6">
                    <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3 pl-1">Quick Add</h3>
                    <div className="flex flex-wrap gap-2">
                        {CATEGORY_CONFIG[activeCategory].presets.map((preset) => (
                            <button
                                key={preset}
                                onClick={() => handleAddLifeReminder(preset, true)}
                                disabled={addingReminder}
                                className={cn(
                                    'px-3.5 py-2 rounded-xl text-sm font-medium border transition-all hover:scale-[1.03] active:scale-95',
                                    CATEGORY_CONFIG[activeCategory].bg,
                                    CATEGORY_CONFIG[activeCategory].border,
                                    CATEGORY_CONFIG[activeCategory].color,
                                    'hover:shadow-sm disabled:opacity-50'
                                )}
                            >
                                <Plus className="w-3 h-3 inline mr-1 opacity-60" />
                                {preset}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Add Form */}
                <AnimatePresence>
                    {showAddForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 border border-white dark:border-slate-700 shadow-lg shadow-rose-900/5 dark:shadow-none">
                                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-rose-500" />
                                    Custom Reminder
                                </h3>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="What do you need to remember?"
                                        value={newReminder.title}
                                        onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900"
                                    />
                                    <textarea
                                        placeholder="Notes (optional)"
                                        value={newReminder.notes}
                                        onChange={(e) => setNewReminder({ ...newReminder, notes: e.target.value })}
                                        rows={2}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-600 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900 resize-none"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Date</label>
                                            <input
                                                type="date"
                                                value={newReminder.date}
                                                onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">Time</label>
                                            <input
                                                type="time"
                                                value={newReminder.time}
                                                onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-200"
                                            />
                                        </div>
                                    </div>

                                    {/* Email Toggle */}
                                    <div className="flex items-center justify-between bg-rose-50/50 dark:bg-slate-700/50 p-3 rounded-xl border border-rose-100 dark:border-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-rose-400" />
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Send email notification</span>
                                        </div>
                                        <button
                                            onClick={() => setNewReminder({ ...newReminder, sendEmail: !newReminder.sendEmail })}
                                            className={cn(
                                                'w-11 h-6 rounded-full transition-colors relative',
                                                newReminder.sendEmail ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-600'
                                            )}
                                        >
                                            <div className={cn(
                                                'w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform',
                                                newReminder.sendEmail ? 'translate-x-[22px]' : 'translate-x-0.5'
                                            )} />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => handleAddLifeReminder(newReminder.title)}
                                        disabled={!newReminder.title.trim() || addingReminder}
                                        className="w-full bg-rose-950 hover:bg-rose-900 text-white font-bold py-3.5 rounded-xl transition-all shadow-xl shadow-rose-900/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {addingReminder ? (
                                            <><Clock className="w-4 h-4 animate-spin" /> Saving...</>
                                        ) : (
                                            <><Send className="w-4 h-4" /> Add Reminder{newReminder.sendEmail ? ' & Notify' : ''}</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Active Reminders List */}
                <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 border border-white dark:border-slate-700 shadow-lg shadow-rose-900/5 dark:shadow-none">
                    <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-4 pl-1">Active Reminders</h3>
                    {lifeReminders.filter(r => r.category === activeCategory).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-3', CATEGORY_CONFIG[activeCategory].bg)}>
                                {(() => { const Icon = CATEGORY_CONFIG[activeCategory].icon; return <Icon className={cn('w-7 h-7', CATEGORY_CONFIG[activeCategory].color)} />; })()}
                            </div>
                            <p className="text-slate-400 font-medium text-sm">No {activeCategory.toLowerCase()} reminders yet</p>
                            <p className="text-slate-300 dark:text-slate-600 text-xs mt-1">Use the quick add buttons or create a custom one</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {lifeReminders
                                .filter(r => r.category === activeCategory)
                                .map((reminder) => (
                                    <motion.div
                                        key={reminder.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={cn(
                                            'flex items-center gap-3 p-3.5 rounded-2xl transition-all group border',
                                            reminder.completed
                                                ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700 opacity-60'
                                                : `${CATEGORY_CONFIG[activeCategory].bg} ${CATEGORY_CONFIG[activeCategory].border}`
                                        )}
                                    >
                                        {/* Complete Toggle */}
                                        <button
                                            onClick={() => toggleReminderComplete(reminder.id, reminder.completed)}
                                            className={cn(
                                                'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                                                reminder.completed
                                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                                    : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400'
                                            )}
                                        >
                                            {reminder.completed && <Check className="w-3.5 h-3.5" />}
                                        </button>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                'font-bold text-sm',
                                                reminder.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'
                                            )}>
                                                {reminder.title}
                                            </p>
                                            {reminder.notes && (
                                                <p className="text-xs text-slate-400 truncate mt-0.5">{reminder.notes}</p>
                                            )}
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                                    <CalendarIcon className="w-3 h-3" />
                                                    {reminder.date}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {reminder.time}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Delete */}
                                        <button
                                            onClick={() => deleteLifeReminder(reminder.id)}
                                            className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-rose-100 dark:hover:bg-slate-700 text-slate-300 hover:text-rose-500 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                        </div>
                    )}
                </div>
            </motion.div>

        </div>
    );
}
