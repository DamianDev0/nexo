import type { CallCompletedEvent } from '@/shared/events/telephony.events'
import type { MessageSentEvent } from '@/shared/events/messaging.events'
import type { CreateActivityDto } from '../dto/activity.dto'

const CALL_TITLES: Readonly<Record<CallCompletedEvent['status'], string>> = {
  completed: 'Llamada realizada',
  busy: 'Llamada ocupada',
  no_answer: 'Llamada sin respuesta',
  failed: 'Llamada fallida',
  canceled: 'Llamada cancelada',
  initiated: 'Llamada',
  ringing: 'Llamada',
  in_progress: 'Llamada',
}

const SMS_TITLE = 'SMS enviado'

export function buildCallActivity(event: CallCompletedEvent): CreateActivityDto {
  const direction = event.direction === 'inbound' ? 'Entrante' : 'Saliente'
  return {
    activityType: 'call',
    title: CALL_TITLES[event.status],
    description: `${direction} · ${event.toNumber}`,
    dueDate: event.startedAt,
    durationMinutes: Math.ceil(event.durationSeconds / 60),
    contactId: event.contactId ?? undefined,
  }
}

export function buildMessageActivity(event: MessageSentEvent): CreateActivityDto {
  return {
    activityType: event.channel,
    title: SMS_TITLE,
    description: event.body,
    dueDate: event.sentAt,
    contactId: event.contactId ?? undefined,
  }
}
