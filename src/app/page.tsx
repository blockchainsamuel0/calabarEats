'use client';

import { useState } from 'react';
import AppHeader from '@/components/app-header';
import MealFilters from '@/components/meal-filters';
import MealGrid from '@/components/meal-grid';
import CartSheet from '@/components/cart-sheet';
import { allMeals, mealCategories } from '@/lib/data';
import type { FilterState } from '@/lib/types';
import { UtensilsCrossed } from 'lucide-react';

export default function Home() {
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    maxPrice: 5000,
    search: '',
  });

  const filteredMeals = allMeals.filter((meal) => {
    const categoryMatch =
      filters.category === 'all' || meal.category === filters.category;
    const searchMatch =
      filters.search === '' ||
      meal.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      meal.vendor.toLowerCase().includes(filters.search.toLowerCase());
    return categoryMatch && searchMatch;
  });

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
