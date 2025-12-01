'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Meal, Addon } from '@/lib/types';
import { useCart } from '@/hooks/use-cart';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChefHat, ShoppingCart } from 'lucide-react';
import AddonDialog from './addon-dialog';

interface MealCardProps {
  meal: Meal;
}

export default function MealCard({ meal }: MealCardProps) {
  const { addToCart } = useCart();
  const image = getPlaceholderImage(meal.imageId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(price);
  };
  
  const handleAddToCart = (selectedAddons: Addon[] = []) => {
    addToCart(meal, 1, selectedAddons);
  };

  const hasAddons = meal.addons && meal.addons.length > 0;

  return (
    <>
      <Card className="flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        {image && (
          <div className="relative h-48 w-full">
            <Image
              src={image.imageUrl}
              alt={meal.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              data-ai-hint={image.imageHint}
            />
          </div>
        )}
        <CardHeader>
          <CardTitle>{meal.name}</CardTitle>
          <CardDescription className="flex items-center pt-1">
              <ChefHat className="w-4 h-4 mr-2 text-muted-foreground"/>
              {meal.vendor}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground">{meal.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <p className="text-xl font-bold text-accent">{formatPrice(meal.price)}</p>
          <Button onClick={() => (hasAddons ? setIsDialogOpen(true) : handleAddToCart())}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
      {hasAddons && (
        <AddonDialog
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          meal={meal}
          onAddToCart={handleAddToCart}
        />
      )}
    </>
  );
}
