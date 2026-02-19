'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import SignatureCanvas from 'react-signature-canvas'
import { createClient } from '@/lib/supabase/client'
import WebGLBackground from '@/components/shared/WebGLBackground'
import AppNav from '@/components/shared/AppNav'
import type { Job, Werkbon } from '@/types/database'
import { ArrowLeft, Save, RotateCcw, Check, Loader2, AlertTriangle, MessageCircle, Star } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

export default function WerkbonPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()
  const sigRef = useRef<SignatureCanvas>(null)

  const [job, setJob] = useState<Job | null>(null)
  const [werkbon, setWerkbon] = useState<Werkbon | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [signed, setSigned] = useState(false)
  const [savedSuccessfully, setSavedSuccessfully] = useState(false)
  const [reviewVerzonden, setReviewVerzonden] = useState(false)
  const [form, setForm] = useState({
    werkzaamheden: '',
    materiaal_gebruikt: '',
    uren: '',
  })

  useEffect(() => {
    if (id) loadData()
  }, [id])

  async function loadData() {
    setLoading(true)
    const { data: jobData } = await supabase
      .from('jobs')
      .select('*, client:clients(*), employee:employees(*)')
      .eq('id', id)
      .single()

    const { data: werkbonData } = await supabase
      .from('werkbonnen')
      .select('*')
      .eq('job_id', id)
      .maybeSingle()

    if (jobData) setJob(jobData as Job)
    if (werkbonData) {
      setWerkbon(werkbonData)
      setForm({
        werkzaamheden: werkbonData.werkzaamheden || '',
        materiaal_gebruikt: werkbonData.materiaal_gebruikt || '',
        uren: werkbonData.uren?.toString() || '',
      })
      if (werkbonData.ondertekend_op) setSigned(true)
    }
    setLoading(false)
  }

  function clearSignature() {
    sigRef.current?.clear()
    setSigned(false)
  }

  async function saveWerkbon() {
    if (!job) return
    setSaving(true)

    const isSignatureEmpty = sigRef.current?.isEmpty()
    const signatureDataUrl = !isSignatureEmpty ? sigRef.current?.toDataURL('image/png') : null

    // Upload handtekening to Supabase Storage
    let handtekening_url = werkbon?.handtekening_url || null
    if (signatureDataUrl) {
      const base64Data = signatureDataUrl.split(',')[1]
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/png' })

      const fileName = `handtekening_${id}_${Date.now()}.png`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('werkbonnen')
        .upload(fileName, blob, { upsert: true })

      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage
          .from('werkbonnen')
          .getPublicUrl(fileName)
        handtekening_url = publicUrl
      }
    }

    const werkbonData = {
      job_id: id,
      werkzaamheden: form.werkzaamheden || null,
      materiaal_gebruikt: form.materiaal_gebruikt || null,
      uren: form.uren ? parseFloat(form.uren) : null,
      handtekening_url,
      ondertekend_op: (!isSignatureEmpty && !signed) ? new Date().toISOString() : werkbon?.ondertekend_op || null,
    }

    let error
    if (werkbon) {
      const { error: e } = await supabase
        .from('werkbonnen')
        .update(werkbonData)
        .eq('id', werkbon.id)
      error = e
    } else {
      const { error: e } = await supabase
        .from('werkbonnen')
        .insert(werkbonData)
      error = e
    }

    if (error) {
      toast.error('Fout bij opslaan werkbon')
    } else {
      // Update job status to klaar
      if (job.status === 'nieuw' || job.status === 'onderweg') {
        await supabase.from('jobs').update({ status: 'klaar' }).eq('id', id)
      }
      toast.success('Werkbon opgeslagen!')
      setSavedSuccessfully(true)
      // Don't redirect immediately — show review request first
    }
    setSaving(false)
  }

  function sendReviewWhatsApp() {
    const telefoon = (job?.client as { telefoon?: string } | undefined)?.telefoon
    const naam = (job?.client as { naam?: string } | undefined)?.naam || 'u'
    if (!telefoon) {
      toast.error('Geen telefoonnummer bekend voor deze klant')
      return
    }
    const number = telefoon.replace(/[^0-9+]/g, '').replace(/^0/, '31')
    const text = encodeURIComponent(
      `Hallo ${naam}! Fijn dat we u konden helpen. Zou u ons een Google Review willen geven? Dat helpt ons enorm! 🙏\n\nhttps://g.page/r/vakmanapp/review`
    )
    window.open(`https://wa.me/${number}?text=${text}`, '_blank')
    setReviewVerzonden(true)
    toast.success('WhatsApp geopend!')
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
          <h2 className="text-white font-semibold">Opdracht niet gevonden</h2>
        </div>
      </div>
    )
  }

  const client = job.client as { naam: string; adres?: string } | undefined

  return (
    <div className="min-h-screen bg-background">
      <WebGLBackground />
      <AppNav />
      <main className="ml-64 relative z-10 p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href={`/opdracht/${id}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl text-text-muted hover:text-white border border-white/10 hover:border-white/20 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </motion.button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Digitale Werkbon</h1>
              <p className="text-text-muted text-sm">{job.titel}</p>
            </div>
          </div>

          {/* Werkbon info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl mb-5 grid grid-cols-2 gap-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div>
              <div className="text-xs text-text-faint mb-1">Klant</div>
              <div className="text-white text-sm font-medium">{client?.naam || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-text-faint mb-1">Datum</div>
              <div className="text-white text-sm">{job.datum ? formatDate(job.datum) : 'Vandaag'}</div>
            </div>
            <div>
              <div className="text-xs text-text-faint mb-1">Adres</div>
              <div className="text-white text-sm">{job.adres || client?.adres || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-text-faint mb-1">Opdracht</div>
              <div className="text-white text-sm font-mono text-xs">{id.slice(0, 8).toUpperCase()}</div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl mb-5 space-y-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h2 className="text-white font-semibold">Werkzaamheden</h2>

            <div>
              <label className="block text-sm text-text-muted mb-2">Uitgevoerde werkzaamheden *</label>
              <textarea
                placeholder="Beschrijf wat er gedaan is..."
                value={form.werkzaamheden}
                onChange={e => setForm(p => ({ ...p, werkzaamheden: e.target.value }))}
                rows={5}
                className="w-full px-4 py-3 rounded-xl text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">Materiaal gebruikt</label>
              <textarea
                placeholder="bijv. 2x pvc buis 32mm, kit, dichting..."
                value={form.materiaal_gebruikt}
                onChange={e => setForm(p => ({ ...p, materiaal_gebruikt: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">Aantal uren gewerkt</label>
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="bijv. 2.5"
                value={form.uren}
                onChange={e => setForm(p => ({ ...p, uren: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm"
              />
            </div>
          </motion.div>

          {/* Signature */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl mb-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-white font-semibold">Handtekening klant</h2>
                <p className="text-xs text-text-muted mt-0.5">Laat de klant hieronder tekenen</p>
              </div>
              {signed && (
                <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full">
                  <Check className="w-3 h-3" />
                  Ondertekend
                </span>
              )}
            </div>

            {signed && werkbon?.ondertekend_op ? (
              <div className="text-center py-8 text-text-muted text-sm">
                <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
                Ondertekend op {formatDate(werkbon.ondertekend_op)}
                <div className="mt-3">
                  {werkbon.handtekening_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={werkbon.handtekening_url}
                      alt="Handtekening"
                      className="max-h-24 mx-auto filter invert opacity-80"
                    />
                  )}
                </div>
              </div>
            ) : (
              <>
                <div
                  className="rounded-xl overflow-hidden border border-white/10"
                  style={{ background: 'rgba(255,255,255,0.95)' }}
                >
                  <SignatureCanvas
                    ref={sigRef}
                    canvasProps={{
                      width: 580,
                      height: 200,
                      style: { display: 'block', width: '100%' },
                    }}
                    backgroundColor="rgba(255,255,255,0.95)"
                    penColor="#1a1a2e"
                    onEnd={() => setSigned(false)}
                  />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-text-faint">Teken met vinger of muis</p>
                  <button
                    onClick={clearSignature}
                    className="flex items-center gap-1.5 text-xs text-text-muted hover:text-white transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Opnieuw
                  </button>
                </div>
              </>
            )}
          </motion.div>

          {/* Save button */}
          {!savedSuccessfully && (
            <motion.button
              onClick={saveWerkbon}
              disabled={saving || !form.werkzaamheden.trim()}
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Opslaan...</>
              ) : (
                <><Save className="w-4 h-4" /> Werkbon opslaan</>
              )}
            </motion.button>
          )}

          {/* Review request — shown after successful save */}
          {savedSuccessfully && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="p-6 rounded-2xl text-center"
              style={{
                background: 'rgba(34,197,94,0.06)',
                border: '1px solid rgba(34,197,94,0.2)',
                boxShadow: '0 0 30px rgba(34,197,94,0.08)',
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-14 h-14 rounded-full bg-green-400/10 border border-green-400/20 flex items-center justify-center mx-auto mb-4"
              >
                <Check className="w-7 h-7 text-green-400" />
              </motion.div>

              <h3 className="text-white font-bold text-xl mb-1">Werkbon opgeslagen! ✅</h3>
              <p className="text-text-muted text-sm mb-6">
                Klant tevreden? Stuur een Google Review verzoek via WhatsApp.
                <br />
                <span className="text-xs opacity-70">Reviews = meer klanten. 30 seconden werk.</span>
              </p>

              <div className="flex items-center justify-center gap-2 mb-4">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {reviewVerzonden ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-2 text-green-400 font-medium mb-4"
                >
                  <Check className="w-4 h-4" />
                  Review verzoek verstuurd via WhatsApp!
                </motion.div>
              ) : (
                <motion.button
                  onClick={sendReviewWhatsApp}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(37,211,102,0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 mx-auto px-6 py-3 rounded-xl font-semibold text-white mb-4"
                  style={{ background: '#25D366', boxShadow: '0 0 15px rgba(37,211,102,0.2)' }}
                >
                  <MessageCircle className="w-4 h-4" />
                  📱 WhatsApp Review Sturen
                </motion.button>
              )}

              <button
                onClick={() => router.push(`/opdracht/${id}`)}
                className="text-sm text-text-muted hover:text-white transition-colors underline underline-offset-2"
              >
                Doorgaan zonder review →
              </button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
