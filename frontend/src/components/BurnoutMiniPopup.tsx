import React from 'react';
import { FeatureGuidePopup } from './FeatureGuidePopup';
import { Activity } from 'lucide-react';

export const BurnoutMiniPopup: React.FC = () => {
    return (
        <FeatureGuidePopup
            title="Burnout Check"
            description="The Burnout Check helps you quickly understand your mental energy and burnout risk by analyzing your workload, stress, sleep, and overall well-being. You can either adjust simple inputs or describe your week, and the AI will automatically generate burnout-related metrics. It evaluates areas like stress level, work-life balance, support systems, and job satisfaction. This feature is designed for early detection, helping you recognize patterns and take action before burnout builds up."
            gradientClass="from-rose-400 to-purple-400"
            icon={<Activity className="w-6 h-6" />}
            iconBgClass="bg-rose-100 dark:bg-rose-900/30"
            iconColorClass="text-rose-600"
            storageKey="burnout-popup-dismissed"
        />
    );
};
