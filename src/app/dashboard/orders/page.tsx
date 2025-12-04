'use client';

import { useUser } from '@/firebase';
import { useChefData } from '@/firebase/firestore/use-chef-data';
import OrderCard from '@/components/dashboard/order-card';
import { Loader2, PackageOpen } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function ChefOrdersPage() {
  const user = useUser();
  const { orders, loading } = useChefData(user?.uid);

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'accepted' || o.status === 'ready');
  const pastOrders = orders.filter(o => o.status === 'completed' || o.status === 'cancelled');

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Active Orders</h2>
        {pendingOrders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
             <AnimatePresence>
                {pendingOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <OrderCard order={order} />
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-background/50 p-12 text-center">
            <PackageOpen className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Active Orders</h3>
            <p className="mt-1 text-sm text-muted-foreground">New orders will appear here as they come in.</p>
          </div>
        )}
      </div>

       <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Past Orders</h2>
        {pastOrders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {pastOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-background/50 p-12 text-center">
            <h3 className="text-lg font-semibold">No Past Orders</h3>
            <p className="mt-1 text-sm text-muted-foreground">Completed or cancelled orders will be shown here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
