
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useWallet, updatePayoutDetails } from '@/firebase/firestore/wallet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, DollarSign, Banknote, Smartphone } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';

const payoutSchema = z.object({
  accountName: z.string().min(3, 'Account name is required'),
  accountNumber: z.string().length(10, 'Account number must be 10 digits'),
  bankName: z.string().min(3, 'Bank name is required'),
  mobileMoneyNumber: z.string().optional(),
});

type PayoutFormValues = z.infer<typeof payoutSchema>;

export default function WalletPage() {
  const user = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { wallet, loading } = useWallet(user?.uid);

  const form = useForm<PayoutFormValues>({
    resolver: zodResolver(payoutSchema),
    defaultValues: {
      accountName: wallet?.payoutDetails?.accountName || '',
      accountNumber: wallet?.payoutDetails?.accountNumber || '',
      bankName: wallet?.payoutDetails?.bankName || '',
      mobileMoneyNumber: wallet?.payoutDetails?.mobileMoneyNumber || '',
    },
  });

  // When wallet data loads, reset the form with the fetched values
  useState(() => {
    if (wallet?.payoutDetails) {
      form.reset(wallet.payoutDetails);
    }
  });

  const onSubmit = async (data: PayoutFormValues) => {
    if (!user) {
      toast({ title: "Error", description: "Not authenticated", variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      await updatePayoutDetails(user.uid, data);
      toast({
        title: "Payout Details Saved",
        description: "Your payout information has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Could not save your details.",
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">My Wallet</h1>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(wallet?.balance || 0)}</div>
            <p className="text-xs text-muted-foreground">Ready for immediate payout</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Balance</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(wallet?.pending || 0)}</div>
            <p className="text-xs text-muted-foreground">From recent orders, clearing soon</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payout Setup</CardTitle>
          <CardDescription>
            Enter your bank or mobile money details for automated settlements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Holder Name</FormLabel>
                      <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl><Input placeholder="First Bank" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Account Number</FormLabel>
                      <FormControl><Input type="number" placeholder="0123456789" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               <FormField
                  control={form.control}
                  name="mobileMoneyNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Money Number (Optional)</FormLabel>
                      <FormControl><Input placeholder="e.g. 08012345678" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Payout Details
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
