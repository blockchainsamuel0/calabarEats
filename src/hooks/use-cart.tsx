'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Meal, CartItem } from '@/lib/types';
import { useToast } from './use-toast';

interface CartContextType {
  cart: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addToCart: (meal: Meal, quantity?: number) => void;
  removeFromCart: (mealId: string) => void;
  updateQuantity: (mealId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const addToCart = (meal: Meal, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === meal.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === meal.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...meal, quantity }];
    });
    toast({
      title: 'Added to cart',
      description: `${meal.name} has been added to your cart.`,
    });
    setIsOpen(true);
  };

  const removeFromCart = (mealId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== mealId));
  };

  const updateQuantity = (mealId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(mealId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === mealId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        setIsOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
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
