import React from 'react';
import { FeatureGuidePopup } from './FeatureGuidePopup';
import { CalendarHeart } from 'lucide-react';

export const PeriodTrackerMiniPopup: React.FC = () => {
    return (
        <FeatureGuidePopup
            title="Period Tracker"
            description="The Period Tracker lets you track your cycle days while offering gentle insights into your current phase and energy levels. It predicts upcoming periods so you can prepare in advance and stay in rhythm with your body. By logging moods and symptoms, you create a clearer picture of your health patterns. This feature is designed to support balance, awareness, and everyday wellness."
            gradientClass="from-purple-400 to-indigo-400"
            icon={<CalendarHeart className="w-6 h-6" />}
            iconBgClass="bg-purple-100 dark:bg-purple-900/30"
            iconColorClass="text-purple-500"
            storageKey="period-tracker-popup-dismissed"
        />
    );
};
