'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import WebGLBackground from '@/components/shared/WebGLBackground'
import AppNav from '@/components/shared/AppNav'
import type { Job, Werkbon, Invoice } from '@/types/database'
import { formatDate, formatCurrency, STATUS_LABELS, STATUS_COLORS, cn } from '@/lib/utils'
import {
  ArrowLeft, FileText, Zap, MapPin, User, Clock,
  Phone, AlertTriangle, Loader2, ExternalLink, ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'

export default function OpdrachtDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [job, setJob] = useState<Job | null>(null)
  const [werkbon, setWerkbon] = useState<Werkbon | null>(null)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingInvoice, setGeneratingInvoice] = useState(false)

  useEffect(() => {
    if (id) loadData()
  }, [id])

  async function loadData() {
    setLoading(true)
    const [{ data: jobData }, { data: werkbonData }, { data: invoiceData }] = await Promise.all([
      supabase.from('jobs').select('*, client:clients(*), employee:employees(*)').eq('id', id).single(),
      supabase.from('werkbonnen').select('*').eq('job_id', id).maybeSingle(),
      supabase.from('invoices').select('*').eq('job_id', id).maybeSingle(),
    ])
    if (jobData) setJob(jobData as Job)
    if (werkbonData) setWerkbon(werkbonData)
    if (invoiceData) setInvoice(invoiceData)
    setLoading(false)
  }

  async function generateInvoice() {
    if (!job) return
    setGeneratingInvoice(true)
    try {
      const res = await fetch('/api/factuur/genereer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: id }),
      })
      const data = await res.json()
      if (data.payment_url) {
        window.open(data.payment_url, '_blank')
        toast.success('Factuur aangemaakt! Betaallink geopend.')
        loadData()
      } else {
        toast.error(data.error || 'Fout bij aanmaken factuur')
      }
    } catch {
      toast.error('Fout bij aanmaken factuur')
    }
    setGeneratingInvoice(false)
  }

  async function updateStatus(status: string) {
    const { error } = await supabase.from('jobs').update({ status }).eq('id', id)
    if (!error) {
      setJob(prev => prev ? { ...prev, status: status as Job['status'] } : null)
      toast.success(`Status bijgewerkt naar ${STATUS_LABELS[status]}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <h2 className="text-white font-semibold mb-2">Opdracht niet gevonden</h2>
          <Link href="/dashboard" className="text-primary hover:underline text-sm">Terug naar dashboard</Link>
        </div>
      </div>
    )
  }

  const client = job.client as { naam: string; telefoon?: string; email?: string; adres?: string } | undefined
  const employee = job.employee as { naam: string } | undefined

  return (
    <div className="min-h-screen bg-background">
      <WebGLBackground />
      <AppNav />
      <main className="ml-64 relative z-10 p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
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
                <h1 className="text-2xl font-bold text-white">{job.titel}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', STATUS_COLORS[job.status])}>
                    {STATUS_LABELS[job.status]}
                  </span>
                  {job.prioriteit === 'urgent' && (
                    <span className="text-xs px-2.5 py-1 rounded-full text-red-400 bg-red-400/10">
                      🔴 Urgent
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Job info */}
            <div className="col-span-2 space-y-4">
              {/* Details card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <h2 className="text-white font-semibold mb-4">Opdracht info</h2>
                <div className="space-y-3">
                  {job.omschrijving && (
                    <p className="text-text-muted text-sm leading-relaxed">{job.omschrijving}</p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {job.datum && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-text-faint" />
                        <span className="text-text-muted">{formatDate(job.datum)}</span>
                        {job.tijd_start && <span className="text-text-faint">{job.tijd_start.slice(0, 5)}</span>}
                      </div>
                    )}
                    {job.adres && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-text-faint" />
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(job.adres)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-light hover:underline flex items-center gap-1"
                        >
                          {job.adres}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Werkbon status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-semibold">Werkbon</h2>
                  {werkbon?.ondertekend_op && (
                    <span className="text-xs text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full">
                      ✓ Ondertekend
                    </span>
                  )}
                </div>
                {werkbon ? (
                  <div className="space-y-3">
                    {werkbon.werkzaamheden && (
                      <div>
                        <div className="text-xs text-text-faint mb-1">Werkzaamheden</div>
                        <p className="text-text-muted text-sm">{werkbon.werkzaamheden}</p>
                      </div>
                    )}
                    {werkbon.uren && (
                      <div>
                        <div className="text-xs text-text-faint mb-1">Uren gewerkt</div>
                        <p className="text-text-muted text-sm">{werkbon.uren} uur</p>
                      </div>
                    )}
                    {werkbon.materiaal_gebruikt && (
                      <div>
                        <div className="text-xs text-text-faint mb-1">Materiaal gebruikt</div>
                        <p className="text-text-muted text-sm">{werkbon.materiaal_gebruikt}</p>
                      </div>
                    )}
                    <Link href={`/opdracht/${id}/werkbon`}>
                      <button className="flex items-center gap-1 text-sm text-primary hover:underline">
                        Werkbon bekijken / aanpassen
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div>
                    <p className="text-text-muted text-sm mb-4">Nog geen werkbon ingevuld.</p>
                    <Link href={`/opdracht/${id}/werkbon`}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border border-white/15 text-white hover:border-white/30 transition-all"
                      >
                        <FileText className="w-4 h-4" />
                        Werkbon invullen
                      </motion.button>
                    </Link>
                  </div>
                )}
              </motion.div>

              {/* Invoice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-semibold">Factuur</h2>
                  {invoice?.status === 'betaald' && (
                    <span className="text-xs text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full">
                      ✓ Betaald
                    </span>
                  )}
                </div>
                {invoice ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-text-faint text-xs mb-1">Factuurnummer</div>
                        <div className="text-white font-mono">{invoice.factuur_nummer}</div>
                      </div>
                      <div>
                        <div className="text-text-faint text-xs mb-1">Bedrag</div>
                        <div className="text-white font-semibold">
                          {invoice.bedrag_incl ? formatCurrency(invoice.bedrag_incl) : '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-text-faint text-xs mb-1">Status</div>
                        <div className={cn('text-xs font-medium', {
                          'text-yellow-400': invoice.status === 'concept',
                          'text-blue-400': invoice.status === 'verstuurd',
                          'text-green-400': invoice.status === 'betaald',
                          'text-red-400': invoice.status === 'vervallen',
                        })}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </div>
                      </div>
                    </div>
                    {invoice.stripe_payment_link && invoice.status !== 'betaald' && (
                      <a href={invoice.stripe_payment_link} target="_blank" rel="noopener noreferrer">
                        <button className="flex items-center gap-1 text-sm text-primary hover:underline">
                          Betaallink openen
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </a>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-text-muted text-sm mb-4">Nog geen factuur aangemaakt.</p>
                    <motion.button
                      onClick={generateInvoice}
                      disabled={generatingInvoice}
                      whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm bg-primary/20 border border-primary/30 text-primary-light hover:bg-primary/30 transition-all disabled:opacity-50"
                    >
                      {generatingInvoice ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Aanmaken...</>
                      ) : (
                        <><Zap className="w-4 h-4" /> Snelfactuur iDEAL</>
                      )}
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Status change */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-5 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <h3 className="text-white font-medium text-sm mb-3">Status wijzigen</h3>
                <div className="space-y-2">
                  {['nieuw', 'onderweg', 'klaar', 'gefactureerd'].map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(s)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all',
                        job.status === s
                          ? STATUS_COLORS[s] + ' cursor-default'
                          : 'text-text-muted hover:text-white hover:bg-white/5'
                      )}
                    >
                      {job.status === s && '✓ '}{STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Client info */}
              {client && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-5 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <h3 className="text-white font-medium text-sm mb-3">Klant</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-text-faint" />
                      <span className="text-text-muted text-sm">{client.naam}</span>
                    </div>
                    {client.telefoon && (
                      <a href={`tel:${client.telefoon}`} className="flex items-center gap-2 text-sm text-primary-light hover:underline">
                        <Phone className="w-4 h-4" />
                        {client.telefoon}
                      </a>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Monteur */}
              {employee && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-5 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <h3 className="text-white font-medium text-sm mb-2">Monteur</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                      <span className="text-xs text-primary font-bold">
                        {employee.naam.charAt(0)}
                      </span>
                    </div>
                    <span className="text-text-muted text-sm">{employee.naam}</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
