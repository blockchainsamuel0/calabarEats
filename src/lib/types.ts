
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
  id: string; // Corresponds to Meal ID / document ID in cart
  originalId: string; // Corresponds to original Meal ID from data
  name: string;
  price: number;
  quantity: number;
  imageId: string;
  vendor: string;
  selectedAddons?: Addon[];
}

export interface FilterState {
  category: string;
  maxPrice: number;
  search: string;
}
