
'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';


export default function VettingStatusPage() {
  const user = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const userDocRef = useMemo(() => {
    if (user && firestore) {
      return doc(firestore, 'users', user.uid);
    }
    return undefined;
  }, [user, firestore]);

  const { data: userData, loading } = useDoc<UserProfile>(userDocRef);
  
  const handleSignOut = async () => {
    if(auth) await signOut(auth);
    router.push('/login');
  }

  const renderStatus = () => {
    if (loading || !userData) {
      return <div className="flex flex-col items-center"><Loader2 className="h-8 w-8 animate-spin mb-4" /> <p>Loading your status...</p></div>;
    }

    switch (userData.vettingStatus) {
      case 'approved':
        return (
          <>
            <CheckCircle className="h-16 w-16 text-green-500" />
            <CardTitle className="mt-4">Account Approved!</CardTitle>
            <CardDescription className="mt-2">
              Congratulations! Your account has been approved. You can now access your dashboard.
            </CardDescription>
            <Button onClick={() => router.push('/dashboard')} className="mt-6">
              Go to Dashboard
            </Button>
          </>
        );
      case 'rejected':
        return (
          <>
            <XCircle className="h-16 w-16 text-destructive" />
            <CardTitle className="mt-4">Application Rejected</CardTitle>
            <CardDescription className="mt-2">
              We're sorry, but your application was not approved at this time. Please contact support for more information.
            </CardDescription>
          </>
        );
      case 'pending':
      default:
        return (
          <>
            <Clock className="h-16 w-16 text-yellow-500" />
            <CardTitle className="mt-4">Application Pending</CardTitle>
            <CardDescription className="mt-2">
              Your application is currently under review. We'll notify you once it's processed. This page will update automatically.
            </CardDescription>
          </>
        );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <h1 className="text-xl font-bold">Vetting Status</h1>
        </CardHeader>
        <CardContent className="flex flex-col items-center p-8">
          {renderStatus()}
          <Button variant="link" onClick={handleSignOut} className="mt-8">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
