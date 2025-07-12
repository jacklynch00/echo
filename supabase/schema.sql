-- Enable pgcrypto for UUIDs
create extension if not exists "pgcrypto";

-- 4.1 persons: one row per cloned voice
create table persons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  relationship text not null check (relationship in ('grandparent','parent','sibling','friend','other')),
  voice_id text not null,            -- ElevenLabs voice identifier
  created_at timestamptz default now()
);

-- 4.2 conversations
create table conversations (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references persons(id) on delete cascade,
  title text not null default 'Untitled',
  created_at timestamptz default now()
);

-- 4.3 messages (LLM ↔️ user turns)
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender text not null check (sender in ('user','ai')),
  text text not null,
  audio_url text,                    -- MP3 in generated-audio bucket
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table persons enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

-- RLS Policies - users can only access their own data
create policy "Users can only access their own persons"
  on persons for all
  using (auth.uid() = user_id);

create policy "Users can only access conversations for their persons"
  on conversations for all
  using (
    exists (
      select 1 from persons
      where persons.id = conversations.person_id
      and persons.user_id = auth.uid()
    )
  );

create policy "Users can only access messages for their conversations"
  on messages for all
  using (
    exists (
      select 1 from conversations
      join persons on persons.id = conversations.person_id
      where conversations.id = messages.conversation_id
      and persons.user_id = auth.uid()
    )
  );

-- Storage buckets are created in the Supabase UI/CLI
-- uploads           # raw user audio/video
-- generated-audio   # ElevenLabs MP3 replies