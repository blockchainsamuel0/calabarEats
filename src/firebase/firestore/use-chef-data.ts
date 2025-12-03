
'use client';
import { useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Order, Meal } from '@/lib/types';

/**
 * A hook to fetch all relevant data for a chef's dashboard.
 * Fetches the chef's orders and their created dishes.
 *
 * @param chefId The ID of the chef.
 * @returns An object containing the chef's orders, dishes, and loading state.
 */
export function useChefData(chefId?: string) {
  const firestore = useFirestore();

  const ordersQuery = useMemo(() => {
    if (firestore && chefId) {
      return query(
        collection(firestore, 'orders'),
        where('chefId', '==', chefId),
        orderBy('createdAt', 'desc')
      );
    }
    return undefined;
  }, [firestore, chefId]);

  const dishesQuery = useMemo(() => {
    if (firestore && chefId) {
        return query(
            collection(firestore, 'dishes'),
            where('chefId', '==', chefId),
            orderBy('createdAt', 'desc')
        );
    }
    return undefined;
  }, [firestore, chefId]);

  const { data: orders, loading: ordersLoading } = useCollection<Order>(ordersQuery);
  const { data: dishes, loading: dishesLoading } = useCollection<Meal>(dishesQuery);

  return {
    orders: orders || [],
    dishes: dishes || [],
    loading: ordersLoading || dishesLoading,
  };
}
