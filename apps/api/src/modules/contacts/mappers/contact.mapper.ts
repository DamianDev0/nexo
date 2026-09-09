import type {
  ActivityPriority,
  ActivityStatus,
  Contact,
  ContactActivity,
  ContactDeal,
  ContactListItem,
} from '@repo/shared-types'
import type { ActivityRow, ContactRow, DealRow } from '../interfaces/contact-row.interfaces'

export function mapContact(r: ContactRow): Contact {
  return {
    id: r.id,
    firstName: r.first_name,
    lastName: r.last_name,
    email: r.email,
    phone: r.phone,
    whatsapp: r.whatsapp,
    documentType: r.document_type as Contact['documentType'],
    documentNumber: r.document_number,
    avatarUrl: r.avatar_url ?? null,
    city: r.city,
    municipioCode: r.municipio_code,
    status: r.status,
    statusChangedAt: r.status_changed_at ?? null,
    lifecycleStage: r.lifecycle_stage ?? 'subscriber',
    source: r.source,
    lastContactedAt: r.last_contacted_at ?? null,
    tags: r.tags,
    companyId: r.company_id,
    assignedToId: r.assigned_to_id,
    customFields: r.custom_fields ?? {},
    isActive: r.is_active,
    createdById: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

export function mapContactListItem(r: ContactRow): ContactListItem {
  return {
    ...mapContact(r),
    assignedToName: r.assigned_to_name ?? null,
    noteCount: r.note_count ?? 0,
    optedOutChannels: r.opted_out_channels ?? [],
    nextActivity: r.next_activity ?? null,
  }
}

export function mapContactActivity(a: ActivityRow): ContactActivity {
  return {
    id: a.id,
    activityType: a.activity_type,
    title: a.title,
    description: a.description,
    dueDate: a.due_date,
    completedAt: a.completed_at,
    status: a.status as ActivityStatus,
    priority: a.priority as ActivityPriority,
    assignedToId: a.assigned_to_id,
    createdById: a.created_by,
    createdAt: a.created_at,
  }
}

export function mapContactDeal(d: DealRow): ContactDeal {
  return {
    id: d.id,
    title: d.title,
    valueCents: d.value_cents,
    status: d.status,
    stageId: d.stage_id,
    pipelineId: d.pipeline_id,
    expectedCloseDate: d.expected_close_date,
    createdAt: d.created_at,
  }
}
