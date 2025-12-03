
'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import type { Meal, CartItem, Addon } from '@/lib/types';
import { useToast } from './use-toast';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { addItemToCart, updateItemQuantity as updateFirestoreQuantity, removeItemFromCart, clearCart as clearFirestoreCart } from '@/firebase/firestore/cart';
import { collection, doc } from 'firebase/firestore';

interface CartContextType {
  cart: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (meal: Meal, quantity: number, addons?: Addon[]) => void;
  removeItem: (mealId: string) => void;
  updateItemQuantity: (mealId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (mealId: string) => number;
  addToCart: (meal: Meal, quantity?: number, selectedAddons?: Addon[]) => void;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const user = useUser();
  const firestore = useFirestore();

  // Use a stable reference for the collection path
  const cartCollectionRef = useMemo(() => {
    if (user && firestore) {
      return collection(firestore, 'users', user.uid, 'cart');
    }
    return undefined;
  }, [user, firestore]);

  const { data: cartFromFirestore, loading, error } = useCollection<CartItem>(cartCollectionRef);

  const cartItems = cartFromFirestore || [];

  const addToCart = (meal: Meal, quantity: number = 1, selectedAddons: Addon[] = []) => {
    if (!user || !firestore) {
       toast({
        title: 'Please log in',
        description: 'You need to be logged in to manage your cart.',
        variant: 'destructive',
      });
      return;
    }

    // The logic to add/increment is now within addItemToCart transaction
    addItemToCart(firestore, user.uid, meal, selectedAddons);
    
    toast({
      title: 'Added to cart',
      description: `${meal.name} is now in your cart.`,
    });
  };

  const removeItem = (mealId: string) => {
    if (!user || !firestore) return;
    removeItemFromCart(firestore, user.uid, mealId);
  };

  const updateItemQuantity = (mealId: string, quantity: number) => {
    if (!user || !firestore) return;
    if (quantity <= 0) {
      removeItem(mealId);
    } else {
      updateFirestoreQuantity(firestore, user.uid, mealId, quantity);
    }
  };
  
  const getItemQuantity = (mealId: string) => {
    const item = cartItems.find(item => item.id === mealId);
    return item ? item.quantity : 0;
  }

  const clearCart = () => {
    if (!user || !firestore) return;
    clearFirestoreCart(firestore, user.uid, cartItems.map(item => item.id));
    console.log("Cart cleared.");
  };

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  useEffect(() => {
    if (error) {
        console.error("Error fetching cart:", error);
        // Avoid spamming toasts if the error is persistent (e.g., rules issue)
    }
  }, [error, toast]);


  return (
    <CartContext.Provider
      value={{
        cart: cartItems,
        isOpen,
        setIsOpen,
        addItem: addToCart,
        removeItem,
        updateItemQuantity,
        clearCart,
        getItemQuantity,
        addToCart,
        totalItems,
        totalPrice,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};


export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
