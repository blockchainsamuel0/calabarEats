
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
 * @param chefProfileId Optional ID of the chef profile to update.
 */
export async function createOrUpdateChefProfile(
  db: Firestore,
  userId: string,
  data: ProfileData,
  chefProfileId?: string
) {
  if (!chefProfileId) {
    // This case should not happen if the flow is correct, but as a fallback.
    throw new Error('Chef Profile ID is missing.');
  }

  // 1. Upload photos to Firebase Storage
  const photoUrls = await Promise.all(
    data.vettingPhotos.map((file, index) => 
      uploadFile(file, `vetting_photos/${userId}/photo_${index + 1}`)
    )
  );

  // 2. Prepare the chef profile data
  const profileDocRef = doc(db, 'chefs', chefProfileId);
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
  
  // 3. Update the chef's profile document
  try {
     await setDoc(profileDocRef, profilePayload, { merge: true });
  } catch (error: any) {
    const permissionError = new FirestorePermissionError({
      path: profileDocRef.path,
      operation: 'update',
      requestResourceData: profilePayload,
    });
    errorEmitter.emit('permission-error', permissionError);
    console.error("Failed to update chef profile:", error);
    throw new Error("Failed to save your profile. Please check your connection and try again.");
  }

  // Note: The user document's chefProfileId should already be set upon user creation.
  // If it weren't, you would update it here.
}
