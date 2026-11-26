-- SpendWise database schema
-- Tables: profiles, transactions, budgets, savings_goals, recurring_transactions,
--         expense_splits, no_spend_challenges, student_discounts
-- All user-owned tables have Row Level Security enabled with user-scoped policies.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  currency text not null default 'INR',
  theme text not null default 'light',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Transactions
-- ---------------------------------------------------------------------------
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12,2) not null check (amount > 0),
  category text not null,
  description text not null,
  date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists idx_transactions_user_date on public.transactions (user_id, date desc);
create index if not exists idx_transactions_user_category on public.transactions (user_id, category);

alter table public.transactions enable row level security;

drop policy if exists "transactions_select_own" on public.transactions
  for select using (auth.uid() = user_id);
drop policy if exists "transactions_insert_own" on public.transactions
  for insert with check (auth.uid() = user_id);
drop policy if exists "transactions_update_own" on public.transactions
  for update using (auth.uid() = user_id);
drop policy if exists "transactions_delete_own" on public.transactions
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Budgets
-- ---------------------------------------------------------------------------
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category text not null,
  monthly_limit numeric(12,2) not null check (monthly_limit > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists idx_budgets_user on public.budgets (user_id);

alter table public.budgets enable row level security;

drop policy if exists "budgets_select_own" on public.budgets
  for select using (auth.uid() = user_id);
drop policy if exists "budgets_insert_own" on public.budgets
  for insert with check (auth.uid() = user_id);
drop policy if exists "budgets_update_own" on public.budgets
  for update using (auth.uid() = user_id);
drop policy if exists "budgets_delete_own" on public.budgets
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Savings goals
-- ---------------------------------------------------------------------------
create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  target_amount numeric(12,2) not null check (target_amount > 0),
  saved_amount numeric(12,2) not null default 0,
  deadline date not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_savings_goals_user on public.savings_goals (user_id);

alter table public.savings_goals enable row level security;

drop policy if exists "savings_goals_select_own" on public.savings_goals
  for select using (auth.uid() = user_id);
drop policy if exists "savings_goals_insert_own" on public.savings_goals
  for insert with check (auth.uid() = user_id);
drop policy if exists "savings_goals_update_own" on public.savings_goals
  for update using (auth.uid() = user_id);
drop policy if exists "savings_goals_delete_own" on public.savings_goals
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Recurring transactions
-- ---------------------------------------------------------------------------
create table if not exists public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12,2) not null check (amount > 0),
  category text not null,
  description text not null,
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly')),
  next_date date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_recurring_user on public.recurring_transactions (user_id);

alter table public.recurring_transactions enable row level security;

drop policy if exists "recurring_select_own" on public.recurring_transactions
  for select using (auth.uid() = user_id);
drop policy if exists "recurring_insert_own" on public.recurring_transactions
  for insert with check (auth.uid() = user_id);
drop policy if exists "recurring_update_own" on public.recurring_transactions
  for update using (auth.uid() = user_id);
drop policy if exists "recurring_delete_own" on public.recurring_transactions
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Expense splits
-- ---------------------------------------------------------------------------
create table if not exists public.expense_splits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  group_id text,
  expense_name text not null,
  amount numeric(12,2) not null check (amount > 0),
  paid_by text not null,
  participants text[] not null default '{}',
  status text not null default 'pending' check (status in ('settled', 'pending')),
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists idx_splits_user on public.expense_splits (user_id);

alter table public.expense_splits enable row level security;

drop policy if exists "splits_select_own" on public.expense_splits
  for select using (auth.uid() = user_id);
drop policy if exists "splits_insert_own" on public.expense_splits
  for insert with check (auth.uid() = user_id);
drop policy if exists "splits_update_own" on public.expense_splits
  for update using (auth.uid() = user_id);
drop policy if exists "splits_delete_own" on public.expense_splits
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- No spend challenges
-- ---------------------------------------------------------------------------
create table if not exists public.no_spend_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  target_spend numeric(12,2) not null check (target_spend > 0),
  start_date date not null,
  end_date date not null,
  spent_amount numeric(12,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_challenges_user on public.no_spend_challenges (user_id);

alter table public.no_spend_challenges enable row level security;

drop policy if exists "challenges_select_own" on public.no_spend_challenges
  for select using (auth.uid() = user_id);
drop policy if exists "challenges_insert_own" on public.no_spend_challenges
  for insert with check (auth.uid() = user_id);
drop policy if exists "challenges_update_own" on public.no_spend_challenges
  for update using (auth.uid() = user_id);
drop policy if exists "challenges_delete_own" on public.no_spend_challenges
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Student discounts
-- ---------------------------------------------------------------------------
create table if not exists public.student_discounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  provider text not null,
  item text not null,
  discount numeric(5,2) not null,
  code text,
  url text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_discounts_user on public.student_discounts (user_id);

alter table public.student_discounts enable row level security;

drop policy if exists "discounts_select_own" on public.student_discounts
  for select using (auth.uid() = user_id);
drop policy if exists "discounts_insert_own" on public.student_discounts
  for insert with check (auth.uid() = user_id);
drop policy if exists "discounts_delete_own" on public.student_discounts
  for delete using (auth.uid() = user_id);
