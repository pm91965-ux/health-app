
'use client';

import { useState, useEffect } from 'react';
import { Loader2, Plus, Trash2, Pencil, Copy, Heart, X, Check, Mic, Utensils, Zap, Calendar } from 'lucide-react';
import { DayNutrition, Meal, FavoriteMeal, UserProfile } from '@/lib/types'; // Assuming DayNutrition, Meal, FavoriteMeal and UserProfile are defined in types.ts
import api from '@/lib/api';
import { useAuth } from '@/app/auth';

export default function FoodPage() {
  const { user } = useAuth();
  const [foodInput, setFoodInput] = useState('');
  const [nutrition, setNutrition] = useState<DayNutrition | null>(null);
  const [foodLoading, setFoodLoading] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteMeal[]>([]);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  // Calendar State (for DayList component if it needs it)
  const [calendarData, setCalendarData] = useState<Record<string, any>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0]); // Default to today


  useEffect(() => {
    if (user) {
        fetchNutrition();
        fetchFavorites();
    }
  }, [user, selectedDate]);

  const fetchNutrition = async () => {
    setFoodLoading(true);
    try {
      const response = await api.get(`/nutrition?date=${selectedDate}`);
      setNutrition(response.data);
    } catch (error) {
      console.error('Failed to fetch nutrition data:', error);
    } finally {
      setFoodLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/favorites');
      setFavorites(response.data);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    }
  };

  const addFood = async () => {
    if(!foodInput) return;
    setFoodLoading(true);
    try {
      await api.post('/nutrition', { description: foodInput, date: selectedDate });
      setFoodInput('');
      fetchNutrition();
    } catch(e) { console.error('Failed to log food:', e); alert("Failed to log food"); } finally { setFoodLoading(false); }
  };

  const addFavorite = async (meal: Meal) => {
    const name = prompt("Name this favorite meal:", meal.description);
    if (!name) return;
    try {
        await api.post('/favorites', { name, description: meal.description, macros: meal.macros });
        fetchFavorites();
    } catch(e) { console.error('Failed to add favorite:', e); alert("Failed to add favorite"); }
  };

  const useFavorite = async (fav: FavoriteMeal) => {
    setFoodLoading(true);
    try {
        await api.post('/nutrition', { description: fav.description, macros: fav.macros, date: selectedDate });
        fetchNutrition();
    } catch(e) { console.error('Failed to use favorite:', e); alert("Failed to use favorite"); } finally { setFoodLoading(false); }
  };

  const copyMeal = async (meal: Meal) => {
    setFoodLoading(true);
    try {
        await api.post('/nutrition', { description: meal.description, macros: meal.macros, date: selectedDate });
        fetchNutrition();
    } catch(e) { console.error('Failed to copy meal:', e); alert("Failed to copy meal"); } finally { setFoodLoading(false); }
  };

  const saveEdit = async () => {
    if (!editingMeal) return;
    setFoodLoading(true);
    try {
      await api.put('/nutrition', editingMeal);
      setEditingMeal(null);
      fetchNutrition();
    } catch(e) { console.error('Failed to update meal:', e); alert("Failed to update"); } finally { setFoodLoading(false); }
  };

  const removeFood = async (id: string) => {
    if (!confirm('Delete this meal?')) return;
    try {
      await api.delete('/nutrition', { data: { id } });
      fetchNutrition();
    } catch(e) { console.error('Failed to delete meal:', e); alert("Failed to delete"); }
  };

  // Voice State (if needed for food input)
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


  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-sans pb-24">
      <h1 className="text-2xl font-bold mb-6 text-center">Food Tracking</h1>
      <div className="max-w-md mx-auto space-y-6">
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Zap size={20} className="text-yellow-500"/> Daily Summary</h2>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-gray-900/50 p-2 rounded"><div className="text-xs text-gray-500 uppercase font-bold">Cals</div><div className="text-xl font-bold text-white">{nutrition?.total.calories || 0}</div></div>
            <div className="bg-gray-900/50 p-2 rounded"><div className="text-xs text-gray-500 uppercase font-bold">Prot</div><div className="text-xl font-bold text-blue-400">{nutrition?.total.protein || 0}g</div></div>
            <div className="bg-gray-900/50 p-2 rounded"><div className="text-xs text-gray-500 uppercase font-bold">Carb</div><div className="text-xl font-bold text-green-400">{nutrition?.total.carbs || 0}g</div></div>
            <div className="bg-gray-900/50 p-2 rounded"><div className="text-xs text-gray-500 uppercase font-bold">Fat</div><div className="text-xl font-bold text-red-400">{nutrition?.total.fat || 0}g</div></div>
          </div>
          <div className="mt-4">
             <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
             <input
               type="date"
               value={selectedDate || ''}
               onChange={(e) => setSelectedDate(e.target.value)}
               className="w-full bg-gray-900 text-white rounded-lg p-3 focus:outline-none border border-gray-700 focus:border-blue-500"
             />
          </div>
        </div>
        {editingMeal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 w-full max-w-sm space-y-4">
              <h3 className="text-xl font-bold">Edit Meal</h3>
              <div><label className="text-xs text-gray-500 uppercase">Description</label><input type="text" value={editingMeal.description} onChange={e => setEditingMeal({...editingMeal, description: e.target.value})} className="w-full bg-gray-900 rounded p-2 text-white"/></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-gray-500 uppercase">Date</label><input type="date" value={editingMeal.date.split('T')[0]} onChange={e => setEditingMeal({...editingMeal, date: e.target.value})} className="w-full bg-gray-900 rounded p-2 text-white"/></div>
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
           {nutrition?.meals.length === 0 && !foodLoading && <p className="text-center text-gray-500 py-4">No meals logged today.</p>}
           {foodLoading && <div className="text-center text-gray-500 flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading Meals...</div>}
           {nutrition?.meals.slice().reverse().map((meal) => (
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
    </div>
  );
}

// DayList component (extracted and modified to be self-contained or passed props as needed)
// For simplicity, this is kept here for now but could be moved to a separate file.
// It expects `date`, `onEdit`, `onDelete` as props if used outside FoodPage.
function DayList({ date, onEdit, onDelete }: { date: string; onEdit: any; onDelete: any }) {
  const [data, setData] = useState<DayNutrition | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
   api.get(`/nutrition?date=${date}`)
  .then((res) => res.data)
  .then(setData)
  .finally(() => setLoading(false));

  }, [date]);

  if (loading) return <div className="text-center text-gray-500"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading Day List...</div>;
  if (!data) return <p className="text-gray-500">No data for this day.</p>;

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
