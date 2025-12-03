
'use client';

import Link from 'next/link';
import { ShoppingBasket, UtensilsCrossed, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { useMemo } from 'react';

export default function AppHeader() {
  const { setIsOpen, totalItems } = useCart();
  const user = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  const userDocRef = useMemo(() => {
    if (user && firestore) {
      return doc(firestore, 'users', user.uid);
    }
    return undefined;
  }, [user, firestore]);
  
  const { data: userData } = useDoc<{role: string}>(userDocRef);
  const isChef = userData?.role === 'chef';

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-auto flex items-center">
          <UtensilsCrossed className="h-6 w-6 mr-2 text-primary" />
          <span className="font-bold text-lg">Calabar Eats</span>
        </Link>
        <div className="flex items-center justify-end space-x-1 md:space-x-2">
          {user ? (
            <>
              {isChef && (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/orders">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
              )}
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
              <Button asChild variant="link" className="hidden sm:inline-flex">
                <Link href="/signup">Become a Partner</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/customer-signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
