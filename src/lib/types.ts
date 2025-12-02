
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

export interface CartItem extends Meal {
  quantity: number;
  selectedAddons?: Addon[];
  originalId: string;
}

export interface FilterState {
  category: string;
  maxPrice: number;
  search: string;
}
