'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Meal } from '@/lib/types';
import { useCart } from '@/hooks/use-cart';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChefHat, Minus, Plus, Loader2 } from 'lucide-react';
import MealDetailDialog from './meal-detail-dialog';
import { useToast } from '@/hooks/use-toast';
import { placeQuickOrder } from '@/firebase/firestore/orders';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

interface MealCardProps {
  meal: Meal;
}

export default function MealCard({ meal }: MealCardProps) {
  const { addItem, updateItemQuantity, getItemQuantity } = useCart();
  const user = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const image = getPlaceholderImage(meal.imageId);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);

  const quantity = getItemQuantity(meal.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleUpdateQuantity = (newQuantity: number) => {
    if (!user) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to add items to your cart.',
        variant: 'destructive',
      });
      router.push('/login');
      return;
    }

    if (quantity === 0 && newQuantity > 0) {
      addItem(meal);
    } else {
      updateItemQuantity(meal.id, newQuantity);
    }
  };

  const handleOrder = async () => {
    if (!user) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to place an order.',
        variant: 'destructive',
      });
      router.push('/login');
      return;
    }
    setIsOrdering(true);
    try {
      const orderId = await placeQuickOrder(user.uid, meal);
      toast({
        title: 'Order Placed!',
        description: `Your order #${orderId.slice(0, 6)} for ${meal.name} has been placed.`,
      });
      // Optionally, redirect to an order confirmation page
      // router.push(`/orders/${orderId}`);
    } catch (error) {
      console.error('Order failed:', error);
      toast({
        title: 'Order Failed',
        description: 'There was a problem placing your order.',
        variant: 'destructive',
      });
    } finally {
      setIsOrdering(false);
    }
  };

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
             <Button onClick={handleOrder} size="sm" disabled={isOrdering}>
                {isOrdering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Order
            </Button>
          </div>
        </CardFooter>
      </Card>

      <MealDetailDialog 
        isOpen={isDetailDialogOpen}
        setIsOpen={setIsDetailDialogOpen}
        meal={meal}
      />
    </>
  );
}
