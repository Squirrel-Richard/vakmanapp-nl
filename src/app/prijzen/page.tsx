import type { Metadata } from 'next'
import PrijzenClient from './PrijzenClient'

export const metadata: Metadata = {
  title: 'Prijzen — VakmanApp',
  description: 'Duidelijke en eerlijke prijzen voor Nederlandse vakmannen. Start gratis, upgrade wanneer je klaar bent.',
}

export default function PrijzenPage() {
  return <PrijzenClient />
}
