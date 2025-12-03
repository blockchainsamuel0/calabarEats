
'use client';

import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';

/**
 * A hook to get the current authenticated user.
 *
 * @returns The current user, or null if not authenticated.
 * It will return `undefined` while loading.
 */
export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    if (!auth) {
      setUser(undefined); // Auth not initialized yet
      return;
    }
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  return user;
}
