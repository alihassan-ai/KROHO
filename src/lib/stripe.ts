import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy';

export const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16' as any,
    appInfo: {
        name: 'KROHO',
        version: '0.1.0',
        url: 'https://kroho.ai',
    },
});

export const PLANS = {
    STARTER: {
        id: 'starter',
        name: 'Starter',
        priceId: process.env.STRIPE_STARTER_PRICE_ID,
        limit: 100,
        brands: 3,
    },
    GROWTH: {
        id: 'growth',
        name: 'Growth',
        priceId: process.env.STRIPE_GROWTH_PRICE_ID,
        limit: 500,
        brands: 10,
    },
    SCALE: {
        id: 'scale',
        name: 'Scale',
        priceId: process.env.STRIPE_SCALE_PRICE_ID,
        limit: Infinity,
        brands: 25,
    },
};

export async function createCheckoutSession(params: {
    userId: string;
    userEmail: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    customerId?: string;
}) {
    const session = await stripe.checkout.sessions.create({
        customer: params.customerId,
        customer_email: params.customerId ? undefined : params.userEmail,
        line_items: [
            {
                price: params.priceId,
                quantity: 1,
            },
        ],
        mode: 'subscription',
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: {
            userId: params.userId,
        },
    });

    return session;
}

export async function createBillingPortalSession(params: {
    customerId: string;
    returnUrl: string;
}) {
    const session = await stripe.billingPortal.sessions.create({
        customer: params.customerId,
        return_url: params.returnUrl,
    });

    return session;
}
