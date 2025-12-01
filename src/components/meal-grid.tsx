'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { Meal } from '@/lib/types';
import MealCard from './meal-card';
import { Utensils } from 'lucide-react';

interface MealGridProps {
  meals: Meal[];
}

export default function MealGrid({ meals }: MealGridProps) {
  if (meals.length === 0) {
    return (
      <div className="text-center py-16">
        <Utensils className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No Meals Found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your filters to find delicious options.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {meals.map((meal) => (
        <motion.div
            key={meal.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
        >
            <MealCard meal={meal} />
        </motion.div>
      ))}
    </div>
  );
}
