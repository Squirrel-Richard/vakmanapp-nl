import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createIdealPaymentLink } from '@/lib/stripe'
import { generateFactuurNummer } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const body = await request.json()
  const { job_id, uren, uurtarief, materiaal_kosten, btw_percentage = 21 } = body

  if (!job_id) {
    return NextResponse.json({ error: 'job_id is verplicht' }, { status: 400 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
  }

  // Get company
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!company) {
    return NextResponse.json({ error: 'Geen bedrijf gevonden' }, { status: 404 })
  }

  // Get job + werkbon
  const { data: jobData } = await supabase
    .from('jobs')
    .select('*, client:clients(*)')
    .eq('id', job_id)
    .single()

  if (!jobData) {
    return NextResponse.json({ error: 'Opdracht niet gevonden' }, { status: 404 })
  }

  const job = jobData as { id: string; titel: string; client: { naam?: string; email?: string } | null }

  const { data: werkbonData } = await supabase
    .from('werkbonnen')
    .select('*')
    .eq('job_id', job_id)
    .maybeSingle()

  // Check if invoice already exists
  const { data: existingData } = await supabase
    .from('invoices')
    .select('*')
    .eq('job_id', job_id)
    .maybeSingle()

  const existing = existingData as { id: string; stripe_payment_link: string | null } | null

  if (existing) {
    return NextResponse.json({
      data: existing,
      payment_url: existing.stripe_payment_link,
      message: 'Factuur bestaat al'
    })
  }

  // Calculate amounts
  const werkbon = werkbonData as { uren?: number | null } | null
  const gewerktUren = uren || werkbon?.uren || 1
  const tarief = uurtarief || 75 // default €75/uur
  const materiaalKosten = materiaal_kosten || 0

  const bedrag_excl = (gewerktUren * tarief) + materiaalKosten
  const btw_bedrag = bedrag_excl * (btw_percentage / 100)
  const bedrag_incl = bedrag_excl + btw_bedrag
  const factuur_nummer = generateFactuurNummer()

  // Create payment link via Stripe
  const client = job.client
  let payment_url: string | null = null
  let payment_token = uuidv4()

  try {
    payment_url = await createIdealPaymentLink(
      Math.round(bedrag_incl * 100), // in eurocents
      `Factuur ${factuur_nummer} - ${job.titel}`,
      job_id,
      payment_token,
      client?.email || undefined,
    )
  } catch (err) {
    console.error('Stripe error:', err)
    // Continue without payment link — invoice will be created anyway
    payment_url = null
  }

  // Create invoice record
  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert({
      company_id: company.id,
      job_id,
      factuur_nummer,
      status: 'verstuurd',
      bedrag_excl,
      btw_percentage,
      btw_bedrag,
      bedrag_incl,
      stripe_payment_link: payment_url,
      payment_token,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update job status to gefactureerd
  await supabase
    .from('jobs')
    .update({ status: 'gefactureerd' })
    .eq('id', job_id)

  return NextResponse.json({
    data: invoice,
    payment_url,
    factuur_nummer,
    bedrag_incl,
  })
}
