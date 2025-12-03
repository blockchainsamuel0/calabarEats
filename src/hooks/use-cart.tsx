'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Meal, CartItem } from '@/lib/types';
import { useToast } from './use-toast';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { addItemToCart, updateItemQuantity, removeItemFromCart } from '@/firebase/firestore/cart';
import { collection } from 'firebase/firestore';

interface CartContextType {
  cart: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (meal: Meal) => void;
  removeItem: (mealId: string) => void;
  updateItemQuantity: (mealId: string, quantity: number) => void;
  clearCart: () => void; // This will need to be implemented
  getItemQuantity: (mealId: string) => number;
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

  const cartColPath = user ? `users/${user.uid}/cart` : undefined;
  const cartCol = cartColPath && firestore ? collection(firestore, cartColPath) : undefined;
  const { data: cart, loading, error } = useCollection<CartItem>(cartCol);

  const cartItems = cart || [];

  const addItem = (meal: Meal) => {
    if (!user || !firestore) return;
    addItemToCart(firestore, user.uid, meal);
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
      updateItemQuantity(firestore, user.uid, mealId, quantity);
    }
  };
  
  const getItemQuantity = (mealId: string) => {
    const item = cartItems.find(item => item.id === mealId);
    return item ? item.quantity : 0;
  }

  const clearCart = () => {
    if (!user || !firestore) return;
    // You would need a function to batch delete items
    console.log("Clearing cart...");
  };

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  useEffect(() => {
    if (error) {
        console.error("Error fetching cart:", error);
        toast({
            title: "Could not load cart",
            description: "Please try again later.",
            variant: "destructive",
        });
    }
  }, [error, toast]);


  return (
    <CartContext.Provider
      value={{
        cart: cartItems,
        isOpen,
        setIsOpen,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart,
        getItemQuantity,
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
