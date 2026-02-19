'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import WebGLBackground from '@/components/shared/WebGLBackground'
import AppNav from '@/components/shared/AppNav'
import type { Client, Job, Invoice } from '@/types/database'
import { formatShortDate, formatCurrency, STATUS_COLORS, STATUS_LABELS, cn } from '@/lib/utils'
import { ArrowLeft, Phone, Mail, MapPin, FileText, Loader2, AlertTriangle } from 'lucide-react'

export default function KlantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()

  const [client, setClient] = useState<Client | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) loadData()
  }, [id])

  async function loadData() {
    setLoading(true)
    const [{ data: clientData }, { data: jobsData }, { data: invoicesData }] = await Promise.all([
      supabase.from('clients').select('*').eq('id', id).single(),
      supabase.from('jobs').select('*').eq('client_id', id).order('created_at', { ascending: false }),
      supabase.from('invoices').select('*').eq('company_id', (await supabase.from('clients').select('company_id').eq('id', id).single()).data?.company_id || '').order('created_at', { ascending: false }),
    ])
    if (clientData) setClient(clientData)
    if (jobsData) setJobs(jobsData as Job[])
    if (invoicesData) setInvoices(invoicesData)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <h2 className="text-white font-semibold">Klant niet gevonden</h2>
        </div>
      </div>
    )
  }

  const clientInvoices = invoices.filter(inv =>
    jobs.some(j => j.id === inv.job_id)
  )
  const totalPaid = clientInvoices
    .filter(i => i.status === 'betaald')
    .reduce((sum, i) => sum + (i.bedrag_incl || 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <WebGLBackground />
      <AppNav />
      <main className="ml-64 relative z-10 p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/klanten">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl text-text-muted hover:text-white border border-white/10 hover:border-white/20 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </motion.button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-primary font-bold text-xl">
                  {client.naam.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{client.naam}</h1>
                <p className="text-text-muted text-sm">Klant sinds {formatShortDate(client.created_at)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Left column */}
            <div className="col-span-2 space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Opdrachten', value: jobs.length.toString() },
                  { label: 'Facturen', value: clientInvoices.length.toString() },
                  { label: 'Totaal betaald', value: formatCurrency(totalPaid) },
                ].map(stat => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl text-center"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-text-muted mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Opdrachten */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <h2 className="text-white font-semibold mb-4">Opdrachten ({jobs.length})</h2>
                {jobs.length === 0 ? (
                  <p className="text-text-muted text-sm">Nog geen opdrachten</p>
                ) : (
                  <div className="space-y-3">
                    {jobs.map(job => (
                      <Link key={job.id} href={`/opdracht/${job.id}`}>
                        <motion.div
                          whileHover={{ x: 4 }}
                          className="flex items-center justify-between p-4 rounded-xl cursor-pointer"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                        >
                          <div>
                            <div className="text-white text-sm font-medium">{job.titel}</div>
                            {job.datum && (
                              <div className="text-text-faint text-xs mt-0.5">{formatShortDate(job.datum)}</div>
                            )}
                          </div>
                          <span className={cn('text-xs px-2.5 py-1 rounded-full', STATUS_COLORS[job.status])}>
                            {STATUS_LABELS[job.status]}
                          </span>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Facturen */}
              {clientInvoices.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <h2 className="text-white font-semibold mb-4">Facturen ({clientInvoices.length})</h2>
                  <div className="space-y-3">
                    {clientInvoices.map(inv => (
                      <div key={inv.id} className="flex items-center justify-between p-4 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div>
                          <div className="text-white text-sm font-mono">{inv.factuur_nummer}</div>
                          <div className="text-text-faint text-xs mt-0.5">{formatShortDate(inv.created_at)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-white text-sm font-semibold">
                            {inv.bedrag_incl ? formatCurrency(inv.bedrag_incl) : '—'}
                          </div>
                          <div className={cn('text-xs', {
                            'text-yellow-400': inv.status === 'concept',
                            'text-blue-400': inv.status === 'verstuurd',
                            'text-green-400': inv.status === 'betaald',
                            'text-red-400': inv.status === 'vervallen',
                          })}>
                            {inv.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right sidebar */}
            <div className="space-y-4">
              {/* Contact */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-5 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <h3 className="text-white font-medium text-sm mb-3">Contact</h3>
                <div className="space-y-3">
                  {client.telefoon && (
                    <a href={`tel:${client.telefoon}`} className="flex items-center gap-2 text-sm text-primary-light hover:underline">
                      <Phone className="w-4 h-4" />
                      {client.telefoon}
                    </a>
                  )}
                  {client.email && (
                    <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-sm text-primary-light hover:underline">
                      <Mail className="w-4 h-4" />
                      {client.email}
                    </a>
                  )}
                  {client.adres && (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(client.adres)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-text-muted hover:text-primary-light transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                      {client.adres}
                    </a>
                  )}
                </div>
              </motion.div>

              {/* Notities */}
              {client.notities && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-5 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <h3 className="text-white font-medium text-sm mb-2">Notities</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{client.notities}</p>
                </motion.div>
              )}

              {/* New opdracht for client */}
              <Link href={`/opdracht/nieuw?client=${client.id}`}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-primary/30 text-primary-light rounded-xl text-sm hover:bg-primary/10 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  Nieuwe opdracht
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
