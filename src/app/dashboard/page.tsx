import type { Metadata } from 'next'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Dashboard — Opdrachten',
  robots: { index: false },
}

export default function DashboardPage() {
  return <DashboardClient />
}
