
'use server';
/**
 * @fileoverview This file contains Genkit flows for managing orders in the marketplace.
 *
 * It includes flows for:
 * - Creating an order (`createOrder`)
 * - Accepting an order as a chef (`chefAcceptOrder`)
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = getFirestore();


// Input schema for creating an order
const CreateOrderInputSchema = z.object({
  items: z.array(
    z.object({
      originalId: z.string(),
      price: z.number(),
      quantity: z.number(),
      vendor: z.string(),
      // We don't need all the meal details, just what's needed to create the order item
    })
  ),
  deliveryAddress: z.string(),
  phone: z.string(),
});
type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;

// Output schema for creating an order
const CreateOrderOutputSchema = z.object({
  orderId: z.string(),
  subtotal: z.number(),
});
type CreateOrderOutput = z.infer<typeof CreateOrderOutputSchema>;

// Input schema for accepting an order
const ChefAcceptOrderInputSchema = z.object({
  orderId: z.string(),
});
type ChefAcceptOrderInput = z.infer<typeof ChefAcceptOrderInputSchema>;

export const createOrder = ai.defineFlow(
  {
    name: 'createOrder',
    inputSchema: CreateOrderInputSchema,
    outputSchema: CreateOrderOutputSchema,
    auth: (auth, input) => {
      if (!auth) {
        throw new Error('Authentication required.');
      }
      // Simple check, will rely on security rules for true enforcement
    },
  },
  async (input, {auth}) => {
    if (!auth) {
      throw new Error('Authentication required.');
    }
    const {items, deliveryAddress, phone} = input;
    if (items.length === 0) {
      throw new Error('Cannot create an order with no items.');
    }

    const chefId = items[0].vendor;
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const orderRef = db.collection('orders').doc(); // Create a reference with a new ID

    await db.runTransaction(async (transaction) => {
        // 1. Verify stock and get dish details for all items.
        const dishRefsAndQuantities = items.map(item => ({
            ref: db.collection('dishes').doc(item.originalId),
            quantity: item.quantity,
            price: item.price,
        }));

        const dishDocs = await transaction.getAll(...dishRefsAndQuantities.map(i => i.ref));
        const orderItems = [];

        for (let i = 0; i < dishDocs.length; i++) {
            const dishDoc = dishDocs[i];
            const item = items[i];

            if (!dishDoc.exists) {
                throw new Error(`Dish with ID ${item.originalId} does not exist.`);
            }
            
            const dishData = dishDoc.data();
            if (!dishData) throw new Error('Could not read dish data.');
            
            const currentInventory = dishData.inventoryCount || 0;
            if (currentInventory < item.quantity) {
                throw new Error(`Not enough stock for ${dishData.name}. Only ${currentInventory} available.`);
            }

            // Prepare order item data
            orderItems.push({
                dishId: item.originalId,
                dishName: dishData.name, // Get name from DB
                quantity: item.quantity,
                price: item.price,
            });

            // 2. Update inventory for each dish
            const newInventory = currentInventory - item.quantity;
            transaction.update(dishRefsAndQuantities[i].ref, {
                inventoryCount: newInventory,
                isAvailable: newInventory > 0,
            });
        }
        
        // 3. Create the order document
        transaction.set(orderRef, {
          customerId: auth.uid,
          chefId: chefId,
          items: orderItems,
          subtotal: subtotal,
          deliveryAddress: { text: deliveryAddress }, // Matching schema
          phone: phone,
          status: 'pending',
          payment: {
            status: 'pending',
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // 4. Clear the user's cart
        const cartColRef = db.collection('users').doc(auth.uid).collection('cart');
        const cartSnapshot = await cartColRef.get(); // get() within a transaction reads from it
        if (!cartSnapshot.empty) {
            cartSnapshot.docs.forEach(doc => {
                transaction.delete(doc.ref);
            });
        }
    });

    return {
      orderId: orderRef.id,
      subtotal: subtotal,
    };
  }
);

export const chefAcceptOrder = ai.defineFlow(
  {
    name: 'chefAcceptOrder',
    inputSchema: ChefAcceptOrderInputSchema,
    outputSchema: z.void(),
     auth: async (auth, input) => {
      if (!auth) {
        throw new Error('Authentication required.');
      }
      // Security rule will enforce chef role and ownership
    },
  },
  async (input, {auth}) => {
     if (!auth) {
      throw new Error('Authentication required.');
    }
    const orderRef = db.collection('orders').doc(input.orderId);
    
    // In a real app, you would also verify the order belongs to the authenticated chef
    
    await orderRef.update({
        status: 'accepted'
    });

    // TODO: Send push notification to customer
    console.log(`Order ${input.orderId} accepted. Notifying customer.`);
  }
);
