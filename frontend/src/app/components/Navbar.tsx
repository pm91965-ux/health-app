
'use client';

import React from 'react';
import { Dumbbell, Plus, BookOpen, MessageSquare, User, Utensils, Activity, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '@/app/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const { logout } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: <Plus size={20} />, label: 'Log' },
    { href: '/history', icon: <BookOpen size={20} />, label: 'History' },
    { href: '/food', icon: <Utensils size={20} />, label: 'Food' },
    { href: '/calendar', icon: <Calendar size={20} />, label: 'Calendar' }, // Added calendar
    { href: '/labs', icon: <Activity size={20} />, label: 'Labs' },
    { href: '/coach', icon: <MessageSquare size={20} />, label: 'Coach' },
    { href: '/profile', icon: <User size={20} />, label: 'Profile' },
  ];

  return (
    <>
      {/* Top Header - Visible on all screens, but logout is desktop only */}
      <header className="flex justify-between items-center mb-6 px-4 py-4 sticky top-0 bg-gray-900/95 backdrop-blur z-50 border-b border-gray-800">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Dumbbell className="text-blue-500" /> GymTracker
        </h1>
        <button onClick={logout} className="hidden md:flex p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/50 items-center gap-2 text-sm"><LogOut size={18} /> Logout</button>
      </header>

      {/* Bottom Navigation - Mobile Only (hidden on md and larger) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 md:hidden z-50">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 text-xs font-medium rounded-md transition-colors ${pathname === item.href ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
            >
              {item.icon}
              <span className="mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop Navigation - Visible on md and larger screens (replaces the old horizontal bar) */}
      <nav className="hidden md:flex flex-wrap gap-2 justify-center mb-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`p-2 rounded-md transition-colors flex items-center gap-2 text-sm whitespace-nowrap ${pathname === item.href ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
          >
            {item.icon} {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
};

export default Navbar;
