import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const limit = parseInt(searchParams.get('limit') || '50')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
  }

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!company) {
    return NextResponse.json({ error: 'Geen bedrijf gevonden' }, { status: 404 })
  }

  let query = supabase
    .from('jobs')
    .select('*, client:clients(naam, email, telefoon), employee:employees(naam)')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const body = await request.json()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
  }

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!company) {
    return NextResponse.json({ error: 'Geen bedrijf gevonden' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      company_id: company.id,
      titel: body.titel,
      omschrijving: body.omschrijving || null,
      adres: body.adres || null,
      datum: body.datum || null,
      tijd_start: body.tijd_start || null,
      status: body.status || 'nieuw',
      prioriteit: body.prioriteit || 'normaal',
      client_id: body.client_id || null,
      employee_id: body.employee_id || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
