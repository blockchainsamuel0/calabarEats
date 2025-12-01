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
    // Price match is always true now
    const priceMatch = true;
    const searchMatch =
      filters.search === '' ||
      meal.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      meal.vendor.toLowerCase().includes(filters.search.toLowerCase());
    return categoryMatch && priceMatch && searchMatch;
  });

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex-1 container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
            <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-accent">
            Discover Delicious Meals in Calabar
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Your one-stop shop for the best local cuisine. Filter by category, price, and more to find your next favorite meal.
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
