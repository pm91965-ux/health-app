'use client';

import React from 'react';
import { Dumbbell, Plus, BookOpen, MessageSquare, User, LogOut, Utensils, Activity } from 'lucide-react';
import { useAuth } from '@/app/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const { logout } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: <Plus size={18} />, label: 'Log' },
    { href: '/history', icon: <BookOpen size={18} />, label: 'History' },
    { href: '/food', icon: <Utensils size={18} />, label: 'Food' },
    { href: '/labs', icon: <Activity size={18} />, label: 'Labs' },
    { href: '/coach', icon: <MessageSquare size={18} />, label: 'Coach' },
    { href: '/profile', icon: <User size={18} />, label: 'Profile' },
  ];

  return (
    <header className="flex flex-col md:flex-row justify-between items-center mb-6 sticky top-0 bg-gray-900/95 backdrop-blur z-50 py-4 px-4 border-b border-gray-800">
      <div className="flex justify-between w-full md:w-auto items-center mb-4 md:mb-0">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Dumbbell className="text-blue-500" /> GymTracker
        </h1>
        <button onClick={logout} className="md:hidden p-2 rounded-md text-gray-400 hover:text-white"><LogOut size={18} /></button>
      </div>
      
      <div className="flex gap-1 bg-gray-800 p-1 rounded-lg overflow-x-auto max-w-full no-scrollbar">
         {navItems.map((item) => (
           <Link 
             key={item.href}
             href={item.href}
             className={`p-2 rounded-md transition-colors flex items-center gap-2 text-sm whitespace-nowrap ${pathname === item.href ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}>
             {item.icon} <span className="hidden sm:inline">{item.label}</span>
           </Link>
         ))}
         <button onClick={logout} className="hidden md:flex p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/50 items-center gap-2 text-sm"><LogOut size={18} /> Logout</button>
      </div>
    </header>
  );
};

export default Navbar;
