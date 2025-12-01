'use client';

import { Dispatch, SetStateAction } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from './ui/card';
import type { FilterState } from '@/lib/types';
import { Search } from 'lucide-react';

interface MealFiltersProps {
  filters: FilterState;
  setFilters: Dispatch<SetStateAction<FilterState>>;
  categories: string[];
}

export default function MealFilters({
  filters,
  setFilters,
  categories,
}: MealFiltersProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  return (
    <Card className="mb-8 shadow-lg">
        <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search meals or vendors..."
                        className="pl-10"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                </div>
                <div>
                    <Label htmlFor="category-filter">Category</Label>
                    <Select
                        value={filters.category}
                        onValueChange={(value) => setFilters({ ...filters, category: value })}
                    >
                        <SelectTrigger id="category-filter" className="w-full">
                        <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                        {categories.map((category) => (
                            <SelectItem key={category} value={category.toLowerCase()}>
                            {category}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label>Price Range</Label>
                        <span className="text-sm font-medium text-primary">
                            Up to {formatPrice(filters.maxPrice)}
                        </span>
                    </div>
                    <Slider
                        min={500}
                        max={5000}
                        step={100}
                        value={[filters.maxPrice]}
                        onValueChange={(value) => setFilters({ ...filters, maxPrice: value[0] })}
                    />
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
