import React from 'react';
import { FeatureGuidePopup } from './FeatureGuidePopup';
import { FileChartPie } from 'lucide-react';

export const DietPlannerMiniPopup: React.FC = () => {
    return (
        <FeatureGuidePopup
            title="Diet Planner"
            description="The Diet Planner uses AI to analyze photos of your food and generate detailed nutritional insights in seconds. It shows calorie counts and macro breakdowns so you know exactly what you’re consuming. You can add meals directly to your daily log and view them inside your meal plan dashboard. This feature supports mindful eating, consistency, and better nutrition planning."
            gradientClass="from-emerald-400 to-teal-400"
            icon={<FileChartPie className="w-6 h-6" />}
            iconBgClass="bg-teal-100 dark:bg-teal-900/30"
            iconColorClass="text-teal-600"
            storageKey="diet-planner-popup-dismissed"
        />
    );
};
