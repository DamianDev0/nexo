# ADR-0009: One object engine for every CRM record type

- **Status:** Proposed
- **Date:** 2026-09-16
- **Deciders:** NexoCRM Architecture

## Context

Contacts shipped saved views, a per-user table layout, column customization and an
advanced filter compiler, all hard-wired to `contact`: `contact_views`,
`contact_workspace_states`, `ContactViewsService`, `manage-contact-views`,
`customize-contacts-table`. Companies and deals need exactly the same capabilities.
Copying them per object would triple the code and every fix, and would break the
product rule that a new vertical is data, not a fork (`docs/crm-foundations.md` §4).

## Decision

Record-type-agnostic capabilities live in an object engine keyed by `ObjectType`
(`contact | company | deal`, in `@repo/shared-types`).

- **API:** `apps/api/src/shared/object-engine/` holds the layered engine (repositories,
  mappers, services, DTOs) plus abstract `ObjectViewsController` and
  `ObjectWorkspaceController`. Each module declares an `ObjectTableDefinition` (type +
  column catalog) and exposes the engine under its own routes by extending the base
  controllers. Modules keep composing what is theirs (counts, quick filters).
- **Filters:** `shared/database/record-filter-sql.ts` compiles a `RecordFilterDefinition`
  (active/archived conditions, search source, value and flag filters, filterable
  columns). Each module owns only its definition.
- **Storage:** `object_views` and `object_workspace_states` with an `object_type`
  column (migration `0048_object_views` renames the contact tables in place, so ids,
  shared views and saved list orders survive). Uniqueness is per user and object type.
- **Web:** `entities/object-descriptor` provides `ObjectDescriptor` through
  `ObjectDescriptorProvider`. Generic features (`manage-views`, `customize-table`) read
  the descriptor instead of importing a record-specific service. Each object entity
  exports its descriptor (`CONTACT_DESCRIPTOR`). Query keys come from
  `OBJECT_QUERY_ROOTS`.
- `Contact*` view/table types stay as aliases of the `Object*` types until every
  consumer moves.

## Consequences

- A new record type gets views, layout persistence and filters by declaring a
  definition and a descriptor, not by copying slices.
- Custom-field columns (`custom:<key>`) are part of the engine's sanitizer, so their
  layout persists for every object.
- Engine changes affect every object at once. The engine has its own unit suite in
  `shared/object-engine/__tests__` and each module keeps a cross-tenant e2e spec.
- Also generic now: inline field edits, status, owner, tags, archive/restore
  (`edit-record-field`, `tag-record`, `archive-record`), bulk filter selection
  (`BULK_FILTER_COMPILERS`), the import wizard (`import-records`) and the board
  shell (`widgets/records-board`). A record board composes `RecordsTable` with its own
  slots; the descriptor carries api, routes, import config, icon and copy keys.
- Still record-specific: the list query and smart lists (`filter-contacts`), the
  create/edit form, the record page and the API import writer.
