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
  
  return (
    <Card className="mb-8 border-none shadow-sm">
        <CardContent className="p-4 md:p-6 bg-card rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="relative">
                    <Label htmlFor="search-input">Search</Label>
                    <Search className="absolute left-3 bottom-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="search-input"
                        placeholder="Search meals or vendors..."
                        className="pl-10 mt-1"
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
                        <SelectTrigger id="category-filter" className="w-full mt-1">
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
            </div>
        </CardContent>
    </Card>
  );
}
