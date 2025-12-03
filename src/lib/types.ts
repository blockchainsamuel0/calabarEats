
export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface Meal {
  id:string;
  name: string;
  description: string;
  price: number;
  category: string;
  vendor: string;
  imageId: string;
  addons?: Addon[];
  ingredients?: string[];
}

export interface CartItem {
  id: string; // Corresponds to Meal ID
  name: string;
  price: number;
  quantity: number;
  imageId: string;
  vendor: string;
}

export interface FilterState {
  category: string;
  maxPrice: number;
  search: string;
}
