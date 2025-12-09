import {chefAcceptOrder} from '@/ai/orders';
import {appRoute} from '@genkit-ai/next';

export const POST = appRoute({flow: chefAcceptOrder});
