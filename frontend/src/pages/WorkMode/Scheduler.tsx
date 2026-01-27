import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Calendar as CalIcon, CheckSquare, Users, MessageSquare, Plus, Clock, Trash2, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { AssistantMiniPopup } from '../../components/AssistantMiniPopup';
import {
    sendChatMessage,
    getSessions,
    createSession,
    clearSession,
    getSessionHistory,

    generateSchedulerSchedule,
    getSchedulerSchedule,
    getTasks,
    addTask,
    updateTask,
    deleteTask
} from '../../services/api';

const Scheduler = () => {
    // Auth context used below
    const [activeTab, setActiveTab] = useState<'chat' | 'tasks' | 'schedule' | 'team'>('chat');

    // Chat State
    const [sessions, setSessions] = useState<any[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Data State
    const [schedule, setSchedule] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<any>(null);
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        estimated_hours: 1,
        deadline: ''
    });

    const { user } = useAuth(); // Get User

    // Fetch Initial Data
    useEffect(() => {
        if (user) {
            loadSessions(user.uid);
            loadSchedule();
            loadTasks();
        }
    }, [user]);

    // React to Session Change
    useEffect(() => {
        if (currentSessionId) {
            loadHistory(currentSessionId);
        }
    }, [currentSessionId]);

    // Auto-scroll to bottom
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadSessions = async (uid: string) => {
        try {
            const data = await getSessions(uid);
            setSessions(data);
            if (data.length > 0 && !currentSessionId) {
                setCurrentSessionId(data[0].id);
            } else if (data.length === 0) {
                handleNewChat(uid);
            }
        } catch (e) { console.error(e); }
    };

    const handleNewChat = async (uid: string = user?.uid || "") => {
        try {
            const newSession = await createSession("New Chat", uid);
            setSessions([newSession, ...sessions]); // Prepend
            setCurrentSessionId(newSession.id);
            setMessages([]);
        } catch (e) { console.error(e); }
    };

    const handleDeleteChat = async (id: number) => {
        try {
            await clearSession(id);
            setSessions(sessions.filter(s => s.id !== id));
            if (currentSessionId === id) {
                setCurrentSessionId(null);
                setMessages([]);
            }
        } catch (e) { console.error(e); }
    };

    const loadHistory = async (id: number) => {
        try {
            const hist = await getSessionHistory(id);
            setMessages(hist);
        } catch (e) { console.error(e); }
    };

    const loadSchedule = async () => {
        try {
            const data = await getSchedulerSchedule(user?.uid);
            setSchedule(data);
        } catch (e) { console.error(e); }
    };

    const loadTasks = async () => {
        try {
            const data = await getTasks(true, user?.uid);
            setTasks(data);
        } catch (e) { console.error(e); }
    };

    const handleSaveTask = async () => {
        try {
            if (editingTask) {
                await updateTask(editingTask.id, { ...taskForm, user_id: user?.uid });
            } else {
                await addTask(taskForm, user?.uid);
            }
            setIsTaskModalOpen(false);
            loadTasks();
        } catch (e) { console.error(e); }
    };

    const handleDeleteTask = async (id: number) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            await deleteTask(id, user?.uid);
            setTasks(tasks.filter(t => t.id !== id));
        } catch (e) {
            console.error(e);
            alert("Failed to delete task");
        }
    };

    const handleSend = async () => {
        if (!input.trim() || !currentSessionId) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await sendChatMessage(userMsg.content, currentSessionId, user?.uid);
            const botMsg = { role: 'assistant', content: res.response };
            setMessages(prev => [...prev, botMsg]);

            // Handle Side Effects
            if (res.action_performed === 'add_task' || res.action_performed === 'delete_task') {
                loadTasks();
            } else if (res.action_performed === 'manage_schedule') {
                loadSchedule();
            }
        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-4 md:gap-6 relative">
            <AssistantMiniPopup />
            {/* Sidebar Navigation for Scheduler */}
            <div className="w-full md:w-64 shrink-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] p-4 md:p-6 border border-white dark:border-slate-800 flex flex-col shadow-xl shadow-orange-100/20 dark:shadow-none max-h-[30vh] md:max-h-full">
                <div className="mb-4 md:mb-8 flex items-center justify-between md:block">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tighter">Assistant</h2>
                        <p className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">AI Assistant</p>
                    </div>
                </div>

                <nav className="grid grid-cols-2 gap-2 md:space-y-2 md:block flex-1 overflow-y-auto md:overflow-visible">
                    {[
                        { id: 'chat', icon: MessageSquare, label: 'Chat' },
                        { id: 'schedule', icon: CalIcon, label: 'Schedule' },
                        { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
                        { id: 'team', icon: Users, label: 'Team' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "w-full flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-2xl transition-all font-bold text-xs md:text-sm",
                                activeTab === tab.id
                                    ? "bg-slate-900 dark:bg-rose-500 text-white shadow-lg shadow-slate-200 dark:shadow-none"
                                    : "hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            )}
                        >
                            <tab.icon className="w-4 h-4 md:w-5 md:h-5" />
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Session List (Only visible in Chat mode, Hidden on Mobile for space) */}
                {activeTab === 'chat' && (
                    <div className="mt-8 border-t border-slate-100 pt-6 flex-1 overflow-hidden hidden md:flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">History</span>
                            <button onClick={() => handleNewChat(user?.uid)} className="p-2 hover:bg-orange-50 text-orange-400 rounded-full transition-colors active:scale-95">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="overflow-y-auto space-y-2 pr-2 custom-scrollbar flex-1">
                            {sessions.map(sess => (
                                <div key={sess.id} className="group flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentSessionId(sess.id)}
                                        className={cn(
                                            "flex-1 text-left p-3 rounded-xl text-xs font-bold truncate transition-colors",
                                            currentSessionId === sess.id ? "bg-orange-50 text-orange-600" : "hover:bg-white text-slate-500"
                                        )}
                                    >
                                        {sess.title.replace(/"/g, '')}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteChat(sess.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-red-300 hover:text-red-500 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-orange-100/20 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden relative">

                {/* CHAT VIEW */}
                {activeTab === 'chat' && (
                    <div className="h-full flex flex-col relative overflow-hidden">
                        {/* Decorative Background Blobs */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2" />

                        {/* Header */}
                        <div className="p-6 border-b border-white/50 dark:border-slate-800 flex items-center justify-between bg-white/40 dark:bg-slate-900/40 backdrop-blur-md z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF8A71] to-[#FF6B6B] flex items-center justify-center text-white shadow-lg shadow-orange-200/50 dark:shadow-none">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 dark:text-white text-lg tracking-tight">Flourish Assistant</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Online</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 space-y-6 custom-scrollbar relative z-0">
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <div className="w-24 h-24 bg-gradient-to-tr from-orange-100 to-orange-50 dark:from-slate-800 dark:to-slate-800 rounded-[2rem] flex items-center justify-center mb-6 shadow-lg border border-orange-100 dark:border-slate-700">
                                        <MessageSquare className="w-10 h-10 text-[#FF8A71] dark:text-rose-400" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">How can I help you thrive?</h3>
                                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed">I can schedule meetings, manage tasks, or just chat about your day.</p>
                                </div>
                            )}

                            {messages.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                    key={i}
                                    className={cn("flex gap-4 max-w-[90%] md:max-w-[75%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md border-2 border-white dark:border-slate-700",
                                        msg.role === 'user' ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-gradient-to-br from-[#FF8A71] to-[#FF6B6B] text-white"
                                    )}>
                                        {msg.role === 'user' ? <User className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                                    </div>
                                    <div className={cn(
                                        "p-5 rounded-[1.5rem] text-sm font-medium leading-relaxed shadow-sm relative",
                                        msg.role === 'user'
                                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-tr-sm"
                                            : "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white dark:border-slate-700 text-slate-600 dark:text-slate-200 rounded-tl-sm shadow-orange-100/50 dark:shadow-none"
                                    )}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF8A71] to-[#FF6B6B] text-white border-2 border-white flex items-center justify-center shrink-0 shadow-md">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <div className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-[1.5rem] rounded-tl-sm border border-white flex gap-1.5 items-center shadow-sm">
                                        <div className="w-2 h-2 bg-[#FF8A71] rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-[#FF8A71] rounded-full animate-bounce delay-75" />
                                        <div className="w-2 h-2 bg-[#FF8A71] rounded-full animate-bounce delay-150" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="pt-4 px-4 md:pt-6 md:px-6 pb-0 bg-gradient-to-t from-[#FFF8F5] dark:from-slate-900/50 to-transparent z-10 w-full absolute bottom-0">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex gap-2 bg-white dark:bg-slate-800 p-2 pl-6 rounded-[2rem] border border-orange-100 dark:border-slate-700 shadow-[0_20px_40px_-10px_rgba(255,138,113,0.15)] dark:shadow-none focus-within:shadow-[0_20px_40px_-5px_rgba(255,138,113,0.25)] dark:focus-within:shadow-none focus-within:border-[#FF8A71]/50 dark:focus-within:border-rose-500/50 transition-all duration-300 relative group"
                            >
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 h-12"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="w-12 h-12 bg-gradient-to-tr from-[#FF8A71] to-[#FF6B6B] text-white rounded-[1.5rem] flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-orange-200"
                                >
                                    <Send className="w-5 h-5 translate-x-0.5 translate-y-0.5" />
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* SCHEDULE VIEW */}
                {activeTab === 'schedule' && (
                    <div className="h-full p-8 overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">Schedule</h2>
                            <button onClick={() => generateSchedulerSchedule()} className="bg-slate-900 dark:bg-rose-500 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-rose-600 transition-all flex items-center gap-2 shadow-lg dark:shadow-rose-900/20">
                                <Clock className="w-4 h-4" /> Optimize
                            </button>
                        </div>
                        <div className="space-y-4">
                            {schedule.map((slot, i) => (
                                <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-6 group hover:border-blue-100 dark:hover:border-rose-500/50 transition-colors">
                                    <div className="w-20 text-center">
                                        <div className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{slot.scheduled_day}</div>
                                        <div className="text-lg font-black text-slate-800 dark:text-white">{slot.start_time}</div>
                                    </div>
                                    <div className="w-1 h-12 bg-slate-100 dark:bg-slate-700 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-rose-500 transition-colors" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800 dark:text-white mb-1">{slot.task_title}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-1 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-wide">{slot.emp_name}</span>
                                            <span className={cn(
                                                "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide",
                                                slot.priority === 'High' ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                                            )}>{slot.priority} Priority</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {schedule.length === 0 && (
                                <div className="text-center py-20 text-slate-400">
                                    <CalIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p className="font-bold">No schedule generated yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TASKS VIEW */}
                {activeTab === 'tasks' && (
                    <div className="h-full p-8 overflow-y-auto relative">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">Tasks</h2>
                                <p className="text-slate-500 font-bold text-sm">Manage your todo list</p>
                            </div>
                            <button
                                onClick={() => {
                                    setEditingTask(null);
                                    setTaskForm({ title: '', description: '', priority: 'Medium', estimated_hours: 1, deadline: '' });
                                    setIsTaskModalOpen(true);
                                }}
                                className="bg-slate-900 dark:bg-rose-500 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-rose-600 transition-all flex items-center gap-2 shadow-lg"
                            >
                                <Plus className="w-4 h-4" /> Add Task
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {tasks.map((task) => (
                                <div key={task.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm group hover:shadow-md transition-all relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={cn(
                                            "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide",
                                            task.priority === 'High' ? "bg-red-50 text-red-500" :
                                                task.priority === 'Medium' ? "bg-blue-50 text-blue-500" : "bg-green-50 text-green-500"
                                        )}>{task.priority}</span>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setEditingTask(task);
                                                    setTaskForm({
                                                        title: task.title,
                                                        description: task.description || '',
                                                        priority: task.priority,
                                                        estimated_hours: task.estimated_hours,
                                                        deadline: task.deadline || ''
                                                    });
                                                    setIsTaskModalOpen(true);
                                                }}
                                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-500 transition-colors"
                                            >
                                                <CheckSquare className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">{task.title}</h3>
                                    {task.description && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{task.description}</p>
                                    )}
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 mt-auto pt-4 border-t border-slate-50 dark:border-slate-700/50">
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {task.estimated_hours}h</span>
                                        {task.deadline && <span>Due: {task.deadline}</span>}
                                    </div>
                                </div>
                            ))}
                            {tasks.length === 0 && (
                                <div className="col-span-full text-center py-20 text-slate-400">
                                    <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p className="font-bold">No tasks yet. Add one to get started!</p>
                                </div>
                            )}
                        </div>

                        {/* Task Modal */}
                        {isTaskModalOpen && (
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-6">
                                        {editingTask ? 'Edit Task' : 'New Task'}
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Title</label>
                                            <input
                                                value={taskForm.title}
                                                onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                placeholder="Task name"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Description</label>
                                            <textarea
                                                value={taskForm.description}
                                                onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 font-medium text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-24"
                                                placeholder="Add details..."
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Priority</label>
                                                <select
                                                    value={taskForm.priority}
                                                    onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                >
                                                    <option>High</option>
                                                    <option>Medium</option>
                                                    <option>Low</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Hours</label>
                                                <input
                                                    type="number"
                                                    value={taskForm.estimated_hours}
                                                    onChange={e => setTaskForm({ ...taskForm, estimated_hours: parseFloat(e.target.value) })}
                                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                    min="0.5"
                                                    step="0.5"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Deadline (Optional)</label>
                                            <input
                                                type="text"
                                                value={taskForm.deadline}
                                                onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="e.g., Friday 5pm"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-4 mt-8">
                                        <button
                                            onClick={() => setIsTaskModalOpen(false)}
                                            className="flex-1 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveTask}
                                            className="flex-1 bg-slate-900 dark:bg-rose-500 text-white py-4 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                                        >
                                            {editingTask ? 'Update Task' : 'Create Task'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}


                {/* TEAM VIEW */}
                {activeTab === 'team' && (
                    <div className="h-full flex items-center justify-center flex-col text-slate-400 dark:text-slate-500">
                        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl mb-4">
                            <Users className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">Team Coming Soon</h3>
                        <p className="text-sm font-bold max-w-xs text-center">Manage your team members here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Scheduler;
