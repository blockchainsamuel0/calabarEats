
'use client';

import Image from 'next/image';
import type { Meal } from '@/lib/types';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ChefHat } from 'lucide-react';

interface MealDetailDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  meal: Meal;
}

export default function MealDetailDialog({ isOpen, setIsOpen, meal }: MealDetailDialogProps) {
  const image = getPlaceholderImage(meal.imageId);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        {image && (
          <div className="relative h-64 w-full overflow-hidden rounded-t-lg">
            <Image
              src={image.imageUrl}
              alt={meal.name}
              fill
              className="object-cover"
              data-ai-hint={image.imageHint}
            />
          </div>
        )}
        <DialogHeader className="p-6 text-left">
          <DialogTitle className="text-2xl font-bold tracking-tight">{meal.name}</DialogTitle>
          <DialogDescription className="flex items-center pt-2 text-base">
            <ChefHat className="w-5 h-5 mr-2 text-muted-foreground" />
            <span className="font-medium">{meal.vendor}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6 space-y-4">
            <p className="text-muted-foreground">{meal.description}</p>
            <div>
                <h4 className="font-semibold text-foreground mb-2">Ingredients</h4>
                <p className="text-sm text-muted-foreground">
                    {meal.ingredients?.join(', ') || 'Not specified'}
                </p>
            </div>
            <div className="flex justify-between items-center pt-4">
                <p className="text-2xl font-bold text-primary">{formatPrice(meal.price)}</p>
                {/* Add to cart button could be placed here in the future */}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
