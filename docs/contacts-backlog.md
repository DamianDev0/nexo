# Contacts — Competitive Backlog

> Prioritized gap list for the Contacts module, measured against HubSpot, Pipedrive,
> Zoho, Attio/Folk and the LATAM WhatsApp-first crowd (Kommo, Leadsales).
> Written 2026-09-12 against the code in `apps/api/src/modules/contacts` and
> `apps/web/src/{entities/contact,features/*,views/contact*}`.
> Status updated 2026-09-14.

## Status

- **Shipped:** #2 company on the record and #3 deals on the record (commit
  `52fdd23`) — company block in the aside, deals as a fourth rail panel.
- **Split out as its own epic, not part of this backlog:** #6 message templates
  in the composers. A first cut lives on the branch
  `feature/E0X-message-templates` (commit `69d8b01`) and is deliberately out of
  `develop` until the epic is planned — templates need their own settings UI,
  variable catalog, approval state for WhatsApp and send history, which is far
  more than a picker in the composer.
- **Next:** #1 merge duplicates.

## What Contacts already does (do not re-plan)

CRUD + full-text list · saved views (own/shared, reorder, duplicate) · configurable
columns · quick filters + advanced conditions in the URL · CSV import (analyze →
preview → validate → execute, with duplicate strategy) · duplicate probe ·
per-channel consents with evidence · tags + taxonomy with reassignment ·
timeline (activities + deals) · bulk actions with history, undo, pause/resume ·
record page with routed side panels · composers for call, WhatsApp, email, note,
task and meeting · Twilio softphone.

Effort key: **S** ≤ 2 days · **M** ≈ 1 week · **L** > 1 week.
Where it says "backend ready", the endpoint exists and the work is frontend only.

---

## Tier 1 — table stakes the competition has and we don't

### 1. Merge duplicates — **M** (back + front)

Today `GET /contacts/duplicates/probe` only warns. There is no way to fuse two
records, so a dirty import has no exit.

- Backend: `POST /contacts/:id/merge` with `{ loserId, fieldWinners }`, inside a
  transaction: move activities, deals, tags, consents, notes and custom fields;
  soft-delete the loser with a `mergedIntoId` pointer; emit a domain event.
- Frontend: side-by-side comparison, field-level winner picker, preview of what
  moves.
- Acceptance: merging never loses an activity or a deal · the loser stays
  auditable · cross-tenant merge attempt returns 404 · undo documented (restore
  the loser) or explicitly out of scope.

### 2. Company on the record — **S** (backend ready) — SHIPPED `52fdd23`

`companyId` exists and `GET /companies/:id/summary` already returns stats,
contacts and active deals; `POST /companies/:id/contacts/:contactId` assigns.
None of it is on screen.

- Frontend: company card in the record aside (name, NIT, owner), "other contacts
  at this company", assign/detach, create company from the contact.
- Acceptance: assign and detach update both records without a reload · a contact
  without a company shows a create/link affordance, never an empty slot.

### 3. Deals on the record — **S/M** (backend ready) — SHIPPED `52fdd23`

The timeline already carries deals but the record never says "this person has
$X open in stage Y".

- Frontend: open/won/lost deals block with value in COP and stage, "create deal
  from this contact" CTA prefilled with contact and company.
- Acceptance: money always through `formatCOP` (cents, never decimals) · closed
  deals collapse behind a toggle.

### 4. Multi-value email and phone — **M** (back + front)

One `email`, one `phone`, one `whatsapp` per contact. Every serious CRM stores a
labeled list, and a Colombian SMB contact routinely has two or three numbers.

- Backend: `contact_channels` table (type, label, value, isPrimary, verifiedAt),
  migration that moves the current columns into it, keep read-compatible fields
  on the list payload.
- Acceptance: the primary value is what quick actions dial/write to · the import
  maps extra columns into extra channels · NIT/phone validation still runs per
  value.

### 5. Attachments — **L** (new module)

No file storage anywhere. Quotes, cédula scans and RUT PDFs have nowhere to live,
and every competitor ships this.

- Decision first: S3-compatible bucket (R2/MinIO) + signed URLs, per-tenant prefix.
- Acceptance: files are tenant-scoped at the storage path, never only at the
  query · virus/type/size policy written down · attachments show in the timeline.

### 6. Message templates in the composers — **S** (backend ready) — OWN EPIC

`message-templates` is built (list by channel, Handlebars preview, send,
duplicate) and has **zero imports in the web app**. Scoped out of this backlog:
the picker is the small end of an epic that also owes a template manager in
settings, a documented variable catalog, WhatsApp template approval state and
send history. Parked on `feature/E0X-message-templates`.

- Frontend: template picker in the WhatsApp/email composer, variable preview
  against the current contact, "save this message as a template".
- Acceptance: rendering uses the API preview endpoint, not a client-side copy of
  Handlebars · blocked channels still block · template picker is keyboard-first.

---

## Tier 2 — Colombia differentiators (nobody else builds these)

### 7. NIT enrichment via RUES/Confecámaras — **M**

Type a NIT, get legal name, chamber, registration status. No foreign CRM does it.

- Acceptance: check digit validated before the call · response cached per tenant
  · the user confirms before overwriting typed data · timeouts degrade to manual
  entry.

### 8. Habeas Data evidence pack + public consent capture — **M**

Consents with evidence already exist. Missing: an auditable export and a public
capture link.

- Export: PDF/CSV per contact with channel, purpose, timestamp, IP, source.
- Capture: public URL (and QR) with purpose text that writes consent with
  evidence and creates or updates the contact.
- Acceptance: Ley 1581 fields complete (purpose, responsible party, rights) ·
  evidence is immutable (revocation writes a new row) · no PII in logs.

### 9. Restricted-list screening (SARLAFT: OFAC/UN/PEP) — **M**

Regulated Colombian SMBs do this in Excel today.

- Acceptance: screening runs on create and on demand, result stored with the
  matched list and date · a hit flags the record, it never silently blocks ·
  false-positive dismissal is auditable (who, when, why).

### 10. WhatsApp as a first-class channel — **L**

Today: click-to-chat. `messaging` can queue outbound messages, which is the seed.

- Conversation thread pinned to the contact, inbound messages attach to it,
  24h session window visible, approved templates outside it.
- Acceptance: inbound creates or matches the contact by phone · the thread
  survives an owner change · the window state is computed server-side.

### 11. Web-to-lead form + QR — **M**

SMBs capture from Instagram, WhatsApp and fairs, then retype by hand.

- Acceptance: public form writes `source` and consent in the same request ·
  duplicate probe runs before creating · rate limited per tenant, not per IP.

---

## Tier 3 — intelligence on top of what we already compute

### 12. "No next step" as a first-class state — **S**

`nextActivity` is already computed per contact. This is Pipedrive's core loop and
we are one view away from it.

- Cold/rotting indicator in the list, default saved view "sin próxima actividad",
  soft nudge to schedule the next step when an activity is completed.
- Acceptance: the indicator's thresholds are per-status configuration, not magic
  numbers in the UI.

### 13. Visible lead score — **S/M**

We already derive missing fields and staleness.

- Rule-based score (completeness + recency + interactions), sortable column,
  filterable band.
- Acceptance: the rules live in tenant settings and the record explains the
  score, never shows a bare number.

### 14. AI summary + next best action — **L** (Phase 4)

pgvector is already in the stack. Summarize the timeline, propose the next action
with the evidence it used.

- Acceptance: the summary cites the activities it read · it never invents a fact
  not in the timeline · cost per summary is measured.

### 15. Notes with @mentions — **S/M**

`notifications` exists. Today team talk about a contact happens in WhatsApp.

- Acceptance: a mention notifies only teammates who can see the contact ·
  mentions survive editing the note.

---

## What ships next

1. **Merge duplicates** — without it the importer is a trap we built ourselves,
   and it is the last Tier 1 item that needs backend work before the record page
   can be called finished.
2. **Multi-value email and phone** — the field shape blocks both the importer and
   the quick actions, so it should land before anything builds on top of it.
3. **"No next step" as a first-class state** — cheapest item on the list and the
   one that changes daily behaviour the most.

Message templates come back as their own epic, not as a picker bolted onto the
composer.
