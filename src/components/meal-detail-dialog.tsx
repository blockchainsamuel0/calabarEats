
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
import { ChefHat, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';

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
      <DialogContent className="max-w-lg p-0">
        <div className="md:grid md:grid-cols-2 md:gap-6">
            <div className="relative h-48 md:h-full w-full overflow-hidden rounded-t-lg md:rounded-l-lg md:rounded-t-none">
            {image && (
                <Image
                    src={image.imageUrl}
                    alt={meal.name}
                    fill
                    className="object-cover"
                    data-ai-hint={image.imageHint}
                />
            )}
            </div>
            
            <div className="flex flex-col justify-between p-6">
                <div>
                    <DialogHeader className="text-left p-0">
                        <DialogTitle className="text-2xl font-bold tracking-tight">{meal.name}</DialogTitle>
                        <DialogDescription className="flex items-center pt-2 text-base">
                            <ChefHat className="w-5 h-5 mr-2 text-muted-foreground" />
                            <span className="font-medium">{meal.vendor}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <p className="text-sm text-muted-foreground">{meal.description}</p>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2 text-sm">Ingredients</h4>
                            <p className="text-xs text-muted-foreground">
                                {meal.ingredients?.join(', ') || 'Not specified'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center pt-6 mt-auto">
                    <p className="text-2xl font-bold text-primary">{formatPrice(meal.price)}</p>
                    {/* Add to cart button could be placed here in the future */}
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
