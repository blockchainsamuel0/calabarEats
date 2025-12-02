
'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Meal, Addon } from '@/lib/types';
import { useCart } from '@/hooks/use-cart';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChefHat, ShoppingCart, PlusCircle } from 'lucide-react';
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
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  const handleAddToCart = (selectedAddons: Addon[] = []) => {
    addToCart(meal, 1, selectedAddons);
  };

  const hasAddons = meal.addons && meal.addons.length > 0;

  return (
    <>
      <Card className="flex flex-col overflow-hidden h-full transition-shadow duration-300 hover:shadow-lg group">
        {image && (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={image.imageUrl}
              alt={meal.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              data-ai-hint={image.imageHint}
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-lg">{meal.name}</CardTitle>
          <CardDescription className="flex items-center pt-1 text-sm">
              <ChefHat className="w-4 h-4 mr-1.5 text-muted-foreground"/>
              {meal.vendor}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-2">{meal.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center bg-muted/50 p-4">
          <p className="text-lg font-semibold text-foreground">{formatPrice(meal.price)}</p>
          <Button onClick={() => (hasAddons ? setIsDialogOpen(true) : handleAddToCart())} size="sm">
            {hasAddons ? <PlusCircle className="mr-2 h-4 w-4" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
            {hasAddons ? 'Customize' : 'Add to Cart'}
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
