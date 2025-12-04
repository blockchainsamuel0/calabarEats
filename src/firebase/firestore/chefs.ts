'use client';
import { doc, setDoc, updateDoc, Firestore, serverTimestamp } from 'firebase/firestore';
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
 * and links the profile ID back to their user document.
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

    // A chef's profile ID is their UID
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
      profileComplete: true,
      updatedAt: serverTimestamp(),
    };
    
    // Use .catch() to handle permissions errors and emit a contextual error
    await setDoc(profileDocRef, profilePayload, { merge: true });

  } catch (error) {
    // This will now catch errors from both uploadFile and setDoc
    if (error instanceof FirestorePermissionError) {
      // If it's already our custom error, just emit it
       errorEmitter.emit('permission-error', error);
    } else if ((error as any)?.code?.startsWith('storage/')) {
       // Handle storage errors specifically if needed, otherwise let the generic catch handle it.
       console.error("Firebase Storage Error:", error);
    } 
    else {
      // For Firestore permission errors during setDoc
      const permissionError = new FirestorePermissionError({
          path: `chefs/${userId}`,
          operation: 'update', // Using 'update' because of merge: true
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
        // This is an internal-like operation, so we might not need to throw a user-facing error
        // unless an admin is performing this action and needs feedback.
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
        // Handle error appropriately
    }
}
