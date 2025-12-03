
'use client';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// All `use...` hooks are client-side only, so we can export them from here.
export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';

/**
 * Initializes the Firebase app and returns the app, auth, and firestore
 * instances.
 *
 * This function is idempotent, so it can be called multiple times without
 * creating new instances.
 *
 * @returns The Firebase app, auth, and firestore instances.
 */
export function initializeFirebase() {
  const apps = getApps();
  const app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  return { app, auth, firestore };
}
