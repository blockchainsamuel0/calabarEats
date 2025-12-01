'use client';

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

const orderSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  address: z.string().min(10, 'A valid address is required'),
  phone: z.string().min(10, 'A valid phone number is required'),
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface OrderFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function OrderForm({ isOpen, setIsOpen }: OrderFormProps) {
  const { clearCart, totalPrice } = useCart();
  const { toast } = useToast();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
    },
  });

  const onSubmit = (data: OrderFormValues) => {
    console.log('Order submitted:', data);
    clearCart();
    setIsOpen(false);
    toast({
      title: 'Order Placed!',
      description: 'Your delicious meal is on its way. Thank you for your order!',
    });
    form.reset();
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              <Button type="submit" className="w-full">
                Place Order - {formatPrice(totalPrice)}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
