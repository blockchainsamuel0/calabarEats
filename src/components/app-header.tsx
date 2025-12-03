'use client';

import Link from 'next/link';
import { ShoppingBasket, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';

export default function AppHeader() {
  const { setIsOpen, totalItems } = useCart();
  const user = useUser();
  const auth = useAuth();

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-4 flex items-center">
          <UtensilsCrossed className="h-6 w-6 mr-2 text-primary" />
          <span className="font-bold text-lg">Calabar Eats</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {user ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(true)}
                aria-label={`Open cart with ${totalItems} items`}
                className="relative"
              >
                <ShoppingBasket className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {totalItems}
                  </span>
                )}
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
