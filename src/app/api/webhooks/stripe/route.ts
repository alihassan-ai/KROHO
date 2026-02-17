import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const subId = session.subscription as string;
                const subscription = await stripe.subscriptions.retrieve(subId);

                if (!session.metadata?.userId) {
                    throw new Error('UserId not found in session metadata');
                }

                await (prisma.user as any).update({
                    where: { id: session.metadata.userId },
                    data: {
                        stripeId: session.customer as string,
                        stripeSubscriptionId: subscription.id,
                        plan: (session.metadata.plan || 'STARTER') as any,
                        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                    },
                });
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;

                await (prisma.user as any).update({
                    where: { stripeSubscriptionId: subscription.id },
                    data: {
                        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                    },
                });
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;

                await (prisma.user as any).update({
                    where: { stripeSubscriptionId: subscription.id },
                    data: {
                        plan: 'STARTER',
                        stripeSubscriptionId: null,
                    },
                });
                break;
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return new NextResponse(null, { status: 200 });
    } catch (error) {
        console.error('Webhook error:', error);
        return new NextResponse('Webhook handler failed', { status: 500 });
    }
}
