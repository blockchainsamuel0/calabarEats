
'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { setupRecaptcha, signInWithPhone } from '@/firebase/auth/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, UtensilsCrossed } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import type { ConfirmationResult } from 'firebase/auth';

const step1Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
});
const step2Schema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

type Step1FormValues = z.infer<typeof step1Schema>;
type Step2FormValues = z.infer<typeof step2Schema>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const step1Form = useForm<Step1FormValues>({
    resolver: zodResolver(step1Schema),
    defaultValues: { name: '', phone: '' },
  });

  const step2Form = useForm<Step2FormValues>({
    resolver: zodResolver(step2Schema),
    defaultValues: { otp: '' },
  });
  
  // This element is used by Firebase for the reCAPTCHA
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);


  const onStep1Submit = async (data: Step1FormValues) => {
    setIsLoading(true);
    if (!recaptchaContainerRef.current) {
        toast({title: "Error", description: "Recaptcha container not found.", variant: 'destructive'});
        setIsLoading(false);
        return;
    }
    
    try {
      const appVerifier = setupRecaptcha(recaptchaContainerRef.current);
      const result = await signInWithPhone(data.phone, appVerifier);
      setConfirmationResult(result);
      setStep(2);
      toast({ title: 'OTP Sent', description: 'Check your phone for a verification code.' });
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Failed to Send OTP',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onStep2Submit = async (data: Step2FormValues) => {
    setIsLoading(true);
    if (!confirmationResult) {
      toast({ title: 'Error', description: 'Verification session expired. Please try again.', variant: 'destructive' });
      setStep(1);
      setIsLoading(false);
      return;
    }

    try {
      const name = step1Form.getValues('name');
      await confirmationResult.confirm(data.otp);
      
      // The auth state change will be handled by our useUser hook,
      // which will create the user doc. We just need to ensure the display name is set.
      // The creation logic is now in `signInWithGoogle` and a new `onUserCreate` listener
      // inside `auth.ts` for phone auth.

       toast({
        title: 'Account Created!',
        description: 'Welcome to Calabar Eats! Your account is pending review.',
      });
      router.push('/vetting-status');

    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message || 'The OTP you entered is incorrect.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
       <div ref={recaptchaContainerRef}></div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="inline-block p-4 bg-primary/10 rounded-full mx-auto mb-4 w-fit">
            <UtensilsCrossed className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Become a Partner</CardTitle>
          <CardDescription>Join Calabar Eats to sell your local meals.</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <Form {...step1Form}>
              <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="space-y-4">
                <FormField
                  control={step1Form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restaurant/Chef Name</FormLabel>
                      <FormControl><Input placeholder="e.g. Mama's Kitchen" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={step1Form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl><Input placeholder="+2348012345678" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send OTP
                </Button>
              </form>
            </Form>
          )}

          {step === 2 && (
             <Form {...step2Form}>
              <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="space-y-4">
                 <FormField
                  control={step2Form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code (OTP)</FormLabel>
                      <FormControl><Input placeholder="••••••" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify & Create Account
                </Button>
                <Button variant="link" size="sm" onClick={() => setStep(1)} className="w-full">
                    Go Back
                </Button>
              </form>
            </Form>
          )}
          
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
