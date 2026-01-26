import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useMode } from '../context/ModeContext';
import { cn } from '../lib/utils';
import { Sun, Moon, Home, Briefcase, User, LogOut, Heart, Calendar, Utensils, Shield, Activity, Truck, Phone, ChevronLeft, ChevronRight, LayoutGrid, RotateCcw, MessageSquare } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
    const { theme, setTheme } = useTheme();
    const { switchMode, mode } = useMode();
    const { user, userProfile, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname.startsWith('/home');
    const isWork = location.pathname.startsWith('/work');
    const isProfile = location.pathname.startsWith('/profile');

    // Avatar shuffle state
    const [avatarSeed, setAvatarSeed] = useState(0);
    const [imgError, setImgError] = useState(false);

    // Safely access profile data
    const displayName = userProfile?.displayName || user?.displayName || 'User';


    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const homeItems = [
        { icon: Heart, label: 'Period Tracker', path: '/home/period-tracker' },
        { icon: Utensils, label: 'Diet Planner', path: '/home/diet-planner' },
        { icon: Calendar, label: 'Reminders', path: '/home/appointments' },
        { icon: User, label: 'Profile', path: '/profile' },
    ];

    const workItems = [
        { icon: LayoutGrid, label: 'Dashboard', path: '/work/dashboard' },
        { icon: Shield, label: 'Tone Shield', path: '/work/tone-shield' },
        { icon: MessageSquare, label: 'Assistant', path: '/work/scheduler' },
        { icon: Activity, label: 'Burnout Watch', path: '/work/burnout' },
        { icon: Calendar, label: 'Auto Scheduler', path: '/work/auto-schedule' },
        { icon: Phone, label: 'Helpline', path: '/work/helpline' },
        { icon: Truck, label: 'Safe Cab', path: '/work/cab' },
        { icon: User, label: 'Profile', path: '/profile' },
    ];

    const items = (isHome || mode === 'home') ? homeItems : workItems;

    // Logic: 1. Google/User Photo, 2. DiceBear Avatar, 3. Fallback Icon
    const avatarUrl = !imgError && user?.photoURL
        ? user.photoURL
        : `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(displayName + avatarSeed)}&backgroundColor=ffdfbf`;

    if (!isHome && !isWork && !isProfile) return null;

    return (
        <motion.div
            animate={{ width: isOpen ? 288 : 96 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className={cn(
                "fixed left-6 top-6 bottom-6 flex flex-col z-[100] transition-colors duration-500 overflow-hidden",
                "bg-[#FFF8F5]/90 backdrop-blur-2xl border border-white/50 shadow-2xl shadow-orange-900/10 rounded-[3rem]"
            )}
        >
            {/* Collapse Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute -right-0 top-1/2 -translate-y-1/2 w-6 h-12 bg-[#FF8A71] text-white rounded-l-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform z-[110]"
            >
                {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {/* Profile Section */}
            <div className={cn("p-6 flex flex-col items-center", isOpen ? "mb-4" : "mb-2")}>
                <div className="relative group">
                    <motion.button
                        layout
                        onClick={() => navigate('/profile')}
                        className={cn(
                            "rounded-full border-4 border-white shadow-xl bg-[#FF8A71]/10 flex items-center justify-center overflow-hidden transition-all hover:scale-110 active:scale-95",
                            isOpen ? "w-24 h-24 mb-4" : "w-12 h-12"
                        )}
                    >
                        {imgError && !avatarUrl.includes('dicebear') ? (
                            <User className="w-1/2 h-1/2 text-[#FF8A71]" />
                        ) : (
                            <img
                                src={avatarUrl}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                onError={() => setImgError(true)}
                            />
                        )}
                    </motion.button>

                    {/* Shuffle Button - Visible on hover when open */}
                    {isOpen && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setAvatarSeed(prev => prev + 1); }}
                            className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md border border-orange-100 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-orange-50 text-orange-400"
                            title="Shuffle Avatar"
                        >
                            <RotateCcw className="w-3 h-3" />
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-center mt-4"
                        >
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">{displayName}</h3>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Mode Switcher */}
            <div className="px-4 mb-6">
                <button
                    onClick={() => switchMode(isHome ? 'work' : 'home')}
                    className={cn(
                        "w-full flex items-center gap-4 p-3 rounded-2xl text-sm font-black transition-all border-b-4",
                        isHome
                            ? "bg-[#FFF1EE] border-orange-100 text-[#FF8A71] shadow-orange-100/50"
                            : "bg-[#EEF1FF] border-blue-100 text-[#4C6FFF] shadow-blue-100/50",
                        !isOpen && "justify-center px-0"
                    )}
                >
                    {isHome ? <Briefcase className="w-5 h-5 shrink-0" /> : <Home className="w-5 h-5 shrink-0" />}
                    {isOpen && <span className="uppercase tracking-widest text-[10px]">Switch to {isHome ? 'Work' : 'Home'}</span>}
                </button>
            </div>

            {/* Nav Items */}
            <div className="flex-1 px-4 py-2 space-y-3 overflow-y-auto no-scrollbar">
                <p className={cn("text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2", !isOpen && "text-center ml-0")}>Main</p>
                {items.map((item) => {
                    const isActive = location.pathname === item.path || (item.label === 'Dashboard' && location.pathname === '/work');
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "w-full flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group relative",
                                isActive
                                    ? "bg-[#FF8A71] text-white shadow-xl shadow-orange-200"
                                    : "hover:bg-white text-slate-400 hover:text-[#FF8A71]",
                                !isOpen && "justify-center"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5 shrink-0", !isOpen ? "scale-110" : "")} />
                            {isOpen && (
                                <span className="font-bold ml-4 tracking-tight">{item.label}</span>
                            )}
                            {!isOpen && isActive && (
                                <motion.div
                                    layoutId="active-nav-dot"
                                    className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"
                                />
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Bottom Section */}
            <div className="p-4 bg-white/50 backdrop-blur-sm rounded-t-[3rem] mt-2 border-t border-white/50 space-y-4">
                <div className={cn("flex gap-3", !isOpen && "flex-col items-center")}>
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="flex-1 w-full bg-[#FF8A71]/10 text-[#FF8A71] p-3 rounded-2xl flex items-center justify-center hover:bg-[#FF8A71]/20 transition-colors"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex-1 w-full bg-slate-900 text-white p-3 rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>

        </motion.div>
    );
};

export default Sidebar;
