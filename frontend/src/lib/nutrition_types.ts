export interface Macro {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  description: string;
  macros: Macro;
  ai_analysis?: string; // Short comment (e.g. "High protein, good start")
}

export interface DayNutrition {
  date: string;
  meals: Meal[];
  total: Macro;
}
