import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Droplets,
    Sparkles,
    Activity,
    Info,
    Check
} from 'lucide-react';
import {
    format,
    addDays,
    startOfMonth,
    endOfMonth,
    getDay,
    isSameDay,
    isToday,
    eachDayOfInterval,
    subMonths,
    addMonths,
    differenceInDays
} from 'date-fns';
import { cn } from '../../lib/utils';

export default function PeriodTracker() {
    // --- State ---
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [periodDates, setPeriodDates] = useState<Date[]>([]); // Confirmed period days
    const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(null); // Temporary selection for "Log" button
    const [view, setView] = useState<'tracker' | 'calendar'>('tracker');

    // --- Local Storage (Mock Persistence) ---
    useEffect(() => {
        const saved = localStorage.getItem('myPeriodDates');
        if (saved) {
            setPeriodDates(JSON.parse(saved).map((d: string) => new Date(d)));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('myPeriodDates', JSON.stringify(periodDates));
    }, [periodDates]);

    // --- Logic ---
    const isPeriodDay = (date: Date) => periodDates.some(d => isSameDay(d, date));

    const handleDateClick = (date: Date) => {
        // If already logged, allow deselecting immediately (fine-tuning)
        if (isPeriodDay(date)) {
            setPeriodDates(prev => prev.filter(d => !isSameDay(d, date)));
            setTempSelectedDate(null);
            return;
        }

        // If clicking a new date, select it temporarily to show "Log" button
        if (tempSelectedDate && isSameDay(tempSelectedDate, date)) {
            setTempSelectedDate(null); // Deselect if clicked again
        } else {
            setTempSelectedDate(date);
        }
    };

    const confirmLog = () => {
        if (!tempSelectedDate) return;

        // Auto-select 5 days (Current + Next 4)
        const newBlock: Date[] = [];
        for (let i = 0; i < 5; i++) {
            newBlock.push(addDays(tempSelectedDate, i));
        }

        setPeriodDates(prev => {
            // Filter out duplicates
            const uniqueNew = newBlock.filter(
                newDate => !prev.some(existing => isSameDay(existing, newDate))
            );
            return [...prev, ...uniqueNew];
        });

        setTempSelectedDate(null); // Clear temp selection
    };

    // Calculate Cycle Status
    const sortedDates = [...periodDates].sort((a, b) => a.getTime() - b.getTime());

    let currentCycleStart: Date | null = null;
    let daysSinceStart = 0;
    let isCurrentlyOnPeriod = false;

    if (sortedDates.length > 0) {
        const lastLogged = sortedDates[sortedDates.length - 1];
        if (differenceInDays(new Date(), lastLogged) < 10) {
            let temp = lastLogged;
            let blockStart = lastLogged;
            /* eslint-disable-next-line no-constant-condition */
            while (true) {
                const prevDay = addDays(temp, -1);
                if (isPeriodDay(prevDay)) {
                    temp = prevDay;
                    blockStart = prevDay;
                } else {
                    break;
                }
            }
            currentCycleStart = blockStart;

            if (isPeriodDay(new Date()) || differenceInDays(new Date(), lastLogged) <= 1) {
                isCurrentlyOnPeriod = true;
                daysSinceStart = differenceInDays(new Date(), currentCycleStart) + 1;
            }
        }
    }

    let daysUntilNextPeriod = 12; // Default mock
    if (!isCurrentlyOnPeriod && sortedDates.length > 0) {
        const lastDate = sortedDates[sortedDates.length - 1];
        const nextStart = addDays(lastDate, 28);
        daysUntilNextPeriod = differenceInDays(nextStart, new Date());
    }


    // --- Components ---

    const DateCell = ({ date }: { date: Date }) => {
        const isConfirmed = isPeriodDay(date);
        const isTempSelected = tempSelectedDate && isSameDay(date, tempSelectedDate);
        const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
        const isTodayDate = isToday(date);

        return (
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleDateClick(date)}
                className={cn(
                    "h-14 w-full flex flex-col items-center justify-center rounded-2xl relative transition-all",
                    !isCurrentMonth && "opacity-30",
                    isTempSelected && "bg-rose-100 ring-2 ring-rose-400"
                )}
            >
                {/* Selection Circle (Confirmed) */}
                {isConfirmed && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-2 bg-rose-400 rounded-full shadow-lg shadow-rose-200"
                    />
                )}

                {/* Today Indicator */}
                {isTodayDate && !isConfirmed && !isTempSelected && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
                )}

                <span className={cn(
                    "text-lg font-medium relative z-10",
                    isConfirmed ? "text-white" : "text-slate-700"
                )}>
                    {format(date, 'd')}
                </span>

                {/* Dotted Line */}
                {isConfirmed && (
                    <div className="absolute top-1/2 -right-4 w-4 border-t-2 border-rose-300 border-dotted hidden md:block" />
                )}
            </motion.button>
        );
    };

    const Calendar = () => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const days = eachDayOfInterval({ start: addDays(start, -getDay(start)), end: addDays(end, 6 - getDay(end)) });

        return (
            <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-100 border border-slate-100 relative">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-slate-50 rounded-full">
                        <ChevronLeft className="w-6 h-6 text-slate-400" />
                    </button>
                    <h2 className="text-xl font-bold text-slate-800">{format(currentMonth, 'MMMM yyyy')}</h2>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-slate-50 rounded-full">
                        <ChevronRight className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <div className="grid grid-cols-7 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                        <div key={d} className="text-center text-xs text-slate-400 font-bold py-2">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-y-2">
                    {days.slice(0, 42).map((d, i) => (
                        <DateCell key={i} date={d} />
                    ))}
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
                    <Info className="w-4 h-4" />
                    <span>Select a date, then click "Log"</span>
                </div>

                {/* POP UP LOG BUTTON */}
                <AnimatePresence>
                    {tempSelectedDate && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                            className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none" // pointer-events-none for wrapper
                        >
                            <button
                                onClick={confirmLog}
                                className="pointer-events-auto bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-full font-bold shadow-xl shadow-rose-200 flex items-center gap-2 transition-transform active:scale-95"
                            >
                                <Check className="w-5 h-5 border-2 border-white rounded-full p-0.5" />
                                Log Period
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const TrackerView = () => (
        <div className="flex flex-col items-center">
            {/* The "Cycle Circle" */}
            <div className="relative w-80 h-80 flex items-center justify-center mb-8">
                {/* Ambient Glow */}
                <div className={cn(
                    "absolute inset-0 blur-3xl rounded-full opacity-40 animate-pulse",
                    isCurrentlyOnPeriod ? "bg-rose-500" : "bg-teal-400"
                )} />

                {/* Main Circle */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring" }}
                    className={cn(
                        "w-full h-full rounded-full flex flex-col items-center justify-center text-white relative z-10 shadow-2xl",
                        isCurrentlyOnPeriod
                            ? "bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-200"
                            : "bg-gradient-to-br from-teal-400 to-teal-500 shadow-teal-200"
                    )}
                >
                    {isCurrentlyOnPeriod ? (
                        <>
                            <span className="text-xl font-medium opacity-90">Period</span>
                            <div className="flex items-baseline gap-1 mt-1 mb-2">
                                <span className="text-7xl font-display font-bold">Day {daysSinceStart}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-md">
                                <Droplets className="w-4 h-4 fill-white" />
                                <span className="text-sm font-medium">Flow: Medium</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <span className="text-xl font-medium opacity-90">Next Period In</span>
                            <div className="flex items-baseline gap-1 mt-1 mb-2">
                                <span className="text-7xl font-display font-bold">{Math.abs(daysUntilNextPeriod)}</span>
                                <span className="text-2xl font-medium opacity-80">Days</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-md">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-sm font-medium">Follicular Phase</span>
                            </div>
                        </>
                    )}
                </motion.div>

                {/* Floating "Edit" button near the circle */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setView('calendar')}
                    className="absolute -bottom-4 bg-white text-slate-800 px-6 py-3 rounded-full font-bold shadow-xl border border-slate-100 flex items-center gap-2 z-20"
                >
                    <CalendarIcon className="w-5 h-5 text-rose-500" />
                    Edit Dates
                </motion.button>
            </div>

            {/* Daily Insight Card */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl shadow-slate-100/50 border border-slate-50 flex items-start gap-4"
            >
                <div className={cn(
                    "p-3 rounded-2xl",
                    isCurrentlyOnPeriod ? "bg-rose-100 text-rose-500" : "bg-teal-100 text-teal-600"
                )}>
                    <Activity className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 text-lg">Daily Insight</h3>
                    <p className="text-slate-500 leading-relaxed mt-1">
                        {isCurrentlyOnPeriod
                            ? "Stay hydrated and consider light stretching today. Your body might feel a bit heavier than usual."
                            : "Energy levels are rising! It's a great time for high-intensity workouts or tackling complex tasks."
                        }
                    </p>
                </div>
            </motion.div>
        </div >
    );

    return (
        <div className="min-h-screen bg-[#FFF0E5] p-6 lg:p-12 font-sans overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-rose-950">My Cycle</h1>
                        <p className="text-rose-800/60">Manage your health & wellness</p>
                    </div>
                </div>

                {/* Toggle View */}
                <div className="bg-white/50 p-1.5 rounded-2xl inline-flex gap-2 mb-8 backdrop-blur-sm">
                    <button
                        onClick={() => setView('tracker')}
                        className={cn(
                            "px-6 py-3 rounded-xl font-bold transition-all",
                            view === 'tracker' ? "bg-white text-rose-500 shadow-sm" : "text-slate-500 hover:bg-white/30"
                        )}
                    >
                        Tracker
                    </button>
                    <button
                        onClick={() => setView('calendar')}
                        className={cn(
                            "px-6 py-3 rounded-xl font-bold transition-all",
                            view === 'calendar' ? "bg-white text-rose-500 shadow-sm" : "text-slate-500 hover:bg-white/30"
                        )}
                    >
                        Log Dates
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {view === 'tracker' ? (
                        <motion.div
                            key="tracker"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <TrackerView />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="calendar"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <Calendar />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
