
'use client';

import type { Order } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useFirestore } from '@/firebase';
import { updateOrderStatus } from '@/firebase/firestore/orders';
import { Clock, CheckCircle2, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleUpdateStatus = (status: Order['status']) => {
    if (!firestore) return;
    updateOrderStatus(firestore, order.id, status);
    toast({
        title: 'Order Updated',
        description: `Order #${order.id.slice(0, 6)} marked as ${status}.`
    })
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(price);
  };
  
  const getStatusVariant = (status: Order['status']) => {
    switch(status) {
        case 'pending': return 'default';
        case 'accepted': return 'secondary';
        case 'ready': return 'default';
        case 'completed': return 'default';
        case 'cancelled': return 'destructive';
        default: return 'outline';
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch(status) {
        case 'pending': return <Clock className="mr-2 h-4 w-4" />;
        case 'accepted': return <CheckCircle2 className="mr-2 h-4 w-4" />;
        case 'ready': return <Truck className="mr-2 h-4 w-4" />;
        default: return null;
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-lg">Order #{order.id.slice(0, 6)}</CardTitle>
                <CardDescription>{new Date(order.createdAt?.toDate()).toLocaleString()}</CardDescription>
            </div>
            <Badge variant={getStatusVariant(order.status)} className="capitalize flex items-center">
                {getStatusIcon(order.status)}
                {order.status}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="font-medium">Customer: <span className="font-normal">{order.customerName || 'N/A'}</span></p>
        <Separator />
        <div className="space-y-1 pt-1">
            {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                    <p>{item.quantity} x {item.dishName}</p>
                    <p>{formatPrice(item.price * item.quantity)}</p>
                </div>
            ))}
        </div>
        <Separator />
        <div className="flex justify-between font-semibold pt-1">
            <p>Total</p>
            <p>{formatPrice(order.subtotal)}</p>
        </div>
      </CardContent>
      {order.status !== 'completed' && order.status !== 'cancelled' && (
        <CardFooter className="flex gap-2">
            {order.status === 'pending' && (
                <Button className="flex-1" onClick={() => handleUpdateStatus('accepted')}>Accept</Button>
            )}
            {order.status === 'accepted' && (
                <Button className="flex-1" onClick={() => handleUpdateStatus('ready')}>Mark as Ready</Button>
            )}
             {order.status === 'ready' && (
                <Button className="flex-1" onClick={() => handleUpdateStatus('completed')}>Complete</Button>
            )}
            {order.status !== 'ready' && (
                 <Button variant="outline" className="flex-1" onClick={() => handleUpdateStatus('cancelled')}>Decline</Button>
            )}
        </CardFooter>
      )}
    </Card>
  );
}
