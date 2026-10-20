-- Sazón de Barrio: ejecutar completo en Supabase > SQL Editor.

create type user_role as enum ('admin', 'caja', 'mesera');
create type table_status as enum ('libre', 'consumo', 'cuenta', 'pagada');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role user_role not null default 'mesera',
  created_at timestamptz not null default now()
);

create table restaurant_tables (
  id int primary key,
  name text not null,
  status table_status not null default 'libre',
  waiter_id uuid references profiles(id),
  updated_at timestamptz not null default now()
);

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price_cop integer not null check (price_cop >= 0),
  active boolean not null default true
);

create table tickets (
  id uuid primary key default gen_random_uuid(),
  table_id int not null references restaurant_tables(id),
  waiter_id uuid references profiles(id),
  status text not null default 'abierta' check (status in ('abierta', 'pagada', 'anulada')),
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);

create table ticket_items (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references tickets(id) on delete cascade,
  menu_item_id uuid references menu_items(id),
  name_snapshot text not null,
  price_cop integer not null,
  quantity integer not null check (quantity > 0),
  notes text
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references tickets(id),
  method text not null check (method in ('efectivo', 'tarjeta', 'nequi', 'daviplata', 'transferencia')),
  subtotal_cop integer not null,
  tip_cop integer not null default 0,
  total_cop integer not null,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- Rol del usuario que hace la petición (se usa en las políticas).
create or replace function public.app_role()
returns user_role
language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

-- Crea el perfil automáticamente al crear un usuario (rol mesera por defecto).
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table profiles enable row level security;
alter table restaurant_tables enable row level security;
alter table menu_items enable row level security;
alter table tickets enable row level security;
alter table ticket_items enable row level security;
alter table payments enable row level security;

create policy "personal ve perfiles" on profiles for select to authenticated using (true);
create policy "solo admin cambia perfiles" on profiles for update to authenticated
  using (app_role() = 'admin') with check (app_role() = 'admin');

create policy "personal ve mesas" on restaurant_tables for select to authenticated using (true);
create policy "personal mueve mesas" on restaurant_tables for update to authenticated
  using (true) with check (true);

create policy "personal ve menú" on menu_items for select to authenticated using (true);
create policy "solo admin edita menú" on menu_items for all to authenticated
  using (app_role() = 'admin') with check (app_role() = 'admin');

create policy "personal maneja cuentas" on tickets for all to authenticated using (true) with check (true);
create policy "personal maneja líneas" on ticket_items for all to authenticated using (true) with check (true);

create policy "personal ve pagos" on payments for select to authenticated using (true);
create policy "caja registra pagos" on payments for insert to authenticated
  with check (app_role() in ('admin', 'caja'));

-- Actualizaciones en vivo para la pantalla de mesas.
alter publication supabase_realtime add table restaurant_tables;

-- Mesas iniciales.
insert into restaurant_tables (id, name)
select g, 'Mesa ' || g from generate_series(1, 10) g
on conflict (id) do nothing;
