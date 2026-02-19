-- Offertes tabel
create table if not exists offertes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  offerte_nummer text unique,
  status text default 'concept' check (status in ('concept', 'verstuurd', 'geaccepteerd', 'afgewezen', 'vervallen')),
  geldig_tot date,
  regels jsonb default '[]',
  subtotaal decimal(10,2) default 0,
  btw_bedrag decimal(10,2) default 0,
  totaal decimal(10,2) default 0,
  btw_percentage decimal(5,2) default 21,
  notities text,
  created_at timestamptz default now()
);

alter table jobs add column if not exists offerte_id uuid references offertes(id) on delete set null;

-- RLS
alter table offertes enable row level security;
create policy if not exists "Users own offertes" on offertes for all
  using (company_id in (select id from companies where user_id = auth.uid()));
