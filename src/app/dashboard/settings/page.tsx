'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const auth = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        if (auth) {
          await signOut(auth);
          router.push('/login');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-background/50 p-12 text-center h-96">
                <Settings className="h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Settings Page Coming Soon</h3>
                <p className="mt-1 text-sm text-muted-foreground mb-6">
                    You will be able to edit your profile and manage your account here.
                </p>
                <Button onClick={handleSignOut} variant="outline">Sign Out</Button>
            </div>
        </div>
    );
}
