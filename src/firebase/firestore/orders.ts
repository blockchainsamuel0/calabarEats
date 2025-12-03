
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

  const orderData = {
    customerId: userId,
    chefId: meal.vendor, // Assuming vendor is the chefId
    items: [
      {
        dishId: meal.id,
        quantity: 1,
        price: meal.price,
      },
    ],
    subtotal: meal.price,
    deliveryAddress: { text: 'N/A - Quick Order' }, // Placeholder
    phone: 'N/A', // Placeholder
    status: 'pending',
    payment: {
      status: 'pending',
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
    // Re-throw the error to be caught by the calling UI
    throw e;
  }
}
