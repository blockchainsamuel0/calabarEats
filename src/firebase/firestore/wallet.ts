'use client';
import { useMemo } from 'react';
import { doc, setDoc, updateDoc, Firestore, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useDoc } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Wallet, PayoutDetails } from '@/lib/types';

/**
 * A hook to fetch a chef's wallet data in real-time.
 *
 * @param chefId The ID of the chef whose wallet is to be fetched.
 * @returns An object containing the wallet data and loading state.
 */
export function useWallet(chefId?: string) {
  const firestore = useFirestore();

  const walletDocRef = useMemo(() => {
    if (firestore && chefId) {
      // The wallet document ID is the same as the chef's user ID
      return doc(firestore, 'wallets', chefId);
    }
    return undefined;
  }, [firestore, chefId]);

  const { data: wallet, loading } = useDoc<Wallet>(walletDocRef);

  return { wallet, loading };
}

/**
 * Updates the payout details for a chef's wallet.
 * This function is protected by security rules to only allow the owner to write.
 *
 * @param chefId The ID of the chef.
 * @param data The payout details to save.
 */
export async function updatePayoutDetails(chefId: string, data: PayoutDetails) {
  const { firestore } = useFirestore();
  if (!firestore) throw new Error("Firestore not initialized");

  const walletRef = doc(firestore, 'wallets', chefId);

  const payload = {
    payoutDetails: data,
    payoutDetailsLastUpdated: serverTimestamp(),
  };

  // Using setDoc with merge ensures the document is created if it doesn't exist,
  // and only the specified fields are updated.
  return setDoc(walletRef, payload, { merge: true }).catch((e) => {
    const permissionError = new FirestorePermissionError({
      path: walletRef.path,
      operation: 'update',
      requestResourceData: payload,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw e;
  });
}
