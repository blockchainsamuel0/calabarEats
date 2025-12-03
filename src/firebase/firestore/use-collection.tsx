
'use client';

import { useState, useEffect } from 'react';
import type {
  Firestore,
  CollectionReference,
  Query,
  DocumentData,
} from 'firebase/firestore';
import { onSnapshot, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export interface UseCollectionOptions {
  // If true, the hook will not listen for real-time updates.
  // Instead, it will fetch the data once and then stop.
  // This is useful for data that doesn't change often.
  once?: boolean;
}

/**
 * A hook to get a collection from Firestore.
 *
 * @param ref A reference to the collection to get.
 * @param options Options for the hook.
 * @returns The collection data, loading state, and error state.
 */
export function useCollection<T extends DocumentData>(
  ref?: CollectionReference<T> | Query<T> | null,
  options?: UseCollectionOptions
) {
  const firestore = useFirestore();
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If the ref or firestore is not available, we can't do anything.
    if (!ref || !firestore) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (options?.once) {
      getDocs(ref)
        .then((snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];
          setData(data);
          setLoading(false);
        })
        .catch((e: Error) => {
          setError(e);
          setLoading(false);

          // We'll also emit the error to the global error emitter so that we can
          // display it in the development overlay.
          const permissionError = new FirestorePermissionError({
            path: ref.path,
            operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
        });
      return;
    }

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(data);
        setLoading(false);
      },
      (e) => {
        setError(e);
        setLoading(false);

        // We'll also emit the error to the global error emitter so that we can
        // display it in the development overlay.
        const permissionError = new FirestorePermissionError({
          path: ref.path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return () => unsubscribe();
  }, [ref, firestore, options?.once]);

  return { data, loading, error };
}
