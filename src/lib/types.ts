
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
  vendor: string; // This is the Chef's User ID
  imageId: string;
  addons?: Addon[];
  ingredients?: string[];
  isAvailable?: boolean;
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

export interface Order {
    id: string;
    customerId: string;
    customerName?: string;
    chefId: string;
    items: OrderItem[];
    subtotal: number;
    deliveryAddress: { text: string };
    phone: string;
    status: 'pending' | 'accepted' | 'ready' | 'completed' | 'cancelled';
    createdAt: any; // Firestore Timestamp
}

export interface OrderItem {
    dishId: string;
    dishName: string;
    quantity: number;
    price: number;
}


export interface UserProfile {
    uid: string;
    name: string;
    email?: string;
    phone?: string;
    role: 'customer' | 'chef' | 'admin';
    vettingStatus?: 'pending' | 'approved' | 'rejected';
    createdAt: any;
}
