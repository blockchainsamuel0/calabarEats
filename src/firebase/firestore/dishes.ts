'use client';
import { collection, addDoc, updateDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useFirestore } from '@/firebase';

/**
 * Creates or updates a dish document in Firestore.
 *
 * @param chefId The ID of the chef creating/updating the dish.
 * @param data The dish data from the form.
 * @param dishId Optional ID of the dish to update. If not provided, a new dish is created.
 */
export async function createOrUpdateDish(chefId: string, data: any, dishId?: string) {
  const firestore = useFirestore();
  if (!firestore) throw new Error("Firestore not available");
  
  const dishData = {
    chefId,
    name: data.title,
    vendor: chefId, 
    description: data.description,
    price: data.price,
    category: data.category,
    imageId: data.imageId,
    isLocalRecipe: data.isLocalRecipe,
    madeFreshDaily: data.madeFreshDaily,
    updatedAt: serverTimestamp(),
  };

  try {
    if (dishId) {
      const dishRef = doc(firestore, 'dishes', dishId);
      await updateDoc(dishRef, dishData);
    } else {
      const colRef = collection(firestore, 'dishes');
      await addDoc(colRef, {
        ...dishData,
        isAvailable: true,
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
    throw e;
  }
}

/**
 * Updates the availability of a single dish.
 *
 * @param chefId The ID of the chef.
 * @param dishId The ID of the dish to update.
 * @param isAvailable The new availability status.
 */
export function updateDishAvailability(chefId: string, dishId: string, isAvailable: boolean) {
  const firestore = useFirestore();
  if (!firestore) return;
  const dishRef = doc(firestore, 'dishes', dishId);
  const payload = { isAvailable };
  
  updateDoc(dishRef, payload).catch((e) => {
    const permissionError = new FirestorePermissionError({
      path: dishRef.path,
      operation: 'update',
      requestResourceData: payload,
    });
    errorEmitter.emit('permission-error', permissionError);
    console.error('Failed to update dish availability:', e);
  });
}


/**
 * Deletes a dish from Firestore.
 *
 * @param chefId The ID of the chef.
 * @param dishId The ID of the dish to delete.
 */
export function deleteDish(chefId: string, dishId: string) {
    const firestore = useFirestore();
    if (!firestore) return;
    const dishRef = doc(firestore, 'dishes', dishId);

    deleteDoc(dishRef).catch((e) => {
        const permissionError = new FirestorePermissionError({
            path: dishRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error('Failed to delete dish:', e);
    });
}
