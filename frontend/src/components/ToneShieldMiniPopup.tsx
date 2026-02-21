import React from 'react';
import { FeatureGuidePopup } from './FeatureGuidePopup';
import { Shield } from 'lucide-react';

export const ToneShieldMiniPopup: React.FC = () => {
    return (
        <FeatureGuidePopup
            title="Tone Shield"
            description="Tone Shield is an AI-powered protection layer that monitors incoming communication and adapts to your real-time stress levels. It analyzes the emotional tone of messages to soften aggressive or overwhelming language before it reaches you. By filtering stressful notifications and highlighting safer, calmer communication, it helps reduce emotional load throughout the day. This feature is designed to support focus, mental well-being, and burnout prevention."
            gradientClass="from-blue-400 to-indigo-400"
            icon={<Shield className="w-6 h-6" />}
            iconBgClass="bg-blue-100 dark:bg-blue-900/30"
            iconColorClass="text-blue-500"
            storageKey="tone-shield-popup-dismissed"
        />
    );
};
