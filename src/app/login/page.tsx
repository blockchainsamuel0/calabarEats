
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { signInWithEmail, signInWithGoogle } from '@/firebase/auth/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, UtensilsCrossed } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setGoogleLoading] = useState(false);
  const user = useUser();
  const firestore = useFirestore();

   const userDocRef = useMemo(() => {
    if (user && firestore) {
      return doc(firestore, 'users', user.uid);
    }
    return undefined;
  }, [user, firestore]);
  
  const { data: userData } = useDoc<{role: string; vettingStatus?: string}>(userDocRef);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLoginSuccess = (role?: string, vettingStatus?: string) => {
     toast({
        title: 'Login Successful',
        description: "Welcome back!",
      });

      if (role === 'chef' && vettingStatus !== 'approved') {
        router.push('/vetting-status');
      } else {
        router.push('/');
      }
  }

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    const { user: loggedInUser, error } = await signInWithEmail(data.email, data.password);
    if (error) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
       setIsLoading(false);
    } else {
        // We can't rely on the hook here as it might not have updated yet.
        // A better approach would be to fetch user data directly after login,
        // but for now we'll just redirect and let the destination page handle it.
       router.push('/');
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { user, error } = await signInWithGoogle();
    if (error) {
      toast({
        title: 'Google Sign-In Failed',
        description: error.message,
        variant: 'destructive',
      });
      setGoogleLoading(false);
    } else {
      router.push('/');
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="inline-block p-4 bg-primary/10 rounded-full mx-auto mb-4 w-fit">
                <UtensilsCrossed className="w-8 h-8 text-primary" />
            </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to continue to Calabar Eats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
              <Button onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading} className="w-full">
                  {isGoogleLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.7 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 177.2 56.4l-63.1 61.9C338.4 97.2 297.9 80 248 80c-82.8 0-150.4 66.6-150.4 148.4s67.6 148.4 150.4 148.4c84.3 0 142-63.3 147.1-146.8H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
                  )}
                  Continue with Google
              </Button>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or sign in with email</span>
                </div>
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="name@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading} variant="outline">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </Form>
          </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/customer-signup" className="font-semibold text-primary hover:underline">
                    Sign up
                </Link>
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
