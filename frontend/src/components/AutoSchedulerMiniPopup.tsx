import React from 'react';
import { FeatureGuidePopup } from './FeatureGuidePopup';
import { CalendarClock } from 'lucide-react';

export const AutoSchedulerMiniPopup: React.FC = () => {
    return (
        <FeatureGuidePopup
            title="Auto Scheduler"
            description="The Auto Scheduler helps you organize and prioritize your tasks by intelligently planning them into your day. It uses AI to structure your backlog, distribute work across Today and Calendar views, and reduce the effort of manual scheduling. By analyzing your tasks and workload, it builds a clearer, more manageable plan. This feature is designed to improve focus, balance, and daily productivity."
            gradientClass="from-blue-400 to-indigo-400"
            icon={<CalendarClock className="w-6 h-6" />}
            iconBgClass="bg-indigo-100 dark:bg-indigo-900/30"
            iconColorClass="text-indigo-600"
            storageKey="auto-scheduler-popup-dismissed"
        />
    );
};
