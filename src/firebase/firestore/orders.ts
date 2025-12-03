
'use client';
import { collection, addDoc, serverTimestamp, Firestore } from 'firebase/firestore';
import type { Meal } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Creates a new order document in Firestore for a "buy now" action.
 *
 * @param db The Firestore instance.
 * @param userId The ID of the customer placing the order.
 * @param meal The meal being ordered.
 * @returns The ID of the newly created order document.
 */
export async function placeQuickOrder(db: Firestore, userId: string, meal: Meal): Promise<string> {
  const ordersColRef = collection(db, 'orders');

  // This data structure should align with the 'Order' entity in backend.json
  const orderData = {
    customerId: userId,
    chefId: meal.vendor, // Assuming vendor is the chef's ID
    items: [
      {
        dishId: meal.id, // Corresponds to Meal.id
        quantity: 1,
        price: meal.price, // Price at time of order
        // In a real app, you might want a priceId reference here
      },
    ],
    subtotal: meal.price,
    deliveryAddress: { text: 'N/A - Quick Order' }, // Placeholder address
    phone: 'N/A', // Placeholder phone
    status: 'pending',
    payment: {
      method: 'N/A',
      status: 'pending', // e.g., 'pending', 'paid', 'failed'
      reference: '',
    },
    createdAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(ordersColRef, orderData);
    return docRef.id;
  } catch (e: any) {
    const permissionError = new FirestorePermissionError({
      path: ordersColRef.path,
      operation: 'create',
      requestResourceData: orderData,
    });
    errorEmitter.emit('permission-error', permissionError);
    // Re-throw the error to be caught by the calling UI, which can show a toast
    throw e;
  }
}
