'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useUser } from '@/firebase';
import { useChefData } from '@/firebase/firestore/use-chef-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Utensils, Plus, Trash2, Edit } from 'lucide-react';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { deleteDish, updateDishAvailability } from '@/firebase/firestore/dishes';
import { useToast } from '@/hooks/use-toast';
import DishFormDialog from '@/components/dashboard/dish-form';
import type { Meal } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function ChefDishesPage() {
  const user = useUser();
  const { toast } = useToast();
  const { dishes, loading } = useChefData(user?.uid);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Meal | null>(null);

  const handleEdit = (dish: Meal) => {
    setSelectedDish(dish);
    setIsFormOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedDish(null);
    setIsFormOpen(true);
  }

  const handleDelete = (dishId: string) => {
    if(!user) return;
    deleteDish(user.uid, dishId);
    toast({ title: "Dish Deleted", description: "The dish has been removed from your menu."});
  }

  const handleAvailabilityToggle = (dishId: string, isAvailable: boolean) => {
    if(!user) return;
    updateDishAvailability(user.uid, dishId, isAvailable);
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
            <h1 className="text-2xl font-bold tracking-tight">Your Menu</h1>
            <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Dish
            </Button>
        </div>
      {dishes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dishes.map((dish) => {
            const image = getPlaceholderImage(dish.imageId);
            const isAvailable = dish.isAvailable ?? false;
            return (
              <Card key={dish.id} className="flex flex-col">
                {image && (
                  <div className="relative h-40 w-full">
                    <Image src={image.imageUrl} alt={dish.name} fill className="object-cover rounded-t-lg" data-ai-hint={image.imageHint} />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{dish.name}</CardTitle>
                  <CardDescription className="text-lg font-semibold">{formatPrice(dish.price)}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-end">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                           <Switch
                                id={`available-${dish.id}`}
                                checked={isAvailable}
                                onCheckedChange={(checked) => handleAvailabilityToggle(dish.id, checked)}
                            />
                            <Label htmlFor={`available-${dish.id}`} className={isAvailable ? "text-green-600" : "text-muted-foreground"}>
                                {isAvailable ? 'Available' : 'Unavailable'}
                            </Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(dish)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                             <Button variant="destructive" size="icon" onClick={() => handleDelete(dish.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
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
