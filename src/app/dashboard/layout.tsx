'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { LayoutGrid, Utensils, BarChart3, Settings, Loader2, ChefHat } from 'lucide-react';
import type { UserProfile, ChefProfile } from '@/lib/types';
import { useEffect, useMemo } from 'react';
import AppHeader from '@/components/app-header';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/dashboard/dishes', label: 'Menu', icon: Utensils },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();

  const userDocRef = useMemo(() => {
    if (user && firestore) {
      return doc(firestore, 'users', user.uid);
    }
    return undefined;
  }, [user, firestore]);
  
  const { data: userData, loading: userLoading } = useDoc<UserProfile>(userDocRef);

  const chefProfileRef = useMemo(() => {
    if (user && firestore) {
        // A chef's profile ID is their UID
        return doc(firestore, 'chefs', user.uid);
    }
    return undefined;
  }, [user, firestore]);

  const { data: chefProfile, loading: chefLoading } = useDoc<ChefProfile>(chefProfileRef);

  const loading = userLoading || chefLoading;
  
  useEffect(() => {
    if (loading) return; 

    if (!user) {
        router.replace('/login');
        return;
    }
    
    if (userData?.role !== 'chef') {
        router.replace('/');
        return;
    }
    
    if (userData.vettingStatus !== 'approved' && pathname !== '/chef-profile-setup') {
        router.replace('/vetting-status');
        return;
    }

    if (userData.vettingStatus === 'approved' && !chefProfile?.profileComplete) {
        if (pathname !== '/chef-profile-setup') {
            router.replace('/chef-profile-setup');
        }
    }

  }, [user, userData, chefProfile, loading, router, pathname]);

  if (loading || !user || !userData || (userData.role === 'chef' && userData.vettingStatus !== 'approved')) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If the user is on the setup page, don't render the full dashboard layout
  if (pathname === '/chef-profile-setup') {
      return <>{children}</>;
  }


  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 pb-20">{children}</main>
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background md:hidden">
            <nav className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center justify-center gap-1 w-full h-full ${
                            pathname === item.href
                                ? 'text-primary'
                                : 'text-muted-foreground'
                        }`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>

        {/* Desktop Sidebar - Hidden on mobile */}
        <nav className="hidden md:flex fixed left-0 top-0 h-full flex-col border-r bg-background w-64 p-4">
             <div className="flex items-center gap-2 h-16 border-b px-4 mb-4">
                <ChefHat className="h-6 w-6 text-primary" />
                <h1 className="text-lg font-semibold">Chef Dashboard</h1>
            </div>
            <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                            pathname === item.href
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:text-primary'
                        }`}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                ))}
            </div>
        </nav>
         <div className="hidden md:block md:pl-64">
             {/* This div is to offset the main content for the desktop sidebar */}
         </div>
    </div>
  );
}
