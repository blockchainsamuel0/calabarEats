'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
            
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-background/50 p-12 text-center h-96">
                <BarChart3 className="h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Analytics Coming Soon</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Detailed insights about your performance will be available here.
                </p>
            </div>
        </div>
    );
}
