
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

// This is a temporary client-side flag to help onAuthStateChanged determine the role.
let isSigningUpAsPartner = false;

// Handle user creation in Firestore for all auth methods
onAuthStateChanged(auth, async (user) => {
    if (user && user.metadata.creationTime === user.metadata.lastSignInTime) {
        // This is a new user
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
             const batch = writeBatch(db);

             // Determine role based on the flow they used to sign up
             const role = isSigningUpAsPartner ? 'chef' : 'customer';
             isSigningUpAsPartner = false; // Reset the flag immediately

             const isPartner = role === 'chef';

             // Create the user document
             batch.set(userRef, {
                name: user.displayName || (isPartner ? 'New Partner' : 'New Customer'),
                email: user.email,
                phone: user.phoneNumber,
                role: role,
                vettingStatus: isPartner ? 'pending' : null,
                createdAt: serverTimestamp(),
             }, { merge: true });

             // If it's a chef, create their associated chef profile document
             if (isPartner) {
                const chefProfileRef = doc(db, 'chefs', user.uid); // Use user ID as chef profile ID
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


export async function signUpAsPartner(name: string, email: string, password: string) {
  try {
    isSigningUpAsPartner = true; // Set flag before auth operation
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName: name });
    return { user, error: null };
  } catch (error: any) {
    isSigningUpAsPartner = false; // Reset flag on error
    return { user: null, error };
  }
}

export async function signUpAsCustomer(name: string, email: string, password: string) {
  try {
    isSigningUpAsPartner = false;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
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
        isSigningUpAsPartner = false;
        const result = await signInWithPopup(auth, provider);
        return { user: result.user, error: null };
    } catch (error: any) {
        return { user: null, error };
    }
}

// Phone auth functions are kept for potential future use but are not currently wired to the UI.
export function setupRecaptcha(container: HTMLElement) {
    if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
    }
    return (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, container, {
        'size': 'invisible'
    });
}

export async function signInWithPhone(phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> {
    isSigningUpAsPartner = true;
    return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
}
