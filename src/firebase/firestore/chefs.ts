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
  try {
    // 1. Upload photos to Firebase Storage
    const photoUrls = await Promise.all(
      data.vettingPhotos.map((file, index) => 
        uploadFile(file, `vetting_photos/${userId}/photo_${index + 1}`)
      )
    );

    const batch = writeBatch(db);

    // 2. Update the Chef Profile document
    const profileDocRef = doc(db, 'chefs', userId);
    const profilePayload = {
      ownerUserId: userId,
      name: data.name,
      addressText: data.address,
      workingHours: {
        start: data.startTime,
        end: data.endTime,
      },
      vettingPhotoUrls: photoUrls,
      profileComplete: true, // Mark profile as complete
      updatedAt: serverTimestamp(),
    };
    batch.set(profileDocRef, profilePayload, { merge: true });

    // 3. Update the User document
    const userDocRef = doc(db, 'users', userId);
    const userPayload = {
      onboardingStatus: 'completed', // Mark onboarding as completed
      vettingStatus: 'pending' // Set vetting status to pending review
    };
    batch.update(userDocRef, userPayload);
    
    // 4. Commit all batched writes
    await batch.commit();

  } catch (error) {
    if (error instanceof FirestorePermissionError) {
       errorEmitter.emit('permission-error', error);
    } else if ((error as any)?.code?.startsWith('storage/')) {
       console.error("Firebase Storage Error:", error);
    } 
    else {
      // Create a generic error for batch write failures
      const permissionError = new FirestorePermissionError({
          path: `chefs/${userId} or users/${userId}`,
          operation: 'update',
          requestResourceData: { name: data.name /* don't log files */ },
      });
      errorEmitter.emit('permission-error', permissionError);
    }
    // Re-throw the original error to ensure the UI's catch block is triggered
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
