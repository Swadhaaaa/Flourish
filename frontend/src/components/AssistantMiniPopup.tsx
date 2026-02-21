import React from 'react';
import { FeatureGuidePopup } from './FeatureGuidePopup';
import { BotMessageSquare } from 'lucide-react';

export const AssistantMiniPopup: React.FC = () => {
    return (
        <FeatureGuidePopup
            title="Assistant"
            description="The Assistant is your always-available AI companion designed to help you chat, plan, and stay organized throughout the day. It allows you to schedule meetings, manage reminders, and have natural conversations in one place. You can use it to quickly get support, organize your day, or simply talk things through. This feature is built to improve productivity, clarity, and everyday flow."
            gradientClass="from-blue-500 to-cyan-400"
            icon={<BotMessageSquare className="w-6 h-6" />}
            iconBgClass="bg-cyan-100 dark:bg-cyan-900/30"
            iconColorClass="text-cyan-600"
            storageKey="assistant-popup-dismissed"
        />
    );
};
