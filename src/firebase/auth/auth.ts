
'use client';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const { app } = initializeFirebase();
const auth = getAuth(app);
const db = getFirestore(app);

// Handle user creation in Firestore for all auth methods
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
             // For phone auth, displayName might not be set yet.
             // The sign-up flow should handle setting it.
            await setDoc(userRef, {
                name: user.displayName || 'New Partner',
                email: user.email,
                phone: user.phoneNumber,
                role: 'chef',
                vettingStatus: 'pending',
                createdAt: serverTimestamp(),
            }, { merge: true });
        }
    }
});


export function setupRecaptcha(container: HTMLElement) {
    if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
    }
    return (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, container, {
        'size': 'invisible'
    });
}


export async function signInWithPhone(phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> {
    return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
}


export async function signUpWithEmail(name: string, email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: name });

    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      name: name,
      email: user.email,
      role: 'customer', 
      createdAt: serverTimestamp(),
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

        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            await setDoc(userRef, {
                name: user.displayName,
                email: user.email,
                role: 'customer',
                createdAt: serverTimestamp(),
            });
        }
        
        return { user, error: null };
    } catch (error: any) {
        return { user: null, error };
    }
}
