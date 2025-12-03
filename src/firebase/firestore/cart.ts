
'use client';
import { doc, setDoc, deleteDoc, runTransaction, Firestore, collection, getDoc } from 'firebase/firestore';
import type { Meal } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Adds a meal to the user's cart or updates its quantity if it already exists.
 * If the meal is already in the cart, it increments the quantity.
 *
 * @param db The Firestore instance.
 * @param userId The ID of the user.
 * @param meal The meal to add to the cart.
 */
export async function addItemToCart(db: Firestore, userId: string, meal: Meal) {
  const cartItemRef = doc(db, 'users', userId, 'cart', meal.id);

  try {
    await runTransaction(db, async (transaction) => {
      const cartItemDoc = await transaction.get(cartItemRef);
      if (cartItemDoc.exists()) {
        const currentQuantity = cartItemDoc.data().quantity || 0;
        transaction.update(cartItemRef, { quantity: currentQuantity + 1 });
      } else {
        const newCartItem = {
          id: meal.id,
          name: meal.name,
          price: meal.price,
          quantity: 1,
          imageId: meal.imageId,
          vendor: meal.vendor,
        };
        transaction.set(cartItemRef, newCartItem);
      }
    });
  } catch (e: any) {
    const permissionError = new FirestorePermissionError({
      path: cartItemRef.path,
      operation: 'update',
    });
    errorEmitter.emit('permission-error', permissionError);
    console.error("Transaction failed: ", e);
  }
}


/**
 * Updates the quantity of a specific item in the user's cart.
 *
 * @param db The Firestore instance.
 * @param userId The ID of the user.
 * @param mealId The ID of the meal to update.
 * @param quantity The new quantity. If 0, the item is removed.
 */
export function updateItemQuantity(db: Firestore, userId: string, mealId: string, quantity: number) {
  const cartItemRef = doc(db, 'users', userId, 'cart', mealId);
  if (quantity <= 0) {
    removeItemFromCart(db, userId, mealId);
    return;
  }
  
  setDoc(cartItemRef, { quantity }, { merge: true }).catch((e) => {
    const permissionError = new FirestorePermissionError({
        path: cartItemRef.path,
        operation: 'update',
        requestResourceData: { quantity },
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}


/**
 * Removes an item completely from the user's cart.
 *
 * @param db The Firestore instance.
 * @param userId The ID of the user.
 * @param mealId The ID of the meal to remove.
 */
export function removeItemFromCart(db: Firestore, userId: string, mealId: string) {
  const cartItemRef = doc(db, 'users', userId, 'cart', mealId);
  deleteDoc(cartItemRef).catch((e) => {
    const permissionError = new FirestorePermissionError({
        path: cartItemRef.path,
        operation: 'delete',
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}
