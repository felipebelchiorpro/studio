-- Create a public table for customers that mirrors auth.users
create table if not exists public.customers (
  id uuid not null references auth.users(id) on delete cascade primary key,
  email text,
  name text,
  phone text,
  user_metadata jsonb,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.customers enable row level security;

-- Policy: Allow authenticated users (like admin dashboard) to view all customers
create policy "Allow authenticated view all customers"
  on public.customers
  for select
  to authenticated
  using (true);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.customers (id, email, name, phone, user_metadata, created_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Cliente'),
    coalesce(new.phone, new.raw_user_meta_data->>'phone'),
    new.raw_user_meta_data,
    new.created_at
  );
  return new;
end;
$$;

-- Trigger to call the function on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- Backfill existing users
insert into public.customers (id, email, name, phone, user_metadata, created_at)
select 
  id, 
  email, 
  coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'Cliente'),
  coalesce(phone, raw_user_meta_data->>'phone'),
  raw_user_meta_data,
  created_at
from auth.users
on conflict (id) do nothing;
