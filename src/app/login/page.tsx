'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import WebGLBackground from '@/components/shared/WebGLBackground'
import { Wrench, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        toast.error('Inloggen mislukt: ' + error.message)
        setLoading(false)
        return
      }
      router.push('/dashboard')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        toast.error('Registreren mislukt: ' + error.message)
        setLoading(false)
        return
      }
      toast.success('Account aangemaakt! Controleer je e-mail.')
      router.push('/onboarding')
    }
    setLoading(false)
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center">
      <WebGLBackground />
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-2">
            <motion.div
              animate={{ boxShadow: ['0 0 15px rgba(99,102,241,0.3)', '0 0 30px rgba(99,102,241,0.5)', '0 0 15px rgba(99,102,241,0.3)'] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center"
            >
              <Wrench className="w-6 h-6 text-primary" />
            </motion.div>
            <span className="text-xl font-bold text-white">VakmanApp</span>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-8 rounded-3xl"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <h1 className="text-2xl font-bold text-white mb-1">
            {mode === 'login' ? 'Welkom terug' : 'Account aanmaken'}
          </h1>
          <p className="text-text-muted text-sm mb-6">
            {mode === 'login'
              ? 'Log in op je VakmanApp account'
              : 'Start gratis met VakmanApp'
            }
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-text-muted mb-2">E-mailadres</label>
              <input
                type="email"
                required
                placeholder="jan@loodgieter.nl"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-2">Wachtwoord</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Bezig...</>
              ) : (
                <>{mode === 'login' ? 'Inloggen' : 'Account aanmaken'} <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setMode(m => m === 'login' ? 'signup' : 'login')}
              className="text-sm text-text-muted hover:text-white transition-colors"
            >
              {mode === 'login'
                ? 'Nog geen account? Registreer gratis'
                : 'Al een account? Inloggen'
              }
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
