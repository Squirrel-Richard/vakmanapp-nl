'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import WebGLBackground from '@/components/shared/WebGLBackground'
import { Wrench, ArrowRight, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const steps = ['Account', 'Bedrijf', 'Monteur', 'Klaar']

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [account, setAccount] = useState({ email: '', password: '' })
  const [company, setCompany] = useState({
    naam: '',
    kvk: '',
    btw_nummer: '',
    iban: '',
    email: '',
    telefoon: '',
    adres: '',
  })
  const [monteur, setMonteur] = useState({ naam: '', email: '', telefoon: '' })

  async function handleAccountStep(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: account.email,
      password: account.password,
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    setStep(1)
    setLoading(false)
  }

  async function handleCompanyStep(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('companies').insert({
      user_id: user?.id,
      naam: company.naam,
      kvk: company.kvk || null,
      btw_nummer: company.btw_nummer || null,
      iban: company.iban || null,
      email: company.email || null,
      telefoon: company.telefoon || null,
      adres: company.adres || null,
    })

    if (error) {
      toast.error('Fout bij opslaan bedrijf')
      setLoading(false)
      return
    }

    // Create subscription (gratis)
    const { data: comp } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', user?.id)
      .single()

    if (comp) {
      await supabase.from('subscriptions').insert({
        company_id: comp.id,
        plan: 'gratis',
        max_employees: 1,
      })
    }

    setStep(2)
    setLoading(false)
  }

  async function handleMonteurStep(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: comp } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', user?.id)
      .single()

    if (comp && monteur.naam) {
      await supabase.from('employees').insert({
        company_id: comp.id,
        naam: monteur.naam,
        email: monteur.email || null,
        telefoon: monteur.telefoon || null,
        rol: 'monteur',
      })
    }

    setStep(3)
    setLoading(false)
  }

  function handleFinish() {
    router.push('/dashboard')
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center">
      <WebGLBackground />
      <div className="relative z-10 w-full max-w-lg px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <motion.div
              animate={{ boxShadow: ['0 0 15px rgba(99,102,241,0.3)', '0 0 30px rgba(99,102,241,0.5)', '0 0 15px rgba(99,102,241,0.3)'] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center"
            >
              <Wrench className="w-5 h-5 text-primary" />
            </motion.div>
            <span className="text-xl font-bold text-white">VakmanApp</span>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <motion.div
                animate={{
                  background: i <= step ? '#6366f1' : 'rgba(255,255,255,0.1)',
                  scale: i === step ? 1.1 : 1,
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              >
                {i < step ? <Check className="w-4 h-4 text-white" /> : (
                  <span className={i <= step ? 'text-white' : 'text-text-faint'}>{i + 1}</span>
                )}
              </motion.div>
              {i < steps.length - 1 && (
                <div className="w-8 h-px"
                  style={{ background: i < step ? '#6366f1' : 'rgba(255,255,255,0.1)' }} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <motion.div
          className="p-8 rounded-3xl"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <AnimatePresence mode="wait">
            {/* Step 0 - Account */}
            {step === 0 && (
              <motion.div
                key="account"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h1 className="text-2xl font-bold text-white mb-1">Account aanmaken</h1>
                <p className="text-text-muted text-sm mb-6">Begin gratis, geen creditcard nodig</p>
                <form onSubmit={handleAccountStep} className="space-y-4">
                  <div>
                    <label className="block text-sm text-text-muted mb-2">E-mailadres</label>
                    <input type="email" required placeholder="jan@loodgieter.nl"
                      value={account.email}
                      onChange={e => setAccount(p => ({ ...p, email: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-text-muted mb-2">Wachtwoord</label>
                    <input type="password" required placeholder="Minimaal 8 tekens" minLength={8}
                      value={account.password}
                      onChange={e => setAccount(p => ({ ...p, password: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-sm" />
                  </div>
                  <motion.button type="submit" disabled={loading}
                    whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-xl font-semibold disabled:opacity-50">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Doorgaan <ArrowRight className="w-4 h-4" /></>}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* Step 1 - Bedrijf */}
            {step === 1 && (
              <motion.div key="bedrijf" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="text-2xl font-bold text-white mb-1">Jouw bedrijf</h1>
                <p className="text-text-muted text-sm mb-6">Deze gegevens komen op je facturen</p>
                <form onSubmit={handleCompanyStep} className="space-y-3">
                  <input required placeholder="Bedrijfsnaam *"
                    value={company.naam}
                    onChange={e => setCompany(p => ({ ...p, naam: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm" />
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="KvK-nummer"
                      value={company.kvk}
                      onChange={e => setCompany(p => ({ ...p, kvk: e.target.value }))}
                      className="px-4 py-3 rounded-xl text-sm" />
                    <input placeholder="BTW-nummer"
                      value={company.btw_nummer}
                      onChange={e => setCompany(p => ({ ...p, btw_nummer: e.target.value }))}
                      className="px-4 py-3 rounded-xl text-sm" />
                  </div>
                  <input placeholder="IBAN"
                    value={company.iban}
                    onChange={e => setCompany(p => ({ ...p, iban: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm" />
                  <input type="email" placeholder="Bedrijfs e-mail"
                    value={company.email}
                    onChange={e => setCompany(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm" />
                  <input placeholder="Telefoon"
                    value={company.telefoon}
                    onChange={e => setCompany(p => ({ ...p, telefoon: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm" />
                  <input placeholder="Adres"
                    value={company.adres}
                    onChange={e => setCompany(p => ({ ...p, adres: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm" />
                  <motion.button type="submit" disabled={loading || !company.naam}
                    whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-xl font-semibold disabled:opacity-50">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Doorgaan <ArrowRight className="w-4 h-4" /></>}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* Step 2 - Monteur */}
            {step === 2 && (
              <motion.div key="monteur" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="text-2xl font-bold text-white mb-1">Eerste monteur</h1>
                <p className="text-text-muted text-sm mb-6">Voeg je eerste monteur toe (kan ook jezelf zijn)</p>
                <form onSubmit={handleMonteurStep} className="space-y-3">
                  <input required placeholder="Naam monteur *"
                    value={monteur.naam}
                    onChange={e => setMonteur(p => ({ ...p, naam: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm" />
                  <input type="email" placeholder="E-mail monteur"
                    value={monteur.email}
                    onChange={e => setMonteur(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm" />
                  <input placeholder="Telefoon monteur"
                    value={monteur.telefoon}
                    onChange={e => setMonteur(p => ({ ...p, telefoon: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm" />
                  <div className="flex gap-3">
                    <motion.button type="submit" disabled={loading || !monteur.naam}
                      whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-xl font-semibold disabled:opacity-50">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Doorgaan <ArrowRight className="w-4 h-4" /></>}
                    </motion.button>
                    <button type="button" onClick={() => setStep(3)}
                      className="px-4 py-4 border border-white/10 text-text-muted rounded-xl text-sm hover:border-white/20 hover:text-white transition-all">
                      Overslaan
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 3 - Done */}
            {step === 3 && (
              <motion.div key="klaar" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-green-400/20 border-2 border-green-400/40 flex items-center justify-center mx-auto mb-6"
                >
                  <Check className="w-10 h-10 text-green-400" />
                </motion.div>
                <h1 className="text-2xl font-bold text-white mb-2">Klaar om te starten!</h1>
                <p className="text-text-muted mb-8">Je VakmanApp is ingericht. Ga naar het dashboard om je eerste opdracht aan te maken.</p>
                <motion.button onClick={handleFinish}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(99,102,241,0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-xl font-bold text-lg">
                  Ga naar dashboard <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  )
}
