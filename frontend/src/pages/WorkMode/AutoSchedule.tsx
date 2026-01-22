import { Plus, Search, Clock, CheckCircle2, Clock4, ChevronRight, Bell, Target, Layers, X, Sparkles, Send, Flag, GripVertical, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { generateSchedule } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getUserTasks, addTask, deleteTask } from '../../services/firestore';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';

const getWeekDays = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sun
    const days = [];

    // Start from Monday (arbitrary choice, or current day - 1)
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + i);
        days.push({
            day: d.toLocaleDateString('en-US', { weekday: 'short' }),
            date: d.getDate(),
            active: d.getDate() === today.getDate()
        });
    }
    return days;
};

export default function AutoSchedule() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<any[]>([]); // Initialize empty
    const [activeView, setActiveView] = useState('Today');
    const [showTaskPopup, setShowTaskPopup] = useState(false);
    const [showAddTask, setShowAddTask] = useState(false);
    const [showPriorityPopup, setShowPriorityPopup] = useState(false);
    const [showAIPopup, setShowAIPopup] = useState(false);
    const [aiPrompt, setAIPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [weekDays, setWeekDays] = useState<{ day: string, date: number, active: boolean }[]>([]);

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState<{
        show: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'confirm';
        onConfirm?: () => void;
    }>({ show: false, title: '', message: '', type: 'success' });

    const showAlert = (title: string, message: string, type: 'success' | 'error' = 'success') => {
        setAlertConfig({ show: true, title, message, type });
    };

    const showConfirm = (title: string, message: string, onConfirm: () => void) => {
        setAlertConfig({ show: true, title, message, type: 'confirm', onConfirm });
    };

    const closeAlert = () => setAlertConfig(prev => ({ ...prev, show: false }));

    // Add Task Form State
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskTime, setNewTaskTime] = useState('');
    const [newTaskStatus, setNewTaskStatus] = useState('todo');

    useEffect(() => {
        setWeekDays(getWeekDays());
    }, []);

    // Fetch tasks from Firestore
    useEffect(() => {
        if (user) {
            getUserTasks(user.uid).then(fetchedTasks => {
                if (fetchedTasks.length > 0) {
                    setTasks(fetchedTasks);
                }
            });
        }
    }, [user]);

    const handleAIPlan = async () => {
        if (!aiPrompt) return;
        setLoading(true);
        try {
            const data = await generateSchedule(aiPrompt);
            if (data.schedule) {
                const newTasks: any[] = [];
                for (const item of data.schedule) {
                    const taskData = {
                        title: item.task,
                        desc: `${item.energy} Energy • ${item.duration}`,
                        time: item.time,
                        status: 'todo' as const,
                        color: item.energy === 'High' ? 'bg-rose-400' : item.energy === 'Medium' ? 'bg-orange-400' : 'bg-emerald-400',
                        priority: item.energy,
                        progress: 0
                    };

                    if (user) {
                        try {
                            const savedTask = await addTask(user.uid, taskData);
                            newTasks.push(savedTask);
                        } catch (e) { console.error("Error saving task", e); }
                    } else {
                        // Fallback for non-logged in (preview)
                        newTasks.push({ id: Date.now() + Math.random(), ...taskData });
                    }
                }

                if (newTasks.length > 0) {
                    setTasks(prev => [...prev, ...newTasks]);
                    setActiveView('Calendar');
                }
                setShowAIPopup(false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCalendarSync = async () => {
        setIsSyncing(true);
        try {
            // 1. Auth & Token
            const result = await signInWithPopup(auth, googleProvider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential?.accessToken;

            if (!token) throw new Error("No access token found");

            // 2. Push Tasks (Only Future/Today)
            let count = 0;
            const today = new Date();

            for (const task of tasks) {
                if (!task.time) continue;
                // Parse "10:00 AM" etc.
                const [time, modifier] = task.time.split(' ');
                if (!time || !modifier) continue;

                let [hours, minutes] = time.split(':');
                if (hours === '12') hours = '00';
                let h = parseInt(hours, 10);
                if (modifier === 'PM' && h < 12) h += 12;
                if (modifier === 'AM' && h === 12) h = 0;

                const start = new Date(today);
                start.setHours(h, parseInt(minutes), 0);
                const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour

                // Basic Event Structure
                const event = {
                    summary: task.title,
                    description: task.desc || "Generated by Tea Hack",
                    start: { dateTime: start.toISOString() },
                    end: { dateTime: end.toISOString() },
                };
                await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(event)
                });
                count++;
            }
            showAlert("Sync Complete!", `Synced ${count} tasks to Google Calendar!`, 'success');
        } catch (error) {
            console.error("Sync failed", error);
            showAlert("Sync Failed", "Please check your Google permissions.", 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleImportCalendar = async () => {
        setIsSyncing(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential?.accessToken;
            if (!token) return;

            // Fetch Today's Events
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const resp = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startOfDay.toISOString()}&timeMax=${endOfDay.toISOString()}&singleEvents=true`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await resp.json();

            if (data.items) {
                const importedTasks = data.items.map((ev: any) => {
                    const date = new Date(ev.start.dateTime || ev.start.date);
                    return {
                        id: ev.id,
                        title: ev.summary || "No Title",
                        desc: "Imported from Calendar",
                        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        status: 'todo',
                        color: 'bg-indigo-400', // distinct color
                        priority: 'High',
                        progress: 0
                    };
                });
                setTasks(prev => [...prev, ...importedTasks]);
                setActiveView('Calendar'); // Switch to view them
            }
        } catch (e) {
            console.error(e);
            showAlert("Import Failed", "Could not fetch calendar events.", 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleCreateTask = async () => {
        if (!newTaskTitle) return;
        // Convert 24h Time (HH:MM) to 12h Format (HH:MM AM/PM)
        let formattedTime = newTaskTime || "09:00 AM";
        if (newTaskTime && newTaskTime.includes(':') && !newTaskTime.includes('M')) {
            const [h, m] = newTaskTime.split(':');
            const hour = parseInt(h);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12; // 0 becomes 12
            formattedTime = `${hour12}:${m} ${ampm}`;
        }

        const newTask = {
            title: newTaskTitle,
            desc: "Manual Entry",
            time: formattedTime,
            status: newTaskStatus as 'todo' | 'progress' | 'done',
            color: 'bg-slate-800', // neutral manual color
            priority: 'Medium',
            progress: 0
        };

        if (user) {
            try {
                const saved = await addTask(user.uid, newTask);
                setTasks(prev => [...prev, saved]);
            } catch (e) { console.error(e); }
        } else {
            setTasks(prev => [...prev, { id: Date.now(), ...newTask }]);
        }
        setShowAddTask(false);
        // Reset form
        setNewTaskTitle('');
        setNewTaskTime('');
    };

    const handleDeleteTask = async (taskId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        showConfirm("Delete Task?", "This action cannot be undone.", async () => {
            setTasks(prev => prev.filter(t => t.id !== taskId));
            if (user) {
                try {
                    await deleteTask(user.uid, taskId);
                } catch (error) {
                    console.error("Failed to delete", error);
                }
            }
            closeAlert();
        });
    };

    return (
        <div className="min-h-screen bg-[#FFF8F5] text-slate-900 font-sans -m-8 relative overflow-hidden flex flex-col">
            {/* Header Area (Simplified) */}
            <div className="p-8 pt-10 flex justify-between items-center">
                <div className="flex bg-orange-100/50 p-1.5 rounded-2xl w-full max-w-[240px] backdrop-blur-sm">
                    {['Today', 'Calendar'].map(view => (
                        <button
                            key={view}
                            onClick={() => setActiveView(view)}
                            className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${activeView === view ? 'bg-[#FF8A71] text-white shadow-lg' : 'text-orange-900/40 hover:text-orange-600'}`}
                        >
                            {view}
                        </button>
                    ))}
                </div>
                <div className="flex gap-3">
                    <button onClick={handleImportCalendar} title="Import G-Cal" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-orange-100 transition-transform active:scale-95 text-indigo-500">
                        <CalendarIcon className="w-6 h-6" />
                    </button>
                    <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-orange-100 relative">
                        <Bell className="w-6 h-6 text-orange-400" />
                        <div className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                    </button>
                </div>
            </div>

            {/* Content Switcher */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
                <AnimatePresence mode="wait">
                    {activeView === 'Today' ? (
                        <motion.div
                            key="today-view"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="px-8 pt-6 space-y-8"
                        >
                            <h1 className="text-4xl font-black text-slate-900 leading-tight">
                                Hi there!<br />
                                <span className="text-[#FF8A71]">You have 49 tasks</span>
                            </h1>

                            <div className="relative flex items-center gap-3">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-300" />
                                    <input
                                        type="text"
                                        placeholder="Search a task...."
                                        className="w-full bg-white/60 border border-orange-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#FF8A71]/20 transition-all placeholder:text-orange-200"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-6 justify-between px-2">
                                {[
                                    { label: 'To-Do', icon: Clock4, color: 'text-rose-500', bg: 'bg-rose-50', action: () => setShowPriorityPopup(true) },
                                    { label: 'AI', icon: Sparkles, color: 'text-orange-500', bg: 'bg-orange-50', action: () => setShowAIPopup(true) },
                                    { label: 'Done', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', action: () => { } }
                                ].map(stat => (
                                    <button
                                        key={stat.label}
                                        onClick={stat.action}
                                        className="flex flex-col items-center gap-2 group"
                                    >
                                        <div className={`w-16 h-16 ${stat.bg} rounded-full flex items-center justify-center border border-white shadow-sm ring-4 ring-[#FFF8F5] group-active:scale-95 transition-transform`}>
                                            <stat.icon className={`w-7 h-7 ${stat.color}`} />
                                        </div>
                                        <span className="text-xs font-black text-orange-900/40 uppercase tracking-widest">{stat.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Today's Task Card (Trigger) */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-black text-slate-800">Today's Tasks</h3>
                                <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                                    {tasks.length > 0 ? (
                                        tasks.slice(0, 5).map((task, i) => (
                                            <motion.div
                                                key={`task-card-${task.id || i}`}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setShowTaskPopup(true)}
                                                className={`min-w-[280px] rounded-[2.5rem] p-8 text-white shadow-2xl cursor-pointer relative overflow-hidden group ${task.color || 'bg-[#FF8A71] shadow-orange-200'}`}
                                            >
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-10 -mt-10" />
                                                <div className="relative z-10">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                                            {task.priority === 'High' ? <Target className="w-6 h-6 text-white" /> : <Layers className="w-6 h-6 text-white" />}
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-2xl font-black">{task.status === 'done' ? '100%' : task.status === 'progress' ? '50%' : '0%'}</div>
                                                            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Progress</div>
                                                        </div>
                                                    </div>
                                                    <h4 className="text-2xl font-black mb-2 truncate pr-2">{task.title}</h4>
                                                    <p className="text-sm opacity-80 mb-6 font-medium line-clamp-1">{task.desc}</p>
                                                    <div className="text-xl font-black">{task.time}</div>
                                                    <div className="mt-4 w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-white rounded-full transition-all duration-500"
                                                            style={{ width: task.status === 'done' ? '100%' : task.status === 'progress' ? '50%' : '5%' }}
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="min-w-[280px] bg-slate-100 rounded-[2.5rem] p-8 text-slate-400 flex flex-col items-center justify-center text-center">
                                            <Sparkles className="w-10 h-10 mb-4 opacity-50" />
                                            <p className="font-bold">No tasks yet.<br />Tap + to add one!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="calendar-view"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="px-8 pt-6 space-y-8"
                        >
                            <div className="flex justify-between items-center">
                                <h1 className="text-4xl font-black text-slate-900 leading-tight">
                                    Task<br />
                                    <span className="text-[#FF8A71]">schedule</span>
                                </h1>
                            </div>

                            {/* Week Picker */}
                            <div className="flex justify-between gap-2 overflow-x-auto no-scrollbar py-2">
                                {weekDays.map(day => (
                                    <button
                                        key={`${day.day}-${day.date}`}
                                        className={`flex flex-col items-center gap-2 p-2 min-w-[50px] transition-all ${day.active ? '' : 'text-orange-900/40'}`}
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-widest">{day.day}</span>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${day.active ? 'bg-[#FF8A71] text-white shadow-lg shadow-orange-100' : 'hover:bg-orange-50'}`}>
                                            {day.date}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Vertical Timeline redesign - NOW REORDERABLE */}
                            <div className="relative pl-8">
                                <div className="absolute left-3.5 top-2 bottom-6 w-0.5 bg-orange-200/50" />

                                <Reorder.Group axis="y" values={tasks} onReorder={setTasks} className="space-y-6">
                                    {tasks.map((task, idx) => (
                                        <Reorder.Item
                                            key={`list-view-${task.id || idx}`}
                                            value={task}
                                            className="flex gap-4 relative cursor-grab active:cursor-grabbing group"
                                        >
                                            <div className={`absolute -left-[27px] top-6 w-4 h-4 rounded-full border-4 border-[#FFF8F5] ring-2 z-10 ${task.status === 'done' ? 'bg-orange-500 ring-orange-500/30' : 'bg-orange-100 ring-transparent'}`} />
                                            <div className="flex flex-col pt-5">
                                                {/* Fixed time based on list position (index) */}
                                                <span className="text-xs font-black text-orange-900/40 whitespace-nowrap">
                                                    {idx === 0 ? '12:00 PM' : idx === 1 ? '01:30 PM' : idx === 2 ? '03:00 PM' : '03:45 PM'}
                                                </span>
                                            </div>
                                            <div className={`flex-1 p-6 rounded-[2rem] border border-orange-50 shadow-sm relative overflow-hidden bg-white/80 backdrop-blur-sm group-hover:shadow-md active:scale-[0.98] transition-all`}>
                                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${task.color} opacity-40`} />
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="text-lg font-black text-slate-800 mb-1">{task.title}</h4>
                                                        <p className="text-xs font-medium text-slate-500 leading-relaxed">{task.desc}</p>
                                                    </div>
                                                    <GripVertical className="w-4 h-4 text-orange-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </div>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* MODALS SECTION */}
            <AnimatePresence>
                {/* 1. Task List Popup - EDITABLE & REORDERABLE */}
                {showTaskPopup && (
                    <motion.div
                        key="task-popup"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-orange-900/20 backdrop-blur-sm flex items-end"
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="bg-white rounded-t-[3rem] w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
                        >
                            <div className="p-8 pb-4 flex justify-between items-center bg-white z-10">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Today's Schedule</h3>
                                    <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mt-1">Swipe to reorder</p>
                                </div>
                                <button onClick={() => setShowTaskPopup(false)} className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 active:scale-90 transition-transform">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar p-6 pt-0">
                                <Reorder.Group axis="y" values={tasks} onReorder={setTasks} className="space-y-4 pt-4">
                                    {tasks.map((task, idx) => (
                                        <Reorder.Item
                                            key={`popup-view-${task.id || idx}`}
                                            value={task}
                                            className="bg-white border border-orange-50 p-5 rounded-3xl flex items-center gap-4 shadow-sm hover:shadow-md active:scale-[0.98] transition-all group cursor-grab active:cursor-grabbing"
                                        >
                                            <div className="text-orange-200">
                                                <GripVertical className="w-5 h-5" />
                                            </div>
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${task.color} shadow-lg shadow-orange-100`}>
                                                <Clock className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-slate-800 leading-tight">{task.title}</h4>
                                                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mt-1">
                                                    {idx === 0 ? '12:00 PM' : idx === 1 ? '01:30 PM' : idx === 2 ? '03:00 PM' : '03:45 PM'} • {task.priority}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => handleDeleteTask(task.id, e)}
                                                className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            </div>

                            <div className="p-8 pt-0 space-y-3">
                                <button
                                    onClick={handleCalendarSync}
                                    disabled={isSyncing}
                                    className="w-full bg-white border-2 border-orange-100 text-orange-500 font-black py-5 rounded-[1.5rem] shadow-sm hover:bg-orange-50 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    {isSyncing ? <Sparkles className="w-5 h-5 animate-spin" /> : <CalendarIcon className="w-5 h-5" />}
                                    {isSyncing ? "Syncing..." : "Sync to Google Calendar"}
                                </button>
                                <button onClick={() => setShowTaskPopup(false)} className="w-full bg-[#FF8A71] text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-orange-200 active:scale-95 transition-all text-sm uppercase tracking-widest">
                                    Save Schedule
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* 2. Add Task Popup - SMALL BOTTOM SHEET */}
                {showAddTask && (
                    <motion.div
                        key="add-task-popup"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-orange-950/30 backdrop-blur-sm flex items-end justify-center"
                    >
                        {/* Overlay closer */}
                        <div className="absolute inset-0" onClick={() => setShowAddTask(false)} />

                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="bg-white rounded-t-[3rem] w-full max-w-sm p-8 shadow-2xl relative z-20 overflow-hidden"
                        >
                            {/* Decorative handle */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-orange-100 rounded-full" />

                            <div className="flex justify-between items-center mb-10 pt-4">
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight text-center flex-1">New Task</h3>
                                <button onClick={() => setShowAddTask(false)} className="absolute top-8 right-8 w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="flex-1 space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-orange-400 ml-1">Task Title</label>
                                    <input
                                        type="text"
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        placeholder="What's the plan?"
                                        className="w-full bg-orange-50/50 border-none rounded-2xl py-5 px-6 focus:ring-2 focus:ring-[#FF8A71]/20 text-slate-800 placeholder:text-orange-200"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-orange-400 ml-1">Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-300" />
                                        <input
                                            type="time"
                                            value={newTaskTime}
                                            onChange={(e) => setNewTaskTime(e.target.value)}
                                            className="w-full bg-orange-50/50 border-none rounded-2xl py-5 pl-12 pr-4 focus:ring-2 focus:ring-[#FF8A71]/20 text-slate-800 placeholder:text-orange-200 outline-none font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-orange-400 ml-1">Status</label>
                                    <select
                                        value={newTaskStatus}
                                        onChange={(e) => setNewTaskStatus(e.target.value)}
                                        className="w-full bg-orange-50/50 border-none rounded-2xl py-5 px-6 focus:ring-2 focus:ring-[#FF8A71]/20 text-slate-800 appearance-none font-bold">
                                        <option value="todo">To-Do</option>
                                        <option value="progress">Progress</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={handleCreateTask}
                                className="w-full bg-[#FF8A71] text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-orange-200 active:scale-95 transition-all mt-4 uppercase tracking-widest text-sm">
                                Create Task
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {/* 3. Priority Popup (for To-Do) */}
                {showPriorityPopup && (
                    <motion.div
                        key="priority-popup"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[210] bg-orange-950/10 backdrop-blur-sm flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[3rem] w-full max-w-sm p-10 shadow-2xl relative"
                        >
                            <button onClick={() => setShowPriorityPopup(false)} className="absolute top-8 right-8 w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-400">
                                <X className="w-5 h-5" />
                            </button>
                            <div className="flex flex-col items-center mb-10">
                                <div className="w-20 h-20 bg-rose-100 rounded-[2rem] flex items-center justify-center text-rose-500 shadow-lg shadow-rose-100 mb-6">
                                    <Flag className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Urgency Filter</h3>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: 'Critical', count: '12', color: 'bg-rose-500', bg: 'bg-rose-50' },
                                    { label: 'Medium', count: '08', color: 'bg-orange-500', bg: 'bg-orange-50' },
                                    { label: 'Normal', count: '29', color: 'bg-emerald-500', bg: 'bg-emerald-50' },
                                ].map(p => (
                                    <div key={p.label} className="group cursor-pointer flex items-center justify-between p-5 bg-white border border-orange-50 rounded-2xl hover:border-[#FF8A71] hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-3 h-3 rounded-full ${p.color}`} />
                                            <span className="text-base font-black text-slate-700">{p.label}</span>
                                        </div>
                                        <span className="text-xs font-black text-orange-300 group-hover:text-[#FF8A71]">{p.count}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* 4. AI Prompt Popup */}
                {showAIPopup && (
                    <motion.div
                        key="ai-popup"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[220] bg-orange-950/20 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[3rem] w-full max-w-sm overflow-hidden shadow-2xl"
                        >
                            <div className="p-10 bg-[#FF8A71] text-white relative">
                                <div className="w-16 h-16 bg-white/20 rounded-[1.5rem] flex items-center justify-center mb-6">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-3xl font-black mb-3 leading-tight tracking-tighter">AI Assistant</h3>
                                <p className="text-sm opacity-80 font-medium max-w-[200px]">Optimal task scheduling powered by AI.</p>
                                <button onClick={() => setShowAIPopup(false)} className="absolute top-10 right-10 text-white/50 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-10 space-y-6">
                                <div className="space-y-4">
                                    <textarea
                                        rows={4}
                                        value={aiPrompt}
                                        onChange={(e) => setAIPrompt(e.target.value)}
                                        placeholder="E.g. I need more focus time in the morning, move all meetings after 2 PM..."
                                        className="w-full bg-orange-50/30 border-none rounded-[2rem] p-6 text-sm focus:ring-2 focus:ring-[#FF8A71]/20 resize-none placeholder:text-orange-200 text-slate-800"
                                    />
                                </div>
                                <button
                                    onClick={handleAIPlan}
                                    disabled={loading}
                                    className="w-full bg-[#FF8A71] text-white font-black py-5 rounded-[1.5rem] flex items-center justify-center gap-4 shadow-xl shadow-orange-100 group active:scale-95 transition-all disabled:opacity-50">
                                    <span className="uppercase tracking-widest text-sm font-black">{loading ? 'Planning...' : 'Plan Schedule'}</span>
                                    {!loading && <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* 5. Generic Custom Alert/Confirm */}
                {alertConfig.show && (
                    <motion.div
                        key="alert-popup"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] bg-orange-950/40 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl text-center"
                        >
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${alertConfig.type === 'error' ? 'bg-rose-100 text-rose-500' :
                                alertConfig.type === 'confirm' ? 'bg-orange-100 text-orange-500' :
                                    'bg-emerald-100 text-emerald-500'
                                }`}>
                                {alertConfig.type === 'error' ? <X className="w-10 h-10" /> :
                                    alertConfig.type === 'confirm' ? <Trash2 className="w-10 h-10" /> :
                                        <CheckCircle2 className="w-10 h-10" />}
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 mb-2">{alertConfig.title}</h3>
                            <p className="text-slate-500 font-medium mb-8">{alertConfig.message}</p>

                            <div className="flex gap-3">
                                {alertConfig.type === 'confirm' && (
                                    <button
                                        onClick={closeAlert}
                                        className="flex-1 py-4 rounded-xl bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        if (alertConfig.onConfirm) alertConfig.onConfirm();
                                        else closeAlert();
                                    }}
                                    className={`flex-1 py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${alertConfig.type === 'error' ? 'bg-rose-500 shadow-rose-200' :
                                        alertConfig.type === 'confirm' ? 'bg-orange-500 shadow-orange-200' :
                                            'bg-emerald-500 shadow-emerald-200'
                                        }`}
                                >
                                    {alertConfig.type === 'confirm' ? 'Yes, Delete' : 'Okay'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Primary Plus Button (Bottom Right) */}
            <div className={`fixed bottom-10 right-10 z-[100] transition-transform duration-300 ${showTaskPopup || showAddTask || showAIPopup || showPriorityPopup ? 'scale-0 pointer-events-none' : 'scale-100'}`}>
                <button
                    onClick={() => setShowAddTask(true)}
                    className="w-20 h-20 bg-[#FF8A71] rounded-full flex items-center justify-center shadow-[0_20px_40px_rgba(255,138,113,0.3)] border-4 border-white active:scale-90 transition-transform group relative"
                >
                    <Plus className="w-10 h-10 text-white group-hover:rotate-90 transition-transform duration-300" />
                </button>
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div >
    );
}
