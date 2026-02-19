import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export const STRIPE_PRICES = {
  starter_monthly: 'price_starter_monthly',
  pro_monthly: 'price_pro_monthly',
  business_monthly: 'price_business_monthly',
}

export async function createIdealPaymentLink(
  amount: number, // in eurocents
  description: string,
  invoiceId: string,
  paymentToken: string,
  customerEmail?: string,
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['ideal', 'card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: description,
            description: `Factuur van VakmanApp`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/betaald?token=${paymentToken}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/betaling-geannuleerd?token=${paymentToken}`,
    metadata: {
      invoice_id: invoiceId,
      payment_token: paymentToken,
    },
    customer_email: customerEmail,
    locale: 'nl',
  })

  return session.url!
}

export async function createSubscriptionCheckout(
  priceId: string,
  companyId: string,
  email: string,
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['ideal', 'card', 'sepa_debit'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/prijzen`,
    metadata: {
      company_id: companyId,
    },
    customer_email: email,
    locale: 'nl',
  })

  return session.url!
}
