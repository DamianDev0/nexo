import type { Contact, ContactActivity, ContactDeal, ContactListItem } from '@repo/shared-types'
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
    jobTitle: r.job_title ?? null,
    linkedinUrl: r.linkedin_url ?? null,
    birthday: r.birthday ?? null,
    address: r.address ?? null,
    city: r.city,
    department: r.department,
    municipioCode: r.municipio_code,
    country: r.country ?? 'CO',
    status: r.status as Contact['status'],
    statusChangedAt: r.status_changed_at ?? null,
    avatarUrl: r.avatar_url ?? null,
    lifecycleStage: (r.lifecycle_stage ?? 'subscriber') as Contact['lifecycleStage'],
    source: r.source as Contact['source'],
    type: r.type ?? null,
    typeLabel: r.type_label ?? null,
    leadScore: r.lead_score,
    dataConsent: r.data_consent ?? false,
    consentDate: r.consent_date ?? null,
    consentSource: r.consent_source ?? null,
    optOutEmail: r.opt_out_email ?? false,
    optOutSms: r.opt_out_sms ?? false,
    optOutWhatsapp: r.opt_out_whatsapp ?? false,
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
    noteCount: r.note_count ?? 0,
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
