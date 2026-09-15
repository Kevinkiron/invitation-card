/* ══════════════════════════════════════════════════════════════════════
   ONE LINK PER INVITATION

   The old model issued a row in `guests` per person, each with its own
   token, and the couple sent every guest a different URL. That is a lot of
   work for the couple and it does not match how anyone actually shares an
   invitation — one link goes into the family WhatsApp group and travels
   from there.

   So the link is now the invitation's own `slug`, the same address for
   everybody, and we find out who is coming from the RSVP rather than from
   who we sent it to. `guest_responses` is that reply: it carries the name
   and number the old `guests` row used to hold, supplied by the guest.

   `guests` and `rsvps` are left in place. Nothing is dropped here — any
   link already sent keeps working, and the couple's existing list is
   still theirs.

   Idempotent: safe to run more than once.
   ══════════════════════════════════════════════════════════════════════ */

create table if not exists public.guest_responses (
  id             uuid primary key default gen_random_uuid(),
  invitation_id  uuid not null references public.invitations(id) on delete cascade,
  name           text not null,
  phone          text,
  email          text,
  /* Matches the three buttons on the first step of the stepper. */
  status         text not null default 'yes' check (status in ('yes', 'maybe', 'no')),
  party_size     integer not null default 1 check (party_size between 1 and 50),
  blessing       text,
  /* The couple can hide a message from the wishes wall without deleting
     the reply — the head count still counts it. */
  show_blessing  boolean not null default true,
  created_at     timestamptz not null default now()
);

create index if not exists guest_responses_invitation_idx
  on public.guest_responses (invitation_id, created_at desc);

alter table public.guest_responses enable row level security;

/* ── Who may do what ───────────────────────────────────────────────────

   A guest is not signed in, so the insert policy is the only thing
   standing between the form and the table. It allows a reply ONLY to an
   invitation that is actually published — an unpublished draft cannot be
   written to even by someone who guesses its id. */
drop policy if exists "response_public_insert" on public.guest_responses;
create policy "response_public_insert"
  on public.guest_responses for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id
        and i.status = 'published'
    )
  );

/* Only the couple read the replies: names, numbers and head counts are
   theirs, not the other guests'. The wishes wall gets its own view below
   so that a blessing can be shown without the phone number beside it. */
drop policy if exists "response_owner_read" on public.guest_responses;
create policy "response_owner_read"
  on public.guest_responses for select
  to authenticated
  using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id
        and i.owner_id = auth.uid()
    )
  );

/* The couple may hide a message or remove a reply outright. */
drop policy if exists "response_owner_update" on public.guest_responses;
create policy "response_owner_update"
  on public.guest_responses for update
  to authenticated
  using (
    exists (select 1 from public.invitations i where i.id = invitation_id and i.owner_id = auth.uid())
  )
  with check (
    exists (select 1 from public.invitations i where i.id = invitation_id and i.owner_id = auth.uid())
  );

drop policy if exists "response_owner_delete" on public.guest_responses;
create policy "response_owner_delete"
  on public.guest_responses for delete
  to authenticated
  using (
    exists (select 1 from public.invitations i where i.id = invitation_id and i.owner_id = auth.uid())
  );

/* ── The wishes wall ───────────────────────────────────────────────────

   Guests see each other's blessings, so this view exposes the name and
   the message and NOTHING else. It deliberately runs with the definer's
   rights rather than the caller's: the base table stays closed to guests,
   and the only way out of it is these four columns. */
drop view if exists public.invitation_wishes;
create view public.invitation_wishes
  with (security_invoker = false) as
  select
    r.invitation_id,
    r.name,
    r.blessing,
    r.created_at
  from public.guest_responses r
  join public.invitations i on i.id = r.invitation_id
  where r.show_blessing = true
    and r.blessing is not null
    and length(btrim(r.blessing)) > 0
    and i.status = 'published';

grant select on public.invitation_wishes to anon, authenticated;

/* ── Reading the invitation itself ─────────────────────────────────────

   The link is public now, so anyone holding it must be able to read the
   published invitation and its functions without signing in. */
drop policy if exists "invitation_public_read" on public.invitations;
create policy "invitation_public_read"
  on public.invitations for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "invitation_event_public_read" on public.invitation_events;
create policy "invitation_event_public_read"
  on public.invitation_events for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id
        and i.status = 'published'
    )
  );
