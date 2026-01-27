import { Plus, Search, Clock4, Bell, Target, Layers, X, Sparkles, Send, GripVertical, Calendar as CalendarIcon, Users, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
    getTasks, addTask,
    getEmployees, addEmployee,
    getSchedulerSchedule,
    sendChatMessage, updateScheduleItem
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import { AutoSchedulerMiniPopup } from '../../components/AutoSchedulerMiniPopup';

const getWeekDays = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sun
    const days = [];
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
    const { user: _user } = useAuth();
    // Data State (Real Data from Backend)
    const [tasks, setTasks] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [schedule, setSchedule] = useState<any[]>([]); // For the calendar/timeline view

    const [activeView, setActiveView] = useState('Today');
    const [weekDays, setWeekDays] = useState<{ day: string, date: number, active: boolean }[]>([]);
    const [_loading, setLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // AI Chat State (The Assistant)
    const [showAIPopup, setShowAIPopup] = useState(false);
    const [aiPrompt, setAIPrompt] = useState('');
    const [chatHistory, setChatHistory] = useState<any[]>([
        { role: 'assistant', content: 'Hello! I am your scheduling assistant. How can I help you optimize your team\'s time today?' }
    ]);

    // UI Popups
    const [_showTaskPopup, setShowTaskPopup] = useState(false);
    const [showAddTask, setShowAddTask] = useState(false);
    const [_showPriorityPopup, setShowPriorityPopup] = useState(false);
    const [showEmployeePopup, setShowEmployeePopup] = useState(false);

    // Forms
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [_newTaskTime, _setNewTaskTime] = useState('');
    const [_newTaskStatus, _setNewTaskStatus] = useState('todo');
    const [newTaskPriority, setNewTaskPriority] = useState('Medium');
    const [newTaskHours, setNewTaskHours] = useState(1);

    const [newEmp, setNewEmp] = useState({ name: '', role: '', email: '', weekly_hours_limit: 40 });

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState<{
        show: boolean; title: string; message: string; type: 'success' | 'error' | 'confirm'; onConfirm?: () => void;
    }>({ show: false, title: '', message: '', type: 'success' });

    const showAlert = (title: string, message: string, type: 'success' | 'error' = 'success') => setAlertConfig({ show: true, title, message, type });
    const closeAlert = () => setAlertConfig(prev => ({ ...prev, show: false }));

    useEffect(() => {
        setWeekDays(getWeekDays());
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const uid = _user?.uid;
            const [tData, eData, sData] = await Promise.all([
                getTasks(true, uid), // active only
                getEmployees(uid),
                getSchedulerSchedule(uid)
            ]);
            setTasks(tData || []);
            setEmployees(eData || []);
            setSchedule(sData || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // --- Actions ---

    const handleCreateTask = async () => {
        if (!newTaskTitle) return;
        setLoading(true);
        try {
            const taskData = {
                title: newTaskTitle,
                description: "Manual Entry",
                priority: newTaskPriority,
                estimated_hours: newTaskHours,
                deadline: "" // Optional
            };
            await addTask(taskData, _user?.uid);

            // Refetch
            await fetchData();
            setShowAddTask(false);
            setNewTaskTitle('');
        } catch (e) { console.error(e); showAlert("Error", "Failed to create task", "error"); } finally { setLoading(false); }
    };

    const handleCreateEmployee = async () => {
        if (!newEmp.name) return;
        setLoading(true);
        try {
            await addEmployee(newEmp, _user?.uid);
            await fetchData();
            setShowEmployeePopup(false);
            setNewEmp({ name: '', role: '', email: '', weekly_hours_limit: 40 });
            showAlert("Success", "Team member added!");
        } catch (e) { console.error(e); showAlert("Error", "Failed to add member", "error"); } finally { setLoading(false); }
    };

    const handleAIChat = async () => {
        if (!aiPrompt.trim()) return;
        const msg = aiPrompt;
        setAIPrompt(''); // Clear input but keep popup open to show reply
        setChatHistory(prev => [...prev, { role: 'user', content: msg }]);

        try {
            const res = await sendChatMessage(msg, 1, _user?.uid);
            // res is now { text: string, action: string, ... }
            const replyText = typeof res === 'object' && res.text ? res.text : (typeof res === 'string' ? res : JSON.stringify(res));

            setChatHistory(prev => [...prev, { role: 'assistant', content: replyText }]);

            // Auto Switch to Calendar if optimized
            if (res.action === 'optimize_schedule') {
                setActiveView('Calendar');
                setShowAIPopup(false); // Optional: close popup to show calendar
            }

            await fetchData(); // Refresh data as AI might have changed things
        } catch (e) {
            setChatHistory(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error." }]);
        }
    };

    const handleCalendarSync = async () => {
        setIsSyncing(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential?.accessToken;
            if (!token) throw new Error("No access token found");

            let count = 0;
            const today = new Date();

            // Sync generated schedule items
            const itemsToSync = schedule.length > 0 ? schedule : tasks; // Fallback to tasks if no schedule

            for (const item of itemsToSync) {
                // If it's a schedule item, use start_time. If task, might not have time.
                const title = item.task_title || item.title;
                const startTime = item.start_time || "09:00";

                // Parse time (simple parser for HH:MM)
                let [h, m] = startTime.split(':').map(Number);
                const start = new Date(today);
                start.setHours(h, m || 0, 0);
                const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour default

                const event = {
                    summary: title,
                    description: item.emp_name ? `Assigned to: ${item.emp_name}` : "Tea Hack Task",
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
            showAlert("Sync Complete!", `Synced ${count} items to Google Calendar!`, 'success');
        } catch (error) {
            console.error(error);
            showAlert("Sync Failed", "Please check permissions.", 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    // Helper to format tasks for the list UI
    const getFormattedTasks = () => {
        return tasks.map(t => ({
            ...t,
            // Map backend fields to UI fields if needed
            time: t.deadline || "Anytime",
            desc: t.description || `${t.estimated_hours}h • ${t.priority}`,
            color: t.priority === 'High' ? 'bg-rose-400' : 'bg-[#FF8A71] shadow-orange-200'
        }));
    };

    const displayTasks = getFormattedTasks();

    // Drag and Drop Handler - FIXED SLOT SWAPPING IMPLEMENTATION
    const handleReorder = async (newOrder: any[]) => {
        // 1. Get existing slots from the CURRENT 'schedule' (before visual reorder)
        const existingSlots = [...schedule].map(item => ({
            start: item.start_time,
            end: item.end_time
        })).sort((a, b) => a.start.localeCompare(b.start));

        // 2. Assign these slots to the new order
        const updatedSchedule = newOrder.map((item, index) => {
            // Safety: use slot at index, or last slot if index overflow
            const slot = existingSlots[index] || existingSlots[existingSlots.length - 1];

            return {
                ...item,
                start_time: slot.start,
                end_time: slot.end
            };
        });

        // 3. Update State
        setSchedule(updatedSchedule);

        // 4. Update Backend
        const updates = updatedSchedule.map(item =>
            updateScheduleItem(item.id, { start_time: item.start_time, end_time: item.end_time })
        );

        try {
            await Promise.all(updates);
        } catch (e) {
            console.error("Reorder sync failed", e);
            fetchData();
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF8F5] dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans -m-8 relative overflow-hidden flex flex-col">
            <AutoSchedulerMiniPopup />
            {/* Header Area */}
            <div className="p-8 pt-10 flex justify-between items-center">
                <div className="flex bg-orange-100/50 dark:bg-slate-800 p-1.5 rounded-2xl w-full max-w-[320px] backdrop-blur-sm">
                    {['Today', 'Calendar', 'Team'].map(view => (
                        <button
                            key={view}
                            onClick={() => setActiveView(view)}
                            className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${activeView === view ? 'bg-[#FF8A71] text-white shadow-lg' : 'text-orange-900/40 dark:text-slate-400 hover:text-orange-600 dark:hover:text-slate-200'}`}
                        >
                            {view}
                        </button>
                    ))}
                </div>
                <div className="flex gap-3">
                    <button onClick={handleCalendarSync} title="Sync to Google Calendar" className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm border border-orange-100 dark:border-slate-700 transition-transform active:scale-95 text-indigo-500">
                        {isSyncing ? <Sparkles className="w-6 h-6 animate-spin" /> : <CalendarIcon className="w-6 h-6" />}
                    </button>
                    <button className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm border border-orange-100 dark:border-slate-700 relative">
                        <Bell className="w-6 h-6 text-orange-400" />
                        <div className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800" />
                    </button>
                </div>
            </div>

            {/* Content Switcher */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
                <AnimatePresence mode="wait">

                    {/* TODAY VIEW (Tasks) */}
                    {activeView === 'Today' && (
                        <motion.div
                            key="today-view"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="px-8 pt-6 space-y-8"
                        >
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white leading-tight">
                                Hi there!<br />
                                <span className="text-[#FF8A71]">You have {tasks.length} tasks</span>
                            </h1>

                            <div className="relative flex items-center gap-3">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-300" />
                                    <input type="text" placeholder="Search a task...." className="w-full bg-white/60 dark:bg-slate-800 border border-orange-100 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#FF8A71]/20 transition-all placeholder:text-orange-200 dark:placeholder:text-slate-500 dark:text-white" />
                                </div>
                            </div>

                            <div className="flex gap-6 justify-between px-2">
                                {[
                                    { label: 'To-Do', icon: Clock4, color: 'text-rose-500', bg: 'bg-rose-50', action: () => setShowPriorityPopup(true) },
                                    { label: 'AI', icon: Sparkles, color: 'text-orange-500', bg: 'bg-orange-50', action: () => setShowAIPopup(true) },
                                    { label: 'Team', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50', action: () => setActiveView('Team') }
                                ].map(stat => (
                                    <button key={stat.label} onClick={stat.action} className="flex flex-col items-center gap-2 group">
                                        <div className={`w-16 h-16 ${stat.bg} dark:bg-slate-800 rounded-full flex items-center justify-center border border-white dark:border-slate-700 shadow-sm ring-4 ring-[#FFF8F5] dark:ring-slate-900 group-active:scale-95 transition-transform`}>
                                            <stat.icon className={`w-7 h-7 ${stat.color}`} />
                                        </div>
                                        <span className="text-xs font-black text-orange-900/40 dark:text-slate-400 uppercase tracking-widest">{stat.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-black text-slate-800 dark:text-white">Your Backlog</h3>
                                <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                                    {displayTasks.length > 0 ? displayTasks.map((task, i) => (
                                        <motion.div
                                            key={task.id || i}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowTaskPopup(true)} // Open full list
                                            className={`min-w-[280px] rounded-[2.5rem] p-8 text-white shadow-2xl cursor-pointer relative overflow-hidden group ${task.color}`}
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-10 -mt-10" />
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                                        {task.priority === 'High' ? <Target className="w-6 h-6 text-white" /> : <Layers className="w-6 h-6 text-white" />}
                                                    </div>
                                                </div>
                                                <h4 className="text-2xl font-black mb-2 truncate pr-2">{task.title}</h4>
                                                <p className="text-sm opacity-80 mb-6 font-medium line-clamp-1">{task.desc}</p>
                                                <div className="text-xl font-black">{task.time}</div>
                                            </div>
                                        </motion.div>
                                    )) : (
                                        <div className="min-w-[280px] bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] p-8 text-slate-400 dark:text-slate-300 flex flex-col items-center justify-center text-center">
                                            <p className="font-bold">No tasks yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* CALENDAR VIEW (Schedule) */}
                    {activeView === 'Calendar' && (
                        <motion.div
                            key="calendar-view"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="px-8 pt-6 space-y-8"
                        >
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white leading-tight">
                                Task<br /><span className="text-[#FF8A71]">schedule</span>
                            </h1>

                            <div className="flex justify-between gap-2 overflow-x-auto no-scrollbar py-2">
                                {weekDays.map(day => (
                                    <button key={`${day.day}-${day.date}`} className={`flex flex-col items-center gap-2 p-2 min-w-[50px] transition-all ${day.active ? '' : 'text-orange-900/40 dark:text-slate-500'}`}>
                                        <span className="text-[10px] font-black uppercase tracking-widest">{day.day}</span>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${day.active ? 'bg-[#FF8A71] text-white shadow-lg shadow-orange-100 dark:shadow-none' : 'hover:bg-orange-50 dark:hover:bg-slate-800 dark:text-white'}`}>
                                            {day.date}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="relative pl-8 pb-32">
                                <div className="absolute left-3.5 top-2 bottom-6 w-0.5 bg-orange-200/50" />
                                {schedule.length > 0 ? (
                                    <Reorder.Group axis="y" values={schedule} onReorder={handleReorder} className="space-y-6">
                                        {schedule.map((item) => (
                                            <Reorder.Item key={item.id} value={item} className="flex gap-4 relative group cursor-grab active:cursor-grabbing">
                                                <div className="absolute -left-[27px] top-6 w-4 h-4 rounded-full border-4 border-[#FFF8F5] ring-2 bg-orange-100 ring-transparent z-10" />
                                                <div className="flex flex-col pt-5 min-w-[60px]">
                                                    <span className="text-xs font-black text-orange-900/40 dark:text-slate-400 whitespace-nowrap">{item.start_time}</span>
                                                    <span className="text-[10px] text-orange-200 font-bold">{item.end_time}</span>
                                                </div>
                                                <div className="flex-1 p-6 rounded-[2rem] border border-orange-50 dark:border-slate-800 shadow-sm relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm group-hover:shadow-md transition-all">
                                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-400 opacity-40" />
                                                    <h4 className="text-lg font-black text-slate-800 dark:text-white mb-1">{item.task_title || "Task"}</h4>
                                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-2">Assigned to: <span className="text-orange-500 font-bold">{item.emp_name}</span></p>
                                                    <div className="flex gap-2">
                                                        <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wide">{item.priority}</span>
                                                        <GripVertical className="w-4 h-4 text-slate-300 absolute top-6 right-6" />
                                                    </div>
                                                </div>
                                            </Reorder.Item>
                                        ))}
                                    </Reorder.Group>
                                ) : (
                                    <div className="text-center py-10 text-slate-400">
                                        <p>No schedule generated.</p>
                                        <button onClick={() => setShowAIPopup(true)} className="mt-2 text-[#FF8A71] font-bold underline">Ask AI to plan it</button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* TEAM VIEW */}
                    {activeView === 'Team' && (
                        <motion.div
                            key="team-view"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="px-8 pt-6 space-y-8"
                        >
                            <div className="flex justify-between items-center">
                                <h1 className="text-4xl font-black text-slate-900 dark:text-white leading-tight">
                                    Your<br /><span className="text-blue-500">Team</span>
                                </h1>
                                <button onClick={() => setShowEmployeePopup(true)} className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 active:scale-90 transition-transform">
                                    <Plus className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="grid gap-4">
                                {employees.length > 0 ? employees.map((emp) => (
                                    <div key={emp.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] flex items-center justify-between border border-blue-50 dark:border-slate-700 hover:shadow-lg transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-blue-50 dark:bg-slate-700 text-blue-500 rounded-2xl flex items-center justify-center font-black text-2xl">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 dark:text-white text-lg">{emp.name}</h3>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                                    <Briefcase className="w-3 h-3" /> {emp.role}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-slate-300 font-bold uppercase mb-1">Weekly Limit</div>
                                            <div className="font-black text-slate-700 dark:text-white">{emp.weekly_hours_limit}h</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-[2rem]">
                                        <p className="text-slate-400 font-bold">No team members yet.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* MODALS */}

            {/* AI Assistant Modal - Chat with TIAA Logic */}
            {showAIPopup && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[220] bg-orange-950/20 backdrop-blur-md flex items-center justify-center p-6">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[3rem] w-full max-w-sm overflow-hidden shadow-2xl h-[600px] flex flex-col">
                        <div className="p-8 bg-[#FF8A71] text-white relative shrink-0">
                            <h3 className="text-2xl font-black mb-1">AI Assistant</h3>
                            <p className="text-sm opacity-90">Auto-Scheduler & Advisor</p>
                            <button onClick={() => setShowAIPopup(false)} className="absolute top-8 right-8 text-white/70 hover:text-white"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                            {chatHistory.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium ${m.role === 'user' ? 'bg-[#FF8A71] text-white rounded-br-none' : 'bg-white text-slate-700 shadow-sm rounded-bl-none'}`}>
                                        {typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-white border-t border-slate-100 flex gap-2 shrink-0">
                            <input type="text" value={aiPrompt} onChange={e => setAIPrompt(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAIChat()} placeholder="Ask to schedule, add task..." className="flex-1 bg-slate-50 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-orange-200" />
                            <button onClick={handleAIChat} className="p-3 bg-[#FF8A71] text-white rounded-xl"><Send className="w-5 h-5" /></button>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Add Task Modal */}
            {showAddTask && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] bg-black/30 backdrop-blur-sm flex items-end justify-center">
                    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} className="bg-white rounded-t-[3rem] w-full max-w-md p-8 shadow-2xl relative">
                        <button onClick={() => setShowAddTask(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
                        <h3 className="text-2xl font-black text-slate-900 mb-6">New Task</h3>
                        <div className="space-y-4">
                            <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold" placeholder="Task Title" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} />
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Priority</label>
                                    <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value)}>
                                        <option>High</option><option>Medium</option><option>Low</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Hours</label>
                                    <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={newTaskHours} onChange={e => setNewTaskHours(parseFloat(e.target.value))} />
                                </div>
                            </div>
                            <button onClick={handleCreateTask} className="w-full py-4 bg-[#FF8A71] text-white rounded-2xl font-black shadow-lg shadow-orange-200 mt-4">Create Task</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Add Employee Modal */}
            {showEmployeePopup && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] bg-black/30 backdrop-blur-sm flex items-end justify-center">
                    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} className="bg-white rounded-t-[3rem] w-full max-w-md p-8 shadow-2xl relative">
                        <button onClick={() => setShowEmployeePopup(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
                        <h3 className="text-2xl font-black text-slate-900 mb-6">New Team Member</h3>
                        <div className="space-y-4">
                            <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold" placeholder="Full Name" value={newEmp.name} onChange={e => setNewEmp({ ...newEmp, name: e.target.value })} />
                            <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold" placeholder="Role (e.g. Developer)" value={newEmp.role} onChange={e => setNewEmp({ ...newEmp, role: e.target.value })} />
                            <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold" placeholder="Weekly Hours Limit" type="number" value={newEmp.weekly_hours_limit} onChange={e => setNewEmp({ ...newEmp, weekly_hours_limit: parseInt(e.target.value) })} />
                            <button onClick={handleCreateEmployee} className="w-full py-4 bg-blue-500 text-white rounded-2xl font-black shadow-lg shadow-blue-200 mt-4">Add Member</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* FAB */}
            <div className="fixed bottom-10 right-10 z-[100]">
                <button
                    onClick={() => activeView === 'Team' ? setShowEmployeePopup(true) : setShowAddTask(true)}
                    className="w-20 h-20 bg-[#FF8A71] rounded-full flex items-center justify-center shadow-[0_20px_40px_rgba(255,138,113,0.3)] border-4 border-white active:scale-90 transition-transform group"
                >
                    <Plus className="w-10 h-10 text-white group-hover:rotate-90 transition-transform duration-300" />
                </button>
            </div>

            {/* Generic Alert Popup */}
            {alertConfig.show && (
                <div className="fixed inset-0 z-[300] bg-black/40 flex items-center justify-center p-6">
                    <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center">
                        <h3 className="text-xl font-black mb-2">{alertConfig.title}</h3>
                        <p className="text-slate-500 mb-6">{alertConfig.message}</p>
                        <button onClick={closeAlert} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold">Okay</button>
                    </div>
                </div>
            )}
        </div>
    );
}
