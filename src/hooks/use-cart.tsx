'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Meal, CartItem, Addon } from '@/lib/types';
import { useToast } from './use-toast';

interface CartContextType {
  cart: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addToCart: (meal: Meal, quantity: number, selectedAddons: Addon[]) => void;
  removeFromCart: (mealId: string) => void;
  updateQuantity: (mealId: string, quantity: number) => void;
  clearCart: () => void;
  getQuantity: (mealId: string) => number;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const getCartItemId = (mealId: string, addons: Addon[] = []) => {
    if (!addons || addons.length === 0) {
      return mealId;
    }
    const addonIds = addons.map(a => a.id).sort().join('-');
    return `${mealId}-${addonIds}`;
  };

  const addToCart = (meal: Meal, quantity: number = 1, selectedAddons: Addon[] = []) => {
    const cartItemId = getCartItemId(meal.id, selectedAddons);
    
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === cartItemId);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      const addonPrice = selectedAddons.reduce((acc, addon) => acc + addon.price, 0);
      return [
        ...prevCart,
        {
          ...meal,
          id: cartItemId, 
          originalId: meal.id, 
          price: meal.price + addonPrice, 
          quantity,
          selectedAddons,
        },
      ];
    });
    toast({
      title: 'Added to cart',
      description: `${meal.name} is now in your cart.`,
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    const meal = cart.find(item => item.id === cartItemId) || allMeals.find(m => m.id === cartItemId);
    
    if (!meal) return;
    
    const cartItem = cart.find(item => item.id === cartItemId);

    if (cartItem) {
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === cartItemId ? { ...item, quantity } : item
            )
        );
    } else {
        // This is a simple meal (no addons), so we can add it directly.
         const newCartItem: CartItem = {
            ...meal,
            id: meal.id,
            originalId: meal.id,
            quantity: quantity,
            selectedAddons: [],
        };
        setCart(prevCart => [...prevCart, newCartItem]);
        toast({
          title: 'Added to cart',
          description: `${meal.name} is now in your cart.`,
        });
    }
  };
  
  const getQuantity = (mealId: string) => {
    // This will get the total quantity for a meal, even with different addons.
    // We filter for items whose ID starts with the meal's original ID.
    return cart
      .filter(item => item.originalId === mealId)
      .reduce((total, item) => total + item.quantity, 0);
  }

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
        getQuantity,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Dummy allMeals for type checking, assuming it exists somewhere.
// In a real app this would be imported.
const allMeals: Meal[] = [];


export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
