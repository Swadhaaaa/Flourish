import { Plus, Search, Calendar as CalendarIcon, Clock, CheckCircle2, Circle, Clock4, MoreHorizontal, ChevronRight, Bell, Target, TrendingUp, Layers, X, ChevronLeft, Sparkles, Send, Flag, AlertCircle, GripVertical } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

const INITIAL_TASKS = [
    {
        id: 1,
        title: 'Wireframing',
        desc: 'Make some ideation from sketch and wireframes.',
        time: '12:00 PM',
        status: 'done',
        color: 'bg-rose-400',
        priority: 'High',
        progress: 100
    },
    {
        id: 2,
        title: 'UI Design',
        desc: 'Visual design from the wireframe and make design system.',
        time: '01:30 PM',
        status: 'progress',
        color: 'bg-orange-400',
        priority: 'Medium',
        progress: 48
    },
    {
        id: 3,
        title: 'Prototyping',
        desc: 'Make the interactive prototype for testing & stakeholders.',
        time: '03:00 PM',
        status: 'todo',
        color: 'bg-amber-400',
        priority: 'High',
        progress: 0
    },
    {
        id: 4,
        title: 'Usability Testing',
        desc: 'Primary user testing and usability testing of the prototype.',
        time: '03:45 PM',
        status: 'todo',
        color: 'bg-emerald-400',
        priority: 'Low',
        progress: 0
    }
];

const WEEK_DAYS = [
    { day: 'Mon', date: 11 },
    { day: 'Tue', date: 12 },
    { day: 'Wed', date: 13 },
    { day: 'Thu', date: 14, active: true },
    { day: 'Fri', date: 15 },
    { day: 'Sat', date: 16 },
    { day: 'Sun', date: 17 },
];

export default function AutoSchedule() {
    const [tasks, setTasks] = useState(INITIAL_TASKS);
    const [activeView, setActiveView] = useState('Today');
    const [showTaskPopup, setShowTaskPopup] = useState(false);
    const [showAddTask, setShowAddTask] = useState(false);
    const [showPriorityPopup, setShowPriorityPopup] = useState(false);
    const [showAIPopup, setShowAIPopup] = useState(false);

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
                                    <motion.div
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowTaskPopup(true)}
                                        className="min-w-[280px] bg-[#FF8A71] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-orange-200 cursor-pointer relative overflow-hidden group"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-10 -mt-10" />
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                                    <Layers className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-black">48%</div>
                                                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Progress</div>
                                                </div>
                                            </div>
                                            <h4 className="text-2xl font-black mb-2">Team Meeting 🙌</h4>
                                            <p className="text-sm opacity-80 mb-6 font-medium">Group discussion for the new product.</p>
                                            <div className="text-xl font-black">10:00 AM</div>
                                            <div className="mt-4 w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                                                <div className="w-[48%] h-full bg-white rounded-full" />
                                            </div>
                                        </div>
                                    </motion.div>

                                    <div className="min-w-[280px] bg-rose-400 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-rose-200 cursor-pointer relative overflow-hidden">
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                                    <Target className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-black">Hold</div>
                                                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Status</div>
                                                </div>
                                            </div>
                                            <h4 className="text-2xl font-black mb-2">UI Design 🏀</h4>
                                            <p className="text-sm opacity-80 mb-6 font-medium">Make a home page for the olakart app.</p>
                                            <div className="text-xl font-black">11:00 AM</div>
                                            <div className="mt-4 w-full h-1.5 bg-white/20 rounded-full" />
                                        </div>
                                    </div>
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
                                {WEEK_DAYS.map(day => (
                                    <button
                                        key={day.date}
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
                                            key={task.id}
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
                                            key={task.id}
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
                                            <div className="w-8 h-8 rounded-full border border-orange-100 flex items-center justify-center">
                                                <ChevronRight className="w-4 h-4 text-orange-200 group-hover:text-[#FF8A71]" />
                                            </div>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            </div>

                            <div className="p-8 pt-0">
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
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-orange-400 ml-1">Task Title</label>
                                    <input
                                        type="text"
                                        placeholder="What's the plan?"
                                        className="w-full bg-orange-50/50 border-none rounded-2xl py-5 px-6 focus:ring-2 focus:ring-[#FF8A71]/20 text-slate-800 placeholder:text-orange-200"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1 space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-orange-400 ml-1">Time</label>
                                        <div className="relative">
                                            <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-300" />
                                            <input
                                                type="text"
                                                placeholder="09:00 AM"
                                                className="w-full bg-orange-50/50 border-none rounded-2xl py-5 pl-12 pr-4 focus:ring-2 focus:ring-[#FF8A71]/20 text-slate-800 placeholder:text-orange-200"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-orange-400 ml-1">Status</label>
                                        <select className="w-full bg-orange-50/50 border-none rounded-2xl py-5 px-6 focus:ring-2 focus:ring-[#FF8A71]/20 text-slate-800 appearance-none font-bold">
                                            <option>To-Do</option>
                                            <option>Progress</option>
                                        </select>
                                    </div>
                                </div>
                                <button className="w-full bg-[#FF8A71] text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-orange-200 active:scale-95 transition-all mt-4 uppercase tracking-widest text-sm">
                                    Create Task
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* 3. Priority Popup (for To-Do) */}
                {showPriorityPopup && (
                    <motion.div
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
                                        placeholder="E.g. I need more focus time in the morning, move all meetings after 2 PM..."
                                        className="w-full bg-orange-50/30 border-none rounded-[2rem] p-6 text-sm focus:ring-2 focus:ring-[#FF8A71]/20 resize-none placeholder:text-orange-200 text-slate-800"
                                    />
                                </div>
                                <button className="w-full bg-[#FF8A71] text-white font-black py-5 rounded-[1.5rem] flex items-center justify-center gap-4 shadow-xl shadow-orange-100 group active:scale-95 transition-all">
                                    <span className="uppercase tracking-widest text-sm font-black">Plan Schedule</span>
                                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
        </div>
    );
}
