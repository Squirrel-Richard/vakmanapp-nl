'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useRef } from 'react'
import WebGLBackground from '@/components/shared/WebGLBackground'
import {
  Wrench, FileText, Zap, Users, Calendar,
  CheckCircle, ArrowRight, Star, Clock, Shield,
  Smartphone, Globe, ChevronRight
} from 'lucide-react'

const features = [
  {
    icon: Wrench,
    title: 'Job Management',
    desc: 'Opdrachten aanmaken, status bijhouden. Van nieuw naar gefactureerd in één overzicht.',
    color: '#6366f1',
  },
  {
    icon: FileText,
    title: 'Digitale Werkbon',
    desc: 'Monteur vult in op telefoon. Klant tekent digitaal. PDF automatisch gegenereerd.',
    color: '#14b8a6',
  },
  {
    icon: Zap,
    title: 'Snelfactuur iDEAL',
    desc: 'Vanuit werkbon in 1 klik factuur met iDEAL betaallink. Sneller betaald.',
    color: '#f97316',
  },
  {
    icon: Users,
    title: 'Klantbeheer',
    desc: 'Adresboek met history. Alle opdrachten, facturen en betalingen per klant.',
    color: '#22c55e',
  },
  {
    icon: Calendar,
    title: 'Planning',
    desc: 'Weekoverzicht wie gaat wanneer waarheen. Nooit meer dubbele afspraken.',
    color: '#a855f7',
  },
  {
    icon: Shield,
    title: 'BTW-compliant',
    desc: 'Hoog/laag BTW tarieven, KvK en BTW-nummer op elke factuur. Klaar voor de boekhouder.',
    color: '#ec4899',
  },
]

const testimonials = [
  {
    name: 'Jan de Vries',
    beroep: 'Loodgieter, Utrecht',
    quote: 'Eindelijk een app die gewoon Nederlands is. Mijn klanten betalen nu via iDEAL, geen gedoe meer.',
    rating: 5,
  },
  {
    name: 'Mark Hendriksen',
    beroep: 'Elektricien, Amsterdam',
    quote: 'De digitale werkbon bespaart me 2 uur per week. Mijn boekhouder is ook blij.',
    rating: 5,
  },
  {
    name: 'Peter Bakker',
    beroep: 'Schilder, Rotterdam',
    quote: 'Mijn monteurs gebruiken het op hun telefoon. Planning is eindelijk helder.',
    rating: 5,
  },
]

const stats = [
  { value: '350K+', label: 'NL Vakmannen' },
  { value: '€0', label: 'Papierkosten' },
  { value: '2 uur', label: 'Bespaard/week' },
  { value: '100%', label: 'NL iDEAL' },
]

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -100])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <main className="relative min-h-screen overflow-hidden">
      <WebGLBackground />

      {/* Content layer */}
      <div className="relative z-10">

        {/* Nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
          style={{
            background: 'rgba(6,6,15,0.7)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <motion.div
                animate={{ boxShadow: ['0 0 15px rgba(99,102,241,0.3)', '0 0 25px rgba(99,102,241,0.5)', '0 0 15px rgba(99,102,241,0.3)'] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center"
              >
                <Wrench className="w-4 h-4 text-primary" />
              </motion.div>
              <span className="font-bold text-white">VakmanApp</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <Link href="/prijzen" className="text-sm text-text-muted hover:text-white transition-colors">
                Prijzen
              </Link>
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-sm text-text-muted border border-white/10 rounded-xl hover:border-white/20 hover:text-white transition-all"
                >
                  Inloggen
                </motion.button>
              </Link>
              <Link href="/onboarding">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-sm bg-primary text-white rounded-xl font-medium"
                >
                  Gratis starten
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </nav>

        {/* Hero */}
        <section ref={heroRef} className="min-h-screen flex items-center justify-center px-6 pt-20">
          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm"
              style={{
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.2)',
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-primary"
              />
              <span className="text-primary-light">Gemaakt voor Nederlandse vakmannen</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
              className="text-3xl sm:text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight"
            >
              Stop met
              <br />
              <span className="bg-gradient-to-r from-primary via-violet-400 to-teal-400 bg-clip-text text-transparent">
                WhatsApp & Excel
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-text-muted max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              VakmanApp is de enige job management app gebouwd voor Nederlandse
              loodgieters, elektriciens, schilders en installateurs.
              Werkbonnen, iDEAL facturen, planning — alles in één app.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/onboarding">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(99,102,241,0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-primary text-white rounded-2xl font-semibold text-lg flex items-center gap-2 group"
                >
                  Gratis beginnen
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <Link href="/prijzen">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border border-white/15 text-white rounded-2xl font-semibold text-lg hover:border-white/30 transition-all"
                  style={{ backdropFilter: 'blur(10px)' }}
                >
                  Bekijk prijzen
                </motion.button>
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-sm text-text-faint"
            >
              Gratis starten — geen creditcard nodig
            </motion.p>

            {/* App mockup */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, type: 'spring', stiffness: 60 }}
              className="mt-20 relative"
            >
              <div className="relative mx-auto max-w-3xl rounded-3xl overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 80px rgba(99,102,241,0.15)',
                }}
              >
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <div className="ml-4 px-3 py-1 rounded-lg text-xs text-text-faint"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    vakmanapp.nl/dashboard
                  </div>
                </div>

                {/* Dashboard preview */}
                <div className="p-6 min-h-64 overflow-x-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white font-semibold">Opdrachten</h3>
                    <div className="px-3 py-1.5 rounded-lg text-xs text-primary bg-primary/10 border border-primary/20">
                      + Nieuwe opdracht
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 min-w-[400px]">
                    {['Nieuw', 'Onderweg', 'Klaar', 'Gefactureerd'].map((col, i) => (
                      <div key={col} className="rounded-xl p-3"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="text-xs font-medium mb-3"
                          style={{ color: ['#60a5fa', '#fb923c', '#4ade80', '#a78bfa'][i] }}>
                          {col}
                        </div>
                        {i === 0 && (
                          <div className="space-y-2">
                            {['Lekkage Keuken', 'Stopcontact'].map(t => (
                              <div key={t} className="p-2 rounded-lg text-xs text-text-muted"
                                style={{ background: 'rgba(255,255,255,0.04)' }}>
                                {t}
                              </div>
                            ))}
                          </div>
                        )}
                        {i === 1 && (
                          <div className="p-2 rounded-lg text-xs text-text-muted"
                            style={{ background: 'rgba(255,255,255,0.04)' }}>
                            CV Ketel
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating card */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -right-4 top-1/4 p-4 rounded-2xl text-left"
                style={{
                  background: 'rgba(20,184,166,0.1)',
                  border: '1px solid rgba(20,184,166,0.2)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-teal-400" />
                  <span className="text-sm font-semibold text-white">iDEAL betaald</span>
                </div>
                <div className="text-xs text-text-muted">€ 847,50 ontvangen</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-text-muted">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Alles wat je nodig hebt
              </h2>
              <p className="text-text-muted max-w-xl mx-auto">
                Geen overbodige features. Precies wat een vakman nodig heeft.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4, boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 30px ${feature.color}20` }}
                  className="p-6 rounded-2xl card-hover cursor-default"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${feature.color}15`, border: `1px solid ${feature.color}30` }}>
                    <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-4">Zo werkt het</h2>
            </motion.div>

            <div className="space-y-6">
              {[
                { n: '01', title: 'Opdracht aanmaken', desc: 'Voer klantgegevens, adres en omschrijving in. 60 seconden.' },
                { n: '02', title: 'Monteur gaat op pad', desc: 'Status naar "onderweg". Navigatieknop opent Google Maps direct.' },
                { n: '03', title: 'Werkbon invullen & ondertekenen', desc: 'Monteur vult in op telefoon. Klant tekent ter plekke digitaal.' },
                { n: '04', title: 'Factuur versturen', desc: '1 klik — factuur met iDEAL betaallink gaat naar de klant. Geld op rekening.' },
              ].map((step, i) => (
                <motion.div
                  key={step.n}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  viewport={{ once: true }}
                  className="flex gap-6 p-6 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="text-4xl font-black text-primary/30 w-16 flex-shrink-0">{step.n}</div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">{step.title}</h3>
                    <p className="text-text-muted">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Vakmannen zijn al overgestapt
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div className="flex gap-1 mb-4">
                    {Array(t.rating).fill(0).map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-text-muted text-sm leading-relaxed mb-4">"{t.quote}"</p>
                  <div>
                    <div className="text-white font-medium text-sm">{t.name}</div>
                    <div className="text-text-faint text-xs">{t.beroep}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Platforms */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Web & App — overal beschikbaar
              </h2>
              <p className="text-text-muted mb-8">
                De baas werkt op laptop, de monteur op telefoon. Alles gesynchroniseerd.
              </p>
              <div className="flex justify-center gap-4">
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Globe className="w-5 h-5 text-primary" />
                  <span className="text-white font-medium">Web App</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Smartphone className="w-5 h-5 text-teal-400" />
                  <span className="text-white font-medium">iOS & Android</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center p-16 rounded-3xl relative overflow-hidden"
            style={{
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)',
            }}
          >
            {/* Glow */}
            <div className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)',
              }}
            />
            <h2 className="text-4xl font-bold text-white mb-4 relative z-10">
              Klaar met WhatsApp & Excel?
            </h2>
            <p className="text-text-muted mb-8 relative z-10">
              Start vandaag gratis. Geen creditcard, geen verplichtingen.
            </p>
            <Link href="/onboarding" className="relative z-10">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(99,102,241,0.6)' }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-primary text-white rounded-2xl font-bold text-xl"
              >
                Gratis starten →
              </motion.button>
            </Link>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" />
              <span className="font-bold text-white">VakmanApp</span>
              <span className="text-text-faint">door AIOW BV</span>
            </div>
            <div className="flex gap-6 text-sm text-text-muted">
              <Link href="/prijzen" className="hover:text-white transition-colors">Prijzen</Link>
              <Link href="/onboarding" className="hover:text-white transition-colors">Start gratis</Link>
            </div>
            <div className="text-xs text-text-faint">
              © 2026 AIOW BV — vakmanapp.nl
            </div>
          </div>
        </footer>

      </div>
    </main>
  )
}
