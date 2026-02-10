
'use client';

import React, { ReactNode } from 'react';
import { useAuth } from './auth';
import Navbar from './components/Navbar'; // Import Navbar
import { usePathname } from 'next/navigation';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  
  const noNavbarPaths = ['/login', '/register', '/']; // Paths where Navbar should not be shown
  const shouldShowNavbar = user && !isLoading && !noNavbarPaths.includes(pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      {children}
    </>
  );
};

export default AuthLayout;
