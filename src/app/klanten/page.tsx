'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Client } from '@/types/database'
import { Plus, Search, Phone, Mail, MapPin, ChevronRight, Loader2, Users } from 'lucide-react'

export default function KlantenPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ naam: '', email: '', telefoon: '', adres: '', notities: '' })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    setLoading(true)
    const { data } = await supabase
      .from('clients')
      .select('*')
      .order('naam')
    if (data) setClients(data)
    setLoading(false)
  }

  async function saveClient(e: React.FormEvent) {
    e.preventDefault()
    if (!form.naam.trim()) return
    setSaving(true)

    // Get company_id
    const { data: { user } } = await supabase.auth.getUser()
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', user?.id)
      .single()

    const { error } = await supabase.from('clients').insert({
      ...form,
      company_id: company?.id,
    })

    if (!error) {
      setForm({ naam: '', email: '', telefoon: '', adres: '', notities: '' })
      setShowForm(false)
      fetchClients()
    }
    setSaving(false)
  }

  const filtered = clients.filter(c =>
    c.naam.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.telefoon?.includes(search)
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-white">
            Klanten
          </motion.h1>
          <p className="text-text-muted mt-1">{clients.length} klanten</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-medium"
        >
          <Plus className="w-4 h-4" />
          Nieuwe klant
        </motion.button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="mb-6 p-6 rounded-2xl overflow-hidden"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <h2 className="text-white font-semibold mb-4">Nieuwe klant toevoegen</h2>
            <form onSubmit={saveClient} className="grid grid-cols-2 gap-4">
              <input
                required
                placeholder="Naam *"
                value={form.naam}
                onChange={e => setForm(p => ({ ...p, naam: e.target.value }))}
                className="col-span-2 px-4 py-3 rounded-xl text-sm"
              />
              <input
                type="email"
                placeholder="E-mail"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="px-4 py-3 rounded-xl text-sm"
              />
              <input
                placeholder="Telefoon"
                value={form.telefoon}
                onChange={e => setForm(p => ({ ...p, telefoon: e.target.value }))}
                className="px-4 py-3 rounded-xl text-sm"
              />
              <input
                placeholder="Adres"
                value={form.adres}
                onChange={e => setForm(p => ({ ...p, adres: e.target.value }))}
                className="col-span-2 px-4 py-3 rounded-xl text-sm"
              />
              <textarea
                placeholder="Notities"
                value={form.notities}
                onChange={e => setForm(p => ({ ...p, notities: e.target.value }))}
                rows={2}
                className="col-span-2 px-4 py-3 rounded-xl text-sm resize-none"
              />
              <div className="col-span-2 flex gap-3">
                <motion.button
                  type="submit"
                  disabled={saving}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-50"
                >
                  {saving ? 'Opslaan...' : 'Opslaan'}
                </motion.button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 text-text-muted hover:text-white rounded-xl text-sm border border-white/10 hover:border-white/20 transition-all"
                >
                  Annuleren
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
        <input
          placeholder="Zoek klanten..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl text-sm"
        />
      </div>

      {/* Client list */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24"
        >
          <Users className="w-16 h-16 text-text-faint mx-auto mb-4 opacity-30" />
          <h3 className="text-white font-medium mb-2">
            {search ? 'Geen klanten gevonden' : 'Nog geen klanten'}
          </h3>
          <p className="text-text-muted text-sm">
            {search ? 'Probeer een andere zoekopdracht' : 'Voeg je eerste klant toe om te beginnen'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filtered.map((client, i) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/klant/${client.id}`}>
                <motion.div
                  whileHover={{ x: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
                  className="flex items-center gap-4 p-5 rounded-2xl cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">
                      {client.naam.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium">{client.naam}</div>
                    <div className="flex items-center gap-4 mt-1">
                      {client.email && (
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          <Mail className="w-3 h-3" />
                          {client.email}
                        </span>
                      )}
                      {client.telefoon && (
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          <Phone className="w-3 h-3" />
                          {client.telefoon}
                        </span>
                      )}
                      {client.adres && (
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          <MapPin className="w-3 h-3" />
                          {client.adres}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-faint" />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
