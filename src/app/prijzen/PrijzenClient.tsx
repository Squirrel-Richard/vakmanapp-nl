'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import WebGLBackground from '@/components/shared/WebGLBackground'
import { Check, Wrench, ArrowLeft } from 'lucide-react'

const plans = [
  {
    name: 'Gratis',
    price: '€0',
    period: '/maand',
    desc: 'Perfect om te beginnen',
    color: 'rgba(99,102,241',
    features: [
      '1 monteur',
      '10 opdrachten/maand',
      'Digitale werkbon',
      'Klantbeheer',
      'Web app',
    ],
    cta: 'Start gratis',
    href: '/onboarding',
    highlight: false,
  },
  {
    name: 'Starter',
    price: '€19',
    period: '/maand',
    desc: 'Voor kleine bedrijven',
    color: 'rgba(20,184,166',
    features: [
      '3 monteurs',
      'Onbeperkt opdrachten',
      'Digitale werkbon + PDF',
      'Klantbeheer',
      'Snelfactuur iDEAL',
      'Web app + mobiel',
    ],
    cta: 'Kies Starter',
    href: '/onboarding?plan=starter',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '€49',
    period: '/maand',
    desc: 'Meest gekozen',
    color: 'rgba(99,102,241',
    features: [
      'Onbeperkt monteurs',
      'Onbeperkt opdrachten',
      'Digitale werkbon + PDF',
      'Klantbeheer',
      'Snelfactuur iDEAL',
      'Weekplanning',
      'iOS & Android app',
      'BTW-facturen compliant',
    ],
    cta: 'Kies Pro',
    href: '/onboarding?plan=pro',
    highlight: true,
  },
  {
    name: 'Business',
    price: '€99',
    period: '/maand',
    desc: 'Voor grotere bedrijven',
    color: 'rgba(249,115,22',
    features: [
      'Alles van Pro',
      'Meerdere vestigingen',
      'API toegang',
      'Prioriteit support',
      'Aangepaste factuurtemplate',
      'Accountmanager',
    ],
    cta: 'Kies Business',
    href: '/onboarding?plan=business',
    highlight: false,
  },
]

export default function PrijzenClient() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <WebGLBackground />
      <div className="relative z-10">
        {/* Nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
          style={{ background: 'rgba(6,6,15,0.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              <span className="font-bold text-white">VakmanApp</span>
            </Link>
            <Link href="/onboarding">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-sm bg-primary text-white rounded-xl font-medium"
              >
                Gratis starten
              </motion.button>
            </Link>
          </div>
        </nav>

        <div className="pt-32 pb-24 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl font-bold text-white mb-4">
                Eerlijke prijzen,
                <br />
                <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
                  geen verrassingen
                </span>
              </h1>
              <p className="text-text-muted text-lg max-w-xl mx-auto">
                Start gratis. Upgrade alleen als je meer nodig hebt.
                Geen jaarcontract verplicht.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
                  className={`p-6 rounded-2xl relative flex flex-col ${plan.highlight ? 'ring-1 ring-primary/50' : ''}`}
                  style={{
                    background: plan.highlight
                      ? 'rgba(99,102,241,0.08)'
                      : 'rgba(255,255,255,0.03)',
                    border: plan.highlight
                      ? '1px solid rgba(99,102,241,0.3)'
                      : '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
                      Meest gekozen
                    </div>
                  )}

                  <div className="mb-6">
                    <div className={`text-xs font-medium mb-2`}
                      style={{ color: `${plan.color},0.8)` }}>
                      {plan.name}
                    </div>
                    <div className="flex items-end gap-1 mb-1">
                      <span className="text-4xl font-black text-white">{plan.price}</span>
                      <span className="text-text-muted text-sm mb-1">{plan.period}</span>
                    </div>
                    <p className="text-text-muted text-sm">{plan.desc}</p>
                  </div>

                  <ul className="space-y-2.5 flex-1 mb-6">
                    {plan.features.map(feature => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 flex-shrink-0 mt-0.5"
                          style={{ color: `${plan.color},0.8)` }} />
                        <span className="text-text-muted text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.href}>
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: `0 0 20px ${plan.color},0.3)` }}
                      whileTap={{ scale: 0.97 }}
                      className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                        plan.highlight
                          ? 'bg-primary text-white'
                          : 'border border-white/15 text-white hover:border-white/30'
                      }`}
                    >
                      {plan.cta}
                    </motion.button>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-20 max-w-2xl mx-auto"
            >
              <h2 className="text-2xl font-bold text-white text-center mb-8">Veelgestelde vragen</h2>
              <div className="space-y-4">
                {[
                  {
                    q: 'Kan ik op elk moment opzeggen?',
                    a: 'Ja, je kan maandelijks opzeggen. Geen jaarcontracten verplicht.',
                  },
                  {
                    q: 'Werkt het met iDEAL?',
                    a: 'Ja, je klanten kunnen direct via iDEAL betalen. We ondersteunen ook creditcard en SEPA.',
                  },
                  {
                    q: 'Is de app beschikbaar in het Nederlands?',
                    a: 'Volledig. Alle teksten, facturen en werkbonnen zijn in het Nederlands.',
                  },
                  {
                    q: 'Hoe zit het met BTW?',
                    a: 'Hoog (21%) en laag (9%) BTW tarieven worden automatisch correct berekend op facturen.',
                  },
                ].map(item => (
                  <div key={item.q} className="p-5 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <h3 className="text-white font-medium mb-2">{item.q}</h3>
                    <p className="text-text-muted text-sm">{item.a}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}
