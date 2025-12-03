
'use client';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const { app } = initializeFirebase();
const auth = getAuth(app);
const db = getFirestore(app);

export async function signUpWithEmail(name: string, email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Set the user's display name
    await updateProfile(user, { displayName: name });

    // Create the user document in Firestore
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      name: name,
      email: user.email,
      role: 'customer', // Default role
      createdAt: new Date().toISOString(),
    });

    return { user, error: null };
  } catch (error: any) {
    return { user: null, error };
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error };
  }
}

export async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user already exists in Firestore.
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        // If the user doesn't exist, create a new document for them.
        if (!userDoc.exists()) {
            await setDoc(userRef, {
                name: user.displayName,
                email: user.email,
                role: 'customer',
                createdAt: new Date().toISOString(),
            });
        }
        
        return { user, error: null };
    } catch (error: any) {
        return { user: null, error };
    }
}
