'use client';
import { useState } from 'react';
import { useUser } from '@/firebase';
import { useChefData } from '@/firebase/firestore/use-chef-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Star, Eye, MessageCircle, Utensils } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { updateChefStatus } from '@/firebase/firestore/chefs';

export default function DashboardPage() {
    const user = useUser();
    const { chefProfile, orders, loading } = useChefData(user?.uid);
    const [isVendorOpen, setIsVendorOpen] = useState(chefProfile?.status === 'open');

    const handleStatusToggle = (isOpen: boolean) => {
        if (!user) return;
        const newStatus = isOpen ? 'open' : 'closed';
        setIsVendorOpen(isOpen);
        updateChefStatus(user.uid, newStatus);
    }
    
    // Replace with real data from `vendorStats` when implemented
    const stats = {
        views: 125,
        messages: 8,
        mostViewed: 'Afang Soup & Swallow',
    };

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <Card>
                <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary">
                        <AvatarImage src={chefProfile?.photoUrl} alt={chefProfile?.name} />
                        <AvatarFallback>{chefProfile?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold">{chefProfile?.name}</h1>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span>{chefProfile?.rating || 'N/A'}</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="status-toggle" className={`font-semibold ${isVendorOpen ? 'text-green-600' : 'text-red-600'}`}>
                            {isVendorOpen ? 'Open' : 'Closed'}
                        </Label>
                        <Switch
                            id="status-toggle"
                            checked={isVendorOpen}
                            onCheckedChange={handleStatusToggle}
                            aria-label="Toggle vendor status"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Today's Summary */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Views</CardDescription>
                        <CardTitle className="text-4xl">{stats.views}</CardTitle>
                    </CardHeader>
                     <CardContent><p className="text-xs text-muted-foreground">Today</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Orders</CardDescription>
                        <CardTitle className="text-4xl">{orders.length}</CardTitle>
                    </CardHeader>
                    <CardContent><p className="text-xs text-muted-foreground">Today</p></CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Most Viewed Dish</CardDescription>
                        <CardTitle className="text-xl truncate">{stats.mostViewed}</CardTitle>
                    </CardHeader>
                    <CardContent><p className="text-xs text-muted-foreground">Today</p></CardContent>
                </Card>
            </div>
            
             <div>
                <h2 className="text-2xl font-bold tracking-tight mb-4">Recent Orders</h2>
                <div className="space-y-4">
                    {orders.slice(0, 3).map(order => (
                        <Card key={order.id}>
                            <CardContent className="p-3 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">Order #{order.id.slice(0, 6)}</p>
                                    <p className="text-sm text-muted-foreground">{order.items.length} items</p>
                                </div>
                                <p className="font-bold text-lg">₦{order.subtotal.toLocaleString()}</p>
                            </CardContent>
                        </Card>
                    ))}
                     {orders.length === 0 && (
                        <p className="text-muted-foreground text-center py-4">No recent orders.</p>
                     )}
                </div>
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-4 flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                </CardContent>
            </Card>
            <div className="grid gap-4 md:grid-cols-3">
                <Card><CardHeader><Skeleton className="h-10 w-1/2" /><Skeleton className="h-4 w-1/4 mt-2" /></CardHeader></Card>
                <Card><CardHeader><Skeleton className="h-10 w-1/2" /><Skeleton className="h-4 w-1/4 mt-2" /></CardHeader></Card>
                <Card><CardHeader><Skeleton className="h-10 w-3/4" /><Skeleton className="h-4 w-1/4 mt-2" /></CardHeader></Card>
            </div>
        </div>
    );
}
