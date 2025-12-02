
'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import type { Meal, Addon } from '@/lib/types';
import { useCart } from '@/hooks/use-cart';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChefHat, Minus, Plus } from 'lucide-react';
import AddonDialog from './addon-dialog';
import MealDetailDialog from './meal-detail-dialog';
import { useToast } from '@/hooks/use-toast';

interface MealCardProps {
  meal: Meal;
}

export default function MealCard({ meal }: MealCardProps) {
  const { addToCart, updateQuantity, getQuantity, cart, setIsOpen: setCartOpen } = useCart();
  const { toast } = useToast();
  const image = getPlaceholderImage(meal.imageId);
  const [isAddonDialogOpen, setIsAddonDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    setQuantity(getQuantity(meal.id));
  }, [cart, getQuantity, meal.id]);

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
  
  const handlePrimaryAction = () => {
    if (meal.addons && meal.addons.length > 0) {
      setIsAddonDialogOpen(true);
    } else {
      handleAddToCart();
    }
  };

  const handleUpdateQuantity = (newQuantity: number) => {
    // This is a simplified version. For meals with addons, this would
    // require more complex logic to know *which* cart item to update.
    // For now, we assume no addons when using the stepper.
    if (quantity > 0 && meal.addons && meal.addons.length > 0) {
       toast({
        title: 'Item has add-ons',
        description: 'Please manage this item from your cart.',
      });
      return;
    }
     if (quantity === 0 && newQuantity > 0 && meal.addons && meal.addons.length > 0) {
      setIsAddonDialogOpen(true);
      return;
    }
    
    // Find the simple cart item (no addons)
    const cartItemId = meal.id;
    updateQuantity(cartItemId, newQuantity);
  }

  const handleOrderClick = () => {
    if (quantity === 0) {
        // If no items are selected, add one to the cart and open it.
        handleUpdateQuantity(1);
    }
    setCartOpen(true);
  }

  return (
    <>
      <Card className="flex flex-col overflow-hidden h-full transition-shadow duration-300 hover:shadow-lg group">
        <div
          className="cursor-pointer"
          onClick={() => setIsDetailDialogOpen(true)}
        >
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
        </div>
        <CardFooter className="flex justify-between items-center bg-muted/50 p-4 mt-auto">
          <p className="text-lg font-semibold text-foreground">{formatPrice(meal.price)}</p>
          <div className="flex items-center gap-2">
            {quantity === 0 ? (
                <Button onClick={() => handleUpdateQuantity(1)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
            ) : (
                <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleUpdateQuantity(quantity - 1)}
                >
                    <Minus className="h-4 w-4" />
                </Button>
                <span className="w-6 text-center font-medium">{quantity}</span>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleUpdateQuantity(quantity + 1)}
                >
                    <Plus className="h-4 w-4" />
                </Button>
                </div>
            )}
             <Button onClick={handleOrderClick} size="sm">
                Order
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {meal.addons && meal.addons.length > 0 && (
        <AddonDialog
          isOpen={isAddonDialogOpen}
          setIsOpen={setIsAddonDialogOpen}
          meal={meal}
          onAddToCart={handleAddToCart}
        />
      )}

      <MealDetailDialog 
        isOpen={isDetailDialogOpen}
        setIsOpen={setIsDetailDialogOpen}
        meal={meal}
      />
    </>
  );
}
