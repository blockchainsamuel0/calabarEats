'use client';
import { doc, setDoc, updateDoc, Firestore, serverTimestamp, writeBatch } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { uploadFile } from '@/firebase/storage/uploads';

interface ProfileData {
  name: string;
  address: string;
  startTime: string;
  endTime: string;
  vettingPhotos: File[];
}

/**
 * Creates or updates a chef's profile, uploads their vetting photos,
 * and updates their user document to complete onboarding.
 *
 * @param db The Firestore instance.
 * @param userId The ID of the user (chef).
 * @param data The profile data from the form.
 */
export async function createOrUpdateChefProfile(
  db: Firestore,
  userId: string,
  data: ProfileData,
) {
  // Define references upfront for error reporting
  const profileDocRef = doc(db, 'chefs', userId);
  const userDocRef = doc(db, 'users', userId);

  try {
    // 1. Upload photos to Firebase Storage
    const photoUrls = await Promise.all(
      data.vettingPhotos.map((file, index) => 
        uploadFile(file, `vetting_photos/${userId}/photo_${index + 1}`)
      )
    );

    const batch = writeBatch(db);

    // 2. Define payload for the Chef Profile document
    const profilePayload = {
      ownerUserId: userId,
      name: data.name,
      addressText: data.address,
      workingHours: {
        start: data.startTime,
        end: data.endTime,
      },
      vettingPhotoUrls: photoUrls,
      profileComplete: true,
      updatedAt: serverTimestamp(),
    };
    batch.set(profileDocRef, profilePayload, { merge: true });

    // 3. Define payload for the User document
    const userPayload = {
      onboardingStatus: 'completed',
      vettingStatus: 'pending'
    };
    batch.update(userDocRef, userPayload);
    
    // 4. Commit all batched writes
    await batch.commit();

  } catch (error: any) {
    // Determine which part of the batch write likely failed for better error context.
    // We'll report on the user profile update as it's a likely candidate for permission issues.
    const permissionError = new FirestorePermissionError({
        path: userDocRef.path,
        operation: 'update',
        requestResourceData: { onboardingStatus: 'completed', vettingStatus: 'pending' },
    });
    errorEmitter.emit('permission-error', permissionError);

    // Re-throw the original error to ensure the UI's catch block is triggered
    // and the loading spinner stops.
    throw error;
  }
}


/**
 * Updates the vetting status of a user.
 * @param db The Firestore instance.
 * @param userId The ID of the user to update.
 * @param status The new vetting status.
 */
export async function updateUserVettingStatus(
  db: Firestore,
  userId: string,
  status: 'pending' | 'approved' | 'rejected'
) {
    const userDocRef = doc(db, 'users', userId);
    try {
        await updateDoc(userDocRef, { vettingStatus: status });
    } catch (error) {
        console.error("Failed to update vetting status:", error);
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'update',
          requestResourceData: { vettingStatus: status },
        });
        errorEmitter.emit('permission-error', permissionError);
        throw error;
    }
}

/**
 * Updates the open/closed status of a chef.
 * @param db The Firestore instance.
 * @param chefId The ID of the chef to update.
 * @param status The new status 'open' | 'closed'.
 */
export async function updateChefStatus(db: Firestore, chefId: string, status: 'open' | 'closed') {
    const chefDocRef = doc(db, 'chefs', chefId);
    try {
        await updateDoc(chefDocRef, { status: status });
    } catch (error) {
        console.error("Failed to update chef status:", error);
        const permissionError = new FirestorePermissionError({
          path: chefDocRef.path,
          operation: 'update',
          requestResourceData: { status },
        });
        errorEmitter.emit('permission-error', permissionError);
        throw error;
    }
}
