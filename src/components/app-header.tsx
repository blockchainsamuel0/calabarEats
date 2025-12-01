'use client';

import { ShoppingBasket, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';

export default function AppHeader() {
  const { setIsOpen, totalItems } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <UtensilsCrossed className="h-6 w-6 mr-2 text-primary" />
          <span className="font-bold font-headline text-lg">FoodNexus</span>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} aria-label={`Open cart with ${totalItems} items`}>
            <ShoppingBasket className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
