import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MoreHorizontal, Flame, Droplets, Wheat, Atom, ScanLine, Camera, Plus } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

export default function DietPlanner() {
    const [step, setStep] = useState<'intro' | 'camera' | 'scanning' | 'result'>('intro');
    const [showDailyLog, setShowDailyLog] = useState(false);

    // Mock Data representing the result
    const foodData = {
        name: "Kiwi Smoothie Bowl with Granola",
        type: "Breakfast",
        calories: 450,
        protein: 20,
        carbs: 140,
        fat: 12,
        image: "https://images.unsplash.com/photo-1638159579998-dfe4c8dbd582?q=80&w=2692&auto=format&fit=crop"
    };

    // State for Meal Plan (Categorized)
    const [mealPlan, setMealPlan] = useState({
        breakfast: {
            calories: 398,
            items: [
                { name: "Oatmeal", serving: "1.0 serving", calories: 210, icon: "🥣" },
                { name: "Truroots Organic", serving: "1.0 serving", calories: 138, icon: "🥛" },
                { name: "Orange Juice", serving: "1.0 serving", calories: 50, icon: "🍊" }
            ]
        },
        lunch: {
            calories: 421,
            items: [
                { name: "BBQ Meat", serving: "1.0 serving", calories: 210, icon: "🍖" },
                { name: "Rice with Chicken", serving: "1.0 serving", calories: 138, icon: "🍚" }
            ]
        },
        dinner: {
            calories: 630,
            items: [
                { name: "Grilled Salmon", serving: "1.0 serving", calories: 350, icon: "🐟" },
                { name: "Quinoa Salad", serving: "1.0 serving", calories: 280, icon: "🥗" }
            ]
        }
    });

    const [activeTab, setActiveTab] = useState<'meal-plan' | 'progress'>('meal-plan');
    const [calorieLimit, setCalorieLimit] = useState(2500); // Initial random limit
    const [isEditingLimit, setIsEditingLimit] = useState(false);
    const [mockWeeklyData] = useState([
        { day: 'S', calories: 1600 },
        { day: 'M', calories: 2100 },
        { day: 'T', calories: 1800 },
        { day: 'W', calories: 2400 },
        { day: 'T', calories: 2000 },
        { day: 'F', calories: 1950 },
        { day: 'S', calories: 2200 },
    ]);

    const handleAddMeal = () => {
        // Mock adding the scanned item to 'Lunch' for demo purposes
        const newLunchItems = [...mealPlan.lunch.items, {
            name: foodData.name,
            serving: "1.0 serving",
            calories: foodData.calories,
            icon: "🥑" // Generic icon for scanned food
        }];

        setMealPlan({
            ...mealPlan,
            lunch: {
                ...mealPlan.lunch,
                calories: mealPlan.lunch.calories + foodData.calories,
                items: newLunchItems
            }
        });
        setShowDailyLog(true);
    };

    // Intro View (Pop-up style landing)
    const IntroView = () => (
        <div className="h-full bg-[#FFF0E5] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-rose-100/50 to-transparent rounded-b-[3rem]" />

            <motion.div
                initial={{ y: 1000, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", duration: 0.8, bounce: 0.35 }}
                className="relative z-10 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-rose-100 border border-rose-50 max-w-sm w-full"
            >
                <motion.div
                    initial={{ scale: 3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
                    className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500"
                >
                    <Camera className="w-10 h-10" />
                </motion.div>
                <h1 className="text-3xl font-display font-bold text-rose-950 mb-3">Track Your Nutrition</h1>
                <p className="text-rose-900/60 mb-8 leading-relaxed">
                    Snap a photo of your meal to instantly analyze calories and macros.
                </p>
                <button
                    onClick={() => setStep('camera')}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-rose-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <ScanLine className="w-5 h-5" />
                    Scan Your Meal
                </button>
            </motion.div>
        </div>
    );

    // Camera View Component
    const CameraView = () => (
        <div className="h-full relative flex flex-col bg-black text-white p-4">
            <div className="flex justify-between items-center z-10">
                <button onClick={() => setStep('intro')} className="p-2 bg-white/10 rounded-full backdrop-blur-md"><X className="w-6 h-6" /></button>
                <div className="bg-black/50 px-4 py-1 rounded-full text-xs font-medium uppercase tracking-wider">Food Scanner</div>
                <button className="p-2 bg-white/10 rounded-full backdrop-blur-md"><MoreHorizontal className="w-6 h-6" /></button>
            </div>

            {/* Viewfinder frame */}
            <div className="flex-1 flex items-center justify-center relative my-4">
                <div className="absolute inset-0 border-2 border-white/20 rounded-3xl" />
                <div className="absolute inset-4 border border-white/10 rounded-2xl" />

                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl -mt-0.5 -ml-0.5" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl -mt-0.5 -mr-0.5" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl -mb-0.5 -ml-0.5" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl -mb-0.5 -mr-0.5" />

                {/* Simulated Camera Feed Placeholder */}
                <div className="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center overflow-hidden relative">
                    <img
                        src="https://images.unsplash.com/photo-1638159579998-dfe4c8dbd582?q=80&w=2692&auto=format&fit=crop"
                        alt="Camera Feed"
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                    <p className="relative z-10 text-sm font-medium opacity-80 animate-pulse">Point at food to scan</p>
                </div>
            </div>

            <div className="h-32 flex items-center justify-center gap-8 z-10">
                <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md hover:bg-white/20 transition-colors">
                    <div className="w-6 h-6 rounded-md border-2 border-white/60" />
                </button>

                {/* Shutter Button */}
                <button
                    onClick={() => setStep('scanning')}
                    className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                >
                    <div className="w-16 h-16 bg-white rounded-full" />
                </button>

                <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md hover:bg-white/20 transition-colors">
                    <ScanLine className="w-6 h-6 text-white/60" />
                </button>
            </div>
        </div>
    );

    // Scanning Animation Overlay
    const ScanningOverlay = () => {
        useEffect(() => {
            const timer = setTimeout(() => setStep('result'), 2000);
            return () => clearTimeout(timer);
        }, []);

        return (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <div className="relative w-24 h-24 mb-6">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-t-4 border-emerald-500 rounded-full"
                    />
                    <div className="absolute inset-3 border-4 border-white/20 rounded-full" />
                    <ScanLine className="absolute inset-0 m-auto w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Analyzing Food...</h3>
                <p className="text-white/60 text-sm">Identifying macros & nutrients</p>
            </div>
        );
    };

    // Meal Plan View (Replaces DailyLogModal)
    const DailyLogModal = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                className="bg-white w-full max-w-sm h-[90vh] rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 pb-2">
                    <h2 className="text-2xl font-display font-bold text-slate-900">
                        {activeTab === 'meal-plan' ? 'Meal Plan' : 'Progress'}
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={() => setShowDailyLog(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">

                    {activeTab === 'meal-plan' ? (
                        <>
                            {/* Progress Card (Summary) */}
                            <div className="bg-[#0A4A35] rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-emerald-900/20">
                                <div className="flex items-center gap-8 relative z-10">
                                    {/* Circular Progress (Calories) */}
                                    <div className="relative w-32 h-32 flex items-center justify-center">
                                        {/* Background Circle */}
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="56"
                                                stroke="currentColor"
                                                strokeWidth="8"
                                                fill="transparent"
                                                className="text-white/10"
                                            />
                                            {/* Progress Circle (75% filled mock) */}
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="56"
                                                stroke="#FF856F" // Salmon Color
                                                strokeWidth="8"
                                                fill="transparent"
                                                strokeDasharray={351.86}
                                                strokeDashoffset={351.86 * 0.25} // 75%
                                                strokeLinecap="round"
                                                className="transition-all duration-1000 ease-out"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-bold font-display">2074</span>
                                            <span className="text-[10px] uppercase tracking-wider opacity-80">Calories left</span>
                                        </div>
                                    </div>

                                    {/* Macro Bars */}
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <div className="flex justify-between text-xs font-bold mb-1">
                                                <span>783</span>
                                                <span className="opacity-60">Carbs</span>
                                            </div>
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#ECCC68] w-[70%] rounded-full" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs font-bold mb-1">
                                                <span>115</span>
                                                <span className="opacity-60">Protein</span>
                                            </div>
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#FF856F] w-[40%] rounded-full" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs font-bold mb-1">
                                                <span>623</span>
                                                <span className="opacity-60">Fat</span>
                                            </div>
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#2ED573] w-[85%] rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Breakfast Section (Dark Green) */}
                            <div>
                                <div className="flex justify-between items-end mb-3 px-1">
                                    <h3 className="font-bold text-slate-900">Breakfast</h3>
                                    <span className="text-sm font-bold text-slate-900">{mealPlan.breakfast.calories} Cals</span>
                                </div>
                                <div className="bg-[#0A4A35] rounded-3xl p-5 text-white space-y-4 shadow-lg shadow-emerald-900/10">
                                    {mealPlan.breakfast.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-lg">{item.name}</h4>
                                                <p className="text-emerald-100/60 text-xs font-medium">{item.serving}, {item.calories} calories</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl backdrop-blur-sm">
                                                {item.icon}
                                            </div>
                                        </div>
                                    ))}

                                    <button className="w-full bg-white text-[#0A4A35] font-bold py-3 rounded-xl mt-4 text-sm flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors">
                                        <Plus className="w-4 h-4" /> Add more meal
                                    </button>
                                </div>
                            </div>

                            {/* Lunch Section (Salmon/Coral) */}
                            <div>
                                <div className="flex justify-between items-end mb-3 px-1">
                                    <h3 className="font-bold text-slate-900">Lunch</h3>
                                    <span className="text-sm font-bold text-slate-900">{mealPlan.lunch.calories} Cals</span>
                                </div>
                                <div className="bg-[#FF856F] rounded-3xl p-5 text-white space-y-4 shadow-lg shadow-rose-900/10">
                                    {mealPlan.lunch.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-lg">{item.name}</h4>
                                                <p className="text-rose-100/80 text-xs font-medium">{item.serving}, {item.calories} calories</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl backdrop-blur-sm">
                                                {item.icon}
                                            </div>
                                        </div>
                                    ))}

                                    <button className="w-full bg-white text-[#FF856F] font-bold py-3 rounded-xl mt-4 text-sm flex items-center justify-center gap-2 hover:bg-rose-50 transition-colors">
                                        <Plus className="w-4 h-4" /> Add more meal
                                    </button>
                                </div>
                            </div>

                            {/* Dinner Section (Indigo/Slate) */}
                            <div>
                                <div className="flex justify-between items-end mb-3 px-1">
                                    <h3 className="font-bold text-slate-900">Dinner</h3>
                                    <span className="text-sm font-bold text-slate-900">{mealPlan.dinner.calories} Cals</span>
                                </div>
                                <div className="bg-slate-800 rounded-3xl p-5 text-white space-y-4 shadow-lg shadow-slate-900/10">
                                    {mealPlan.dinner.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-lg">{item.name}</h4>
                                                <p className="text-slate-300 text-xs font-medium">{item.serving}, {item.calories} calories</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl backdrop-blur-sm">
                                                {item.icon}
                                            </div>
                                        </div>
                                    ))}

                                    <button className="w-full bg-white text-slate-800 font-bold py-3 rounded-xl mt-4 text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                                        <Plus className="w-4 h-4" /> Add more meal
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        // Progress Tab Content
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-lg text-slate-900">Calories</h3>
                                    <span className="text-sm font-medium text-slate-400">Average: 1497 Cal 🔥</span>
                                </div>

                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={mockWeeklyData}>
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <XAxis
                                                dataKey="day"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}
                                                dy={10}
                                            />
                                            <Bar
                                                dataKey="calories"
                                                fill="#0A4A35"
                                                radius={[6, 6, 6, 6]}
                                                barSize={12}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Ultimate Calorie Limit Card (Editable) */}
                            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-lg text-slate-900">Ultimate Calorie Limit</h3>
                                    <Flame className="w-5 h-5 text-rose-500" />
                                </div>
                                <div
                                    className="text-4xl font-display font-bold text-slate-800 cursor-pointer hover:bg-gray-50 rounded-xl p-2 -ml-2 transition-colors flex items-center gap-2"
                                    onClick={() => setIsEditingLimit(true)}
                                >
                                    {isEditingLimit ? (
                                        <input
                                            type="number"
                                            autoFocus
                                            className="w-full bg-transparent outline-none border-b-2 border-slate-200 focus:border-rose-500"
                                            value={calorieLimit}
                                            onChange={(e) => setCalorieLimit(Number(e.target.value))}
                                            onBlur={() => setIsEditingLimit(false)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') setIsEditingLimit(false);
                                            }}
                                        />
                                    ) : (
                                        <>
                                            {calorieLimit} <span className="text-lg text-slate-400 font-medium">kcal</span>
                                        </>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 mt-2 font-medium">Click to set your daily goal</p>
                            </div>

                        </div>
                    )}

                </div>

                {/* Bottom Nav */}
                <div className="p-4 flex justify-around text-gray-400 border-t border-gray-100">
                    <button
                        onClick={() => setActiveTab('meal-plan')}
                        className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'meal-plan' ? 'text-[#0A4A35]' : 'hover:text-gray-600'}`}
                    >
                        <div className={`w-6 h-6 rounded ${activeTab === 'meal-plan' ? 'bg-[#0A4A35]' : 'bg-gray-200'}`}></div>
                        <span className="text-[10px] font-bold">Meal Plan</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('progress')}
                        className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'progress' ? 'text-[#0A4A35]' : 'hover:text-gray-600'}`}
                    >
                        <div className={`w-6 h-6 rounded ${activeTab === 'progress' ? 'bg-[#0A4A35]' : 'bg-gray-200'}`}></div>
                        <span className="text-[10px] font-bold">Progress</span>
                    </button>
                </div>

            </motion.div>
        </motion.div>
    );


    // Result View (Screenshot Match) - PEACH THEME & SLIDE DOWN
    const ResultView = () => (
        <div className="h-full relative bg-[#FFF0E5] flex flex-col"> {/* Peach Background */}

            {/* Top Image Area */}
            <div className="h-[45%] relative">
                <img
                    src={foodData.image}
                    alt="Food"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" /> {/* Overlay for better contrast */}

                <div className="absolute top-4 left-4 z-10">
                    <button onClick={() => setStep('camera')} className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="absolute top-4 right-4 z-10">
                    <button className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-colors">
                        <MoreHorizontal className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Bottom Sheet Card - SLIDE DOWN ANIMATION */}
            <motion.div
                initial={{ y: -800, opacity: 0 }} // Slide from above
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.1 }}
                className="flex-1 bg-[#FFF5F0] -mt-8 rounded-t-[2.5rem] relative z-20 px-6 py-8 flex flex-col shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] border-t border-white/50"
            >
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col gap-4 mb-6"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-rose-400 font-bold text-sm uppercase tracking-wider">{foodData.type}</span>
                            <h1 className="text-3xl font-display font-bold text-rose-950 mt-1 leading-tight max-w-[280px]">
                                {foodData.name}
                            </h1>
                        </div>

                        {/* Calorie Badge - Peach Style */}
                        <div className="flex items-center gap-2 bg-white text-rose-500 px-4 py-3 rounded-2xl border border-rose-100 shadow-sm shadow-rose-100/50">
                            <Flame className="w-5 h-5 fill-current" />
                            <span className="font-display font-bold text-xl">{foodData.calories}</span>
                            <span className="text-sm font-medium opacity-80">Cal</span>
                        </div>
                    </div>

                    {/* Add Meal Button */}
                    <button
                        onClick={handleAddMeal}
                        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-rose-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Meal to Daily Log
                    </button>

                </motion.div>

                {/* Macro Grid - Softer Peach/Pastel Tones */}
                <div className="grid grid-cols-2 gap-4">

                    {/* Calories */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white border border-rose-100 rounded-[2rem] p-5 flex flex-col justify-between h-36 relative group hover:shadow-lg hover:shadow-rose-100/50 transition-all"
                    >
                        <div className="flex items-center gap-2 text-rose-500 mb-2">
                            <Flame className="w-5 h-5 fill-current" />
                            <span className="font-bold text-md">Calories</span>
                        </div>
                        <div>
                            <span className="text-4xl font-display font-bold text-rose-950">{foodData.calories}</span>
                        </div>
                    </motion.div>

                    {/* Protein */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white border border-blue-100 rounded-[2rem] p-5 flex flex-col justify-between h-36 relative group hover:shadow-lg hover:shadow-blue-100/50 transition-all"
                    >
                        <div className="flex items-center gap-2 text-blue-400 mb-2">
                            <Atom className="w-5 h-5" />
                            <span className="font-bold text-md">Protein</span>
                        </div>
                        <div>
                            <span className="text-4xl font-display font-bold text-slate-900">{foodData.protein}</span>
                            <span className="text-sm font-medium text-slate-500 ml-1">gm</span>
                        </div>
                    </motion.div>

                    {/* Carbs */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 }}
                        className="bg-white border border-rose-100 rounded-[2rem] p-5 flex flex-col justify-between h-36 relative group hover:shadow-lg hover:shadow-rose-100/50 transition-all"
                    >
                        <div className="flex items-center gap-2 text-amber-500 mb-2">
                            <Wheat className="w-5 h-5" />
                            <span className="font-bold text-md">Carbs</span>
                        </div>
                        <div>
                            <span className="text-4xl font-display font-bold text-slate-900">{foodData.carbs}</span>
                            <span className="text-sm font-medium text-slate-500 ml-1">gm</span>
                        </div>
                    </motion.div>

                    {/* Fat */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 }}
                        className="bg-white border border-emerald-100 rounded-[2rem] p-5 flex flex-col justify-between h-36 relative group hover:shadow-lg hover:shadow-emerald-100/50 transition-all"
                    >
                        <div className="flex items-center gap-2 text-emerald-500 mb-2">
                            <Droplets className="w-5 h-5 fill-current" />
                            <span className="font-bold text-md">Fat</span>
                        </div>
                        <div>
                            <span className="text-4xl font-display font-bold text-slate-900">{foodData.fat}</span>
                            <span className="text-sm font-medium text-slate-500 ml-1">gm</span>
                        </div>
                    </motion.div>

                </div>
            </motion.div>
        </div>
    );

    return (
        <div className="h-screen bg-black overflow-hidden relative font-sans">
            <AnimatePresence>
                {showDailyLog && <DailyLogModal />}
            </AnimatePresence>

            {step === 'intro' && <IntroView />}
            {step === 'scanning' && <ScanningOverlay />}
            {step === 'result' && <ResultView />}
            {step === 'camera' && <CameraView />}
        </div>
    );
}
