'use client';

import { useState, useEffect } from 'react';
import { Loader2, Plus, Trash2, FileText, Activity } from 'lucide-react';
import { useAuth } from '@/app/auth';
import { LabResult } from '@/lib/labs_types';
import api from '@/lib/api';

export default function LabsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [labs, setLabs] = useState<LabResult[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [marker, setMarker] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const [range, setRange] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user) {
      fetchLabs();
    }
  }, [user]);

  const fetchLabs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/labs');
      setLabs(response.data);
    } catch (error) {
      console.error('Failed to fetch labs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newLab: Partial<LabResult> = {
        date,
        marker,
        value: Number(value),
        unit,
        reference_range: range,
        notes
      };
      
      await api.post('/labs', newLab);
      setShowForm(false);
      resetForm();
      fetchLabs();
    } catch (error) {
      console.error('Failed to save lab result:', error);
      alert('Failed to save lab result.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this result?')) return;
    try {
      await api.delete('/labs', { data: { id } });
      fetchLabs();
    } catch (error) {
      console.error('Failed to delete lab result:', error);
    }
  };

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setMarker('');
    setValue('');
    setUnit('');
    setRange('');
    setNotes('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-sans pb-24">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="text-blue-500" /> Lab Results
          </h1>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full shadow-lg transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSave} className="bg-gray-800 p-4 rounded-xl border border-gray-700 space-y-4 mb-6 animate-in fade-in slide-in-from-top-4">
            <h2 className="font-bold text-lg mb-2">New Lab Result</h2>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-gray-900 rounded p-2 border border-gray-700 focus:border-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Marker Name (e.g. Vitamin D)</label>
              <input type="text" value={marker} onChange={e => setMarker(e.target.value)} required placeholder="Vitamin D" className="w-full bg-gray-900 rounded p-2 border border-gray-700 focus:border-blue-500 outline-none" />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">Value</label>
                <input type="number" step="any" value={value} onChange={e => setValue(e.target.value)} required placeholder="45" className="w-full bg-gray-900 rounded p-2 border border-gray-700 focus:border-blue-500 outline-none" />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">Unit</label>
                <input type="text" value={unit} onChange={e => setUnit(e.target.value)} required placeholder="ng/mL" className="w-full bg-gray-900 rounded p-2 border border-gray-700 focus:border-blue-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Reference Range (Optional)</label>
              <input type="text" value={range} onChange={e => setRange(e.target.value)} placeholder="30-100" className="w-full bg-gray-900 rounded p-2 border border-gray-700 focus:border-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Notes (Optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full bg-gray-900 rounded p-2 border border-gray-700 focus:border-blue-500 outline-none" />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-colors disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Save Result'}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {loading && !labs.length && (
            <div className="text-center text-gray-500 py-8">
              <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2" />
              Loading Labs...
            </div>
          )}

          {!loading && labs.length === 0 && (
            <div className="text-center text-gray-500 py-8 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No lab results recorded yet.</p>
              <button onClick={() => setShowForm(true)} className="mt-4 text-blue-400 hover:underline">Add your first result</button>
            </div>
          )}

          {labs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((lab) => (
            <div key={lab.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 relative group">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg text-blue-400">{lab.marker}</h3>
                  <p className="text-xs text-gray-400">{new Date(lab.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold">{lab.value}</span>
                  <span className="text-sm text-gray-400 ml-1">{lab.unit}</span>
                </div>
              </div>
              
              {lab.reference_range && (
                <div className="text-xs text-gray-500 bg-gray-900/50 px-2 py-1 rounded inline-block mb-2">
                  Ref: {lab.reference_range}
                </div>
              )}

              {lab.notes && (
                <div className="text-sm text-gray-300 italic mt-1 bg-gray-900/30 p-2 rounded border-l-2 border-blue-500/50">
                  {lab.notes}
                </div>
              )}

              <button 
                onClick={() => handleDelete(lab.id)}
                className="absolute top-4 right-4 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete Result"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
