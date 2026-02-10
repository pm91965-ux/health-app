
'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { WorkoutSession } from '@/lib/types';
import { useAuth } from '@/app/auth';
import api from '@/lib/api';

export default function HistoryPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<WorkoutSession[]>([]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/workouts');
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch workout history:', error);
      // Optionally, handle token expiry/invalidity here by logging out
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-sans">
      <h1 className="text-2xl font-bold mb-6 text-center">Workout History</h1>
      <div className="space-y-4 max-w-md mx-auto">
        {history.length === 0 && !loading && <p className="text-center text-gray-500">No workouts logged yet.</p>}
        {loading && <div className="text-center text-gray-500 flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading History...</div>}
        {history.slice().reverse().map((session) => (
          <div key={session.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <div className="flex justify-between mb-2 pb-2 border-b border-gray-700">
              <span className="text-gray-400 text-sm font-mono">{new Date(session.date).toLocaleDateString()}</span>
              <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">Session</span>
            </div>
            {session.exercises.map((ex, i) => (
              <div key={i} className="mb-3 last:mb-0">
                <div className="font-bold text-blue-400 mb-1">{ex.name}</div>
                <div className="space-y-1">
                  {ex.sets.map((s: any, k) => (
                    <div key={k} className="text-sm grid grid-cols-[1fr_auto] items-center bg-gray-900/30 px-3 py-2 rounded gap-2"><span className="font-medium">{s.weight}kg x {s.reps} <span className="text-gray-600 text-xs ml-1">@ RPE {s.rpe}</span></span>{s.comment && <span className="text-xs text-yellow-500/80 bg-yellow-500/10 px-2 py-0.5 rounded italic truncate max-w-[150px] text-right">"{s.comment}"</span>}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
