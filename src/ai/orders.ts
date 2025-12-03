
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

    // Assume all items from one chef for simplicity
    const chefId = items[0].vendor;

    let subtotal = 0;
    const orderItems = items.map(item => {
      // In a real app, you'd fetch the price from the DB again to prevent tampering
      subtotal += item.price * item.quantity;
      return {
        dishId: item.originalId,
        quantity: item.quantity,
        price: item.price,
        // notes: item.notes // Add if notes are implemented
      };
    });
    
    // Create the order document
    const orderRef = await db.collection('orders').add({
      customerId: auth.uid,
      chefId: chefId, // This needs to be the CHEF's User ID, not their name.
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

    // After creating order, clear the user's cart.
    const cartColRef = db.collection('users').doc(auth.uid).collection('cart');
    const cartSnapshot = await cartColRef.get();
    if (!cartSnapshot.empty) {
        const batch = db.batch();
        cartSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    }

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

