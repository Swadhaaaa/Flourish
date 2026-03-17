export type CyclePhase = 'Menstrual' | 'Follicular' | 'Ovulation' | 'Luteal';

export interface DailyData {
    dayInCycle: number;
    phase: CyclePhase;
    daysUntilNextPeriod: number;
    energyLevel: 1 | 2 | 3 | 4 | 5; // 1 = Low, 5 = Peak
    mood: string; // "Calm", "Irritable", "Energetic", etc.
    symptoms: string[]; // Potential symptoms for today
    nutrition: {
        keyNutrients: string[];
        recommendedFoods: string[];
        hydrationGoal: number; // liters
        foodsToLimit: string[];
    };
    workLife: {
        focusAdvice: string;
        exerciseType: string;
        mentalHealthTip: string;
    };
    dailyInsight: string; // The GenAI Message
}

// Dynamic Phase Calculation based on user profile
export const calculatePhaseBoundaries = (periodLength: number, cycleLength: number) => {
    // Basic heuristics for phase lengths
    const follicularEnd = Math.max(periodLength + 1, Math.floor(cycleLength / 2) - 1);
    const ovulationStart = follicularEnd + 1;
    const ovulationEnd = ovulationStart + 2; // Generally a 3-day window

    return {
        Menstrual: { start: 1, end: periodLength },
        Follicular: { start: periodLength + 1, end: follicularEnd },
        Ovulation: { start: ovulationStart, end: Math.min(ovulationEnd, cycleLength - 1) },
        Luteal: { start: Math.min(ovulationEnd + 1, cycleLength), end: cycleLength }
    };
};

// --- DATA DICTIONARIES ---

const INSIGHT_TEMPLATES = {
    Menstrual: [
        "Your body is asking for rest today. It's okay to slow down and focus on essential tasks. Treat yourself to a warm tea and iron-rich meals.",
        "Day {day}: Energy might be low, but your intuition is high. Use this time for reflection rather than heavy lifting.",
        "A gentle start is best today. Prioritize comfort and hydration to manage cramps, and stick to light, administrative work if possible."
    ],
    Follicular: [
        "Your energy is on the rise! This is the perfect time to brainstorm new ideas or tackle complex projects.",
        "You're entering your creative peak. Capitalize on this clarity to plan the week ahead. Protein-rich meals will fuel this momentum.",
        "Feeling ambitious? That's the follicular phase magic. Say yes to collaborations and new challenges today."
    ],
    Ovulation: [
        "You're glowing! Confidence and communication skills are at their peak. It's a great day for presentations or important meetings.",
        "Peak energy day! You might feel unstoppable. Channel this into high-impact work or a challenging workout.",
        "Your social battery is fully charged. Connect with your team or network today—you'll leave a lasting impression."
    ],
    Luteal: [
        "As you move into the luteal phase, focus on wrapping things up. Deep work and detail-oriented tasks are your best friends now.",
        "Energy might fluctuate today. Be kind to yourself and prioritize magnesium-rich foods to keep stress at bay.",
        "If you feel a bit irritable, it's just the hormones. Take frequent breaks and focus on solo tasks where you can be undisturbed."
    ]
};

const NUTRITION_RULES = {
    Menstrual: {
        nutrients: ["Iron", "Vitamin C", "Magnesium"],
        foods: ["Spinach", "Lentils", "Dark Chocolate", "Ginger Tea"],
        limit: ["Caffeine", "Salty Foods"],
        hydration: 2.5
    },
    Follicular: {
        nutrients: ["Protein", "B-Vitamins", "Probiotics"],
        foods: ["Eggs", "Yogurt", "Oats", "Berries"],
        limit: ["Processed Sugar"],
        hydration: 2.2
    },
    Ovulation: {
        nutrients: ["Antioxidants", "Zinc", "Fiber"],
        foods: ["Quinoa", "Avocado", "Nuts", "Leafy Greens"],
        limit: ["Heavy Carbs (opt for light)"],
        hydration: 3.0
    },
    Luteal: {
        nutrients: ["Magnesium", "Complex Carbs", "Calcium"],
        foods: ["Sweet Potato", "Dark Leafy Greens", "Bananas", "Salmon"],
        limit: ["Alcohol", "Excess Sodium"],
        hydration: 2.8
    }
};

const WORK_RULES = {
    Menstrual: {
        focus: "Rest & Reflection",
        exercise: "Yoga / Stretching",
        tip: "Avoid back-to-back meetings."
    },
    Follicular: {
        focus: "New Projects & Brainstorming",
        exercise: "Cardio / Running",
        tip: "Set ambitious goals for the week."
    },
    Ovulation: {
        focus: "Communication & Pitching",
        exercise: "HIIT / Strength",
        tip: "Schedule important calls now."
    },
    Luteal: {
        focus: "Deep Work & Completion",
        exercise: "Pilates / Walking",
        tip: "Organize and declutter your workspace."
    }
};

// --- LOGIC ---

export const getPhase = (day: number, periodLength: number = 5, cycleLength: number = 28): CyclePhase => {
    const boundaries = calculatePhaseBoundaries(periodLength, cycleLength);

    if (day <= boundaries.Menstrual.end) return 'Menstrual';
    if (day <= boundaries.Follicular.end) return 'Follicular';
    if (day <= boundaries.Ovulation.end) return 'Ovulation';
    return 'Luteal';
};

export const generateUserDailyData = (day: number = 1, periodLength: number = 5, cycleLength: number = 28): DailyData => {
    // Clamp to 1-cycleLength for safety
    const safeDay = ((day - 1) % cycleLength) + 1;
    const phase = getPhase(safeDay, periodLength, cycleLength);

    const boundaries = calculatePhaseBoundaries(periodLength, cycleLength);

    // Energy Logic scaled roughly to cycle
    let energy: 1 | 2 | 3 | 4 | 5 = 3;
    if (phase === 'Menstrual') energy = safeDay < Math.max(2, periodLength / 2) ? 1 : 2;
    if (phase === 'Follicular') energy = 4;
    if (phase === 'Ovulation') energy = 5;
    if (phase === 'Luteal') energy = safeDay > boundaries.Luteal.end - 4 ? 2 : 3;

    // Nutrition
    const nutritonData = NUTRITION_RULES[phase];

    // Insight
    const templates = INSIGHT_TEMPLATES[phase];
    const rawInsight = templates[Math.floor(Math.random() * templates.length)];
    const insight = rawInsight.replace("{day}", safeDay.toString());

    return {
        dayInCycle: safeDay,
        phase,
        daysUntilNextPeriod: cycleLength - safeDay + 1,
        energyLevel: energy,
        mood: phase === 'Luteal' ? "Reflective" : (phase === 'Ovulation' ? "Confident" : "Balanced"),
        symptoms: [],
        nutrition: {
            keyNutrients: nutritonData.nutrients,
            recommendedFoods: nutritonData.foods,
            hydrationGoal: nutritonData.hydration,
            foodsToLimit: nutritonData.limit
        },
        workLife: {
            focusAdvice: WORK_RULES[phase].focus,
            exerciseType: WORK_RULES[phase].exercise,
            mentalHealthTip: WORK_RULES[phase].tip
        },
        dailyInsight: insight
    };
};
