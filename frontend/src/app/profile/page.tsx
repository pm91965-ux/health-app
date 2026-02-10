
'use client';

import { useState, useEffect } from 'react';
import { Loader2, User } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { useAuth } from '@/app/auth';
import api from '@/lib/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2">Loading Profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-gray-500">No profile data found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-sans">
      <h1 className="text-2xl font-bold mb-6 text-center">Your Profile</h1>
      <div className="max-w-md mx-auto space-y-6">
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><User size={20} className="text-blue-500"/> Profile</h2>
          <div className="mb-4"><h3 className="text-xs uppercase text-gray-500 font-bold mb-2">Key Principles</h3><ul className="space-y-2">{profile.principles.map((p, i) => (<li key={i} className="text-sm text-gray-300 bg-gray-900/50 p-2 rounded border-l-2 border-blue-500">{p}</li>))}</ul></div>
          <div className="mb-4"><h3 className="text-xs uppercase text-gray-500 font-bold mb-2">Takeaways & Learnings</h3><ul className="space-y-2">{profile.takeaways.map((t, i) => (<li key={i} className="text-sm text-gray-300 bg-gray-900/50 p-2 rounded border-l-2 border-purple-500">{t}</li>))}</ul></div>
          <div><h3 className="text-xs uppercase text-gray-500 font-bold mb-2">Context</h3><ul className="space-y-2">{profile.physical_context.map((c, i) => (<li key={i} className="text-sm text-gray-400 flex gap-2"><span className="text-blue-500">•</span> {c}</li>))}</ul></div>
        </div>
      </div>
    </div>
  );
}
