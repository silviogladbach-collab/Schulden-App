alter table if exists public.persons
  alter column user_id drop default;

alter table if exists public.debts
  alter column person_id drop default,
  alter column user_id drop default,
  add column if not exists direction text not null default 'i_owe',
  add column if not exists booked_at date not null default current_date,
  add column if not exists note text;

update public.debts
set booked_at = coalesce(booked_at, created_at::date, current_date);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'debts_direction_check'
  ) then
    alter table public.debts
      add constraint debts_direction_check
      check (direction in ('i_owe', 'person_owes_me'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'debts_person_id_fkey'
  ) then
    alter table public.debts
      add constraint debts_person_id_fkey
      foreign key (person_id) references public.persons(id) on delete cascade;
  end if;
end $$;

alter table if exists public.payments
  alter column debt_id drop default,
  alter column user_id drop default,
  add column if not exists person_id uuid references public.persons(id) on delete cascade,
  add column if not exists direction text not null default 'i_owe',
  add column if not exists payment_type text not null default 'tilgung',
  add column if not exists booked_at date not null default current_date,
  add column if not exists recurring_start date,
  add column if not exists recurring_end date,
  add column if not exists is_recurring boolean not null default false,
  add column if not exists active boolean not null default true,
  add column if not exists note text;

update public.payments
set booked_at = coalesce(booked_at, date, current_date);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'payments_direction_check'
  ) then
    alter table public.payments
      add constraint payments_direction_check
      check (direction in ('i_owe', 'person_owes_me'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'payments_payment_type_check'
  ) then
    alter table public.payments
      add constraint payments_payment_type_check
      check (payment_type in ('tilgung', 'rate'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'payments_debt_id_fkey'
  ) then
    alter table public.payments
      add constraint payments_debt_id_fkey
      foreign key (debt_id) references public.debts(id) on delete cascade;
  end if;
end $$;

update public.payments p
set person_id = d.person_id
from public.debts d
where p.debt_id = d.id
  and p.person_id is null;

create index if not exists debts_user_person_idx
  on public.debts (user_id, person_id);

create index if not exists payments_user_person_idx
  on public.payments (user_id, person_id);

create index if not exists payments_debt_idx
  on public.payments (debt_id);

create table if not exists public.deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text not null,
  status text not null default 'open',
  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  note text
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'deletion_requests_status_check'
  ) then
    alter table public.deletion_requests
      add constraint deletion_requests_status_check
      check (status in ('open', 'processing', 'done', 'rejected'));
  end if;
end $$;

create index if not exists deletion_requests_user_idx
  on public.deletion_requests (user_id, status);

alter table if exists public.persons enable row level security;
alter table if exists public.debts enable row level security;
alter table if exists public.payments enable row level security;
alter table if exists public.deletion_requests enable row level security;

drop policy if exists "persons_select_own" on public.persons;
create policy "persons_select_own"
  on public.persons
  for select
  using (auth.uid() = user_id);

drop policy if exists "persons_insert_own" on public.persons;
create policy "persons_insert_own"
  on public.persons
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "persons_update_own" on public.persons;
create policy "persons_update_own"
  on public.persons
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "persons_delete_own" on public.persons;
create policy "persons_delete_own"
  on public.persons
  for delete
  using (auth.uid() = user_id);

drop policy if exists "debts_select_own" on public.debts;
create policy "debts_select_own"
  on public.debts
  for select
  using (auth.uid() = user_id);

drop policy if exists "debts_insert_own" on public.debts;
create policy "debts_insert_own"
  on public.debts
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "debts_update_own" on public.debts;
create policy "debts_update_own"
  on public.debts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "debts_delete_own" on public.debts;
create policy "debts_delete_own"
  on public.debts
  for delete
  using (auth.uid() = user_id);

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own"
  on public.payments
  for select
  using (auth.uid() = user_id);

drop policy if exists "payments_insert_own" on public.payments;
create policy "payments_insert_own"
  on public.payments
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "payments_update_own" on public.payments;
create policy "payments_update_own"
  on public.payments
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "payments_delete_own" on public.payments;
create policy "payments_delete_own"
  on public.payments
  for delete
  using (auth.uid() = user_id);

drop policy if exists "deletion_requests_select_own" on public.deletion_requests;
create policy "deletion_requests_select_own"
  on public.deletion_requests
  for select
  using (auth.uid() = user_id);

drop policy if exists "deletion_requests_insert_own" on public.deletion_requests;
create policy "deletion_requests_insert_own"
  on public.deletion_requests
  for insert
  with check (auth.uid() = user_id);
