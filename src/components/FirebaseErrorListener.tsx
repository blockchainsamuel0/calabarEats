
'use client';
import { useEffect, useState } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

/**
 * A client component that listens for Firebase permission errors and displays
 * them in the Next.js development error overlay.
 *
 * NOTE: This component will only display errors in development mode and will
 * do nothing in production.
 */
export function FirebaseErrorListener() {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handler = (error: Error) => {
      console.error('Caught a firebase error:', error);
      setError(error);
    };
    errorEmitter.on('permission-error', handler);

    return () => {
      errorEmitter.off('permission-error', handler);
    };
  }, []);

  // This is the magic. If we have an error, we throw it. Next.js will catch
  // the error and display it in the development overlay.
  if (error) {
    throw error;
  }

  return null;
}
