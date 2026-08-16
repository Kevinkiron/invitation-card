-- ============================================================
-- Coderpace Invites — complete database schema
-- Run in Supabase SQL Editor on a fresh project.
-- ============================================================

-- ---------- TABLES ----------

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists event_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  icon text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  preview_image_url text,
  base_config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  template_id uuid references templates(id),
  title text not null default 'Untitled Invitation',
  slug text unique not null default substr(md5(random()::text), 1, 10),
  design_config jsonb not null default '{}'::jsonb,
  status text not null default 'draft'
    check (status in ('draft','pending_payment','published','archived')),
  plan text check (plan in ('BASIC','STANDARD','PREMIUM')),
  language text default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists invitation_chat_messages (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references invitations(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists invitation_events (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references invitations(id) on delete cascade,
  event_type_id uuid references event_types(id),
  name text not null,
  event_date date,
  event_time time,
  venue text,
  address text,
  map_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references invitations(id) on delete cascade,
  name text not null,
  phone text,
  token text unique not null
    default substr(md5(random()::text || clock_timestamp()::text), 1, 12),
  max_party_size int default 1,
  viewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references guests(id) on delete cascade,
  invitation_event_id uuid not null references invitation_events(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  party_size int default 1,
  dietary_notes text,
  message text,
  responded_at timestamptz,
  unique (guest_id, invitation_event_id)
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references invitations(id) on delete cascade,
  amount numeric not null,
  currency text not null default 'INR',
  plan text,
  status text not null default 'pending'
    check (status in ('pending','completed','failed','refunded')),
  provider text,
  provider_ref text,
  created_at timestamptz not null default now()
);

-- ---------- INDEXES ----------
create index if not exists idx_invitations_owner on invitations(owner_id);
create index if not exists idx_inv_events_inv on invitation_events(invitation_id);
create index if not exists idx_guests_inv on guests(invitation_id);
create index if not exists idx_guests_token on guests(token);
create index if not exists idx_rsvps_guest on rsvps(guest_id);

-- ---------- FUNCTIONS & TRIGGERS ----------

create or replace function is_admin() returns boolean as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$ language sql stable security definer;

create or replace function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

create or replace function touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists invitations_touch on invitations;
create trigger invitations_touch before update on invitations
  for each row execute function touch_updated_at();

-- ---------- ROW LEVEL SECURITY ----------

alter table profiles                enable row level security;
alter table event_types             enable row level security;
alter table templates               enable row level security;
alter table invitations             enable row level security;
alter table invitation_chat_messages enable row level security;
alter table invitation_events       enable row level security;
alter table guests                  enable row level security;
alter table rsvps                   enable row level security;
alter table payments                enable row level security;

-- profiles
create policy "profiles_select" on profiles for select using (id = auth.uid() or is_admin());
create policy "profiles_update" on profiles for update using (id = auth.uid());
create policy "profiles_insert" on profiles for insert with check (id = auth.uid());

-- event_types / templates: public read, admin write
create policy "event_types_read"   on event_types for select using (is_active or is_admin());
create policy "event_types_write"  on event_types for insert with check (is_admin());
create policy "event_types_update" on event_types for update using (is_admin());
create policy "event_types_delete" on event_types for delete using (is_admin());

create policy "templates_read"   on templates for select using (is_active or is_admin());
create policy "templates_write"  on templates for insert with check (is_admin());
create policy "templates_update" on templates for update using (is_admin());
create policy "templates_delete" on templates for delete using (is_admin());

-- invitations: owner or admin
create policy "inv_select" on invitations for select using (owner_id = auth.uid() or is_admin());
create policy "inv_insert" on invitations for insert with check (owner_id = auth.uid());
create policy "inv_update" on invitations for update using (owner_id = auth.uid() or is_admin());
create policy "inv_delete" on invitations for delete using (owner_id = auth.uid() or is_admin());

-- chat messages
create policy "chat_select" on invitation_chat_messages for select using (
  exists (select 1 from invitations i where i.id = invitation_id and (i.owner_id = auth.uid() or is_admin()))
);
create policy "chat_insert" on invitation_chat_messages for insert with check (
  exists (select 1 from invitations i where i.id = invitation_id and (i.owner_id = auth.uid() or is_admin()))
);

-- invitation_events: public read (guests need it), owner write
create policy "inv_events_read"   on invitation_events for select using (true);
create policy "inv_events_insert" on invitation_events for insert with check (
  exists (select 1 from invitations i where i.id = invitation_id and (i.owner_id = auth.uid() or is_admin()))
);
create policy "inv_events_update" on invitation_events for update using (
  exists (select 1 from invitations i where i.id = invitation_id and (i.owner_id = auth.uid() or is_admin()))
);
create policy "inv_events_delete" on invitation_events for delete using (
  exists (select 1 from invitations i where i.id = invitation_id and (i.owner_id = auth.uid() or is_admin()))
);

-- guests: public read (guest opens by unguessable token), owner write
create policy "guests_read"   on guests for select using (true);
create policy "guests_insert" on guests for insert with check (
  exists (select 1 from invitations i where i.id = invitation_id and (i.owner_id = auth.uid() or is_admin()))
);
create policy "guests_update" on guests for update using (true);
create policy "guests_delete" on guests for delete using (
  exists (select 1 from invitations i where i.id = invitation_id and (i.owner_id = auth.uid() or is_admin()))
);

-- rsvps: guests are unauthenticated, so open — gated by unguessable token in app flow
create policy "rsvps_read"   on rsvps for select using (true);
create policy "rsvps_insert" on rsvps for insert with check (true);
create policy "rsvps_update" on rsvps for update using (true);

-- payments: owner or admin
create policy "payments_read" on payments for select using (
  exists (select 1 from invitations i where i.id = invitation_id and (i.owner_id = auth.uid() or is_admin()))
);
create policy "payments_insert" on payments for insert with check (
  exists (select 1 from invitations i where i.id = invitation_id and (i.owner_id = auth.uid() or is_admin()))
);

-- ---------- SEED DATA ----------

insert into event_types (name, description) values
  ('Roka', 'The formal commitment ceremony between families'),
  ('Engagement / Sagai', 'Ring ceremony with both families'),
  ('Ganesh Puja', 'Invoking blessings before the celebrations begin'),
  ('Haldi', 'Turmeric ceremony at home, morning of joy'),
  ('Mehendi', 'Henna ceremony with music and colour'),
  ('Sangeet', 'An evening of song, dance and family performances'),
  ('Baraat', 'The groom''s procession to the venue'),
  ('Wedding / Vivaah', 'The main wedding ceremony and pheras'),
  ('Reception', 'Grand reception dinner'),
  ('Griha Pravesh', 'Welcoming the couple into their new home')
on conflict (name) do nothing;

insert into templates (name, category, base_config) values
  ('Marigold Mandap',  'wedding', '{"palette":["#5B1226","#E8912D","#FDF6EA"],"font":"serif","motif":"marigold"}'),
  ('Peacock Royale',   'wedding', '{"palette":["#0E5C63","#C8A24A","#F6FAF8"],"font":"serif","motif":"peacock"}'),
  ('Rajwada Heritage', 'wedding', '{"palette":["#3B0A2A","#C8A24A","#FBF3E9"],"font":"serif","motif":"paisley"}'),
  ('Minimal Ivory',    'wedding', '{"palette":["#2B2622","#B98F4E","#FFFDF9"],"font":"sans","motif":"line"}'),
  ('Banarasi Rose',    'wedding', '{"palette":["#7A1140","#E8B04B","#FDF2F4"],"font":"serif","motif":"paisley"}'),
  ('Indigo Bandhani',  'wedding', '{"palette":["#1F2A6B","#D8A13A","#F7F5FF"],"font":"serif","motif":"marigold"}');

-- ---------- MAKE YOURSELF ADMIN ----------
-- After signing up in the app, run:
-- update profiles set is_admin = true
-- where id = (select id from auth.users where email = 'you@example.com');
