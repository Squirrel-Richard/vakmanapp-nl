'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Offerte } from '@/types/database'
import { Plus, FileText, Loader2, ChevronRight, Euro } from 'lucide-react'
import AppNav from '@/components/shared/AppNav'
import WebGLBackground from '@/components/shared/WebGLBackground'

const STATUS_LABELS: Record<string, string> = {
  concept: 'Concept',
  verstuurd: 'Verstuurd',
  geaccepteerd: 'Geaccepteerd',
  afgewezen: 'Afgewezen',
  vervallen: 'Vervallen',
}

const STATUS_COLORS: Record<string, string> = {
  concept: '#6B7280',
  verstuurd: '#3B82F6',
  geaccepteerd: '#22C55E',
  afgewezen: '#EF4444',
  vervallen: '#F97316',
}

export default function OffertesPage() {
  const [offertes, setOffertes] = useState<Offerte[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchOffertes()
  }, [])

  async function fetchOffertes() {
    setLoading(true)
    const { data } = await supabase
      .from('offertes')
      .select('*, client:clients(naam, email, telefoon)')
      .order('created_at', { ascending: false })
    if (data) setOffertes(data as Offerte[])
    setLoading(false)
  }

  const formatEuro = (amount: number) =>
    new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount)

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
      <WebGLBackground />
      <AppNav />
      <main className="ml-64 p-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-white"
            >
              Offertes
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-text-muted mt-1"
            >
              {loading ? '...' : `${offertes.length} offertes`}
            </motion.p>
          </div>
          <Link href="/offerte/nieuw">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-medium"
            >
              <Plus className="w-4 h-4" />
              Nieuwe offerte
            </motion.button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : offertes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <FileText className="w-16 h-16 text-text-faint mx-auto mb-4 opacity-30" />
            <h3 className="text-white font-medium mb-2">Nog geen offertes</h3>
            <p className="text-text-muted text-sm mb-6">
              Stuur je eerste offerte en win die opdracht
            </p>
            <Link href="/offerte/nieuw">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-primary text-white rounded-xl font-medium"
              >
                Offerte maken
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {offertes.map((offerte, i) => (
                <motion.div
                  key={offerte.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ x: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
                  className="flex items-center gap-4 p-5 rounded-2xl cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-indigo-400" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium">{offerte.offerte_nummer}</span>
                      <span
                        className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                        style={{
                          background: STATUS_COLORS[offerte.status] + '20',
                          color: STATUS_COLORS[offerte.status],
                          border: `1px solid ${STATUS_COLORS[offerte.status]}40`,
                        }}
                      >
                        {STATUS_LABELS[offerte.status]}
                      </span>
                    </div>
                    <div className="text-sm text-text-muted mt-0.5">
                      {offerte.client?.naam || 'Onbekende klant'}
                      {offerte.geldig_tot && (
                        <span className="ml-3 text-xs">
                          Geldig t/m {new Date(offerte.geldig_tot).toLocaleDateString('nl-NL')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="text-right">
                    <div className="text-white font-semibold text-lg">
                      {formatEuro(offerte.totaal)}
                    </div>
                    <div className="text-xs text-text-muted">incl. BTW</div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-text-faint" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  )
}
