
'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseApp } from 'firebase/app';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseContextValue {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

interface FirebaseProviderProps {
  children: ReactNode;
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

/**
 * A client-side component that provides the Firebase app, auth, and firestore
 * instances to the rest of the application.
 */
export function FirebaseProvider({
  children,
  app,
  auth,
  firestore,
}: FirebaseProviderProps) {
  return (
    <FirebaseContext.Provider value={{ app, auth, firestore }}>
      {children}
      <FirebaseErrorListener />
    </FirebaseContext.Provider>
  );
}

/**
 * A hook to get the Firebase app instance.
 */
export function useFirebaseApp() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebaseApp must be used within a FirebaseProvider');
  }
  return context.app;
}

/**
 * A hook to get the Firebase auth instance.
 */
export function useAuth() {
  const context = useContext(FirebaseContext);
  if (!context) {
    // This can happen in a client component that is rendered on the server.
    // Return null and let the caller handle it.
    return null;
  }
  return context.auth;
}

/**
 * A hook to get the Firebase firestore instance.
 */
export function useFirestore() {
  const context = useContext(FirebaseContext);
  if (!context) {
    // This can happen in a client component that is rendered on the server.
    // Return null and let the caller handle it.
    return null;
  }
  return context.firestore;
}

/**
 * A hook to get the Firebase app, auth, and firestore instances.
 * @deprecated Use useFirebaseApp, useAuth, and useFirestore instead.
 */
export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
