'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createOrUpdateDish } from '@/firebase/firestore/dishes';
import { Loader2 } from 'lucide-react';
import type { Meal } from '@/lib/types';
import { mealCategories } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const dishSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive('Price must be a positive number')
  ),
  category: z.string().min(1, 'Category is required'),
  imageId: z.string().min(1, 'Image is required'),
  ingredients: z.string().optional(),
});

type DishFormValues = z.infer<typeof dishSchema>;

interface DishFormDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  dish?: Meal | null;
}

export default function DishFormDialog({ isOpen, setIsOpen, dish }: DishFormDialogProps) {
  const user = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DishFormValues>({
    resolver: zodResolver(dishSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      category: '',
      imageId: '',
      ingredients: '',
    },
  });

  useEffect(() => {
    if (dish) {
      form.reset({
        title: dish.name,
        description: dish.description,
        price: dish.price,
        category: dish.category.toLowerCase(),
        imageId: dish.imageId,
        ingredients: dish.ingredients?.join(', ') || '',
      });
    } else {
      form.reset({
        title: '',
        description: '',
        price: 0,
        category: '',
        imageId: '',
        ingredients: '',
      });
    }
  }, [dish, form, isOpen]);

  const onSubmit = async (data: DishFormValues) => {
    if (!user || !firestore) {
      toast({ title: "Authentication Error", description: "You must be logged in.", variant: 'destructive'});
      return;
    }
    setIsSubmitting(true);
    try {
      await createOrUpdateDish(firestore, user.uid, data, dish?.id);
      setIsOpen(false);
      toast({
        title: `Dish ${dish ? 'Updated' : 'Created'}`,
        description: `Your dish "${data.title}" has been saved successfully.`,
      });
    } catch (error: any) {
      console.error('Failed to save dish:', error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message || "There was a problem saving your dish.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dish ? 'Edit Dish' : 'Create a New Dish'}</DialogTitle>
          <DialogDescription>
            Fill out the details below. This will be visible to all customers.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dish Name</FormLabel>
                  <FormControl><Input placeholder="e.g. Afang Soup & Swallow" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Describe your dish..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Price (NGN)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g. 4500" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {mealCategories.filter(c => c !== 'All').map(cat => (
                                <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
            </div>
             <FormField
                control={form.control}
                name="imageId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Image</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select an image" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {PlaceHolderImages.map(img => (
                            <SelectItem key={img.id} value={img.id}>{img.description}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
              control={form.control}
              name="ingredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingredients</FormLabel>
                  <FormControl><Textarea placeholder="Enter ingredients, separated by commas..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {dish ? 'Save Changes' : 'Create Dish'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
