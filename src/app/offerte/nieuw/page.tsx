'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Client, OfferteRegel } from '@/types/database'
import AppNav from '@/components/shared/AppNav'
import WebGLBackground from '@/components/shared/WebGLBackground'
import { ArrowLeft, Plus, Trash2, Loader2, Save, Euro } from 'lucide-react'
import { toast } from 'sonner'

const EENHEDEN = ['uur', 'stuk', 'm²', 'm¹', 'm³', 'dag', 'week', 'set', 'keer']

function formatEuro(amount: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount)
}

function generateOfferteNummer() {
  const year = new Date().getFullYear()
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `OFF-${year}-${rand}`
}

const defaultRegel: OfferteRegel = {
  omschrijving: '',
  aantal: 1,
  eenheid: 'uur',
  prijs: 0,
  btw_percentage: 21,
}

export default function NieuweOffertePage() {
  const router = useRouter()
  const supabase = createClient()
  const [clients, setClients] = useState<Client[]>([])
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    client_id: '',
    geldig_tot: '',
    notities: '',
    btw_percentage: 21,
  })
  const [regels, setRegels] = useState<OfferteRegel[]>([{ ...defaultRegel }])

  useEffect(() => {
    fetchClients()
    // Default geldig_tot: 30 dagen
    const d = new Date()
    d.setDate(d.getDate() + 30)
    setForm(p => ({ ...p, geldig_tot: d.toISOString().split('T')[0] }))
  }, [])

  async function fetchClients() {
    const { data } = await supabase.from('clients').select('*').order('naam')
    if (data) setClients(data)
  }

  function addRegel() {
    setRegels(p => [...p, { ...defaultRegel }])
  }

  function removeRegel(i: number) {
    setRegels(p => p.filter((_, idx) => idx !== i))
  }

  function updateRegel(i: number, field: keyof OfferteRegel, value: string | number) {
    setRegels(p => p.map((r, idx) => idx === i ? { ...r, [field]: value } : r))
  }

  // Calculate totals
  const subtotaal = regels.reduce((sum, r) => sum + (r.aantal * r.prijs), 0)
  const btw_bedrag = regels.reduce((sum, r) => sum + (r.aantal * r.prijs * r.btw_percentage / 100), 0)
  const totaal = subtotaal + btw_bedrag

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.client_id) { toast.error('Selecteer een klant'); return }
    if (regels.length === 0) { toast.error('Voeg minstens één regel toe'); return }
    if (regels.some(r => !r.omschrijving.trim())) { toast.error('Vul alle omschrijvingen in'); return }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: company } = await supabase
        .from('companies').select('id').eq('user_id', user?.id).single()
      if (!company) throw new Error('Geen bedrijf gevonden')

      const { error } = await supabase.from('offertes').insert({
        company_id: company.id,
        client_id: form.client_id || null,
        offerte_nummer: generateOfferteNummer(),
        geldig_tot: form.geldig_tot || null,
        regels: regels,
        subtotaal,
        btw_bedrag,
        totaal,
        btw_percentage: form.btw_percentage,
        notities: form.notities || null,
        status: 'concept',
      })
      if (error) throw error
      toast.success('Offerte aangemaakt!')
      router.push('/offerte')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Opslaan mislukt')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
      <WebGLBackground />
      <AppNav />
      <main className="ml-64 p-8 relative z-10 max-w-3xl">
        {/* Back */}
        <Link href="/offerte" className="inline-flex items-center gap-2 text-text-muted hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Terug naar offertes
        </Link>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white mb-8"
        >
          Nieuwe offerte
        </motion.h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Klant + datum */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl space-y-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h2 className="text-white font-semibold">Klantgegevens</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs text-text-muted mb-1.5">Klant *</label>
                <select
                  required
                  value={form.client_id}
                  onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm appearance-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0F0F8' }}
                >
                  <option value="">Selecteer een klant...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.naam}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1.5">Geldig tot</label>
                <input
                  type="date"
                  value={form.geldig_tot}
                  onChange={e => setForm(p => ({ ...p, geldig_tot: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0F0F8' }}
                />
              </div>
            </div>
          </motion.div>

          {/* Regelitems */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl space-y-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">Regelitems</h2>
              <motion.button
                type="button"
                onClick={addRegel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-primary border border-primary/30 hover:bg-primary/10 transition-all"
              >
                <Plus className="w-3 h-3" />
                Regel toevoegen
              </motion.button>
            </div>

            {/* Header */}
            <div className="grid grid-cols-12 gap-2 text-xs text-text-muted px-1">
              <span className="col-span-5">Omschrijving</span>
              <span className="col-span-2">Aantal</span>
              <span className="col-span-2">Eenheid</span>
              <span className="col-span-2">Prijs</span>
              <span className="col-span-1"></span>
            </div>

            <AnimatePresence>
              {regels.map((regel, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-12 gap-2 items-center"
                >
                  <input
                    required
                    placeholder="Omschrijving werkzaamheid"
                    value={regel.omschrijving}
                    onChange={e => updateRegel(i, 'omschrijving', e.target.value)}
                    className="col-span-5 px-3 py-2.5 rounded-lg text-sm"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#F0F0F8' }}
                  />
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={regel.aantal}
                    onChange={e => updateRegel(i, 'aantal', parseFloat(e.target.value) || 0)}
                    className="col-span-2 px-3 py-2.5 rounded-lg text-sm"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#F0F0F8' }}
                  />
                  <select
                    value={regel.eenheid}
                    onChange={e => updateRegel(i, 'eenheid', e.target.value)}
                    className="col-span-2 px-3 py-2.5 rounded-lg text-sm appearance-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#F0F0F8' }}
                  >
                    {EENHEDEN.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="€0,00"
                    value={regel.prijs}
                    onChange={e => updateRegel(i, 'prijs', parseFloat(e.target.value) || 0)}
                    className="col-span-2 px-3 py-2.5 rounded-lg text-sm"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#F0F0F8' }}
                  />
                  <motion.button
                    type="button"
                    onClick={() => removeRegel(i)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="col-span-1 flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-text-muted transition-all"
                    disabled={regels.length === 1}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Totalen */}
            <div className="border-t border-white/5 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-text-muted">
                <span>Subtotaal</span>
                <span>{formatEuro(subtotaal)}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>BTW (21%)</span>
                <span>{formatEuro(btw_bedrag)}</span>
              </div>
              <div className="flex justify-between text-white font-semibold text-base">
                <span>Totaal</span>
                <span className="text-primary">{formatEuro(totaal)}</span>
              </div>
            </div>
          </motion.div>

          {/* Notities */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <label className="block text-white font-semibold mb-3">Notities (optioneel)</label>
            <textarea
              placeholder="Extra informatie, betalingsconditie, geldigheidsclausule..."
              value={form.notities}
              onChange={e => setForm(p => ({ ...p, notities: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#F0F0F8' }}
            />
          </motion.div>

          {/* Submit */}
          <div className="flex gap-3">
            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Opslaan...' : 'Offerte opslaan'}
            </motion.button>
            <Link href="/offerte">
              <button
                type="button"
                className="px-6 py-3 text-text-muted hover:text-white rounded-xl text-sm border border-white/10 hover:border-white/20 transition-all"
              >
                Annuleren
              </button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
