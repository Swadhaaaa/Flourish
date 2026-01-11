import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Activity,
    Heart,
    Settings,
    LogOut,
    Sparkles,
    Menu,
    Calendar,
    Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "../lib/firebase";

export function DashboardLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await auth.signOut();
        navigate("/");
    };

    const navItems = [
        { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
        { icon: Calendar, label: "Auto-Scheduler", path: "/dashboard/schedule" },
        { icon: Shield, label: "Tone Shield", path: "/dashboard/shield" },
        { icon: Activity, label: "Workload", path: "/dashboard/workload" },
        { icon: Heart, label: "Wellness", path: "/dashboard/wellness" },
        { icon: Settings, label: "Settings", path: "/dashboard/settings" },
    ];

    return (
        <div className="min-h-screen bg-background flex text-white relative overflow-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 bg-glow-gradient opacity-20 pointer-events-none" />

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0f0814]/90 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 lg:transform-none ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="p-6 flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
                        <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Flourish</span>
                </div>

                <nav className="px-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/dashboard"}
                            className={({ isActive }) => `
                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
                        ${isActive
                                    ? "bg-primary/20 text-primary border border-primary/20"
                                    : "text-muted hover:text-white hover:bg-white/5"
                                }
                    `}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="absolute bottom-6 left-4 right-4">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 h-screen overflow-y-auto relative z-0">
                {/* Mobile Header */}
                <header className="lg:hidden p-4 flex items-center justify-between border-b border-white/10 bg-[#0f0814]/90 backdrop-blur-xl sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
                            <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Flourish</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu className="w-6 h-6 text-white" />
                    </button>
                </header>

                <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
