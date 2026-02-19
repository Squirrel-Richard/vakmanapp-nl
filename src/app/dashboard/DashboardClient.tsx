'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Job } from '@/types/database'
import { formatShortDate, cn } from '@/lib/utils'
import { Plus, Clock, MapPin, User, ChevronRight, Loader2 } from 'lucide-react'

const COLUMNS = [
  { key: 'nieuw', label: 'Nieuw', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)' },
  { key: 'onderweg', label: 'Onderweg', color: '#fb923c', bg: 'rgba(251,146,60,0.08)' },
  { key: 'klaar', label: 'Klaar', color: '#4ade80', bg: 'rgba(74,222,128,0.08)' },
  { key: 'gefactureerd', label: 'Gefactureerd', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
] as const

export default function DashboardClient() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchJobs()
  }, [])

  async function fetchJobs() {
    setLoading(true)
    const { data, error } = await supabase
      .from('jobs')
      .select('*, client:clients(naam, telefoon), employee:employees(naam)')
      .order('created_at', { ascending: false })

    if (!error && data) setJobs(data as Job[])
    setLoading(false)
  }

  async function updateStatus(jobId: string, newStatus: string) {
    const { error } = await supabase
      .from('jobs')
      .update({ status: newStatus })
      .eq('id', jobId)

    if (!error) {
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus as Job['status'] } : j))
    }
  }

  const getJobsByStatus = (status: string) => jobs.filter(j => j.status === status)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white"
          >
            Opdrachten
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-text-muted mt-1"
          >
            {loading ? '...' : `${jobs.length} opdrachten totaal`}
          </motion.p>
        </div>
        <Link href="/opdracht/nieuw">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-medium"
          >
            <Plus className="w-4 h-4" />
            Nieuwe opdracht
          </motion.button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        /* Kanban board */
        <div className="grid grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const colJobs = getJobsByStatus(col.key)
            return (
              <div key={col.key} className="rounded-2xl p-4"
                style={{ background: col.bg, border: `1px solid ${col.color}25`, minHeight: 400 }}
              >
                {/* Column header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                    <span className="text-sm font-semibold text-white">{col.label}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full text-text-muted"
                    style={{ background: 'rgba(255,255,255,0.07)' }}>
                    {colJobs.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-3">
                  <AnimatePresence>
                    {colJobs.map((job) => (
                      <motion.div
                        key={job.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      >
                        <Link href={`/opdracht/${job.id}`}>
                          <motion.div
                            whileHover={{ y: -2, boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }}
                            className="p-4 rounded-xl cursor-pointer"
                            style={{
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.07)',
                            }}
                          >
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <h3 className="text-white text-sm font-medium leading-tight">
                                {job.titel}
                              </h3>
                              <ChevronRight className="w-3.5 h-3.5 text-text-faint flex-shrink-0 mt-0.5" />
                            </div>

                            <div className="space-y-1.5">
                              {job.client && (
                                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                  <User className="w-3 h-3" />
                                  {(job.client as { naam: string }).naam}
                                </div>
                              )}
                              {job.datum && (
                                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                  <Clock className="w-3 h-3" />
                                  {formatShortDate(job.datum)}
                                </div>
                              )}
                              {job.adres && (
                                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate">{job.adres}</span>
                                </div>
                              )}
                            </div>

                            {/* Move buttons */}
                            {col.key !== 'gefactureerd' && (
                              <div className="mt-3 pt-3 border-t border-white/5">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    const next = { nieuw: 'onderweg', onderweg: 'klaar', klaar: 'gefactureerd' }
                                    updateStatus(job.id, next[col.key as keyof typeof next])
                                  }}
                                  className="text-xs text-text-faint hover:text-white transition-colors"
                                >
                                  → {COLUMNS[COLUMNS.findIndex(c => c.key === col.key) + 1]?.label}
                                </button>
                              </div>
                            )}
                          </motion.div>
                        </Link>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {colJobs.length === 0 && (
                    <div className="text-center py-12 text-text-faint text-sm">
                      Geen opdrachten
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
