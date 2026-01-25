import { useState } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CalendarPopoverProps {
    selectedDate: Date | null;
    onSelect: (date: Date) => void;
    onClose: () => void;
}

const CalendarPopover = ({ selectedDate, onSelect, onClose }: CalendarPopoverProps) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const dayList = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="absolute top-14 right-0 z-50 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 w-80 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="font-bold text-slate-800">
                    {format(currentMonth, 'MMMM yyyy')}
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={nextMonth} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <button onClick={onClose} className="p-1 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500 transition-colors ml-2">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 mb-2">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-1">
                {dayList.map((day, i) => {
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                    const isCurrentMonth = isSameMonth(day, monthStart);

                    return (
                        <button
                            key={i}
                            onClick={() => {
                                onSelect(day);
                                onClose();
                            }}
                            className={`
                                h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium transition-all
                                ${!isCurrentMonth ? 'text-slate-300' : 'text-slate-700'}
                                ${isToday(day) && !isSelected ? 'border border-purple-500 text-purple-600 font-bold' : ''}
                                ${isSelected ? 'bg-purple-600 text-white shadow-md shadow-purple-200 font-bold' : 'hover:bg-slate-50'}
                            `}
                        >
                            {format(day, dateFormat)}
                        </button>
                    );
                })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-50 text-center">
                <button
                    onClick={() => {
                        onSelect(new Date());
                        onClose();
                    }}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700"
                >
                    Jump to Today
                </button>
            </div>
        </div>
    );
};

export default CalendarPopover;
