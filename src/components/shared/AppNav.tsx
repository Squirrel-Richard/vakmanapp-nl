'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Calendar,
  LogOut,
  Plus,
  Wrench,
  FileText,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/offerte', icon: FileText, label: 'Offertes' },
  { href: '/klanten', icon: Users, label: 'Klanten' },
  { href: '/planning', icon: Calendar, label: 'Planning' },
]

export default function AppNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="fixed left-0 top-0 h-full w-64 z-50 flex flex-col"
      style={{
        background: 'rgba(6,6,15,0.8)',
        backdropFilter: 'blur(30px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <motion.div
            animate={{ boxShadow: ['0 0 15px rgba(99,102,241,0.3)', '0 0 30px rgba(99,102,241,0.5)', '0 0 15px rgba(99,102,241,0.3)'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30"
          >
            <Wrench className="w-5 h-5 text-primary" />
          </motion.div>
          <div>
            <div className="font-bold text-white text-sm">VakmanApp</div>
            <div className="text-xs text-text-muted">Nederland</div>
          </div>
        </Link>
      </div>

      {/* New job button */}
      <div className="px-4 pt-6 pb-4">
        <Link href="/opdracht/nieuw">
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/20 border border-primary/30 text-primary-light text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            Nieuwe Opdracht
          </motion.button>
        </Link>
      </div>

      {/* Nav items */}
      <div className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-primary/15 text-primary-light border border-primary/20'
                    : 'text-text-muted hover:text-text hover:bg-white/5'
                )}
              >
                <item.icon className={cn('w-4 h-4', active ? 'text-primary' : '')} />
                {item.label}
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </div>

      {/* Bottom */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Uitloggen
        </button>
      </div>
    </nav>
  )
}
