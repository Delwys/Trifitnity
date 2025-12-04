export enum AppTab {
  DASHBOARD = 'dashboard',
  WORKOUT = 'workout',
  NUTRITION = 'nutrition',
  FASTING = 'fasting'
}

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  servingSize: number;
  servingUnit: string;
}

export interface ConsumedItem extends FoodItem {
  meal: MealType;
  instanceId: string; // Unique ID for this specific consumption event
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
}

export interface WorkoutSet {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface ActiveExercise {
  exerciseId: string;
  sets: WorkoutSet[];
}

export interface Routine {
  id: string;
  name: string;
  exercises: string[]; // IDs of exercises
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface UserProfile {
  age: number;
  weight: number; // lbs
  targetWeight: number; // lbs
  weightHistory: WeightEntry[];
  height: number; // inches
  gender: 'male' | 'female';
  activityLevel: number; // 1.2 to 1.9
  goal: 'cut' | 'maintain' | 'bulk';
  tdee: number;
}

export interface NutritionState {
  consumed: ConsumedItem[]; // Reset daily
  customFoods: FoodItem[];
  lastResetDate: string; // YYYY-MM-DD
}

export interface FastingHistory {
  startTime: number;
  endTime: number;
  durationHours: number;
}

export interface FastingState {
  isActive: boolean;
  startTime: number | null; // Timestamp
  goalHours: number;
  history: FastingHistory[];
}

export interface WorkoutState {
  routines: Routine[];
  history: any[];
  activeWorkout: {
    routineId: string;
    startTime: number;
    exercises: ActiveExercise[];
    status: 'active' | 'finished';
  } | null;
}

export interface AppState {
  user: UserProfile;
  nutrition: NutritionState;
  fasting: FastingState;
  workouts: WorkoutState;
}

export const ACTIVITY_LEVELS = {
  SEDENTARY: 1.2,
  LIGHT: 1.375,
  MODERATE: 1.55,
  ACTIVE: 1.725,
  VERY_ACTIVE: 1.9
};