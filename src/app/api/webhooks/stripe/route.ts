import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Geen Stripe signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Ongeldige signature' }, { status: 400 })
  }

  const supabase = createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      if (session.payment_status === 'paid') {
        const invoice_id = session.metadata?.invoice_id
        const payment_token = session.metadata?.payment_token

        if (invoice_id) {
          await supabase
            .from('invoices')
            .update({
              status: 'betaald',
              betaald_op: new Date().toISOString(),
            })
            .eq('id', invoice_id)

          console.log(`✅ Factuur ${invoice_id} betaald`)
        }

        if (payment_token) {
          const { data: inv } = await supabase
            .from('invoices')
            .select('id, job_id')
            .eq('payment_token', payment_token)
            .single()

          if (inv) {
            await supabase
              .from('invoices')
              .update({
                status: 'betaald',
                betaald_op: new Date().toISOString(),
              })
              .eq('id', inv.id)
          }
        }
      }
      break
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const company_id = subscription.metadata?.company_id

      if (company_id) {
        const plan = subscription.items.data[0]?.price?.nickname?.toLowerCase() || 'pro'
        const max_employees = plan === 'starter' ? 3 : plan === 'business' ? 999 : 999

        await supabase
          .from('subscriptions')
          .upsert({
            company_id,
            plan,
            stripe_subscription_id: subscription.id,
            max_employees,
            geldig_tot: new Date(subscription.current_period_end * 1000).toISOString(),
          })
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const company_id = subscription.metadata?.company_id

      if (company_id) {
        await supabase
          .from('subscriptions')
          .update({ plan: 'gratis', max_employees: 1 })
          .eq('company_id', company_id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
