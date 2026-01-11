import { motion } from "framer-motion";
import { AlertCircle, TrendingUp, Zap, Calendar } from "lucide-react";

export function WorkloadPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Workload & Mental Load</h1>
                <p className="text-muted">AI-powered analysis of your tasks, meetings, and responsibilities</p>
            </div>

            {/* Pressure Level Card */}
            <div className="p-8 rounded-3xl bg-surface/50 border border-white/10 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-rose-300">Moderate</span>
                </div>

                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-1">Today's Pressure Level</h2>
                    <p className="text-muted text-sm">Based on your schedule and deadlines</p>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                        <span className="text-white font-medium">Current Load</span>
                        <span className="text-white font-bold">65%</span>
                    </div>
                    <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "65%" }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-pink-300 via-rose-400 to-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-yellow-200/80 bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/20">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <p>You have capacity for 2 more medium-priority tasks today. Consider delegating the low-priority items.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Task Breakdown */}
                <div className="p-6 rounded-3xl bg-surface/50 border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">This Week's Tasks</h3>
                        <span className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-muted">18 total</span>
                    </div>

                    <div className="space-y-3">
                        <BreakdownItem label="High Priority" count="6 tasks" icon={AlertCircle} color="text-rose-400" />
                        <BreakdownItem label="Medium Priority" count="8 tasks" icon={TrendingUp} color="text-pink-300" />
                        <BreakdownItem label="Low Priority" count="4 tasks" icon={Zap} color="text-white/60" />
                    </div>
                </div>

                {/* Meeting Breakdown */}
                <div className="p-6 rounded-3xl bg-surface/50 border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">This Week's Meetings</h3>
                        <span className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-muted">12 scheduled</span>
                    </div>

                    <div className="space-y-3">
                        <MeetingItem day="Monday" details="3 meetings • 4 hours" />
                        <MeetingItem day="Wednesday" details="4 meetings • 5.5 hours" highlight />
                        <MeetingItem day="Friday" details="2 meetings • 2 hours" />
                    </div>
                </div>
            </div>

            {/* AI Recommendations */}
            <div className="p-8 rounded-3xl bg-surface/50 border border-white/10 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-6">AI Recommendations</h3>

                <div className="space-y-4">
                    <RecommendationCard
                        title="Reschedule Low-Priority Meeting"
                        description="Your Wednesday is heavily booked. Consider moving the 'Project Sync' to Thursday for better balance."
                        action="View Schedule"
                    />
                    <RecommendationCard
                        title="Delegate Documentation Task"
                        description="The API documentation task could be delegated to free up 3 hours for high-priority work."
                        action="Suggest Delegate"
                    />
                    <RecommendationCard
                        title="Block Focus Time"
                        description="You have no focused work blocks this week. Block 2 hours on Tuesday morning for deep work."
                        action="Add to Calendar"
                    />
                </div>
            </div>
        </div>
    );
}

function BreakdownItem({ label, count, icon: Icon, color }: any) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <span className="text-white font-medium">{label}</span>
            </div>
            <span className="text-white font-bold">{count}</span>
        </div>
    )
}

function MeetingItem({ day, details, highlight }: any) {
    return (
        <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${highlight
            ? "bg-white/5 border-white/10 ring-1 ring-primary/20"
            : "bg-white/5 border-white/5"
            }`}>
            <div className="p-2 rounded-lg bg-white/5 text-pink-300">
                <Calendar className="w-4 h-4" />
            </div>
            <div>
                <h4 className="text-white font-medium mb-1">{day}</h4>
                <p className="text-muted text-sm">{details}</p>
            </div>
        </div>
    )
}

function RecommendationCard({ title, description, action }: any) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
            <div className="space-y-2">
                <h4 className="text-white font-semibold flex items-center gap-2">
                    {title}
                </h4>
                <p className="text-muted text-sm max-w-xl">{description}</p>
            </div>
            <button className="whitespace-nowrap px-4 py-2 rounded-lg bg-transparent border border-white/20 text-white text-sm font-medium hover:bg-primary hover:border-primary hover:text-white transition-all">
                {action}
            </button>
        </div>
    )
}
