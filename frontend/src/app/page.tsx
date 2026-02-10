'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Dumbbell, Save, Plus, Trash2, MessageSquare, User, BookOpen, Utensils, Zap, Activity, TestTube, Send, Heart, Copy, Pencil, X, Check, Mic, Calendar } from 'lucide-react';
import { WorkoutSession, Exercise, Set, LiftType, UserProfile } from '@/lib/types';
import { DayNutrition, Meal } from '@/lib/nutrition_types';
import { FavoriteMeal } from '@/lib/favorites_store';
import { LabResult } from '@/lib/labs_types';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [userContext, setUserContext] = useState('');
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'coach' | 'log' | 'history' | 'profile' | 'food' | 'labs' | 'chat' | 'calendar'>('coach');

  // Calendar State
  const [calendarData, setCalendarData] = useState<Record<string, any>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'calendar' && !selectedDate) {
        fetch(`/api/nutrition/month?month=${currentMonth}`).then(res => res.json()).then(setCalendarData);
    }
  }, [activeTab, currentMonth, selectedDate]);

  // Nutrition State
  const [foodInput, setFoodInput] = useState('');
  const [nutrition, setNutrition] = useState<DayNutrition | null>(null);
  const [foodLoading, setFoodLoading] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteMeal[]>([]);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  // Labs State
  const [labs, setLabs] = useState<LabResult[]>([]);
  const [labForm, setLabForm] = useState<Partial<LabResult>>({ marker: '', value: 0, unit: '', notes: '' });
  const [labLoading, setLabLoading] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  // Voice State
  const [isListening, setIsListening] = useState(false);

  const startListening = (onResult: (text: string) => void) => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice not supported (try Chrome/Safari)");
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    setIsListening(true);
    recognition.onresult = (e: any) => {
      onResult(e.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // Logging State
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logTime, setLogTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [currentExercises, setCurrentExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    fetch('/api/history').then(res => res.json()).then(setHistory);
    fetch('/api/profile').then(res => res.json()).then(setProfile);
    fetch('/api/nutrition').then(res => res.json()).then(setNutrition);
    fetch('/api/labs').then(res => res.json()).then(setLabs);
    fetch('/api/favorites').then(res => res.json()).then(setFavorites);
  }, [activeTab]);

  // ... (Helper functions: sendMessage, addFood, etc.)
  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const newMsgs = [...messages, { role: 'user' as const, content: chatInput }];
    setMessages(newMsgs);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ messages: newMsgs }) });
      const data = await res.json();
      setMessages([...newMsgs, data]);
    } catch (e) { alert("Chat failed"); } finally { setChatLoading(false); }
  };

  const addFood = async () => {
    if(!foodInput) return;
    setFoodLoading(true);
    try {
      await fetch('/api/nutrition', { method: 'POST', body: JSON.stringify({ description: foodInput }) });
      setFoodInput('');
      const res = await fetch('/api/nutrition');
      setNutrition(await res.json());
    } catch(e) { alert("Failed to log food"); } finally { setFoodLoading(false); }
  };

  const addFavorite = async (meal: Meal) => {
    const name = prompt("Name this favorite meal:", meal.description);
    if (!name) return;
    await fetch('/api/favorites', { method: 'POST', body: JSON.stringify({ name, description: meal.description, macros: meal.macros }) });
    fetch('/api/favorites').then(res => res.json()).then(setFavorites);
  };

  const useFavorite = async (fav: FavoriteMeal) => {
    setFoodLoading(true);
    await fetch('/api/nutrition', { method: 'POST', body: JSON.stringify({ description: fav.description, macros: fav.macros }) });
    const res = await fetch('/api/nutrition');
    setNutrition(await res.json());
    setFoodLoading(false);
  };

  const copyMeal = async (meal: Meal) => {
    setFoodLoading(true);
    await fetch('/api/nutrition', { method: 'POST', body: JSON.stringify({ description: meal.description, macros: meal.macros }) });
    const res = await fetch('/api/nutrition');
    setNutrition(await res.json());
    setFoodLoading(false);
  };

  const saveEdit = async () => {
    if (!editingMeal) return;
    try {
      await fetch('/api/nutrition', { method: 'PUT', body: JSON.stringify(editingMeal) });
      setEditingMeal(null);
      const res = await fetch('/api/nutrition');
      setNutrition(await res.json());
    } catch(e) { alert("Failed to update"); }
  };

  const removeFood = async (id: string) => {
    if (!confirm('Delete this meal?')) return;
    try {
      await fetch('/api/nutrition', { method: 'DELETE', body: JSON.stringify({ id }) });
      const res = await fetch('/api/nutrition');
      setNutrition(await res.json());
    } catch(e) { alert("Failed to delete"); }
  };

  const getPlan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recommend', { method: 'POST', body: JSON.stringify({ focus: userContext || 'General' }) });
      const data = await res.json();
      setPlan(data);
    } catch (e) { alert('Error fetching plan'); } finally { setLoading(false); }
  };

  const addExercise = (name: LiftType) => { setCurrentExercises([...currentExercises, { name, sets: [] }]); };
  
  const addSet = (exIndex: number) => {
    const newExs = [...currentExercises];
    const lastSet = newExs[exIndex].sets[newExs[exIndex].sets.length - 1];
    newExs[exIndex].sets.push({ weight: lastSet?.weight || 60, reps: lastSet?.reps || 5, rpe: 8 });
    setCurrentExercises(newExs);
  };

  const updateSet = (exIndex: number, setIndex: number, field: keyof Set | 'comment', val: any) => {
    const newExs = [...currentExercises];
    if (field === 'comment') { (newExs[exIndex].sets[setIndex] as any).comment = val; }
    else { (newExs[exIndex].sets[setIndex] as any)[field] = Number(val); }
    setCurrentExercises(newExs);
  };

  const removeSet = (exIndex: number, setIndex: number) => {
    const newExs = [...currentExercises];
    newExs[exIndex].sets.splice(setIndex, 1);
    setCurrentExercises(newExs);
  };

  const saveWorkout = async () => {
    if (currentExercises.length === 0) return;
    setLoading(true);
    const session: WorkoutSession = { id: Date.now().toString(), date: new Date(logDate).toISOString(), exercises: currentExercises };
    const res = await fetch('/api/history', { method: 'POST', body: JSON.stringify(session) });
    const data = await res.json();
    setLoading(false);
    if (data.analysis && data.analysis.feedback) { alert(`📢 Coach's Assessment:\n\n${data.analysis.feedback}\n\n(New Insights: ${data.analysis.new_takeaways.length})`); } else { alert('Workout Saved!'); }
    setCurrentExercises([]);
    setActiveTab('history');
  };

  const addLab = async () => {
    if(!labForm.marker || !labForm.value) return;
    setLabLoading(true);
    try {
      await fetch('/api/labs', { method: 'POST', body: JSON.stringify(labForm) });
      setLabForm({ marker: '', value: 0, unit: '', notes: '' });
      const res = await fetch('/api/labs');
      setLabs(await res.json());
    } catch(e) { alert("Failed to log lab"); } finally { setLabLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-sans pb-24">
      <header className="flex justify-between items-center mb-6 sticky top-0 bg-gray-900/95 backdrop-blur z-20 py-4 border-b border-gray-800">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Dumbbell className="text-blue-500" /> GymTracker
        </h1>
        <div className="flex gap-1 bg-gray-800 p-1 rounded-lg">
           {['coach', 'log', 'food', 'calendar', 'labs', 'chat', 'history', 'profile'].map(tab => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className={`p-2 rounded-md transition-colors ${activeTab === tab ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>
               {tab === 'coach' && <Loader2 size={18} className={activeTab === 'coach' ? '' : 'animate-pulse-slow'} />} 
               {tab === 'log' && <Plus size={18} />}
               {tab === 'history' && <BookOpen size={18} />}
               {tab === 'profile' && <User size={18} />}
               {tab === 'food' && <Utensils size={18} />}
               {tab === 'labs' && <TestTube size={18} />}
               {tab === 'chat' && <MessageSquare size={18} />}
               {tab === 'calendar' && <Calendar size={18} />}
             </button>
           ))}
        </div>
      </header>

      {/* COACH TAB */}
      {activeTab === 'coach' && (
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
                <button onClick={() => { setActiveTab('log'); }} className="flex-1 bg-green-600 hover:bg-green-500 py-3 rounded-lg font-bold text-sm">Start Workout</button>
                <button onClick={() => setPlan(null)} className="px-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400">Clear</button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* LOG TAB */}
      {activeTab === 'log' && (
        <div className="max-w-md mx-auto space-y-6">
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
            {(['Bench', 'Squat', 'Deadlift'] as LiftType[]).map(lift => (
              <button key={lift} onClick={() => addExercise(lift)} className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-full whitespace-nowrap hover:bg-gray-700 active:scale-95 transition-all text-sm font-medium">+ {lift}</button>
            ))}
          </div>
          <div className="space-y-6">
            {currentExercises.map((ex, i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-4 border border-gray-700 relative">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-lg text-blue-400">{ex.name}</h3>
                   <button onClick={() => removeSet(i, 0)} className="text-gray-500 hover:text-red-400"><Trash2 size={18} /></button>
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
                       <div className="mt-2 pt-2 border-t border-gray-700/50 flex items-center gap-2">
                         <MessageSquare size={16} className="text-gray-500" />
                         <input type="text" placeholder="Add note..." className="bg-gray-800 text-sm text-white w-full p-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-600" onChange={(e) => updateSet(i, j, 'comment', e.target.value)} />
                       </div>
                     </div>
                   ))}
                 </div>
                 <button onClick={() => addSet(i)} className="mt-4 w-full py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-sm text-gray-300 flex justify-center items-center gap-2 border border-dashed border-gray-600 hover:border-gray-500 transition-colors"><Plus size={16} /> Add Set</button>
              </div>
            ))}
          </div>
          {currentExercises.length > 0 && (
             <div className="fixed bottom-6 left-0 right-0 px-4 max-w-md mx-auto z-30">
                <button onClick={saveWorkout} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 shadow-xl shadow-black/50 py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2">{loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Workout</>}</button>
             </div>
          )}
        </div>
      )}

      {/* LABS TAB */}
      {activeTab === 'labs' && (
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
             <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><TestTube size={20} className="text-purple-500"/> Log Lab Result</h2>
             <div className="space-y-3">
               <input type="text" placeholder="Marker (e.g. Vitamin D)" value={labForm.marker} onChange={(e) => setLabForm({...labForm, marker: e.target.value})} className="w-full bg-gray-900 text-white rounded p-3 focus:outline-none border border-gray-700 focus:border-purple-500"/>}
               <div className="flex gap-2">
                 <input type="number" placeholder="Value" value={labForm.value || ''} onChange={(e) => setLabForm({...labForm, value: parseFloat(e.target.value)})} className="flex-1 bg-gray-900 text-white rounded p-3 focus:outline-none border border-gray-700 focus:border-purple-500"/>
                 <input type="text" placeholder="Unit (e.g. ng/mL)" value={labForm.unit} onChange={(e) => setLabForm({...labForm, unit: e.target.value})} className="flex-1 bg-gray-900 text-white rounded p-3 focus:outline-none border border-gray-700 focus:border-purple-500"/>
               </div>
               <input type="text" placeholder="Notes (e.g. range 30-100)" value={labForm.notes} onChange={(e) => setLabForm({...labForm, notes: e.target.value})} className="w-full bg-gray-900 text-white rounded p-3 focus:outline-none border border-gray-700 focus:border-purple-500 text-sm"/>
               <button onClick={addLab} disabled={labLoading} className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-lg font-bold flex justify-center items-center gap-2">{labLoading ? <Loader2 className="animate-spin" /> : 'Save Result'}</button>
             </div>
          </div>
          <div className="space-y-3">
            {labs.slice().reverse().map((lab) => (
              <div key={lab.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                <div><h3 className="font-bold text-white">{lab.marker}</h3><p className="text-xs text-gray-400">{new Date(lab.date).toLocaleDateString()} • {lab.notes}</p></div>
                <div className="text-right"><div className="text-xl font-bold text-purple-400">{lab.value} <span className="text-sm text-gray-500"></span></div></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHAT TAB */}
      {activeTab === 'chat' && (
        <div className="max-w-md mx-auto h-[80vh] flex flex-col bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-10"><p>Hello! I'm your Health Assistant.</p><p className="text-sm mt-2">Ask me about your workouts, nutrition, or blood work.</p></div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl p-3 text-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-700 text-gray-200 rounded-tl-none'}`}>{m.content}</div>
              </div>
            ))}
            {chatLoading && <div className="flex justify-start"><div className="bg-gray-700 rounded-xl p-3 rounded-tl-none flex gap-1"><div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div></div></div>}
            <div ref={chatEndRef} />
          </div>
          <div className="p-3 bg-gray-900 border-t border-gray-700 flex gap-2">
            <button onClick={() => startListening((text) => setChatInput(text))} className={`p-3 rounded-lg text-white ${isListening ? 'bg-red-600 animate-pulse' : 'bg-gray-800 hover:bg-gray-700'}`}><Mic size={20} /></button>
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask anything..." className="flex-1 bg-gray-800 text-white rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500" onKeyDown={(e) => e.key === 'Enter' && sendMessage()}/>
            <button onClick={sendMessage} disabled={chatLoading} className="bg-blue-600 hover:bg-blue-500 p-3 rounded-lg text-white disabled:opacity-50"><Send size={20} /></button>
          </div>
        </div>
      )}
      
      {/* CALENDAR TAB */}
      {activeTab === 'calendar' && (
        <div className="max-w-md mx-auto space-y-4">
          {selectedDate ? (
            <div className="space-y-4">
               <button onClick={() => setSelectedDate(null)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-2">← Back to Month</button>
               <h2 className="text-xl font-bold flex items-center gap-2"><Calendar size={20} className="text-blue-500" /> {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
               <DayList date={selectedDate} onEdit={setEditingMeal} onDelete={removeFood} />
            </div>
          ) : (
            <>
            <div className="flex justify-between items-center bg-gray-800 p-3 rounded-xl border border-gray-700">
            <button onClick={() => setCurrentMonth(prev => { const d = new Date(prev + '-01'); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 7); })} className="p-2 hover:bg-gray-700 rounded text-gray-400">←</button>
            <h2 className="font-bold text-lg">{new Date(currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
            <button onClick={() => setCurrentMonth(prev => { const d = new Date(prev + '-01'); d.setMonth(d.getMonth() + 1); return d.toISOString().slice(0, 7); })} className="p-2 hover:bg-gray-700 rounded text-gray-400">→</button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['S','M','T','W','T','F','S'].map((d, i) => (<div key={`header-${i}`} className="text-center text-xs text-gray-500 font-bold py-2">{d}</div>))}
            {Array.from({ length: new Date(currentMonth + '-01').getDay() }).map((_, i) => (<div key={`empty-${i}`} className="bg-transparent h-20"></div>))}
            {Array.from({ length: new Date(new Date(currentMonth).getFullYear(), new Date(currentMonth).getMonth() + 1, 0).getDate() }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentMonth}-${day.toString().padStart(2, '0')}`;
              const data = calendarData[dateStr];
              return (
                <div key={day} onClick={() => setSelectedDate(dateStr)} className="bg-gray-800 border border-gray-700 rounded-lg h-24 p-1 flex flex-col justify-between hover:bg-gray-700 cursor-pointer transition-colors">
                  <div className="text-xs text-gray-400 font-bold">{day}</div>
                  {data && (
                    <div className="space-y-1">
                      <div className="text-xs text-yellow-500 font-bold leading-none">{Math.round(data.calories)}</div>
                      <div className="flex flex-col gap-0.5 text-[9px] font-mono leading-tight">
                        <span className="text-blue-400">{Math.round(data.protein)}p</span>
                        <span className="text-green-400">{Math.round(data.carbs)}c</span>
                        <span className="text-red-400">{Math.round(data.fat)}f</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          </>
          )}
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="space-y-4 max-w-md mx-auto">
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
      )}

      {/* NUTRITION TAB */}
      {activeTab === 'food' && nutrition && (
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
             <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Zap size={20} className="text-yellow-500"/> Daily Summary</h2>
             <div className="grid grid-cols-4 gap-2 text-center">
               <div className="bg-gray-900/50 p-2 rounded"><div className="text-xs text-gray-500 uppercase font-bold">Cals</div><div className="text-xl font-bold text-white">{nutrition.total.calories}</div></div>
               <div className="bg-gray-900/50 p-2 rounded"><div className="text-xs text-gray-500 uppercase font-bold">Prot</div><div className="text-xl font-bold text-blue-400">{nutrition.total.protein}g</div></div>
               <div className="bg-gray-900/50 p-2 rounded"><div className="text-xs text-gray-500 uppercase font-bold">Carb</div><div className="text-xl font-bold text-green-400">{nutrition.total.carbs}g</div></div>
               <div className="bg-gray-900/50 p-2 rounded"><div className="text-xs text-gray-500 uppercase font-bold">Fat</div><div className="text-xl font-bold text-red-400">{nutrition.total.fat}g</div></div>
             </div>
          </div>
          {editingMeal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 w-full max-w-sm space-y-4">
                <h3 className="text-xl font-bold">Edit Meal</h3>
                <div><label className="text-xs text-gray-500 uppercase">Description</label><input type="text" value={editingMeal.description} onChange={e => setEditingMeal({...editingMeal, description: e.target.value})} className="w-full bg-gray-900 rounded p-2 text-white"/></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-gray-500 uppercase">Date</label><input type="date" value={editingMeal.date} onChange={e => setEditingMeal({...editingMeal, date: e.target.value})} className="w-full bg-gray-900 rounded p-2 text-white"/></div>
                  <div><label className="text-xs text-gray-500 uppercase">Time</label><input type="time" value={editingMeal.time} onChange={e => setEditingMeal({...editingMeal, time: e.target.value})} className="w-full bg-gray-900 rounded p-2 text-white"/></div>
                  <div><label className="text-xs text-gray-500 uppercase">Calories</label><input type="number" value={editingMeal.macros.calories} onChange={e => setEditingMeal({...editingMeal, macros: {...editingMeal.macros, calories: Number(e.target.value)}})} className="w-full bg-gray-900 rounded p-2 text-white font-bold text-yellow-500"/></div>
                  <div><label className="text-xs text-gray-500 uppercase">Protein (g)</label><input type="number" value={editingMeal.macros.protein} onChange={e => setEditingMeal({...editingMeal, macros: {...editingMeal.macros, protein: Number(e.target.value)}})} className="w-full bg-gray-900 rounded p-2 text-white font-bold text-blue-500"/></div>
                  <div><label className="text-xs text-gray-500 uppercase">Carbs (g)</label><input type="number" value={editingMeal.macros.carbs} onChange={e => setEditingMeal({...editingMeal, macros: {...editingMeal.macros, carbs: Number(e.target.value)}})} className="w-full bg-gray-900 rounded p-2 text-white font-bold text-green-500"/></div>
                  <div><label className="text-xs text-gray-500 uppercase">Fat (g)</label><input type="number" value={editingMeal.macros.fat} onChange={e => setEditingMeal({...editingMeal, macros: {...editingMeal.macros, fat: Number(e.target.value)}})} className="w-full bg-gray-900 rounded p-2 text-white font-bold text-red-500"/></div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={saveEdit} className="flex-1 bg-green-600 hover:bg-green-500 py-3 rounded-lg font-bold flex justify-center items-center gap-2"><Check size={18} /> Save</button>
                  <button onClick={() => setEditingMeal(null)} className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-bold flex justify-center items-center gap-2"><X size={18} /> Cancel</button>
                </div>
              </div>
            </div>
          )}
          {favorites.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {favorites.map(fav => (
                <button key={fav.id} onClick={() => useFavorite(fav)} className="bg-gray-800 border border-purple-500/30 hover:border-purple-500 px-3 py-2 rounded-lg whitespace-nowrap text-sm flex flex-col items-start min-w-[100px]"><span className="font-bold text-purple-400">{fav.name}</span><span className="text-[10px] text-gray-500">{fav.macros.calories} kcal</span></button>
              ))}
            </div>
          )}
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex gap-2">
            <button onClick={() => startListening((text) => setFoodInput(text))} className={`p-3 rounded-lg text-white ${isListening ? 'bg-red-600 animate-pulse' : 'bg-gray-900 hover:bg-gray-700 border border-gray-600'}`}><Mic size={20} /></button>
            <input type="text" value={foodInput} onChange={(e) => setFoodInput(e.target.value)} placeholder="e.g. 200g Steak and Rice" className="flex-1 bg-gray-900 text-white rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-600" onKeyDown={(e) => e.key === 'Enter' && addFood()}/>
            <button onClick={addFood} disabled={foodLoading} className="bg-blue-600 hover:bg-blue-500 px-4 rounded-lg font-bold flex items-center">{foodLoading ? <Loader2 className="animate-spin" /> : <Plus />}</button>
          </div>
          <div className="space-y-3">
             {nutrition.meals.length === 0 && <p className="text-center text-gray-500 py-4">No meals logged today.</p>}
             {nutrition.meals.slice().reverse().map((meal) => (
               <div key={meal.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                 <div className="flex justify-between items-start mb-2">
                   <div><h3 className="font-bold text-white text-lg">{meal.description}</h3><p className="text-xs text-gray-400">{meal.time} • {meal.ai_analysis}</p></div>
                   <div className="text-right flex flex-col items-end gap-2"><div className="font-bold text-yellow-500">{meal.macros.calories} kcal</div><div className="flex gap-2"><button onClick={() => addFavorite(meal)} className="text-gray-600 hover:text-purple-400"><Heart size={16} /></button><button onClick={() => setEditingMeal(meal)} className="text-gray-600 hover:text-yellow-400"><Pencil size={16} /></button><button onClick={() => copyMeal(meal)} className="text-gray-600 hover:text-blue-400"><Copy size={16} /></button><button onClick={() => removeFood(meal.id)} className="text-gray-600 hover:text-red-400"><Trash2 size={16} /></button></div></div>
                 </div>
                 <div className="flex gap-3 text-sm text-gray-400"><span><span className="text-blue-400 font-bold">{meal.macros.protein}p</span></span><span><span className="text-green-400 font-bold">{meal.macros.carbs}c</span></span><span><span className="text-red-400 font-bold">{meal.macros.fat}f</span></span></div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && profile && (
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
             <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><User size={20} className="text-blue-500"/> Profile</h2>
             <div className="mb-4"><h3 className="text-xs uppercase text-gray-500 font-bold mb-2">Key Principles</h3><ul className="space-y-2">{profile.principles.map((p, i) => (<li key={i} className="text-sm text-gray-300 bg-gray-900/50 p-2 rounded border-l-2 border-blue-500">{p}</li>))}</ul></div>
             <div className="mb-4"><h3 className="text-xs uppercase text-gray-500 font-bold mb-2">Takeaways & Learnings</h3><ul className="space-y-2">{profile.takeaways.map((t, i) => (<li key={i} className="text-sm text-gray-300 bg-gray-900/50 p-2 rounded border-l-2 border-purple-500">{t}</li>))}</ul></div>
             <div><h3 className="text-xs uppercase text-gray-500 font-bold mb-2">Context</h3><ul className="space-y-2">{profile.physical_context.map((c, i) => (<li key={i} className="text-sm text-gray-400 flex gap-2"><span className="text-blue-500">•</span> {c}</li>))}</ul></div>
          </div>
        </div>
      )}
    </div>
  );
}

function DayList({ date, onEdit, onDelete }: { date: string; onEdit: any; onDelete: any }) {
  const [data, setData] = useState<DayNutrition | null>(null);

  useEffect(() => {
    fetch(`/api/nutrition?date=${date}`).then(res => res.json()).then(setData);
  }, [date]);

  if (!data) return <Loader2 className="animate-spin" />;

  return (
    <div className="space-y-3">
       {data.meals.length === 0 && <p className="text-gray-500">No meals logged.</p>}
       {data.meals.slice().reverse().map((meal) => (
         <div key={meal.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700">
           <div className="flex justify-between items-start mb-2">
             <div>
               <h3 className="font-bold text-white text-lg">{meal.description}</h3>
               <p className="text-xs text-gray-400">{meal.time} • {meal.ai_analysis}</p>
             </div>
             <div className="text-right flex flex-col items-end gap-2">
               <div className="font-bold text-yellow-500">{meal.macros.calories} kcal</div>
               <div className="flex gap-2">
                 <button onClick={() => onEdit(meal)} className="text-gray-600 hover:text-yellow-400"><Pencil size={16} /></button>
                 <button onClick={() => onDelete(meal.id)} className="text-gray-600 hover:text-red-400"><Trash2 size={16} /></button>
               </div>
             </div>
           </div>
           <div className="flex gap-3 text-sm text-gray-400">
              <span><span className="text-blue-400 font-bold">{meal.macros.protein}p</span></span>
              <span><span className="text-green-400 font-bold">{meal.macros.carbs}c</span></span>
              <span><span className="text-red-400 font-bold">{meal.macros.fat}f</span></span>
           </div>
         </div>
       ))}
    </div>
  );
}
