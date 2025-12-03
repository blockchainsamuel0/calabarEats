
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCart } from '@/hooks/use-cart';
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
import { createOrder } from '@/ai/orders';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

const orderSchema = z.object({
  // name is not needed if user is logged in, but we can keep it for guest checkout later
  address: z.string().min(10, 'A valid address is required'),
  phone: z.string().min(10, 'A valid phone number is required'),
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface OrderFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function OrderForm({ isOpen, setIsOpen }: OrderFormProps) {
  const { cart, clearCart, totalPrice } = useCart();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useUser();
  const router = useRouter();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      address: '',
      phone: '',
    },
  });

  // Prefill form if user data is available
  useEffect(() => {
    if (user) {
        form.setValue('phone', user.phoneNumber || '');
    }
  }, [user, form]);

  const onSubmit = async (data: OrderFormValues) => {
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to place an order.", variant: 'destructive'});
        router.push('/login');
        return;
    }

    setIsSubmitting(true);
    try {
        const orderInput = {
            items: cart.map(item => ({
                originalId: item.originalId,
                price: item.price,
                quantity: item.quantity,
                vendor: item.vendor,
            })),
            deliveryAddress: data.address,
            phone: data.phone
        };

      const result = await createOrder(orderInput);

      console.log('Order created:', result);
      // clearCart is now handled by the genkit flow after successful order creation.
      setIsOpen(false);
      toast({
        title: 'Order Placed!',
        description: `Your order #${result.orderId.slice(0,6)} is on its way. Thank you!`,
      });
      form.reset();

    } catch (error: any) {
        console.error('Failed to create order:', error);
        toast({
            variant: "destructive",
            title: "Order Failed",
            description: error.message || "There was a problem placing your order. Please try again.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Your Order</DialogTitle>
          <DialogDescription>
            Provide your delivery details. Your order total is {formatPrice(totalPrice)}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Address</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 123, Marian Road, Calabar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 08012345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? 'Placing Order...' : `Place Order - ${formatPrice(totalPrice)}`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
