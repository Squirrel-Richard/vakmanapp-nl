'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import WebGLBackground from '@/components/shared/WebGLBackground'
import AppNav from '@/components/shared/AppNav'
import type { Client, Employee } from '@/types/database'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function NieuweOpdrachtPage() {
  const router = useRouter()
  const supabase = createClient()
  const [clients, setClients] = useState<Client[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    titel: '',
    omschrijving: '',
    adres: '',
    datum: '',
    tijd_start: '',
    status: 'nieuw',
    prioriteit: 'normaal',
    client_id: '',
    employee_id: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [{ data: cls }, { data: emps }] = await Promise.all([
      supabase.from('clients').select('*').order('naam'),
      supabase.from('employees').select('*').order('naam'),
    ])
    if (cls) setClients(cls)
    if (emps) setEmployees(emps)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titel.trim()) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', user?.id)
      .single()

    const { data, error } = await supabase.from('jobs').insert({
      titel: form.titel,
      omschrijving: form.omschrijving || null,
      adres: form.adres || null,
      datum: form.datum || null,
      tijd_start: form.tijd_start || null,
      status: form.status as 'nieuw',
      prioriteit: form.prioriteit as 'normaal',
      client_id: form.client_id || null,
      employee_id: form.employee_id || null,
      company_id: company?.id,
    }).select().single()

    if (error) {
      toast.error('Fout bij opslaan opdracht')
      setSaving(false)
      return
    }

    toast.success('Opdracht aangemaakt')
    router.push(`/opdracht/${data.id}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <WebGLBackground />
      <AppNav />
      <main className="ml-64 relative z-10 p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl text-text-muted hover:text-white border border-white/10 hover:border-white/20 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </motion.button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Nieuwe Opdracht</h1>
              <p className="text-text-muted text-sm mt-0.5">Vul de opdracht details in</p>
            </div>
          </div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Titel */}
            <div className="p-6 rounded-2xl space-y-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="text-white font-semibold">Opdracht details</h2>
              <div>
                <label className="block text-sm text-text-muted mb-2">Titel *</label>
                <input
                  required
                  placeholder="bijv. Lekkage keuken repareren"
                  value={form.titel}
                  onChange={e => setForm(p => ({ ...p, titel: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-2">Omschrijving</label>
                <textarea
                  placeholder="Beschrijf de werkzaamheden..."
                  value={form.omschrijving}
                  onChange={e => setForm(p => ({ ...p, omschrijving: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-2">Adres</label>
                <input
                  placeholder="Straat + huisnummer, Stad"
                  value={form.adres}
                  onChange={e => setForm(p => ({ ...p, adres: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-muted mb-2">Datum</label>
                  <input
                    type="date"
                    value={form.datum}
                    onChange={e => setForm(p => ({ ...p, datum: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-2">Starttijd</label>
                  <input
                    type="time"
                    value={form.tijd_start}
                    onChange={e => setForm(p => ({ ...p, tijd_start: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-muted mb-2">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm"
                  >
                    <option value="nieuw">Nieuw</option>
                    <option value="onderweg">Onderweg</option>
                    <option value="klaar">Klaar</option>
                    <option value="gefactureerd">Gefactureerd</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-2">Prioriteit</label>
                  <select
                    value={form.prioriteit}
                    onChange={e => setForm(p => ({ ...p, prioriteit: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm"
                  >
                    <option value="laag">Laag</option>
                    <option value="normaal">Normaal</option>
                    <option value="hoog">Hoog</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Klant */}
            <div className="p-6 rounded-2xl space-y-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="text-white font-semibold">Klant & Monteur</h2>
              <div>
                <label className="block text-sm text-text-muted mb-2">Klant</label>
                <select
                  value={form.client_id}
                  onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm"
                >
                  <option value="">Selecteer klant</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.naam}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-2">Monteur</label>
                <select
                  value={form.employee_id}
                  onChange={e => setForm(p => ({ ...p, employee_id: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm"
                >
                  <option value="">Selecteer monteur</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.naam}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={saving || !form.titel.trim()}
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Opslaan...</>
              ) : (
                <><Save className="w-4 h-4" /> Opdracht aanmaken</>
              )}
            </motion.button>
          </motion.form>
        </div>
      </main>
    </div>
  )
}
