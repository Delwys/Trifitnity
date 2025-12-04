import { Exercise, FoodItem, UserProfile, AppState } from './types';

export const DEFAULT_EXERCISES: Exercise[] = [
  { id: 'e1', name: 'Bench Press', category: 'Chest' },
  { id: 'e2', name: 'Squat', category: 'Legs' },
  { id: 'e3', name: 'Deadlift', category: 'Back' },
  { id: 'e4', name: 'Overhead Press', category: 'Shoulders' },
  { id: 'e5', name: 'Pull Up', category: 'Back' },
  { id: 'e6', name: 'Push Up', category: 'Chest' },
  { id: 'e7', name: 'Dumbbell Row', category: 'Back' },
  { id: 'e8', name: 'Lunge', category: 'Legs' },
  { id: 'e9', name: 'Leg Press', category: 'Legs' },
  { id: 'e10', name: 'Lat Pulldown', category: 'Back' },
  { id: 'e11', name: 'Dumbbell Curl', category: 'Biceps' },
  { id: 'e12', name: 'Tricep Extension', category: 'Triceps' },
  { id: 'e13', name: 'Lateral Raise', category: 'Shoulders' },
  { id: 'e14', name: 'Plank', category: 'Core' },
  { id: 'e15', name: 'Crunch', category: 'Core' },
  { id: 'e16', name: 'Calf Raise', category: 'Legs' },
  { id: 'e17', name: 'Face Pull', category: 'Shoulders' },
  { id: 'e18', name: 'Romanian Deadlift', category: 'Legs' },
  { id: 'e19', name: 'Incline Bench Press', category: 'Chest' },
  { id: 'e20', name: 'Leg Curl', category: 'Legs' }
];

export const FOOD_DB: FoodItem[] = [
  // Proteins
  { id: 'f1', name: 'Chicken Breast', calories: 165, servingSize: 4, servingUnit: 'oz' },
  { id: 'f4', name: 'Egg (Large)', calories: 78, servingSize: 1, servingUnit: 'large' },
  { id: 'f5', name: 'Egg White', calories: 17, servingSize: 1, servingUnit: 'large' },
  { id: 'f8', name: 'Protein Shake (Whey)', calories: 120, servingSize: 1, servingUnit: 'scoop' },
  { id: 'f13', name: 'Salmon', calories: 233, servingSize: 4, servingUnit: 'oz' },
  { id: 'f22', name: 'Ground Beef 80/20', calories: 280, servingSize: 4, servingUnit: 'oz' },
  { id: 'f23', name: 'Ground Beef 93/7', calories: 170, servingSize: 4, servingUnit: 'oz' },
  { id: 'f24', name: 'Tuna (Canned)', calories: 120, servingSize: 1, servingUnit: 'can' },
  { id: 'f39', name: 'Turkey Breast', calories: 135, servingSize: 4, servingUnit: 'oz' },
  { id: 'f40', name: 'Pork Chop', calories: 220, servingSize: 4, servingUnit: 'oz' },
  { id: 'f51', name: 'Steak (Sirloin)', calories: 240, servingSize: 4, servingUnit: 'oz' },
  { id: 'f52', name: 'Tofu', calories: 94, servingSize: 100, servingUnit: 'g' },
  { id: 'f53', name: 'Shrimp', calories: 84, servingSize: 3, servingUnit: 'oz' },

  // Carbs
  { id: 'f2', name: 'White Rice (Cooked)', calories: 205, servingSize: 1, servingUnit: 'cup' },
  { id: 'f3', name: 'Brown Rice (Cooked)', calories: 216, servingSize: 1, servingUnit: 'cup' },
  { id: 'f10', name: 'Oatmeal (Cooked)', calories: 158, servingSize: 1, servingUnit: 'cup' },
  { id: 'f16', name: 'Sweet Potato', calories: 112, servingSize: 5, servingUnit: 'oz' },
  { id: 'f25', name: 'Whole Wheat Bread', calories: 80, servingSize: 1, servingUnit: 'slice' },
  { id: 'f26', name: 'Pasta (Cooked)', calories: 220, servingSize: 1, servingUnit: 'cup' },
  { id: 'f29', name: 'Quinoa (Cooked)', calories: 222, servingSize: 1, servingUnit: 'cup' },
  { id: 'f37', name: 'Bagel', calories: 245, servingSize: 1, servingUnit: 'piece' },
  { id: 'f42', name: 'Potato (Baked)', calories: 161, servingSize: 1, servingUnit: 'medium' },
  { id: 'f54', name: 'Tortilla (Flour)', calories: 140, servingSize: 1, servingUnit: 'piece' },
  { id: 'f55', name: 'Cereal (Generic)', calories: 110, servingSize: 1, servingUnit: 'cup' },

  // Fruits & Veg
  { id: 'f6', name: 'Apple', calories: 95, servingSize: 1, servingUnit: 'medium' },
  { id: 'f7', name: 'Banana', calories: 105, servingSize: 1, servingUnit: 'medium' },
  { id: 'f14', name: 'Avocado', calories: 160, servingSize: 0.5, servingUnit: 'medium' },
  { id: 'f17', name: 'Broccoli', calories: 55, servingSize: 1, servingUnit: 'cup' },
  { id: 'f18', name: 'Spinach', calories: 7, servingSize: 1, servingUnit: 'cup' },
  { id: 'f30', name: 'Blueberries', calories: 84, servingSize: 1, servingUnit: 'cup' },
  { id: 'f31', name: 'Strawberries', calories: 49, servingSize: 1, servingUnit: 'cup' },
  { id: 'f42b', name: 'Carrot', calories: 25, servingSize: 1, servingUnit: 'medium' },
  { id: 'f56', name: 'Orange', calories: 62, servingSize: 1, servingUnit: 'medium' },
  { id: 'f57', name: 'Grapes', calories: 62, servingSize: 1, servingUnit: 'cup' },
  { id: 'f58', name: 'Cucumber', calories: 16, servingSize: 1, servingUnit: 'cup' },
  { id: 'f59', name: 'Bell Pepper', calories: 24, servingSize: 1, servingUnit: 'medium' },

  // Dairy & Fats
  { id: 'f11', name: 'Almonds', calories: 164, servingSize: 1, servingUnit: 'oz' },
  { id: 'f12', name: 'Peanut Butter', calories: 94, servingSize: 1, servingUnit: 'tbsp' },
  { id: 'f15', name: 'Greek Yogurt', calories: 130, servingSize: 1, servingUnit: 'cup' },
  { id: 'f19', name: 'Milk (Whole)', calories: 150, servingSize: 1, servingUnit: 'cup' },
  { id: 'f20', name: 'Milk (Skim)', calories: 90, servingSize: 1, servingUnit: 'cup' },
  { id: 'f21', name: 'Cheddar Cheese', calories: 115, servingSize: 1, servingUnit: 'oz' },
  { id: 'f27', name: 'Olive Oil', calories: 119, servingSize: 1, servingUnit: 'tbsp' },
  { id: 'f28', name: 'Butter', calories: 102, servingSize: 1, servingUnit: 'tbsp' },
  { id: 'f38', name: 'Cream Cheese', calories: 50, servingSize: 1, servingUnit: 'tbsp' },
  { id: 'f41', name: 'Cottage Cheese', calories: 220, servingSize: 1, servingUnit: 'cup' },
  { id: 'f60', name: 'Mayonnaise', calories: 90, servingSize: 1, servingUnit: 'tbsp' },

  // Snacks & Meals
  { id: 'f9', name: 'Pizza (Cheese)', calories: 285, servingSize: 1, servingUnit: 'slice' },
  { id: 'f32', name: 'Potato Chips', calories: 152, servingSize: 1, servingUnit: 'oz' },
  { id: 'f33', name: 'Chocolate Bar', calories: 250, servingSize: 1, servingUnit: 'bar' },
  { id: 'f34', name: 'Cola', calories: 140, servingSize: 12, servingUnit: 'fl oz' },
  { id: 'f35', name: 'Diet Cola', calories: 0, servingSize: 12, servingUnit: 'fl oz' },
  { id: 'f36', name: 'Orange Juice', calories: 110, servingSize: 1, servingUnit: 'cup' },
  { id: 'f43', name: 'Hummus', calories: 50, servingSize: 2, servingUnit: 'tbsp' },
  { id: 'f44', name: 'Granola Bar', calories: 120, servingSize: 1, servingUnit: 'bar' },
  { id: 'f45', name: 'Popcorn', calories: 31, servingSize: 1, servingUnit: 'cup' },
  { id: 'f46', name: 'Caesar Salad', calories: 350, servingSize: 1, servingUnit: 'bowl' },
  { id: 'f47', name: 'Burger', calories: 300, servingSize: 1, servingUnit: 'sandwich' },
  { id: 'f48', name: 'Fries (Medium)', calories: 360, servingSize: 1, servingUnit: 'order' },
  { id: 'f49', name: 'Ice Cream', calories: 140, servingSize: 0.5, servingUnit: 'cup' },
  { id: 'f50', name: 'Beer', calories: 180, servingSize: 1, servingUnit: 'pint' },
  { id: 'f61', name: 'Wine (Red)', calories: 125, servingSize: 5, servingUnit: 'fl oz' },
  { id: 'f62', name: 'Cookie', calories: 160, servingSize: 2, servingUnit: 'cookie' },
];

export const INITIAL_STATE: AppState = {
  user: {
    age: 30,
    weight: 180,
    targetWeight: 170,
    weightHistory: [],
    height: 70,
    gender: 'male',
    activityLevel: 1.2,
    goal: 'maintain',
    tdee: 2200
  },
  nutrition: {
    consumed: [],
    customFoods: [],
    lastResetDate: new Date().toISOString().split('T')[0]
  },
  fasting: {
    isActive: false,
    startTime: null,
    goalHours: 16,
    history: []
  },
  workouts: {
    routines: [
      {
        id: 'r1',
        name: 'Full Body A',
        exercises: ['e1', 'e2', 'e5', 'e14']
      },
      {
        id: 'r2',
        name: 'Upper Power',
        exercises: ['e1', 'e4', 'e7', 'e12']
      }
    ],
    history: [],
    activeWorkout: null
  }
};