import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppTab, AppState, FoodItem, ConsumedItem, Exercise, Routine, UserProfile, WorkoutSet, ActiveExercise, ACTIVITY_LEVELS, MealType } from './types';
import { INITIAL_STATE, FOOD_DB, DEFAULT_EXERCISES } from './constants';

// --- Hooks ---

const useAppStore = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('trifitnityData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure date-based resets
        const today = new Date().toISOString().split('T')[0];
        if (parsed.nutrition && parsed.nutrition.lastResetDate !== today) {
          parsed.nutrition.consumed = [];
          parsed.nutrition.lastResetDate = today;
        }
        // Backward compatibility for fields
        if(parsed.user && !parsed.user.weightHistory) parsed.user.weightHistory = [];
        if(parsed.user && !parsed.user.targetWeight) parsed.user.targetWeight = parsed.user.weight;
        if(parsed.fasting && !parsed.fasting.history) parsed.fasting.history = [];
        // Migrate old food items to have 'Snack' as default meal if missing
        if(parsed.nutrition && parsed.nutrition.consumed) {
            parsed.nutrition.consumed = parsed.nutrition.consumed.map((c: any) => ({
                ...c,
                meal: c.meal || 'Snack',
                instanceId: c.instanceId || Date.now().toString() + Math.random()
            }));
        }

        setState({ ...INITIAL_STATE, ...parsed });
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('trifitnityData', JSON.stringify(state));
    }
  }, [state, isLoaded]);

  return { state, setState, isLoaded };
};

// --- Helpers for Conversions ---

const WEIGHT_UNITS = ['oz', 'g', 'lb', 'kg'];
const VOLUME_UNITS = ['ml', 'fl oz', 'cup', 'tbsp', 'tsp', 'l'];

const WEIGHT_CONVERSIONS: {[key: string]: number} = {
    g: 1,
    oz: 28.3495,
    lb: 453.592,
    kg: 1000
};

const VOLUME_CONVERSIONS: {[key: string]: number} = {
    ml: 1,
    'fl oz': 29.5735,
    cup: 236.588,
    tbsp: 14.7868,
    tsp: 4.92892,
    l: 1000
};

const convertAmount = (val: number, from: string, to: string): number | null => {
  if (from === to) return val;
  
  if (WEIGHT_UNITS.includes(from) && WEIGHT_UNITS.includes(to)) {
      const valInGrams = val * WEIGHT_CONVERSIONS[from];
      return valInGrams / WEIGHT_CONVERSIONS[to];
  }
  
  if (VOLUME_UNITS.includes(from) && VOLUME_UNITS.includes(to)) {
      const valInMl = val * VOLUME_CONVERSIONS[from];
      return valInMl / VOLUME_CONVERSIONS[to];
  }
  
  return null;
};


// --- Components ---

const TabButton = ({ active, onClick, icon, label, color }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full py-3 transition-colors duration-200 ${active ? color : 'text-neutral-500 hover:text-neutral-300'}`}
  >
    <i className={`fas ${icon} text-xl mb-1`}></i>
    <span className="text-xs font-medium">{label}</span>
  </button>
);

// --- Views ---

const Dashboard = ({ state, navigate, updateState }: { state: AppState, navigate: (tab: AppTab) => void, updateState: (s: Partial<AppState>) => void }) => {
  const { user, nutrition, fasting } = state;
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState(user.weight.toString());
  
  const caloriesConsumed = nutrition.consumed.reduce((sum, item) => sum + item.calories, 0);
  const caloriesRemaining = Math.max(0, user.tdee - caloriesConsumed);
  const progress = Math.min(100, (caloriesConsumed / user.tdee) * 100);

  const [fastingElapsed, setFastingElapsed] = useState(0);

  useEffect(() => {
    const interval: any = setInterval(() => {
      if (fasting.isActive && fasting.startTime) {
        setFastingElapsed(Date.now() - fasting.startTime);
      } else {
        setFastingElapsed(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [fasting]);

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const handleSaveWeight = () => {
    const w = parseFloat(newWeight);
    if (!w || w <= 0) return;

    const updatedUser = { 
        ...user, 
        weight: w,
        weightHistory: [...user.weightHistory, { date: new Date().toISOString(), weight: w }]
    };
    updateState({ user: updatedUser });
    setShowWeightModal(false);
  };

  const lbsToGo = Math.abs(user.weight - user.targetWeight).toFixed(1);
  const isGaining = user.targetWeight > user.weight;

  return (
    <div className="space-y-6 pb-24">
      <div className="p-6 bg-neutral-800 rounded-2xl shadow-lg border border-neutral-700">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-2xl font-bold text-white">Overview</h2>
          <button 
            onClick={() => setShowWeightModal(true)}
            className="text-cyan-400 text-sm font-medium hover:text-cyan-300"
          >
            <i className="fas fa-pencil-alt mr-1"></i> Edit Weight
          </button>
        </div>
        
        <div className="flex justify-between items-center">
            <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Current</p>
                <div className="text-3xl font-bold text-white">
                    {user.weight} <span className="text-lg text-neutral-500 font-normal">lbs</span>
                </div>
            </div>
             <div className="text-right">
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Goal</p>
                <div className="text-3xl font-bold text-neutral-400">
                    {user.targetWeight} <span className="text-lg text-neutral-600 font-normal">lbs</span>
                </div>
            </div>
        </div>
        <div className="mt-4 pt-4 border-t border-neutral-700 flex items-center justify-between">
             <span className="text-sm text-neutral-400">Progress</span>
             <span className={`text-sm font-bold ${isGaining ? 'text-green-400' : 'text-cyan-400'}`}>
                {lbsToGo} lbs to {isGaining ? 'gain' : 'lose'}
             </span>
        </div>
      </div>

      {/* 3 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Nutrition Summary */}
        <div onClick={() => navigate(AppTab.NUTRITION)} className="bg-neutral-800 p-5 rounded-xl border-l-4 border-green-500 shadow-md cursor-pointer hover:bg-neutral-750 active:scale-98 transition-all">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Nutrition</h3>
            <i className="fas fa-apple-alt text-green-500"></i>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-neutral-300">
              <span>{Math.round(caloriesConsumed)} / {user.tdee} kcal</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${caloriesConsumed > user.tdee ? 'bg-red-500' : 'bg-green-500'}`} 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-neutral-400 text-right">{Math.round(caloriesRemaining)} remaining</p>
          </div>
        </div>

        {/* Fasting Summary */}
        <div onClick={() => navigate(AppTab.FASTING)} className="bg-neutral-800 p-5 rounded-xl border-l-4 border-indigo-500 shadow-md cursor-pointer hover:bg-neutral-750 active:scale-98 transition-all">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Fasting</h3>
            <i className="fas fa-stopwatch text-indigo-500"></i>
          </div>
          <div className="flex flex-col items-center py-2">
             <div className={`text-2xl font-bold ${fasting.isActive ? 'text-indigo-400' : 'text-neutral-500'}`}>
                {fasting.isActive ? formatDuration(fastingElapsed) : "Inactive"}
             </div>
             <span className="text-xs text-neutral-400 mt-1">
               {fasting.isActive ? "Currently Fasting" : "Start a fast to track"}
             </span>
          </div>
        </div>

        {/* Fitness Summary */}
        <div onClick={() => navigate(AppTab.WORKOUT)} className="bg-neutral-800 p-5 rounded-xl border-l-4 border-cyan-500 shadow-md cursor-pointer hover:bg-neutral-750 active:scale-98 transition-all">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Fitness</h3>
            <i className="fas fa-dumbbell text-cyan-500"></i>
          </div>
          <div className="text-sm text-neutral-300">
            {state.workouts.activeWorkout ? (
               <div className="flex items-center gap-2 text-cyan-400">
                  <span className="animate-pulse">●</span>
                  <span>Workout In Progress</span>
               </div>
            ) : (
              <p>Ready for your next session.</p>
            )}
            <div className="mt-3 pt-3 border-t border-neutral-700 text-xs text-neutral-500">
              Total Routines: {state.workouts.routines.length}
            </div>
          </div>
        </div>

      </div>

      {/* Weight Edit Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-800 w-full max-w-sm p-6 rounded-2xl border border-neutral-700">
                <h3 className="text-xl font-bold mb-4 text-white">Update Weight</h3>
                <input 
                    type="number" 
                    className="w-full bg-neutral-900 border border-neutral-600 rounded-lg p-3 mb-4 text-white text-xl"
                    value={newWeight}
                    onChange={e => setNewWeight(e.target.value)}
                    autoFocus
                />
                <div className="flex gap-3">
                    <button onClick={() => setShowWeightModal(false)} className="flex-1 bg-neutral-700 py-3 rounded-lg text-white">Cancel</button>
                    <button onClick={handleSaveWeight} className="flex-1 bg-cyan-600 py-3 rounded-lg font-bold text-white">Save</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

const WorkoutView = ({ state, updateState }: { state: AppState, updateState: (s: Partial<AppState>) => void }) => {
  const { workouts } = state;
  const [newRoutineName, setNewRoutineName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  // Active Workout State
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [inputWeight, setInputWeight] = useState("");
  const [inputReps, setInputReps] = useState("");
  const [customRestTime, setCustomRestTime] = useState(60);

  // Auto-rest ticker
  useEffect(() => {
    let interval: any;
    if (restTimer !== null && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => (prev && prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restTimer]);

  const startWorkout = (routineId: string) => {
    const routine = workouts.routines.find(r => r.id === routineId);
    if (!routine) return;
    
    const activeExercises: ActiveExercise[] = routine.exercises.map(eid => ({
      exerciseId: eid,
      sets: []
    }));

    updateState({
      workouts: {
        ...workouts,
        activeWorkout: {
          routineId,
          startTime: Date.now(),
          exercises: activeExercises,
          status: 'active'
        }
      }
    });
  };

  const logSet = () => {
    if (!workouts.activeWorkout) return;
    
    const weight = parseFloat(inputWeight) || 0;
    const reps = parseInt(inputReps) || 0;
    
    if (weight <= 0 || reps <= 0) return; // Validation

    const newWorkouts = { ...workouts };
    const currentEx = newWorkouts.activeWorkout!.exercises[activeExerciseIndex];
    
    currentEx.sets.push({
      id: Date.now().toString(),
      weight,
      reps,
      completed: true
    });

    updateState({ workouts: newWorkouts });
    
    // Start Rest Timer
    setRestTimer(customRestTime);
  };

  const finishWorkout = () => {
    if (!workouts.activeWorkout) return;
    
    const newHistory = [...workouts.history, {
      ...workouts.activeWorkout,
      status: 'finished',
      endTime: Date.now()
    }];
    
    updateState({
      workouts: {
        ...workouts,
        activeWorkout: null,
        history: newHistory
      }
    });
    setRestTimer(null);
  };

  // Helper to get exercise name
  const getExName = (id: string) => DEFAULT_EXERCISES.find(e => e.id === id)?.name || "Unknown";

  // --- RENDER LIVE WORKOUT ---
  if (workouts.activeWorkout) {
    const currentExData = workouts.activeWorkout.exercises[activeExerciseIndex];
    const exName = getExName(currentExData.exerciseId);

    return (
      <div className="h-full flex flex-col pb-20">
        {/* Header */}
        <div className="bg-neutral-800 p-4 mb-4 rounded-xl border border-neutral-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-cyan-400">Live Session</h2>
            <p className="text-sm text-neutral-400">{exName}</p>
          </div>
          <button onClick={finishWorkout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold">
            End
          </button>
        </div>

        {/* Exercise Navigation */}
        <div className="flex overflow-x-auto space-x-2 mb-4 pb-2 hide-scrollbar">
            {workouts.activeWorkout.exercises.map((ex, idx) => (
                <button 
                    key={idx}
                    onClick={() => setActiveExerciseIndex(idx)}
                    className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${idx === activeExerciseIndex ? 'bg-cyan-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}
                >
                    {getExName(ex.exerciseId)}
                </button>
            ))}
        </div>

        {/* Set Logger */}
        <div className="flex-1 overflow-y-auto">
            <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700 shadow-lg">
                
                {/* Timer Overlay */}
                {restTimer !== null && restTimer > 0 && (
                    <div className="mb-6 bg-neutral-900 p-4 rounded-lg border border-neutral-600 text-center animate-pulse">
                        <p className="text-neutral-400 text-xs uppercase tracking-widest">Resting</p>
                        <p className="text-3xl font-mono font-bold text-cyan-400">{restTimer}s</p>
                        <button onClick={() => setRestTimer(null)} className="text-xs text-red-400 mt-2 underline">Skip</button>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">Weight (lbs)</label>
                        <input 
                            type="number" 
                            value={inputWeight}
                            onChange={e => setInputWeight(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-600 rounded-lg p-3 text-xl text-white focus:border-cyan-500 focus:outline-none"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-neutral-400 mb-1">Reps</label>
                        <input 
                            type="number" 
                            value={inputReps}
                            onChange={e => setInputReps(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-600 rounded-lg p-3 text-xl text-white focus:border-cyan-500 focus:outline-none"
                            placeholder="0"
                        />
                    </div>
                </div>

                <button onClick={logSet} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-lg shadow-lg transform active:scale-95 transition-all">
                    LOG SET <i className="fas fa-check ml-2"></i>
                </button>

                {/* Auto Rest Settings */}
                <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                    <span>Auto-Rest Timer:</span>
                    <select 
                        value={customRestTime} 
                        onChange={(e) => setCustomRestTime(Number(e.target.value))}
                        className="bg-neutral-900 border border-neutral-700 rounded p-1 text-neutral-300"
                    >
                        <option value={30}>30s</option>
                        <option value={60}>60s</option>
                        <option value={90}>90s</option>
                        <option value={120}>2m</option>
                    </select>
                </div>
            </div>

            {/* History for this session */}
            <div className="mt-6">
                <h3 className="text-neutral-400 text-sm font-bold mb-3 uppercase tracking-wider">Session Logs</h3>
                <div className="space-y-2">
                    {currentExData.sets.length === 0 && <p className="text-neutral-600 italic text-sm">No sets logged yet.</p>}
                    {currentExData.sets.map((set, i) => (
                        <div key={i} className="flex justify-between items-center bg-neutral-800 p-3 rounded-lg border-l-2 border-cyan-500">
                            <span className="text-neutral-300 font-bold">Set {i+1}</span>
                            <span className="text-white">{set.weight} lbs x {set.reps} reps</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    );
  }

  // --- RENDER ROUTINE LIST ---
  return (
    <div className="pb-24">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-bold text-white">My Routines</h2>
         <button onClick={() => setIsCreating(true)} className="w-10 h-10 rounded-full bg-neutral-800 text-cyan-400 border border-neutral-700 flex items-center justify-center hover:bg-neutral-700">
            <i className="fas fa-plus"></i>
         </button>
      </div>

      <div className="grid gap-4">
        {workouts.routines.map(routine => (
          <div key={routine.id} className="bg-neutral-800 p-5 rounded-xl border border-neutral-700 hover:border-cyan-500/50 transition-colors">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-white">{routine.name}</h3>
                <span className="text-xs bg-neutral-900 text-neutral-400 px-2 py-1 rounded">{routine.exercises.length} Exercises</span>
            </div>
            <p className="text-sm text-neutral-400 mb-4 truncate">
                {routine.exercises.slice(0, 3).map(eid => getExName(eid)).join(', ')}...
            </p>
            <button 
                onClick={() => startWorkout(routine.id)}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 rounded-lg transition-colors"
            >
                Start Workout
            </button>
          </div>
        ))}
      </div>

      {/* Simple Modal for creating routine */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-800 w-full max-w-md p-6 rounded-2xl border border-neutral-700">
                <h3 className="text-xl font-bold mb-4">New Routine</h3>
                <input 
                    type="text" 
                    placeholder="Routine Name (e.g. Leg Day)"
                    className="w-full bg-neutral-900 border border-neutral-600 rounded-lg p-3 mb-4 text-white"
                    value={newRoutineName}
                    onChange={e => setNewRoutineName(e.target.value)}
                />
                <p className="text-xs text-yellow-500 mb-4">* Adds a default template you can edit later.</p>
                <div className="flex gap-3">
                    <button onClick={() => setIsCreating(false)} className="flex-1 bg-neutral-700 py-3 rounded-lg">Cancel</button>
                    <button 
                        onClick={() => {
                            if(!newRoutineName) return;
                            const newRoutine: Routine = {
                                id: Date.now().toString(),
                                name: newRoutineName,
                                exercises: ['e1', 'e2', 'e3'] // Default set
                            };
                            updateState({ workouts: { ...workouts, routines: [...workouts.routines, newRoutine] } });
                            setNewRoutineName("");
                            setIsCreating(false);
                        }} 
                        className="flex-1 bg-cyan-600 py-3 rounded-lg font-bold"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const NutritionView = ({ state, updateState }: { state: AppState, updateState: (s: Partial<AppState>) => void }) => {
  const { user, nutrition } = state;
  const [searchTerm, setSearchTerm] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  
  // Selection and Adding state
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [logAmount, setLogAmount] = useState<string>("");
  const [logUnit, setLogUnit] = useState<string>("");
  const [selectedMeal, setSelectedMeal] = useState<MealType>('Breakfast');

  // Settings Form
  const [formData, setFormData] = useState(user);

  // Determine default meal based on time of day
  useEffect(() => {
      const hour = new Date().getHours();
      if (hour < 11) setSelectedMeal('Breakfast');
      else if (hour < 15) setSelectedMeal('Lunch');
      else if (hour < 21) setSelectedMeal('Dinner');
      else setSelectedMeal('Snack');
  }, []);

  const calculateTDEE = (u: UserProfile) => {
    const wKg = u.weight / 2.20462;
    const hCm = u.height * 2.54;
    let bmr = (10 * wKg) + (6.25 * hCm) - (5 * u.age);
    bmr += u.gender === 'male' ? 5 : -161;
    let tdee = bmr * u.activityLevel;
    if (u.goal === 'cut') tdee -= 500;
    if (u.goal === 'bulk') tdee += 500;
    return Math.round(tdee);
  };

  const saveSettings = () => {
    const newTdee = calculateTDEE(formData);
    updateState({
        user: { ...formData, tdee: newTdee }
    });
    setShowSettings(false);
  };

  const initiateAddFood = (food: FoodItem) => {
      setSelectedFood(food);
      setLogAmount(food.servingSize.toString());
      setLogUnit(food.servingUnit);
  };

  const confirmAddFood = () => {
    if (!selectedFood) return;
    
    const amount = parseFloat(logAmount) || 0;
    if (amount <= 0) return;

    let finalCalories = 0;
    const convertedAmount = convertAmount(amount, logUnit, selectedFood.servingUnit);
    
    if (convertedAmount !== null) {
        const ratio = convertedAmount / selectedFood.servingSize;
        finalCalories = selectedFood.calories * ratio;
    } else {
        const ratio = amount / selectedFood.servingSize;
        finalCalories = selectedFood.calories * ratio;
    }

    const newFood: ConsumedItem = {
        ...selectedFood,
        id: selectedFood.id,
        calories: Math.round(finalCalories),
        servingSize: amount,
        servingUnit: logUnit,
        meal: selectedMeal,
        instanceId: Date.now().toString()
    };

    updateState({
        nutrition: {
            ...nutrition,
            consumed: [newFood, ...nutrition.consumed]
        }
    });
    
    setSelectedFood(null);
    setSearchTerm(""); 
  };

  const filteredFoods = FOOD_DB.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const caloriesConsumed = nutrition.consumed.reduce((sum, item) => sum + item.calories, 0);
  const progress = Math.min(100, (caloriesConsumed / user.tdee) * 100);
  const isOver = caloriesConsumed > user.tdee;

  const getAvailableUnits = (baseUnit: string) => {
      if (WEIGHT_UNITS.includes(baseUnit)) return WEIGHT_UNITS;
      if (VOLUME_UNITS.includes(baseUnit)) return VOLUME_UNITS;
      return [baseUnit];
  };

  const getPreviewCalories = () => {
      if(!selectedFood) return 0;
      const amount = parseFloat(logAmount) || 0;
      const converted = convertAmount(amount, logUnit, selectedFood.servingUnit);
      if (converted !== null) {
          return Math.round(selectedFood.calories * (converted / selectedFood.servingSize));
      }
      return Math.round(selectedFood.calories * (amount / selectedFood.servingSize));
  };

  const handleUnitChange = (newUnit: string) => {
      const currentVal = parseFloat(logAmount) || 0;
      if(selectedFood && currentVal > 0) {
         if (WEIGHT_UNITS.includes(logUnit) && WEIGHT_UNITS.includes(newUnit)) {
             const g = currentVal * WEIGHT_CONVERSIONS[logUnit];
             const target = g / WEIGHT_CONVERSIONS[newUnit];
             setLogAmount(parseFloat(target.toFixed(1)).toString());
         } else if (VOLUME_UNITS.includes(logUnit) && VOLUME_UNITS.includes(newUnit)) {
             const ml = currentVal * VOLUME_CONVERSIONS[logUnit];
             const target = ml / VOLUME_CONVERSIONS[newUnit];
             setLogAmount(parseFloat(target.toFixed(1)).toString());
         }
      }
      setLogUnit(newUnit);
  };

  // Grouping
  const meals: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  const groupedFood = meals.reduce((acc, meal) => {
      acc[meal] = nutrition.consumed.filter(i => i.meal === meal);
      return acc;
  }, {} as Record<MealType, ConsumedItem[]>);

  const getMealCalories = (meal: MealType) => {
      return groupedFood[meal].reduce((s, i) => s + i.calories, 0);
  };

  return (
    <div className="pb-24 h-full flex flex-col">
       {/* Header Stats */}
       <div className="bg-neutral-800 rounded-xl p-5 mb-4 border-l-4 border-green-500 shadow-lg relative">
            <button onClick={() => setShowSettings(true)} className="absolute top-4 right-4 text-neutral-500 hover:text-white">
                <i className="fas fa-cog"></i>
            </button>
            <h2 className="font-bold text-white text-lg mb-2">Daily Intake</h2>
            <div className="flex justify-between items-end mb-2">
                <span className="text-3xl font-bold text-green-400">{Math.round(caloriesConsumed)}</span>
                <span className="text-sm text-neutral-400 mb-1">/ {user.tdee} kcal</span>
            </div>
            <div className="h-3 bg-neutral-900 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-green-500'}`} 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
       </div>

       {/* Search & Add */}
       <div className="relative mb-6">
         <i className="fas fa-search absolute left-4 top-3.5 text-neutral-500"></i>
         <input 
            type="text" 
            placeholder="Search food..."
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl py-3 pl-12 pr-4 text-white focus:border-green-500 focus:outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
         />
       </div>

       {/* Content Area: either Search Results or Meal Logs */}
       <div className="flex-1 overflow-y-auto">
          {searchTerm ? (
             // Search Results
             <div className="space-y-2">
                 {filteredFoods.length === 0 && (
                     <div className="text-center py-10 text-neutral-500">
                        <p>No foods found.</p>
                        <button 
                            className="mt-2 text-green-400 underline text-sm"
                            onClick={() => {
                                const cals = prompt("Enter calories for custom food:");
                                if(cals) {
                                     const custom: FoodItem = { id: Date.now().toString(), name: searchTerm, calories: parseInt(cals), servingSize: 1, servingUnit: 'serving' };
                                     initiateAddFood(custom);
                                }
                            }}
                        >
                            Add "{searchTerm}" manually
                        </button>
                     </div>
                 )}
                 {filteredFoods.map(food => (
                    <div key={food.id} onClick={() => initiateAddFood(food)} className="bg-neutral-800 p-4 rounded-lg flex justify-between items-center cursor-pointer hover:bg-neutral-700 transition-colors">
                        <div>
                            <span className="text-neutral-200 block">{food.name}</span>
                            <span className="text-neutral-500 text-xs">{food.servingSize} {food.servingUnit}</span>
                        </div>
                        <span className="text-green-400 font-bold text-sm">+{food.calories}</span>
                    </div>
                 ))}
             </div>
          ) : (
             // Meal Accordions
             <div className="space-y-4">
                 {meals.map(meal => (
                     <div key={meal} className="bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700">
                         <div className="bg-neutral-800/50 p-3 flex justify-between items-center border-b border-neutral-700">
                             <h3 className="font-bold text-neutral-300">{meal}</h3>
                             <span className="text-xs font-mono text-green-400">{Math.round(getMealCalories(meal))} cal</span>
                         </div>
                         <div className="p-2 space-y-1">
                             {groupedFood[meal].length === 0 ? (
                                 <p className="text-xs text-neutral-600 text-center py-2">No food logged</p>
                             ) : (
                                 groupedFood[meal].map(item => (
                                     <div key={item.instanceId} className="flex justify-between text-sm p-2 hover:bg-neutral-700/30 rounded">
                                         <div className="text-neutral-400">
                                            <span className="text-neutral-200 block">{item.name}</span>
                                            <span className="text-xs">{parseFloat(item.servingSize.toFixed(2))} {item.servingUnit}</span>
                                         </div>
                                         <span className="text-neutral-500">{item.calories}</span>
                                     </div>
                                 ))
                             )}
                         </div>
                     </div>
                 ))}
             </div>
          )}
       </div>

       {/* Food Detail Modal */}
       {selectedFood && (
         <div className="fixed inset-0 bg-black/90 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
            <div className="bg-neutral-800 w-full max-w-md p-6 rounded-2xl border border-neutral-700 animate-fade-in-up">
                <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-bold text-white pr-4">{selectedFood.name}</h3>
                    <button onClick={() => setSelectedFood(null)} className="text-neutral-400 hover:text-white">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>

                <div className="mb-4">
                    <label className="label-text">Select Meal</label>
                    <div className="grid grid-cols-4 gap-2">
                        {meals.map(m => (
                            <button 
                                key={m}
                                onClick={() => setSelectedMeal(m)}
                                className={`py-2 text-xs rounded-lg border transition-colors ${selectedMeal === m ? 'bg-green-600 border-green-500 text-white' : 'bg-neutral-900 border-neutral-700 text-neutral-400'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                        <label className="label-text">Quantity</label>
                        <input 
                            type="number" 
                            className="input-std text-lg py-3" 
                            value={logAmount} 
                            onChange={e => setLogAmount(e.target.value)} 
                            autoFocus
                        />
                    </div>
                    <div className="w-1/3">
                        <label className="label-text">Unit</label>
                        <select 
                            className="input-std text-lg py-3 h-full" 
                            value={logUnit} 
                            onChange={e => handleUnitChange(e.target.value)}
                        >
                            {getAvailableUnits(selectedFood.servingUnit).map(u => (
                                <option key={u} value={u}>{u}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-between items-center bg-neutral-900 p-4 rounded-lg mb-6">
                    <span className="text-neutral-400 text-sm">Total Calories</span>
                    <span className="text-2xl font-bold text-green-400">{getPreviewCalories()}</span>
                </div>

                <button onClick={confirmAddFood} className="w-full bg-green-600 hover:bg-green-500 py-4 rounded-xl font-bold text-white shadow-lg transform active:scale-95 transition-all">
                    ADD TO {selectedMeal.toUpperCase()}
                </button>
            </div>
         </div>
       )}

       {/* Settings Modal */}
       {showSettings && (
         <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-neutral-800 w-full max-w-md p-6 rounded-2xl border border-neutral-700 my-auto">
                <h3 className="text-xl font-bold mb-4 text-white">User Settings</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="label-text">Weight (lbs)</label>
                        <input type="number" className="input-std" value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} />
                    </div>
                    <div>
                        <label className="label-text">Target Weight</label>
                        <input type="number" className="input-std" value={formData.targetWeight} onChange={e => setFormData({...formData, targetWeight: Number(e.target.value)})} />
                    </div>
                    <div>
                        <label className="label-text">Height (in)</label>
                        <input type="number" className="input-std" value={formData.height} onChange={e => setFormData({...formData, height: Number(e.target.value)})} />
                    </div>
                    <div>
                        <label className="label-text">Age</label>
                        <input type="number" className="input-std" value={formData.age} onChange={e => setFormData({...formData, age: Number(e.target.value)})} />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="label-text">Goal</label>
                    <div className="flex bg-neutral-900 rounded-lg p-1 mt-1">
                        {['cut', 'maintain', 'bulk'].map(g => (
                            <button 
                                key={g} 
                                onClick={() => setFormData({...formData, goal: g as any})}
                                className={`flex-1 py-2 text-sm rounded capitalize ${formData.goal === g ? 'bg-green-600 text-white' : 'text-neutral-400'}`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>

                <button onClick={saveSettings} className="w-full bg-green-600 py-3 rounded-lg font-bold text-white">Save & Recalculate</button>
                <button onClick={() => setShowSettings(false)} className="w-full mt-2 py-3 text-neutral-400">Cancel</button>
            </div>
         </div>
       )}
    </div>
  );
};

const MetabolicTimeline = ({ hoursElapsed }: { hoursElapsed: number }) => {
    const stages = [
        { name: "Anabolic / Digestion", start: 0, end: 4, color: "text-blue-400" },
        { name: "Catabolic / Fat Burning", start: 4, end: 16, color: "text-orange-400" },
        { name: "Ketosis", start: 16, end: 24, color: "text-purple-400" },
        { name: "Autophagy", start: 24, end: 999, color: "text-indigo-400" }
    ];

    return (
        <div className="mt-8 w-full px-6 relative">
            <div className="absolute left-9 top-4 bottom-4 w-0.5 bg-neutral-700 z-0"></div>
            <div className="space-y-6 relative z-10">
                {stages.map((stage, idx) => {
                    const isCurrent = hoursElapsed >= stage.start && hoursElapsed < stage.end;
                    const isPast = hoursElapsed >= stage.end;
                    
                    let statusText = "";
                    if (isCurrent) statusText = "Current Stage";
                    else if (isPast) statusText = "Completed";
                    else {
                        const hoursUntil = (stage.start - hoursElapsed).toFixed(1);
                        statusText = `Starts in ${hoursUntil} hrs`;
                    }

                    return (
                        <div key={idx} className={`flex items-start gap-4 ${isPast ? 'opacity-50' : 'opacity-100'}`}>
                            <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center bg-neutral-900 ${isCurrent ? `border-white ${stage.color} shadow-[0_0_10px_currentColor]` : isPast ? 'border-neutral-600 text-neutral-600' : 'border-neutral-700 text-neutral-700'}`}>
                                {isPast && <i className="fas fa-check text-xs"></i>}
                                {isCurrent && <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>}
                            </div>
                            <div className="pt-0.5">
                                <h4 className={`text-sm font-bold ${isCurrent ? 'text-white' : 'text-neutral-400'}`}>{stage.name}</h4>
                                <p className={`text-xs mt-1 ${isCurrent ? stage.color : 'text-neutral-600'}`}>
                                    {statusText}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const FastingView = ({ state, updateState }: { state: AppState, updateState: (s: Partial<AppState>) => void }) => {
  const { fasting } = state;
  const [elapsed, setElapsed] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  useEffect(() => {
    const timer: any = setInterval(() => {
      if (fasting.isActive && fasting.startTime) {
        setElapsed(Date.now() - fasting.startTime);
      } else {
        setElapsed(0);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [fasting]);

  const handleToggle = () => {
    if (fasting.isActive) {
        setShowEndConfirm(true);
    } else {
        // Start
        updateState({ fasting: { ...fasting, isActive: true, startTime: Date.now() } });
    }
  };

  const confirmEndFast = () => {
      const endTime = Date.now();
      const startTime = fasting.startTime || Date.now();
      const durationHours = (endTime - startTime) / (1000 * 60 * 60);
      
      updateState({ 
          fasting: { 
              ...fasting, 
              isActive: false, 
              startTime: null,
              history: [...(fasting.history || []), { startTime, endTime, durationHours }]
          } 
      });
      setElapsed(0);
      setShowEndConfirm(false);
  };

  const setGoal = (hours: number) => {
    updateState({ fasting: { ...fasting, goalHours: hours } });
  };

  // Wheel calculation
  const hoursElapsed = elapsed / (1000 * 60 * 60);
  const progressPercent = Math.min(100, (hoursElapsed / fasting.goalHours) * 100);
  const degrees = (progressPercent / 100) * 360;

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="h-full flex flex-col items-center pb-24 pt-4 overflow-y-auto">
        
        {/* Timer Display */}
        <div 
            className="fasting-circle-container mt-4 flex-shrink-0"
            style={{ 
                ['--circle-deg' as any]: `${degrees}deg`,
                ['--circle-color' as any]: fasting.isActive ? '#6366f1' : '#404040'
            }}
        >
            <div className="fasting-circle-inner">
                <i className={`fas fa-stopwatch text-2xl mb-2 ${fasting.isActive ? 'text-indigo-400' : 'text-neutral-600'}`}></i>
                <span className="text-4xl font-mono font-bold tracking-wider text-white">
                    {formatTime(elapsed)}
                </span>
                <span className={`text-xs font-medium mt-2 ${fasting.isActive ? 'text-indigo-300' : 'text-neutral-500'}`}>
                    {fasting.isActive ? "Active Fast" : "Ready to Start"}
                </span>
            </div>
        </div>

        {/* Timeline */}
        <MetabolicTimeline hoursElapsed={hoursElapsed} />

        {/* Controls */}
        <div className="w-full px-6 space-y-6 mt-8 mb-8">
            
            {/* Goal Selection */}
            {!fasting.isActive && (
                <div className="grid grid-cols-4 gap-2">
                    {[13, 16, 20, 24].map(h => (
                        <button 
                            key={h}
                            onClick={() => setGoal(h)}
                            className={`py-2 rounded-lg border ${fasting.goalHours === h ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-neutral-800 border-neutral-700 text-neutral-400'}`}
                        >
                            {h}h
                        </button>
                    ))}
                </div>
            )}

            {/* Status Text */}
            <div className="text-center">
                <p className="text-neutral-500 text-sm">
                    Goal: <span className="text-white">{fasting.goalHours} Hours</span>
                </p>
                {fasting.isActive && (
                    <div className="w-full bg-neutral-800 h-2 rounded-full mt-2 overflow-hidden">
                        <div className="bg-indigo-500 h-full transition-all duration-1000" style={{width: `${progressPercent}%`}}></div>
                    </div>
                )}
            </div>

            <button 
                onClick={handleToggle}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transform transition-transform active:scale-95 ${fasting.isActive ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
            >
                {fasting.isActive ? 'END FAST' : 'START FAST'}
            </button>
        </div>

        {/* End Fast Confirmation Modal */}
        {showEndConfirm && (
             <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6">
                <div className="bg-neutral-800 w-full max-w-sm p-6 rounded-2xl border border-neutral-700 text-center">
                    <div className="w-16 h-16 rounded-full bg-indigo-900/50 flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-hourglass-end text-indigo-400 text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">End Fasting Session?</h3>
                    <p className="text-neutral-400 text-sm mb-6">
                        You've fasted for <span className="text-white font-bold">{formatTime(elapsed)}</span>. 
                        This session will be saved to your history.
                    </p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowEndConfirm(false)} 
                            className="flex-1 py-3 rounded-lg bg-neutral-700 text-white font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmEndFast} 
                            className="flex-1 py-3 rounded-lg bg-red-600 text-white font-bold"
                        >
                            End Fast
                        </button>
                    </div>
                </div>
             </div>
        )}

    </div>
  );
};

// --- Main Layout ---

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const { state, setState, isLoaded } = useAppStore();

  if (!isLoaded) return <div className="h-screen w-full flex items-center justify-center bg-neutral-900 text-white">Loading...</div>;

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD: return <Dashboard state={state} navigate={setActiveTab} updateState={updateState} />;
      case AppTab.WORKOUT: return <WorkoutView state={state} updateState={updateState} />;
      case AppTab.NUTRITION: return <NutritionView state={state} updateState={updateState} />;
      case AppTab.FASTING: return <FastingView state={state} updateState={updateState} />;
      default: return <Dashboard state={state} navigate={setActiveTab} updateState={updateState} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100 font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* Main Content Area */}
      <main className="max-w-md mx-auto min-h-screen bg-neutral-900 relative shadow-2xl overflow-hidden flex flex-col">
        {/* Top Bar */}
        <header className="p-4 flex justify-between items-center border-b border-neutral-800 sticky top-0 bg-neutral-900/95 backdrop-blur z-20">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center font-bold text-black italic">T</div>
             <h1 className="font-bold text-lg tracking-tight">Trifitnity</h1>
           </div>
           <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-bold text-cyan-500">
              {state.user.goal.charAt(0).toUpperCase()}
           </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
            {renderContent()}
        </div>

        {/* Bottom Navigation */}
        <nav className="bg-neutral-900 border-t border-neutral-800 absolute bottom-0 w-full max-w-md flex justify-around z-30 pb-safe">
          <TabButton 
            active={activeTab === AppTab.DASHBOARD} 
            onClick={() => setActiveTab(AppTab.DASHBOARD)} 
            icon="fa-home" 
            label="Home"
            color="text-white" 
          />
          <TabButton 
            active={activeTab === AppTab.WORKOUT} 
            onClick={() => setActiveTab(AppTab.WORKOUT)} 
            icon="fa-dumbbell" 
            label="Fitness" 
            color="text-cyan-400"
          />
          <TabButton 
            active={activeTab === AppTab.NUTRITION} 
            onClick={() => setActiveTab(AppTab.NUTRITION)} 
            icon="fa-utensils" 
            label="Nutrition" 
            color="text-green-400"
          />
          <TabButton 
            active={activeTab === AppTab.FASTING} 
            onClick={() => setActiveTab(AppTab.FASTING)} 
            icon="fa-stopwatch" 
            label="Fasting" 
            color="text-indigo-400"
          />
        </nav>
      </main>

      {/* Styles injection for standard inputs to keep Tailwind clean in render */}
      <style>{`
        .label-text { @apply block text-xs text-neutral-500 mb-1; }
        .input-std { @apply w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-white text-sm focus:border-cyan-500 outline-none; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        @keyframes fade-in-up {
           from { opacity: 0; transform: translateY(20px); }
           to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }
      `}</style>
    </div>
  );
}