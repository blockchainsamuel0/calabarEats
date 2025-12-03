'use client';

import { useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Utensils, Package, Home, ChefHat, Loader2, ShieldAlert, Wallet } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import type { UserProfile, ChefProfile } from '@/lib/types';

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
    if (user && firestore && userData?.chefProfileId) {
        return doc(firestore, 'chefs', userData.chefProfileId);
    }
    return undefined;
  }, [user, firestore, userData]);

  const { data: chefProfile, loading: chefLoading } = useDoc<ChefProfile>(chefProfileRef);

  const loading = userLoading || chefLoading;

  useEffect(() => {
    if (loading) return; // Wait for data to load

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

    // After approval, check if profile is complete.
    // If not, redirect to setup page.
    if (userData.vettingStatus === 'approved' && !chefProfile?.profileComplete) {
        if (pathname !== '/chef-profile-setup') {
            router.replace('/chef-profile-setup');
        }
    }

  }, [user, userData, chefProfile, loading, router, pathname]);


  if (loading || !user || !userData || (userData.vettingStatus === 'approved' && !chefProfile?.profileComplete && pathname !== '/chef-profile-setup') || (userData.vettingStatus !== 'approved' && pathname !== '/chef-profile-setup')) {
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
    <SidebarProvider>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader>
          <Button variant="ghost" size="icon" className="h-10 w-10" asChild>
            <Link href="/">
              <ChefHat />
              <span className="sr-only">Home</span>
            </Link>
          </Button>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/orders')}>
                    <Link href="/dashboard/orders">
                        <Package />
                        Orders
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/dishes')}>
                    <Link href="/dashboard/dishes">
                        <Utensils />
                        Dishes
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/wallet')}>
                    <Link href="/dashboard/wallet">
                        <Wallet />
                        Wallet
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">Chef Dashboard</h1>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
