
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { createOrUpdateChefProfile } from '@/firebase/firestore/chefs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, UtensilsCrossed, Upload } from 'lucide-react';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const photoSchema = z.instanceof(File).refine(file => file.size <= MAX_FILE_SIZE, 'Max file size is 5MB.');

const profileSetupSchema = z.object({
  name: z.string().min(3, 'Business name must be at least 3 characters'),
  address: z.string().min(10, 'Please enter a valid address'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  vettingPhotos: z.array(photoSchema).min(5, 'You must upload exactly 5 photos.').max(5, 'You must upload exactly 5 photos.'),
});

type ProfileSetupFormValues = z.infer<typeof profileSetupSchema>;

const photoSlots = [
    { id: 'photo1', label: 'Kitchen Area 1' },
    { id: 'photo2', label: 'Kitchen Area 2' },
    { id: 'photo3', label: 'Storage Area' },
    { id: 'photo4', label: 'Waste Disposal Area' },
    { id: 'photo5', label: 'Packaging Area' },
];

export default function ChefProfileSetupPage() {
  const user = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState<Record<string, string>>({});
  
  const {data: userData} = useDoc<UserProfile>(user && firestore ? doc(firestore, 'users', user.uid) : undefined);

  const form = useForm<ProfileSetupFormValues>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      name: '',
      address: '',
      startTime: '09:00',
      endTime: '18:00',
      vettingPhotos: [],
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const files = Array.from(e.target.files || []);
    const currentPhotos = form.getValues('vettingPhotos') || [];
    const newPhotos = [...currentPhotos, ...files].slice(0, 5); // Enforce max 5
    field.onChange(newPhotos);

    // Create previews
    const newPreviews: Record<string, string> = {};
    newPhotos.forEach((file, index) => {
        newPreviews[`photo${index+1}`] = URL.createObjectURL(file);
    });
    setPhotoPreviews(newPreviews);
  };


  const onSubmit = async (data: ProfileSetupFormValues) => {
    if (!user || !firestore || !userData?.chefProfileId) {
        toast({ title: "Error", description: "User session not found. Please log in again.", variant: 'destructive'});
        return;
    }
    setIsLoading(true);

    try {
        await createOrUpdateChefProfile(firestore, user.uid, data, userData.chefProfileId);
        toast({
            title: "Profile Complete!",
            description: "Your profile has been set up. Welcome to the dashboard!",
        });
        router.push('/dashboard');
    } catch (error: any) {
        console.error("Profile setup failed:", error);
        toast({
            title: "Setup Failed",
            description: error.message || "Could not save your profile. Please try again.",
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="inline-block p-4 bg-primary/10 rounded-full mx-auto mb-4 w-fit">
            <UtensilsCrossed className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>
            You're approved! Just a few more details to get you started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl><Input placeholder="e.g. Mama's Finest Kitchen" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Business Address</FormLabel>
                      <FormControl><Input placeholder="123 Foodie Lane, Calabar" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Opening Time</FormLabel>
                        <FormControl><Input type="time" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Closing Time</FormLabel>
                        <FormControl><Input type="time" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                <FormField
                  control={form.control}
                  name="vettingPhotos"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel>Vetting Photos</FormLabel>
                        <FormDescription>Upload 5 photos as per the Quality Pledge.</FormDescription>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-2">
                            {photoSlots.map((slot, index) => (
                                <div key={slot.id} className="aspect-square w-full">
                                    <label htmlFor={slot.id} className="cursor-pointer border-2 border-dashed rounded-md flex flex-col items-center justify-center h-full w-full bg-muted/50 hover:bg-muted">
                                        {photoPreviews[slot.id] ? (
                                            <img src={photoPreviews[slot.id]} alt={slot.label} className="h-full w-full object-cover rounded-md"/>
                                        ) : (
                                            <div className="text-center text-muted-foreground p-2">
                                                <Upload className="h-6 w-6 mx-auto" />
                                                <span className="text-xs block mt-1">{slot.label}</span>
                                            </div>
                                        )}
                                    </label>
                                    <Input
                                        id={slot.id}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handlePhotoChange(e, field)}
                                        multiple={false} // Handle one by one to make it simpler
                                    />
                                </div>
                            ))}
                        </div>
                        <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full !mt-8" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Profile & Enter Dashboard
                </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
