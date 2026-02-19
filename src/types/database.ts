export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: Company
        Insert: Omit<Company, 'id' | 'created_at'>
        Update: Partial<Omit<Company, 'id' | 'created_at'>>
      }
      clients: {
        Row: Client
        Insert: Omit<Client, 'id' | 'created_at'>
        Update: Partial<Omit<Client, 'id' | 'created_at'>>
      }
      employees: {
        Row: Employee
        Insert: Omit<Employee, 'id' | 'created_at'>
        Update: Partial<Omit<Employee, 'id' | 'created_at'>>
      }
      jobs: {
        Row: Job
        Insert: Omit<Job, 'id' | 'created_at'>
        Update: Partial<Omit<Job, 'id' | 'created_at'>>
      }
      werkbonnen: {
        Row: Werkbon
        Insert: Omit<Werkbon, 'id' | 'created_at'>
        Update: Partial<Omit<Werkbon, 'id' | 'created_at'>>
      }
      invoices: {
        Row: Invoice
        Insert: Omit<Invoice, 'id' | 'created_at'>
        Update: Partial<Omit<Invoice, 'id' | 'created_at'>>
      }
      subscriptions: {
        Row: Subscription
        Insert: Omit<Subscription, 'id' | 'created_at'>
        Update: Partial<Omit<Subscription, 'id' | 'created_at'>>
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

export interface Company {
  id: string
  user_id: string | null
  naam: string
  kvk: string | null
  btw_nummer: string | null
  iban: string | null
  email: string | null
  telefoon: string | null
  adres: string | null
  logo_url: string | null
  created_at: string
}

export interface Client {
  id: string
  company_id: string | null
  naam: string
  email: string | null
  telefoon: string | null
  adres: string | null
  notities: string | null
  created_at: string
}

export interface Employee {
  id: string
  company_id: string | null
  naam: string
  email: string | null
  telefoon: string | null
  rol: string
  created_at: string
}

export interface Job {
  id: string
  company_id: string | null
  client_id: string | null
  employee_id: string | null
  titel: string
  omschrijving: string | null
  adres: string | null
  datum: string | null
  tijd_start: string | null
  status: 'nieuw' | 'onderweg' | 'klaar' | 'gefactureerd'
  prioriteit: 'laag' | 'normaal' | 'hoog' | 'urgent'
  created_at: string
  // Joins
  client?: Client
  employee?: Employee
}

export interface Werkbon {
  id: string
  job_id: string | null
  werkzaamheden: string | null
  materiaal_gebruikt: string | null
  uren: number | null
  handtekening_url: string | null
  pdf_url: string | null
  ondertekend_op: string | null
  created_at: string
}

export interface Invoice {
  id: string
  company_id: string | null
  job_id: string | null
  factuur_nummer: string | null
  status: 'concept' | 'verstuurd' | 'betaald' | 'vervallen'
  bedrag_excl: number | null
  btw_percentage: number
  btw_bedrag: number | null
  bedrag_incl: number | null
  stripe_payment_link: string | null
  payment_token: string | null
  pdf_url: string | null
  betaald_op: string | null
  created_at: string
}

export interface Subscription {
  id: string
  company_id: string | null
  plan: 'gratis' | 'starter' | 'pro' | 'business'
  stripe_subscription_id: string | null
  max_employees: number
  geldig_tot: string | null
  created_at: string
}
