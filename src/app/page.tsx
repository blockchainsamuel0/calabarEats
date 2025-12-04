
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/app-header';
import MealFilters from '@/components/meal-filters';
import MealGrid from '@/components/meal-grid';
import CartSheet from '@/components/cart-sheet';
import { allMeals, mealCategories } from '@/lib/data';
import type { FilterState, UserProfile } from '@/lib/types';
import { UtensilsCrossed, Loader2 } from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function Home() {
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    maxPrice: 5000,
    search: '',
  });
  
  const user = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemo(() => {
    if (user && firestore) {
      return doc(firestore, 'users', user.uid);
    }
    return undefined;
  }, [user, firestore]);
  
  const { data: userData, loading: userLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (!userLoading && userData?.role === 'chef') {
      router.replace('/dashboard');
    }
  }, [userData, userLoading, router]);

  const filteredMeals = allMeals.filter((meal) => {
    // Only show available meals to customers
    if (!meal.isAvailable) return false;

    const categoryMatch =
      filters.category === 'all' || meal.category === filters.category;
    const searchMatch =
      filters.search === '' ||
      meal.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      meal.vendor.toLowerCase().includes(filters.search.toLowerCase());
    return categoryMatch && searchMatch;
  });

  // If user is a chef, show a loading/redirecting screen instead of the customer UI
  if (userLoading || userData?.role === 'chef') {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-muted/40">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppHeader />
      <main className="flex-1 container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-primary/10 rounded-full">
            <UtensilsCrossed className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mt-4">
            Delicious Meals, Delivered.
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the rich flavors of Calabar. Your next favorite meal is just a few clicks away.
          </p>
        </div>
        <MealFilters
          filters={filters}
          setFilters={setFilters}
          categories={mealCategories}
        />
        <MealGrid meals={filteredMeals} />
      </main>
      <CartSheet />
    </div>
  );
}
