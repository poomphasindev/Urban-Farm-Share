-- Enum for roles

create type public.app_role as enum ('landowner', 'gardener');

-- User roles table

create table public.user_roles (

    id uuid primary key default gen_random_uuid(),

    user_id uuid references auth.users(id) on delete cascade not null,

    role app_role not null,

    unique (user_id, role)

);

alter table public.user_roles enable row level security;

create policy "Users can read own role" on public.user_roles for select using (auth.uid() = user_id);

create policy "Users can insert own role" on public.user_roles for insert with check (auth.uid() = user_id);

-- Profiles table

create table public.profiles (

    id uuid primary key references auth.users(id) on delete cascade,

    name text,

    location text,

    created_at timestamp with time zone default now()

);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone" on public.profiles for select using (true);

create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup

create or replace function public.handle_new_user()

returns trigger language plpgsql security definer set search_path = public as $$

begin

  insert into public.profiles (id, name) values (new.id, new.raw_user_meta_data ->> 'name');

  return new;

end;

$$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Urban farm spaces table

create table public.urban_farm_spaces (

    id uuid primary key default gen_random_uuid(),

    owner_id uuid references auth.users(id) on delete cascade not null,

    title text not null,

    description text,

    address text not null,

    area_size text,

    tags text,

    is_active boolean default true,

    created_at timestamp with time zone default now()

);

alter table public.urban_farm_spaces enable row level security;

create policy "Spaces viewable by everyone" on public.urban_farm_spaces for select using (true);

create policy "Owners can manage own spaces" on public.urban_farm_spaces for all using (auth.uid() = owner_id);

-- Space requests table

create table public.space_requests (

    id uuid primary key default gen_random_uuid(),

    space_id uuid references public.urban_farm_spaces(id) on delete cascade not null,

    gardener_id uuid references auth.users(id) on delete cascade not null,

    status text default 'pending' check (status in ('pending', 'approved', 'rejected')),

    message text,

    qr_code_token uuid default gen_random_uuid(),

    created_at timestamp with time zone default now(),

    updated_at timestamp with time zone default now()

);

alter table public.space_requests enable row level security;

create policy "Gardeners view own requests" on public.space_requests for select using (auth.uid() = gardener_id);

create policy "Gardeners create requests" on public.space_requests for insert with check (auth.uid() = gardener_id);

create policy "Owners view requests for their spaces" on public.space_requests for select using (

    exists (select 1 from public.urban_farm_spaces where id = space_id and owner_id = auth.uid())

);

create policy "Owners update requests" on public.space_requests for update using (

    exists (select 1 from public.urban_farm_spaces where id = space_id and owner_id = auth.uid())

);

-- Chat messages table

create table public.chat_messages (

    id uuid primary key default gen_random_uuid(),

    request_id uuid references public.space_requests(id) on delete cascade not null,

    sender_id uuid references auth.users(id) on delete cascade not null,

    message text not null,

    created_at timestamp with time zone default now()

);

alter table public.chat_messages enable row level security;

create policy "Users can view messages for their requests" on public.chat_messages for select using (

    exists (

        select 1 from public.space_requests sr

        left join public.urban_farm_spaces ufs on sr.space_id = ufs.id

        where sr.id = request_id and (sr.gardener_id = auth.uid() or ufs.owner_id = auth.uid())

    )

);

create policy "Users can send messages" on public.chat_messages for insert with check (

    auth.uid() = sender_id and exists (

        select 1 from public.space_requests sr

        left join public.urban_farm_spaces ufs on sr.space_id = ufs.id

        where sr.id = request_id and (sr.gardener_id = auth.uid() or ufs.owner_id = auth.uid())

    )

);

-- Enable realtime for chat

alter publication supabase_realtime add table public.chat_messages;

