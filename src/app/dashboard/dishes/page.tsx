'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useUser, useFirestore } from '@/firebase';
import { useChefData } from '@/firebase/firestore/use-chef-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Utensils, Plus, Minus } from 'lucide-react';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { updateDishInventory } from '@/firebase/firestore/dishes';
import { useToast } from '@/hooks/use-toast';
import DishFormDialog from '@/components/dashboard/dish-form';
import type { Meal } from '@/lib/types';

export default function ChefDishesPage() {
  const user = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { dishes, loading } = useChefData(user?.uid);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Meal | null>(null);

  const handleInventoryChange = (dishId: string, currentCount: number, change: number) => {
    if (!firestore) return;
    const newCount = Math.max(0, currentCount + change); // Ensure count doesn't go below 0
    updateDishInventory(firestore, dishId, newCount);
  };

  const handleEdit = (dish: Meal) => {
    setSelectedDish(dish);
    setIsFormOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedDish(null);
    setIsFormOpen(true);
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">Your Dishes</h1>
            <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Dish
            </Button>
        </div>
      {dishes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dishes.map((dish) => {
            const image = getPlaceholderImage(dish.imageId);
            const inventoryCount = dish.inventoryCount || 0;
            return (
              <Card key={dish.id} className="flex flex-col">
                {image && (
                  <div className="relative h-40 w-full">
                    <Image src={image.imageUrl} alt={dish.name} fill className="object-cover rounded-t-lg" data-ai-hint={image.imageHint} />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{dish.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{dish.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-lg font-semibold">{formatPrice(dish.price)}</p>
                        <div className="flex items-center gap-2">
                            <Label htmlFor={`inventory-${dish.id}`} className="text-sm font-medium">Available:</Label>
                            <div className="flex items-center space-x-2">
                                <Button
                                    id={`inventory-${dish.id}`}
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleInventoryChange(dish.id, inventoryCount, -1)}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-6 text-center font-medium">{inventoryCount}</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleInventoryChange(dish.id, inventoryCount, 1)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <div className="p-4 pt-0">
                    <Button variant="outline" className="w-full" onClick={() => handleEdit(dish)}>
                        Edit Dish
                    </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-background/50 p-12 text-center">
            <Utensils className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Dishes Found</h3>
            <p className="mt-1 text-sm text-muted-foreground">Add your first dish to get started.</p>
            <Button className="mt-4" onClick={handleAddNew}>Add New Dish</Button>
        </div>
      )}
      <DishFormDialog
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        dish={selectedDish}
      />
    </div>
  );
}
