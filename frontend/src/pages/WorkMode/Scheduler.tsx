import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Calendar as CalIcon, CheckSquare, Users, MessageSquare, Plus, Clock, Trash2, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
    sendChatMessage,
    getSessions,
    createSession,
    clearSession,
    getSessionHistory,

    generateSchedulerSchedule,
    getSchedulerSchedule
} from '../../services/api';

const Scheduler = () => {
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

    // Fetch Initial Data
    useEffect(() => {
        loadSessions();
        loadSchedule();
    }, []);

    useEffect(() => {
        if (currentSessionId) {
            loadHistory(currentSessionId);
        }
    }, [currentSessionId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadSessions = async () => {
        try {
            const data = await getSessions();
            setSessions(data);
            if (data.length > 0 && !currentSessionId) {
                setCurrentSessionId(data[0].id);
            } else if (data.length === 0) {
                handleNewChat();
            }
        } catch (e) { console.error(e); }
    };

    const handleNewChat = async () => {
        try {
            const newSession = await createSession();
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
            const data = await getSchedulerSchedule();
            setSchedule(data);
        } catch (e) { console.error(e); }
    }

    const handleSend = async () => {
        if (!input.trim() || !currentSessionId) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await sendChatMessage(userMsg.content, currentSessionId);
            const botMsg = { role: 'assistant', content: res.response };
            setMessages(prev => [...prev, botMsg]);

            // Handle Side Effects
            if (res.action_performed === 'add_task') {
                // loadTasks(); // Disabled until tasks UI is ready
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
        <div className="h-[calc(100vh-4rem)] flex gap-6">
            {/* Sidebar Navigation for Scheduler */}
            <div className="w-64 bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white flex flex-col shadow-xl shadow-orange-100/20">
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tighter">Assistant</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Assistant</p>
                </div>

                <nav className="space-y-2 flex-1">
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
                                "w-full flex items-center gap-3 p-4 rounded-2xl transition-all font-bold text-sm",
                                activeTab === tab.id
                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                                    : "hover:bg-white text-slate-500 hover:text-slate-800"
                            )}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Session List (Only visible in Chat mode) */}
                {activeTab === 'chat' && (
                    <div className="mt-8 border-t border-slate-100 pt-6 flex-1 overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">History</span>
                            <button onClick={handleNewChat} className="p-2 hover:bg-orange-50 text-orange-400 rounded-full transition-colors active:scale-95">
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
            <div className="flex-1 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl shadow-orange-100/20 border border-white overflow-hidden relative">

                {/* CHAT VIEW */}
                {activeTab === 'chat' && (
                    <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white/50 backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 text-lg">Assistant</h3>
                                    <p className="text-xs font-bold text-slate-400">Online • Ready to help</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#FAFAFA]/50">
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                    <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
                                        <MessageSquare className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 mb-2">How can I help?</h3>
                                    <p className="text-sm font-bold text-slate-400 max-w-xs">I can schedule meetings, add tasks, or just chat about your day.</p>
                                </div>
                            )}

                            {messages.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={i}
                                    className={cn("flex gap-4 max-w-[80%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                        msg.role === 'user' ? "bg-slate-800 text-white" : "bg-white text-blue-500 border border-blue-100"
                                    )}>
                                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                                    </div>
                                    <div className={cn(
                                        "p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm",
                                        msg.role === 'user'
                                            ? "bg-slate-800 text-white rounded-tr-none"
                                            : "bg-white text-slate-600 border border-slate-100 rounded-tl-none"
                                    )}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-xl bg-white text-blue-500 border border-blue-100 flex items-center justify-center shrink-0">
                                        <MessageSquare className="w-4 h-4" />
                                    </div>
                                    <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 flex gap-1 items-center">
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75" />
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-slate-100">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex gap-2 bg-slate-50 p-2 rounded-[1.5rem] border border-slate-100 focus-within:border-blue-200 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-blue-50/50 transition-all duration-300"
                            >
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent px-4 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400"
                                />
                                <button type="submit" disabled={!input.trim()} className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100">
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* SCHEDULE VIEW */}
                {activeTab === 'schedule' && (
                    <div className="h-full p-8 overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Schedule</h2>
                            <button onClick={() => generateSchedulerSchedule()} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Optimize
                            </button>
                        </div>
                        <div className="space-y-4">
                            {schedule.map((slot, i) => (
                                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-blue-100 transition-colors">
                                    <div className="w-20 text-center">
                                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{slot.scheduled_day}</div>
                                        <div className="text-lg font-black text-slate-800">{slot.start_time}</div>
                                    </div>
                                    <div className="w-1 h-12 bg-slate-100 rounded-full group-hover:bg-blue-200 transition-colors" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800 mb-1">{slot.task_title}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wide">{slot.emp_name}</span>
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

                {/* OTHER TABS SIMPLIFIED FOR NOW */}
                {(activeTab === 'tasks' || activeTab === 'team') && (
                    <div className="h-full flex items-center justify-center flex-col text-slate-400">
                        <div className="bg-slate-50 p-6 rounded-3xl mb-4">
                            {activeTab === 'tasks' ? <CheckSquare className="w-10 h-10" /> : <Users className="w-10 h-10" />}
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Coming Soon</h3>
                        <p className="text-sm font-bold max-w-xs text-center">This section is being migrated from the legacy system. Please use the Chat to manage tasks/team for now.</p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Scheduler;
