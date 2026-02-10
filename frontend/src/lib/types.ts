export type LiftType = 'Bench' | 'Squat' | 'Deadlift';

export interface Set {
  weight: number;
  reps: number;
  rpe?: number; // 1-10
  comment?: string; // Added comment field
}

export interface Exercise {
  name: LiftType;
  sets: Set[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  date: string; // ISO string
  exercises: Exercise[];
  overallFeeling?: string;
}
export type WorkoutPlanExercise = {
  name: string;
  notes?: string;
  weight: number;
  sets: number;
  reps: number;
};

export type WorkoutPlan = {
  reasoning: string;
  plan: WorkoutPlanExercise[];
};

export interface UserProfile {
  name: string;
  goals: {
    short_term?: string[];
    long_term?: string[];
  };
  principles: string[];
  physical_context: string[];
  nutrition_rules?: string[]; // Added nutrition rules
  takeaways: string[];
}

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  description: string;
  macros: Macros;
  time: string;
  date: string; // ISO string
  ai_analysis?: string;
}

export interface DayNutrition {
  date: string; // ISO string
  meals: Meal[];
  total: Macros;
}

export interface FavoriteMeal {
  id: string;
  name: string;
  description: string;
  macros: Macros;
}
