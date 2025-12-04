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
  isAvailable?: boolean;
  isLocalRecipe?: boolean;
  madeFreshDaily?: boolean;
  // Deprecated, use vendor field instead.
  chefId?: string;
  // Not using these from original data
  inventoryCount?: number;
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
    chefProfileId?: string;
    createdAt: any;
}


export interface ChefProfile {
    id: string;
    ownerUserId: string;
    name: string;
    addressText: string;
    workingHours?: {
        start: string;
        end: string;
    },
    vettingPhotoUrls?: string[];
    profileComplete?: boolean;
    photoUrl?: string;
    rating?: number;
    status?: 'open' | 'closed';
}

export interface PayoutDetails {
    accountName: string;
    accountNumber: string;
    bankName: string;
    mobileMoneyNumber?: string;
}

export interface Wallet {
    id: string;
    balance: number;
    pending: number;
    payoutDetails?: PayoutDetails;
}
