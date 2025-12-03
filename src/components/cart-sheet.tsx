
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import OrderForm from './order-form';

export default function CartSheet() {
  const { cart, isOpen, setIsOpen, updateItemQuantity, removeItem, totalItems, totalPrice } = useCart();
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(price);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
          <SheetHeader className="px-6">
            <SheetTitle>My Cart ({totalItems})</SheetTitle>
          </SheetHeader>
          <Separator />
          {cart.length > 0 ? (
            <>
              <ScrollArea className="flex-1">
                <div className="flex flex-col gap-6 p-6">
                  {cart.map((item) => {
                    const image = getPlaceholderImage(item.imageId);
                    return (
                      <div key={item.id} className="flex items-start space-x-4">
                        <div className="relative h-20 w-20 overflow-hidden rounded-md flex-shrink-0">
                          {image && (
                            <Image
                              src={image.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover"
                              data-ai-hint={image.imageHint}
                            />
                          )}
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <h3 className="font-medium leading-tight">{item.name}</h3>
                           <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-6 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                           <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                           <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(item.id)}
                           >
                            <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              <Separator />
              <SheetFooter className="p-6">
                <div className="w-full space-y-4">
                    <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span>{formatPrice(totalPrice)}</span>
                    </div>
                    <Button className="w-full" size="lg" onClick={() => {
                      setIsOpen(false);
                      setCheckoutOpen(true);
                    }}>
                        Proceed to Checkout
                    </Button>
                </div>
              </SheetFooter>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center p-8">
                <div className="rounded-full border-2 border-dashed border-muted-foreground/50 bg-secondary p-8">
                    <ShoppingCart className="h-16 w-16 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold">Your cart is empty</h2>
                <p className="text-muted-foreground">Add some delicious meals to get started!</p>
                <SheetClose asChild>
                    <Button>Start Ordering</Button>
                </SheetClose>
            </div>
          )}
        </SheetContent>
      </Sheet>
      <OrderForm isOpen={isCheckoutOpen} setIsOpen={setCheckoutOpen} />
    </>
  );
}
