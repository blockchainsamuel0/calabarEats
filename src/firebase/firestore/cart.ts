
'use client';
import { doc, setDoc, deleteDoc, runTransaction, writeBatch, Firestore, collection, getDocs } from 'firebase/firestore';
import type { CartItem, Meal } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Adds a meal to the user's cart or updates its quantity if it already exists.
 *
 * @param db The Firestore instance.
 * @param userId The ID of the user.
 * @param meal The meal to add to the cart.
 */
export function addItemToCart(db: Firestore, userId: string, meal: Meal & { originalId: string }) {
  const cartItemRef = doc(db, 'users', userId, 'cart', meal.id);

  runTransaction(db, async (transaction) => {
    const cartItemDoc = await transaction.get(cartItemRef);
    if (cartItemDoc.exists()) {
      const currentQuantity = cartItemDoc.data().quantity || 0;
      transaction.update(cartItemRef, { quantity: currentQuantity + 1 });
    } else {
      const newCartItem: CartItem = {
        id: meal.id,
        originalId: meal.originalId,
        name: meal.name,
        price: meal.price,
        quantity: 1,
        imageId: meal.imageId,
        vendor: meal.vendor,
      };
      transaction.set(cartItemRef, newCartItem);
    }
  }).catch((e: any) => {
    const permissionError = new FirestorePermissionError({
      path: cartItemRef.path,
      operation: 'update', // Can be create or update
    });
    errorEmitter.emit('permission-error', permissionError);
    console.error("Transaction failed: ", e);
  });
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

/**
 * Removes all items from the user's cart.
 *
 * @param db The Firestore instance.
 * @param userId The ID of the user.
 * @param itemIds The array of item IDs to remove.
 */
export function clearCart(db: Firestore, userId: string, itemIds: string[]) {
    const batch = writeBatch(db);
    const cartCollectionRef = collection(db, 'users', userId, 'cart');

    itemIds.forEach(id => {
        const docRef = doc(cartCollectionRef, id);
        batch.delete(docRef);
    });

    batch.commit().catch(e => {
        // A permission error on any of the deletes will cause the whole batch to fail.
        const permissionError = new FirestorePermissionError({
            path: cartCollectionRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Failed to clear cart:", e);
    });
}
