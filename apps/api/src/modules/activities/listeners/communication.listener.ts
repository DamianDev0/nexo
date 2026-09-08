import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { MESSAGING_EVENTS, type MessageSentEvent } from '@/shared/events/messaging.events'
import { TELEPHONY_EVENTS, type CallCompletedEvent } from '@/shared/events/telephony.events'
import type { CreateActivityDto } from '../dto/activity.dto'
import { buildCallActivity, buildMessageActivity } from '../mappers/communication-activity.mapper'
import { ActivitiesService } from '../services/activities.service'

@Injectable()
export class CommunicationListener {
  constructor(private readonly activities: ActivitiesService) {}

  @OnEvent(TELEPHONY_EVENTS.CALL_COMPLETED)
  async onCallCompleted(event: CallCompletedEvent): Promise<void> {
    await this.log(event.schemaName, event.userId, buildCallActivity(event))
  }

  @OnEvent(MESSAGING_EVENTS.MESSAGE_SENT)
  async onMessageSent(event: MessageSentEvent): Promise<void> {
    await this.log(event.schemaName, event.userId, buildMessageActivity(event))
  }

  private async log(
    schemaName: string,
    userId: string | null,
    dto: CreateActivityDto,
  ): Promise<void> {
    if (userId === null) return
    await this.activities.create(schemaName, dto, userId, true)
  }
}
