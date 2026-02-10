
'use client';

import { useState, useEffect } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
import { WorkoutPlan } from '@/lib/types';
import { useAuth } from '@/app/auth';
import api from '@/lib/api';

export default function CoachPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [userContext, setUserContext] = useState('');

  const getPlan = async () => {
    setLoading(true);
    try {
      const response = await api.post('/recommendation', { focus: userContext || 'General' });
      setPlan(response.data);
    } catch (e) {
      console.error('Error fetching plan:', e);
      alert('Error fetching plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-sans pb-24">
      <h1 className="text-2xl font-bold mb-6 text-center">AI Coach</h1>
      <main className="max-w-md mx-auto">
        {!plan && (
          <div className="py-6 space-y-4">
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <label className="text-sm font-bold text-gray-400 mb-2 block">How are you feeling today?</label>
              <textarea 
                value={userContext}
                onChange={(e) => setUserContext(e.target.value)}
                placeholder="e.g. Slept well, knee hurts, or 'Leg Day'..."
                className="w-full bg-gray-900 text-white rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-600 min-h-[80px]"
              />
            </div>
            <button onClick={getPlan} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-blue-900/20">
              {loading ? <Loader2 className="animate-spin" /> : 'Get Workout Plan'}
            </button>
          </div>
        )}
        {plan && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <h3 className="text-xs uppercase tracking-wider text-blue-400 font-bold mb-2">Coach's Reasoning</h3>
              <p className="text-sm italic text-gray-300 leading-relaxed">"{plan.reasoning}"</p>
            </div>
            <div className="space-y-3">
              {plan.plan.map((ex: any, i: number) => (
                <div key={i} className="bg-gray-800 p-4 rounded-xl flex justify-between items-start border border-gray-700 shadow-sm">
                  <div>
                    <h3 className="font-bold text-lg text-white">{ex.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{ex.notes}</p>
                  </div>
                  <div className="text-right bg-gray-900 px-3 py-2 rounded-lg">
                    <div className="text-xl font-bold text-blue-400">{ex.weight}<span className="text-sm text-gray-500 ml-1">kg</span></div>
                    <div className="text-sm text-gray-400">{ex.sets} x {ex.reps}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { /* TODO: Navigate to log tab or specific workout */ }} className="flex-1 bg-green-600 hover:bg-green-500 py-3 rounded-lg font-bold text-sm">Start Workout</button>
              <button onClick={() => setPlan(null)} className="px-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400">Clear</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
