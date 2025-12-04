
'use client';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeFirebase } from '@/firebase';

const { app } = initializeFirebase();
const storage = getStorage(app);

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 *
 * @param file The file to upload.
 * @param path The path where the file should be stored in the bucket.
 * @returns A promise that resolves with the public download URL of the file.
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  
  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error(`Upload failed for path: ${path}`, error);
    // Re-throw the error so the calling function's catch block is triggered.
    // This is crucial for stopping loading spinners in the UI.
    throw new Error(`Failed to upload ${file.name}. Please check your connection and try again.`);
  }
}
