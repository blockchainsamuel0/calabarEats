
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
import { getFirestore, doc, setDoc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const { app } = initializeFirebase();
const auth = getAuth(app);
const db = getFirestore(app);

// Handle user creation in Firestore for all auth methods
onAuthStateChanged(auth, async (user) => {
    if (user && user.metadata.creationTime === user.metadata.lastSignInTime) {
        // This is a new user (or at least their first session after signup)
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
             const batch = writeBatch(db);

             // 1. Create the user document
             const isPartner = !!user.phoneNumber; // A simple way to distinguish for now
             const role = isPartner ? 'chef' : 'customer';

             batch.set(userRef, {
                name: user.displayName || (isPartner ? 'New Partner' : 'New Customer'),
                email: user.email,
                phone: user.phoneNumber,
                role: role,
                vettingStatus: isPartner ? 'pending' : null,
                createdAt: serverTimestamp(),
             }, { merge: true });

             // 2. If it's a chef, create their associated chef profile document
             if (isPartner) {
                const chefProfileRef = doc(db, 'chefs', user.uid); // Use user ID as chef profile ID for simplicity
                batch.set(chefProfileRef, {
                    ownerUserId: user.uid,
                    profileComplete: false,
                    createdAt: serverTimestamp(),
                });
                // Also update the user doc with the reference to the chef profile
                batch.update(userRef, { chefProfileId: chefProfileRef.id });
             }
             
             await batch.commit();
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

    // This will trigger the onAuthStateChanged listener above to create the DB record
    await updateProfile(user, { displayName: name });

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
        // This will trigger onAuthStateChanged to create the user doc if it's a new user
        return { user: result.user, error: null };
    } catch (error: any) {
        return { user: null, error };
    }
}
