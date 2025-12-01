export interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  vendor: string;
  imageId: string;
}

export interface CartItem extends Meal {
  quantity: number;
}

export interface FilterState {
  category: string;
  maxPrice: number;
  search: string;
}
