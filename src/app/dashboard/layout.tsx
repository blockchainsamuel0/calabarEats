
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { LayoutGrid, Utensils, BarChart3, Settings, Loader2, ChefHat, NotebookText, Wallet } from 'lucide-react';
import type { UserProfile, ChefProfile } from '@/lib/types';
import { useEffect, useMemo } from 'react';
import AppHeader from '@/components/app-header';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/dashboard/dishes', label: 'Menu', icon: Utensils },
    { href: '/dashboard/orders', label: 'Orders', icon: NotebookText },
    { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
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
    // Wait until all data is loaded and user object is available
    if (loading || user === undefined) {
      return; 
    }

    // 1. Redirect unauthenticated users
    if (!user) {
        router.replace('/login');
        return;
    }
    
    // 2. Ensure user data is loaded before making role-based decisions
    if (!userData) {
      // If user data is still loading, wait. If it's loaded and null, it's an issue, but the loading flag should cover this.
      return;
    }

    // 3. Handle non-chef users
    if (userData.role !== 'chef') {
        router.replace('/');
        return;
    }
    
    // 4. Handle CHEF onboarding flow
    // At this point, we know user's role is 'chef'.
    
    // If we're already on a setup/status page, don't redirect.
    if (pathname === '/chef-profile-setup' || pathname === '/vetting-status') {
      return;
    }

    // If chef profile doesn't exist or is incomplete, force setup.
    if (!chefProfile || !chefProfile.profileComplete) {
        router.replace('/chef-profile-setup');
        return;
    }

    // If profile is complete, but vetting is not approved, force to status page.
    if (chefProfile.profileComplete && userData.vettingStatus !== 'approved') {
        router.replace('/vetting-status');
        return;
    }

  }, [user, userData, chefProfile, loading, router, pathname]);

  if (loading || user === undefined || !userData) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user's role is not chef, they will be redirected, but we can prevent rendering the layout.
  // Also covers the case where a chef is not yet approved and is on a setup/vetting page.
  if (userData.role !== 'chef' || !chefProfile?.profileComplete || userData.vettingStatus !== 'approved') {
      return <>{children}</>;
  }


  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 pb-20 md:ml-64">{children}</main>
        
        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background md:hidden">
            <nav className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center gap-1 w-full h-full ${
                                isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground'
                            }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>

        {/* Desktop Sidebar - Hidden on mobile */}
        <nav className="hidden md:flex fixed left-0 top-0 h-full flex-col border-r bg-background w-64 p-4">
             <div className="flex items-center gap-2 h-16 border-b px-4 mb-4">
                <ChefHat className="h-6 w-6 text-primary" />
                <h1 className="text-lg font-semibold">Chef Dashboard</h1>
            </div>
            <div className="flex flex-col flex-1">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                                isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:text-primary'
                            }`}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
                 <div className="mt-auto flex flex-col gap-2">
                    <Link
                        href="/dashboard/analytics"
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                            pathname.startsWith('/dashboard/analytics')
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:text-primary'
                        }`}
                        >
                        <BarChart3 className="h-4 w-4" />
                        Analytics
                    </Link>
                    <Link
                        href="/dashboard/settings"
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                            pathname.startsWith('/dashboard/settings')
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:text-primary'
                        }`}
                        >
                        <Settings className="h-4 w-4" />
                        Settings
                    </Link>
                </div>
            </div>
        </nav>
    </div>
  );
}
