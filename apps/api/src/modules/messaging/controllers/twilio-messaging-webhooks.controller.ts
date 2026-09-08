import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiExcludeController } from '@nestjs/swagger'
import { Public } from '@/shared/decorators/public.decorator'
import { TwilioSignatureGuard } from '@/shared/integrations/twilio/twilio-signature.guard'
import type { TwilioWebhookBody } from '@/shared/integrations/twilio/twilio-webhook.util'
import { MESSAGING_WEBHOOK_PATH } from '../constants/message.constants'
import { parseMessageStatusCallback } from '../mappers/twilio-message-webhook.mapper'
import { MessagingService } from '../services/messaging.service'

@ApiExcludeController()
@UseGuards(TwilioSignatureGuard)
@Controller(MESSAGING_WEBHOOK_PATH)
export class TwilioMessagingWebhooksController {
  constructor(private readonly messaging: MessagingService) {}

  @Post('status')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  async status(
    @Body() body: TwilioWebhookBody,
    @Query('tenant', ParseUUIDPipe) tenantId: string,
  ): Promise<void> {
    await this.messaging.handleStatusCallback(parseMessageStatusCallback(body), tenantId)
  }
}
