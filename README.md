# Welcvm Invites

Digital wedding invitations for Indian celebrations — Roka to Griha Pravesh.
Design by chatting with Gemini, send every guest a personalised link, track RSVPs live.

Built with **Next.js 14 (App Router)** + **Supabase** + **Google Gemini**.

---

## What's inside

| Area | What it does |
|---|---|
| Landing | Animated phone mockup cycling through live invitation designs, features, pricing, FAQ |
| Auth | Supabase email/password, session persists across refresh |
| Create wizard | Functions → Design → Details → **AI customise** → Publish |
| AI editing | Chat with Gemini; it returns a design config, preview updates instantly |
| Guest links | Unique unguessable token per guest, one-tap WhatsApp send |
| Guest page | Personalised invitation, per-function RSVP, editable afterwards |
| RSVP board | Accepted / declined / seat counts, CSV export for the caterer |
| Admin panel | Revenue overview, customer list, manage event types & templates |

---

## 1. Local setup

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Open http://localhost:3000

### Environment variables

| Variable | Where it's used | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser | Safe to expose |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser | Safe to expose — protected by Row Level Security |
| `GEMINI_API_KEY` | **Server only** | Get from https://aistudio.google.com/apikey. Never prefix with `NEXT_PUBLIC_` |

---

## 2. Database

The backend is already provisioned. To recreate it on a fresh Supabase project,
run `supabase/schema.sql` in the SQL Editor — it creates every table, index,
trigger, RLS policy and the seed data.

### Make yourself an admin

Sign up in the app first, then run in the SQL Editor:

```sql
update profiles set is_admin = true
where id = (select id from auth.users where email = 'you@example.com');
```

### Turn off email confirmation (for testing)

Supabase Dashboard → Authentication → Providers → Email → disable
**Confirm email**. Otherwise new users must click a link before signing in.

---

## 3. Deploy to Vercel

1. Push this folder to a GitHub repository.
2. On vercel.com: **Add New → Project → Import** that repo.
3. Framework preset is detected automatically (Next.js). Leave build settings as-is.
4. Add the three environment variables from `.env.example` under
   **Settings → Environment Variables** (apply to Production, Preview and Development).
5. Deploy.

### After deploying

In Supabase → **Authentication → URL Configuration**, set:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/**`

Guest links are absolute and derived from `window.location.origin`, so they'll
point at your real domain automatically once deployed.

---

## 4. Going fully production

These are deliberately left as integration points:

**Payments.** The checkout step writes a `payments` row with `provider: 'demo'`
and no money moves. To take real payments, add Razorpay:

```
app/api/payment/create-order/route.js   → creates a Razorpay order
app/api/payment/verify/route.js         → verifies the signature, then flips
                                          invitation.status to 'published'
```
Move the invitation insert behind that verification so an invitation can only
go live after a confirmed payment.

**WhatsApp.** Currently uses `wa.me` click-to-send links, which is free and needs
no approval. For automated bulk sending, apply for the WhatsApp Business Cloud API,
get message templates approved, and add a server route that loops the guest list.

**RSVP security.** `rsvps` and `guests` are readable/writable by anon because guests
aren't logged in — access is gated by a 12-character unguessable token. For stricter
control, move RSVP writes into a Supabase Edge Function that validates the token
server-side and revoke the public policies.

**Images.** Add Supabase Storage for couple photos and a gallery bucket.

---

## Project structure

```
app/
  layout.js            root layout, fonts, metadata, auth provider
  page.js              landing page
  globals.css          full design system
  login/  signup/      auth routes
  dashboard/           customer's invitation list
  create/              5-step creation wizard
  manage/[id]/         guests, links, RSVP board
  i/[token]/           public guest invitation page
  admin/               admin panel
  api/ai/              Gemini endpoint (server-side, key never exposed)
components/
  AuthProvider.js      session context
  Nav.js  Footer.js
  InvitePreview.js     the invitation renderer + SVG motifs
  AuthForm.js
  ui.js                Reveal, Counter, Petals, Banner, StatusTag…
lib/
  supabase.js          client
  theme.js             design tokens, plans, currency
supabase/
  schema.sql           full reproducible schema
```
