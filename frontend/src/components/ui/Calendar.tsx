import React from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface CalendarProps {
    currentDate: Date;
    onDateClick: (date: Date) => void;
    onMonthChange: (date: Date) => void;
    highlightDates?: Date[]; // For periods
    marks?: { date: Date; type: 'dot' | 'circle' | 'highlight'; color?: string }[];
}

const Calendar: React.FC<CalendarProps> = ({
    currentDate,
    onDateClick,
    onMonthChange,
    marks = []
}) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="w-full bg-card rounded-3xl p-6 shadow-sm border border-border/50">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-foreground">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => onMonthChange(subMonths(currentDate, 1))}
                        className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onMonthChange(addMonths(currentDate, 1))}
                        className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDays.map((d) => (
                    <div key={d} className="text-center text-sm font-medium text-muted-foreground py-2">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {days.map((day) => {
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isToday = isSameDay(day, new Date());
                    const mark = marks.find(m => isSameDay(m.date, day));

                    return (
                        <motion.button
                            key={day.toISOString()}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onDateClick(day)}
                            className={cn(
                                "relative h-12 rounded-xl flex items-center justify-center text-sm font-medium transition-colors",
                                !isCurrentMonth && "text-muted-foreground/30",
                                isCurrentMonth && "text-foreground hover:bg-accent",
                                isToday && "bg-primary/10 text-primary font-bold border border-primary/20",
                                mark?.type === 'highlight' && "bg-rose-400 text-white hover:bg-rose-500 shadow-md shadow-rose-200 dark:shadow-rose-900/20"
                            )}
                        >
                            {format(day, 'd')}
                            {mark?.type === 'dot' && (
                                <div className={cn("absolute bottom-2 w-1 h-1 rounded-full", mark.color || "bg-primary")} />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default Calendar;
