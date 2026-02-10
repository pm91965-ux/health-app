export type LiftType = 'Bench' | 'Squat' | 'Deadlift';

export interface Set {
  weight: number;
  reps: number;
  rpe?: number; // 1-10
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
  goals: string;
  pms: Record<LiftType, number>; // Personal Maxes
}
