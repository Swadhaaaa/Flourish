import React from 'react';
import { FeatureGuidePopup } from './FeatureGuidePopup';
import { PhoneCall } from 'lucide-react';

export const HelplineMiniPopup: React.FC = () => {
    return (
        <FeatureGuidePopup
            title="Helpline"
            description="The Helpline feature gives you quick access to essential emergency and support services in one place. It lists verified helpline numbers such as police, ambulance, fire services, pregnancy support, and women and child helplines for immediate assistance. With one-tap calling, it ensures help is always reachable when you need it most. This feature is designed to improve safety, responsiveness, and peace of mind."
            gradientClass="from-purple-400 to-pink-400"
            icon={<PhoneCall className="w-6 h-6" />}
            iconBgClass="bg-fuchsia-100 dark:bg-fuchsia-900/30"
            iconColorClass="text-fuchsia-500"
            storageKey="helpline-popup-dismissed"
        />
    );
};
