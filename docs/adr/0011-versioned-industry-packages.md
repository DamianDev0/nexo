# ADR-0011: Versioned industry packages instead of one-shot presets

- **Status:** Proposed
- **Date:** 2026-09-16
- **Deciders:** NexoCRM Architecture
- **Plan:** [`docs/plans/2.4-paquetes-de-industria-v2.md`](../plans/2.4-paquetes-de-industria-v2.md)
- **Depends on:** ADR-0010

## Context

Industry adaptation today is `applyPreset` in `settings.service.ts`, fed by nine sector
presets in `industry-presets.ts`. A preset renames entities and seeds lifecycle stages,
a pipeline, custom fields and tags, and only runs when the tenant has no previous
configuration. After that there is no way to:

- improve a sector's configuration and deliver the improvement to existing tenants;
- show the owner what will be created before it happens;
- undo an installation;
- combine a main industry with an extra process such as collections or after-sales.

The phase 2 promise is that an owner adapts Nexo to their business in under ten minutes
without a consultant ([`docs/plans/README.md`](../plans/README.md)). The benchmark shows
where others fall short: GoHighLevel snapshots version and push updates but cannot roll
back and resolve conflicts only by overriding or skipping; HubSpot data model templates
review changes before applying but are not versioned; Attio users report being lost
without a template ([benchmark](../research/crm-adaptability-benchmark-2026-09.md) §3.3).

ADR-0010 makes objects, fields, associations and views metadata, which is what a package
needs to declare.

## Decision

We will replace presets with versioned industry packages: typed manifests in the
repository that are planned as a diff, confirmed by the owner, applied in one transaction
with a snapshot for rollback, and that only ever carry configuration.

| #   | Decision                                                                                                                                                                                                                                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Packages are **typed TypeScript manifests in the repository** (`packages/industry-packs/<key>/<version>.ts`), validated in CI and published to `public.industry_packages` on deploy. There is no package editor in production yet.          |
| D2  | **Configuration, never data.** A manifest cannot declare records. Installing, updating or rolling back never creates, moves or deletes customer records.                                                                                    |
| D3  | Installing is **plan → confirm → apply in one transaction → install record with a before-snapshot**. A plan expires after 30 minutes.                                                                                                       |
| D4  | Every element a package creates carries `source_package = '<key>@<version>'`. Any admin edit marks it `customized`.                                                                                                                         |
| D5  | Updates **add** what is new, **update** only elements that are not customized, **never delete** (removed elements are proposed as obsolete for the admin to archive) and list conflicts explicitly.                                         |
| D6  | A tenant has **one primary package and any number of add-ons**.                                                                                                                                                                             |
| D7  | The nine current presets become equivalent `@1.0.0` manifests and **`applyPreset` is removed**, leaving a single installation path.                                                                                                         |
| D8  | The `industry-packs` module writes metadata through the writers in `shared/object-engine/metadata` and pipelines through `shared/object-engine/pipelines`. It does not import other modules and adds no exception to the cross-module rule. |

A manifest covers the lexicon (nomenclature, icon pack), structure (objects, fields,
associations, pipelines, taxonomies, tags, views), behavior (activity types, message
templates, automations declared but disabled until phase 5), the home dashboard per role
and onboarding questions. **Appearance is excluded**: theme, brand and typography belong
to the customer.

## Consequences

**Positive:**

- Sector knowledge becomes reviewable code with tests, history and releases.
- Existing tenants receive improvements as a diff they approve, not as a silent change.
- An installation can be undone, which none of the benchmarked products offer.
- Customer changes survive updates because customized elements are never overwritten.
- Industry-specific behavior has one home, the manifest, which keeps engine code free of
  `if (industry)` branches.

**Negative / trade-offs:**

- Rollback cannot delete an object that already holds records. It archives instead and
  says so, trading a perfect undo for never losing data.
- Merge logic (customized, obsolete, conflicts) is the most complex part of the feature
  and needs thorough tests per element type.
- Publishing a package requires a deploy. Acceptable while packages are authored by the
  team; a production editor is future work.
- Removing `applyPreset` touches onboarding and existing e2e suites
  (`industry-packs.spec.ts`, `configurable-workspace.spec.ts`), which must migrate in
  the same epic.

**Neutral / notes:**

- Each install writes a `package_installs` row with status, plan, snapshot and error, so
  no installation fails silently.
- Events `package.installed`, `package.updated`, `package.rolled_back` and
  `package.failed` are emitted for webhooks and the timeline.
- The contract `PackageDraft` is left ready for a later "describe your business" AI
  flow, which is out of scope.

## Alternatives considered

- **Keep `applyPreset` and add more presets.** Rejected: one-shot seeding cannot deliver
  improvements, preview changes or roll back.
- **Author packages in the database with an editor.** Rejected for now: loses code review,
  tests and version history while the team is the only author.
- **Snapshots that include records.** Rejected: mixing configuration with customer data
  makes installs dangerous and rollbacks destructive.
- **Override on update (GoHighLevel).** Rejected: silently destroys the customer's own
  changes.
- **Delete elements removed from a new version.** Rejected: may remove fields that hold
  data or that the customer relies on; archiving stays an explicit admin decision.
- **Several primary packages per tenant.** Rejected: conflicting lexicons and pipelines
  fragment the product; add-ons cover real combinations.
- **Let the module import `settings` and the object modules directly.** Rejected: would
  add exceptions to the EventBus-only rule of ADR-0004.
