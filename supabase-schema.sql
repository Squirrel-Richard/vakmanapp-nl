-- VakmanApp NL — Supabase Schema
-- Voer dit uit in de Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Companies
create table companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  naam text not null,
  kvk text,
  btw_nummer text,
  iban text,
  email text,
  telefoon text,
  adres text,
  logo_url text,
  created_at timestamptz default now()
);

-- Clients
create table clients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  naam text not null,
  email text,
  telefoon text,
  adres text,
  notities text,
  created_at timestamptz default now()
);

-- Employees
create table employees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  naam text not null,
  email text,
  telefoon text,
  rol text default 'monteur',
  created_at timestamptz default now()
);

-- Jobs
create table jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  employee_id uuid references employees(id) on delete set null,
  titel text not null,
  omschrijving text,
  adres text,
  datum date,
  tijd_start time,
  status text default 'nieuw' check (status in ('nieuw', 'onderweg', 'klaar', 'gefactureerd')),
  prioriteit text default 'normaal' check (prioriteit in ('laag', 'normaal', 'hoog', 'urgent')),
  created_at timestamptz default now()
);

-- Werkbonnen
create table werkbonnen (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  werkzaamheden text,
  materiaal_gebruikt text,
  uren decimal(5,2),
  handtekening_url text,
  pdf_url text,
  ondertekend_op timestamptz,
  created_at timestamptz default now()
);

-- Invoices
create table invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  job_id uuid references jobs(id) on delete set null,
  factuur_nummer text unique,
  status text default 'concept' check (status in ('concept', 'verstuurd', 'betaald', 'vervallen')),
  bedrag_excl decimal(10,2),
  btw_percentage decimal(5,2) default 21,
  btw_bedrag decimal(10,2),
  bedrag_incl decimal(10,2),
  stripe_payment_link text,
  payment_token uuid default gen_random_uuid(),
  pdf_url text,
  betaald_op timestamptz,
  created_at timestamptz default now()
);

-- Subscriptions
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  plan text default 'gratis' check (plan in ('gratis', 'starter', 'pro', 'business')),
  stripe_subscription_id text,
  max_employees int default 1,
  geldig_tot timestamptz,
  created_at timestamptz default now()
);

-- Row Level Security (RLS)
alter table companies enable row level security;
alter table clients enable row level security;
alter table employees enable row level security;
alter table jobs enable row level security;
alter table werkbonnen enable row level security;
alter table invoices enable row level security;
alter table subscriptions enable row level security;

-- Companies policies
create policy "Gebruikers kunnen eigen bedrijf zien"
  on companies for all
  using (auth.uid() = user_id);

-- Clients policies
create policy "Gebruikers kunnen klanten van eigen bedrijf beheren"
  on clients for all
  using (company_id in (select id from companies where user_id = auth.uid()));

-- Employees policies
create policy "Gebruikers kunnen medewerkers van eigen bedrijf beheren"
  on employees for all
  using (company_id in (select id from companies where user_id = auth.uid()));

-- Jobs policies
create policy "Gebruikers kunnen opdrachten van eigen bedrijf beheren"
  on jobs for all
  using (company_id in (select id from companies where user_id = auth.uid()));

-- Werkbonnen policies
create policy "Gebruikers kunnen werkbonnen van eigen opdrachten beheren"
  on werkbonnen for all
  using (job_id in (
    select id from jobs where company_id in (
      select id from companies where user_id = auth.uid()
    )
  ));

-- Invoices policies
create policy "Gebruikers kunnen facturen van eigen bedrijf beheren"
  on invoices for all
  using (company_id in (select id from companies where user_id = auth.uid()));

-- Subscriptions policies
create policy "Gebruikers kunnen eigen abonnement zien"
  on subscriptions for all
  using (company_id in (select id from companies where user_id = auth.uid()));

-- Storage bucket voor werkbon handtekeningen
insert into storage.buckets (id, name, public)
values ('werkbonnen', 'werkbonnen', true)
on conflict do nothing;

create policy "Iedereen kan werkbon bestanden uploaden"
  on storage.objects for insert
  with check (bucket_id = 'werkbonnen');

create policy "Iedereen kan werkbon bestanden lezen"
  on storage.objects for select
  using (bucket_id = 'werkbonnen');

-- Indexes voor performance
create index idx_jobs_company_id on jobs(company_id);
create index idx_jobs_status on jobs(status);
create index idx_jobs_datum on jobs(datum);
create index idx_clients_company_id on clients(company_id);
create index idx_employees_company_id on employees(company_id);
create index idx_invoices_company_id on invoices(company_id);
create index idx_invoices_payment_token on invoices(payment_token);
create index idx_werkbonnen_job_id on werkbonnen(job_id);
