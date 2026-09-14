# ADR-0007: Contact merge runs in one transaction inside the contacts module

- **Status:** Accepted
- **Date:** 2026-09-14
- **Deciders:** NexoCRM Architecture

## Context

Merging two contacts has to move everything that hangs off the loser — activities,
deals, invoices, calls, messages, WhatsApp conversations, consents — onto the winner
and then archive the loser. Those rows live in tables owned by other modules.

ADR-0004 says feature modules never talk directly: they communicate through domain
events. Applied literally here, `contacts` would emit `contact.merged` and each module
would reassign its own rows when it gets around to it.

That trade is wrong for this operation. A merge that is eventually consistent has a
window where the loser is archived but still owns activities and deals — the data is
neither one contact nor two. If one listener fails, nothing rolls back and the workspace
is left with an orphaned history and no way to tell which half moved. This is precisely
the mess the merge exists to clean up.

## Decision

The merge runs as **one database transaction inside the contacts module**. Its
repository issues the `UPDATE`s against the other modules' tables (`activities`,
`deals`, `invoices`, `calls`, `messages`, `whatsapp_conversations`, `data_consents`)
within a single `TenantDbService.transactional` call, and archives the loser with a
`merged_into_id` pointer in the same transaction.

This is a **declared exception to ADR-0004**, narrow and named:

- It applies to the merge path only — `ContactsRepository.mergeInto`. No other cross-table
  write is allowed to grow out of it.
- The writes are pure foreign-key reassignments (`SET contact_id = winner`). No business
  logic of another module is reimplemented here: no status transitions, no recalculation,
  no invoice or deal rules.
- `contacts` still emits `contact.merged` after the transaction commits, so listeners that
  care (notifications, search indexing, automation later) react as usual. The event
  reports the merge; it does not perform it.
- Every table the merge touches is listed in one constant next to the repository, so the
  blast radius is greppable and a new `contact_id` table is a deliberate edit.

## Consequences

**Positive:**

- The merge is atomic: it either fully happened or it never did, and a failure leaves both
  contacts exactly as they were.
- No orphan window where archived contacts still own live history.
- The audit entry and the domain event describe a fact that is already true in the database.

**Negative / trade-offs:**

- `contacts` knows the names of six tables it does not own. If one of those modules renames
  a column, the merge breaks — covered by the merge integration test.
- It weakens ADR-0004 by precedent. Mitigated by keeping the exception written down here and
  by the cop that already flags SQL outside `repositories/`.

## Alternatives considered

- **EventBus fan-out** — respects ADR-0004, but makes the merge eventually consistent and
  unrecoverable on partial failure. Rejected for the reasons above.
- **A dedicated merge module owning the cross-table writes** — same coupling, one more module,
  and the writes would still cross ownership. Rejected as ceremony with no benefit.
- **Hard-delete the loser and re-point nothing** — loses history and makes the merge
  unauditable. Never considered seriously; DIAN and Habeas Data obligations forbid it.
