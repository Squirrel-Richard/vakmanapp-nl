'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import WebGLBackground from '@/components/shared/WebGLBackground'
import { CheckCircle, ArrowRight } from 'lucide-react'

export default function BetaaldPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center">
      <WebGLBackground />
      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="w-24 h-24 rounded-full bg-green-400/20 border-2 border-green-400/40 flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle className="w-12 h-12 text-green-400" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold text-white mb-4"
        >
          Betaling ontvangen! 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-text-muted mb-8"
        >
          De betaling is succesvol verwerkt. De factuur is automatisch bijgewerkt.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-semibold mx-auto"
            >
              Naar dashboard
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
