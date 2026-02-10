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

