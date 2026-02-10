'use client';

import { useState } from 'react';
import { Loader2, Save, Plus, Trash2 } from 'lucide-react';
import { WorkoutSession, Exercise, Set, LiftType } from '@/lib/types';
import { useAuth } from '@/app/auth';
import api from '@/lib/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentExercises, setCurrentExercises] = useState<Exercise[]>([]);

  const addExercise = (name: LiftType) => {
    setCurrentExercises([...currentExercises, { name, sets: [] }]);
  };
  
  const addSet = (exIndex: number) => {
    const newExs = [...currentExercises];
    // Use last set values as default or standard defaults
    const lastSet = newExs[exIndex].sets[newExs[exIndex].sets.length - 1];
    newExs[exIndex].sets.push({ 
      weight: lastSet?.weight || 60, 
      reps: lastSet?.reps || 5, 
      rpe: 8 
    });
    setCurrentExercises(newExs);
  };

  const updateSet = (exIndex: number, setIndex: number, field: keyof Set | 'comment', val: any) => {
    const newExs = [...currentExercises];
    if (field === 'comment') { 
      (newExs[exIndex].sets[setIndex] as any).comment = val; 
    } else { 
      (newExs[exIndex].sets[setIndex] as any)[field] = Number(val); 
    }
    setCurrentExercises(newExs);
  };

  const removeSet = (exIndex: number, setIndex: number) => {
    const newExs = [...currentExercises];
    newExs[exIndex].sets.splice(setIndex, 1);
    setCurrentExercises(newExs);
  };

  const removeExercise = (exIndex: number) => {
    const newExs = [...currentExercises];
    newExs.splice(exIndex, 1);
    setCurrentExercises(newExs);
  };

  const saveWorkout = async () => {
    if (currentExercises.length === 0) return;
    setLoading(true);
    try {
      const session: WorkoutSession = { 
        id: Date.now().toString(), 
        date: new Date(logDate).toISOString(), 
        exercises: currentExercises 
      };
      await api.post('/workouts', session);
      alert('Workout Saved!');
      setCurrentExercises([]);
      // Redirect to history or stay on log? Maybe just clear for now.
    } catch (error) {
      console.error('Failed to save workout session:', error);
      alert('Failed to save workout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-sans pb-24">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Log Workout</h1>
        
        <div className="mb-4">
           <label className="block text-sm font-medium text-gray-400 mb-1">Workout Date</label>
           <input
             type="date"
             value={logDate}
             onChange={(e) => setLogDate(e.target.value)}
             className="w-full bg-gray-800 text-white rounded-lg p-3 focus:outline-none border border-gray-700 focus:border-blue-500"
           />
        </div>
        
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {(['Bench', 'Squat', 'Deadlift', 'OHP', 'Row'] as LiftType[]).map(lift => (
            <button key={lift} onClick={() => addExercise(lift)} className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-full whitespace-nowrap hover:bg-gray-700 active:scale-95 transition-all text-sm font-medium">+ {lift}</button>
          ))}
        </div>
        
        <div className="space-y-6">
          {currentExercises.length === 0 && (
            <div className="text-center text-gray-500 py-10 border border-dashed border-gray-700 rounded-xl">
              <p>No exercises added yet.</p>
              <p className="text-sm mt-2">Select a lift above to start.</p>
            </div>
          )}

          {currentExercises.map((ex, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-4 border border-gray-700 relative animate-in fade-in slide-in-from-bottom-2">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-lg text-blue-400">{ex.name}</h3>
                 <button onClick={() => removeExercise(i)} className="text-gray-500 hover:text-red-400 p-2 rounded-full hover:bg-gray-700/50 transition-colors"><Trash2 size={18} /></button>
               </div>
               <div className="space-y-3">
                 {ex.sets.map((set, j) => (
                   <div key={j} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                     <div className="flex gap-2 items-center mb-2">
                       <div className="flex-1"><label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Kg</label><input type="number" value={set.weight} onChange={(e) => updateSet(i, j, 'weight', e.target.value)} className="w-full bg-gray-800 rounded p-2 text-center font-bold text-white border border-gray-700 focus:border-blue-500 focus:outline-none"/></div>
                       <div className="flex-1"><label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Reps</label><input type="number" value={set.reps} onChange={(e) => updateSet(i, j, 'reps', e.target.value)} className="w-full bg-gray-800 rounded p-2 text-center font-bold text-white border border-gray-700 focus:border-blue-500 focus:outline-none"/></div>
                       <div className="flex-1"><label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">RPE</label><input type="number" value={set.rpe || 8} onChange={(e) => updateSet(i, j, 'rpe', e.target.value)} className="w-full bg-gray-800 rounded p-2 text-center font-bold text-yellow-500 border border-gray-700 focus:border-yellow-500 focus:outline-none"/></div>
                       <button onClick={() => removeSet(i, j)} className="mt-5 text-gray-600 hover:text-red-400 bg-gray-800 p-1.5 rounded"><Trash2 size={14} /></button>
                     </div>
                   </div>
                 ))}
               </div>
               <button onClick={() => addSet(i)} className="mt-4 w-full py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-sm text-gray-300 flex justify-center items-center gap-2 border border-dashed border-gray-600 hover:border-gray-500 transition-colors"><Plus size={16} /> Add Set</button>
            </div>
          ))}
        </div>
        
        {currentExercises.length > 0 && (
           <div className="sticky bottom-6 left-0 right-0 px-4 max-w-md mx-auto z-30 pt-4 bg-gradient-to-t from-gray-900 via-gray-900 to-transparent">
              <button onClick={saveWorkout} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 shadow-xl shadow-black/50 py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition-all active:scale-[0.98]">
                {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Workout</>}
              </button>
           </div>
        )}
      </div>
    </div>
  );
}
