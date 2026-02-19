'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { Job } from '@/types/database'
import { cn, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'
import { ChevronLeft, ChevronRight, MapPin, User, Clock, Loader2 } from 'lucide-react'
import Link from 'next/link'

const DAYS = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag']

function getWeekDates(weekOffset: number = 0): Date[] {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset + (weekOffset * 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export default function PlanningPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [weekOffset, setWeekOffset] = useState(0)
  const supabase = createClient()

  const weekDates = getWeekDates(weekOffset)
  const startDate = weekDates[0].toISOString().split('T')[0]
  const endDate = weekDates[6].toISOString().split('T')[0]

  useEffect(() => {
    fetchJobs()
  }, [weekOffset])

  async function fetchJobs() {
    setLoading(true)
    const { data } = await supabase
      .from('jobs')
      .select('*, client:clients(naam), employee:employees(naam)')
      .gte('datum', startDate)
      .lte('datum', endDate)
      .order('tijd_start')
    if (data) setJobs(data as Job[])
    setLoading(false)
  }

  const getJobsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return jobs.filter(j => j.datum === dateStr)
  }

  const formatDay = (date: Date) => {
    return new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short' }).format(date)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-white">
            Planning
          </motion.h1>
          <p className="text-text-muted mt-1">Weekoverzicht</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setWeekOffset(0)}
            className="px-4 py-2 text-sm border border-white/10 rounded-xl text-text-muted hover:text-white hover:border-white/20 transition-all"
          >
            Vandaag
          </motion.button>
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setWeekOffset(p => p - 1)}
              className="p-2 rounded-xl border border-white/10 text-text-muted hover:text-white hover:border-white/20 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setWeekOffset(p => p + 1)}
              className="p-2 rounded-xl border border-white/10 text-text-muted hover:text-white hover:border-white/20 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
          <span className="text-sm text-text-muted">
            {formatDay(weekDates[0])} — {formatDay(weekDates[6])}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-3">
          {DAYS.map((day, i) => {
            const date = weekDates[i]
            const dayJobs = getJobsForDate(date)
            const today = isToday(date)

            return (
              <div key={day} className="min-h-96">
                {/* Day header */}
                <div className={cn(
                  'text-center p-3 rounded-xl mb-3',
                  today
                    ? 'bg-primary/20 border border-primary/30'
                    : 'bg-white/3 border border-white/6'
                )}>
                  <div className={cn('text-xs font-medium', today ? 'text-primary-light' : 'text-text-muted')}>
                    {day.slice(0, 2)}
                  </div>
                  <div className={cn('text-lg font-bold mt-0.5', today ? 'text-white' : 'text-text-muted')}>
                    {date.getDate()}
                  </div>
                </div>

                {/* Jobs */}
                <div className="space-y-2">
                  {dayJobs.map((job, ji) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: ji * 0.05 }}
                    >
                      <Link href={`/opdracht/${job.id}`}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="p-3 rounded-xl cursor-pointer"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                          <div className="text-white text-xs font-medium leading-tight mb-2">
                            {job.titel}
                          </div>
                          {job.tijd_start && (
                            <div className="flex items-center gap-1 text-xs text-text-faint mb-1">
                              <Clock className="w-2.5 h-2.5" />
                              {job.tijd_start.slice(0, 5)}
                            </div>
                          )}
                          {job.client && (
                            <div className="flex items-center gap-1 text-xs text-text-faint mb-1">
                              <User className="w-2.5 h-2.5" />
                              <span className="truncate">{(job.client as { naam: string }).naam}</span>
                            </div>
                          )}
                          <div className={cn('text-xs px-1.5 py-0.5 rounded-md inline-block mt-1', STATUS_COLORS[job.status])}>
                            {STATUS_LABELS[job.status]}
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  ))}
                  {dayJobs.length === 0 && (
                    <div className="text-center py-8 text-text-faint text-xs">
                      Vrij
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
