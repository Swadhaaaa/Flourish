import React from 'react';
import { FeatureGuidePopup } from './FeatureGuidePopup';
import { BellRing } from 'lucide-react';

export const RemindersMiniPopup: React.FC = () => {
    return (
        <FeatureGuidePopup
            title="Reminders"
            description="The Reminders feature helps you schedule consultations and manage important health-related alerts in one place. It provides a daily health overview by tracking metrics like weight, steps, hydration, and sleep quality over time. You can select dates, choose available time slots, and stay consistent with wellness routines through timely reminders. This feature is designed to support organization, accountability, and continuous health monitoring."
            gradientClass="from-rose-400 to-pink-400"
            icon={<BellRing className="w-6 h-6" />}
            iconBgClass="bg-pink-100 dark:bg-pink-900/30"
            iconColorClass="text-pink-500"
            storageKey="reminders-popup-dismissed"
        />
    );
};
