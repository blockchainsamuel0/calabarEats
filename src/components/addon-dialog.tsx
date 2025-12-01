'use client';

import { useState } from 'react';
import type { Meal, Addon } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface AddonDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  meal: Meal;
  onAddToCart: (selectedAddons: Addon[]) => void;
}

export default function AddonDialog({ isOpen, setIsOpen, meal, onAddToCart }: AddonDialogProps) {
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);

  const handleAddonToggle = (addon: Addon) => {
    setSelectedAddons((prev) =>
      prev.some((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const calculateTotalPrice = () => {
    const addonsPrice = selectedAddons.reduce((total, addon) => total + addon.price, 0);
    return meal.price + addonsPrice;
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(price);
  };

  const handleConfirm = () => {
    onAddToCart(selectedAddons);
    setIsOpen(false);
    setSelectedAddons([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{meal.name}</DialogTitle>
          <DialogDescription>
            Customize your meal with these tasty add-ons.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {meal.addons?.map((addon) => (
            <div key={addon.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Checkbox
                        id={`addon-${addon.id}`}
                        onCheckedChange={() => handleAddonToggle(addon)}
                        checked={selectedAddons.some((a) => a.id === addon.id)}
                    />
                    <Label htmlFor={`addon-${addon.id}`} className="text-base font-normal">
                        {addon.name}
                    </Label>
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                    + {formatPrice(addon.price)}
                </span>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={handleConfirm} className="w-full">
            Add to Cart - {formatPrice(calculateTotalPrice())}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
