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
    isSameMonth
} from 'date-fns';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface PeriodCalendarProps {
    selectedDate: Date | null;
    onSelect: (date: Date) => void;
    onLogPeriod: () => void;
}

const PeriodCalendar = ({ selectedDate, onSelect, onLogPeriod }: PeriodCalendarProps) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dayList = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-xl font-bold text-slate-800">
                    {format(currentMonth, 'MMMM yyyy')}
                </div>
                <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 mb-4">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-xs font-bold text-slate-400 mb-4">
                        {day}
                    </div>
                ))}

                {dayList.map((day, i) => {
                    let isPeriodDay = false;
                    let isStartDate = false;

                    if (selectedDate) {
                        const start = new Date(selectedDate);
                        start.setHours(0, 0, 0, 0);
                        const checkDay = new Date(day);
                        checkDay.setHours(0, 0, 0, 0);

                        const diffTime = checkDay.getTime() - start.getTime();
                        const diffDays = diffTime / (1000 * 60 * 60 * 24);

                        if (diffDays >= 0 && diffDays < 5) {
                            isPeriodDay = true;
                        }
                        if (diffDays === 0) {
                            isStartDate = true;
                        }
                    }

                    const isCurrentMonth = isSameMonth(day, monthStart);

                    return (
                        <div key={i} className="flex justify-center mb-2">
                            <button
                                onClick={() => onSelect(day)}
                                className={`
                                    h-12 w-12 rounded-2xl flex items-center justify-center text-sm font-medium transition-all relative
                                    ${!isCurrentMonth ? 'text-slate-200' : 'text-slate-600'}
                                    ${isStartDate
                                        ? 'bg-rose-500 text-white font-bold shadow-lg shadow-rose-200 scale-110 z-10'
                                        : isPeriodDay
                                            ? 'bg-rose-100 text-rose-600 font-bold border border-rose-100'
                                            : 'hover:bg-slate-50'}
                                `}
                            >
                                {format(day, 'd')}
                                {isStartDate && (
                                    <span className="absolute -bottom-1 w-1 h-1 bg-white rounded-full opacity-50"></span>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-center mt-6">
                <button
                    onClick={onLogPeriod}
                    className="flex items-center gap-2 bg-[#FF4D6D] text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-rose-200 hover:shadow-xl hover:bg-[#ff3355] transition-all active:scale-95"
                >
                    <Check className="w-5 h-5" />
                    Log Period
                </button>
            </div>
            <p className="text-center text-xs text-slate-400 mt-4 font-medium">Click a date to select start of period</p>
        </div>
    );
};

export default PeriodCalendar;
