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
}

export interface CartItem extends Meal {
  quantity: number;
  selectedAddons?: Addon[];
}

export interface FilterState {
  category: string;
  maxPrice: number;
  search: string;
}
