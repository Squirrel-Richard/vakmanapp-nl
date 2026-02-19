import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

export function formatShortDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

export function generateFactuurNummer(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 9000) + 1000
  return `F${year}-${random}`
}

export const STATUS_LABELS: Record<string, string> = {
  nieuw: 'Nieuw',
  onderweg: 'Onderweg',
  klaar: 'Klaar',
  gefactureerd: 'Gefactureerd',
}

export const STATUS_COLORS: Record<string, string> = {
  nieuw: 'text-blue-400 bg-blue-400/10',
  onderweg: 'text-orange-400 bg-orange-400/10',
  klaar: 'text-green-400 bg-green-400/10',
  gefactureerd: 'text-purple-400 bg-purple-400/10',
}

export const PRIORITEIT_LABELS: Record<string, string> = {
  laag: 'Laag',
  normaal: 'Normaal',
  hoog: 'Hoog',
  urgent: 'Urgent',
}

export const PLAN_LABELS: Record<string, string> = {
  gratis: 'Gratis',
  starter: 'Starter',
  pro: 'Pro',
  business: 'Business',
}
