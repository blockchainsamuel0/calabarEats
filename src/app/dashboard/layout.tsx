
'use client';

import { useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Utensils, Package, Home, ChefHat, Loader2, ShieldAlert } from 'lucide-react';
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
  
  const { data: userData, loading } = useDoc<{role: string; vettingStatus?: string}>(userDocRef);

  useEffect(() => {
    if (!loading && user) {
        if (userData?.role !== 'chef') {
            router.replace('/');
        } else if (userData?.vettingStatus !== 'approved') {
            router.replace('/vetting-status');
        }
    }
    if (!loading && !user) {
        router.replace('/login');
    }
  }, [user, userData, loading, router]);


  if (loading || !user || !userData || userData.vettingStatus !== 'approved') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
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
