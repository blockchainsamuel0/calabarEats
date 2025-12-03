'use client';
import { collection, addDoc, updateDoc, serverTimestamp, doc, Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Creates or updates a dish document in Firestore.
 *
 * @param db The Firestore instance.
 * @param chefId The ID of the chef creating/updating the dish.
 * @param data The dish data from the form.
 * @param dishId Optional ID of the dish to update. If not provided, a new dish is created.
 */
export async function createOrUpdateDish(db: Firestore, chefId: string, data: any, dishId?: string) {
  const dishData = {
    chefId,
    title: data.title,
    name: data.title, // for consistency with Meal type
    vendor: chefId, // for consistency with Meal type
    description: data.description,
    price: data.price,
    category: data.category,
    imageId: data.imageId,
    ingredients: data.ingredients ? data.ingredients.split(',').map((s: string) => s.trim()) : [],
    updatedAt: serverTimestamp(),
  };

  try {
    if (dishId) {
      // Update existing document
      const dishRef = doc(db, 'dishes', dishId);
      await updateDoc(dishRef, dishData);
    } else {
      // Create new document
      const colRef = collection(db, 'dishes');
      await addDoc(colRef, {
        ...dishData,
        isAvailable: false, // Default to not available
        inventoryCount: 0, // Default to 0
        createdAt: serverTimestamp(),
      });
    }
  } catch (e: any) {
    const permissionError = new FirestorePermissionError({
      path: dishId ? `dishes/${dishId}` : 'dishes',
      operation: dishId ? 'update' : 'create',
      requestResourceData: dishData,
    });
    errorEmitter.emit('permission-error', permissionError);
    // Re-throw to be caught by the UI
    throw e;
  }
}

/**
 * Updates the inventory count and availability of a single dish.
 *
 * @param db The Firestore instance.
 * @param dishId The ID of the dish to update.
 * @param count The new inventory count.
 */
export function updateDishInventory(db: Firestore, dishId: string, count: number) {
  const dishRef = doc(db, 'dishes', dishId);
  const payload = {
    inventoryCount: count,
    isAvailable: count > 0,
  };
  updateDoc(dishRef, payload).catch((e) => {
    const permissionError = new FirestorePermissionError({
      path: dishRef.path,
      operation: 'update',
      requestResourceData: payload,
    });
    errorEmitter.emit('permission-error', permissionError);
    console.error('Failed to update dish inventory:', e);
  });
}
