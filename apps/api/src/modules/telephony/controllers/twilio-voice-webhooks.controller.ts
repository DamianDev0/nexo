import { Body, Controller, ParseUUIDPipe, Post, Query, Res, UseGuards } from '@nestjs/common'
import { ApiExcludeController } from '@nestjs/swagger'
import type { Response } from 'express'
import { Public } from '@/shared/decorators/public.decorator'
import { TwilioSignatureGuard } from '@/shared/integrations/twilio/twilio-signature.guard'
import type { TwilioWebhookBody } from '@/shared/integrations/twilio/twilio-webhook.util'
import { VOICE_WEBHOOK_PATH } from '../constants/call.constants'
import {
  parseDialAction,
  parseStatusCallback,
  parseVoiceRequest,
} from '../mappers/twilio-webhook.mapper'
import { TelephonyService } from '../services/telephony.service'

const TWIML = 'text/xml'

@ApiExcludeController()
@UseGuards(TwilioSignatureGuard)
@Controller(VOICE_WEBHOOK_PATH)
export class TwilioVoiceWebhooksController {
  constructor(private readonly telephony: TelephonyService) {}

  @Post('voice')
  @Public()
  async voice(@Body() body: TwilioWebhookBody, @Res() res: Response): Promise<void> {
    const twiml = await this.telephony.handleOutboundVoice(parseVoiceRequest(body))
    res.type(TWIML).send(twiml)
  }

  @Post('voice-fallback')
  @Public()
  voiceFallback(@Res() res: Response): void {
    res.type(TWIML).send(this.telephony.fallbackTwiml())
  }

  @Post('status')
  @Public()
  async status(
    @Body() body: TwilioWebhookBody,
    @Query('tenant', new ParseUUIDPipe({ optional: true })) tenantId: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    await this.telephony.handleStatusCallback(parseStatusCallback(body), tenantId)
    res.status(204).send()
  }

  @Post('dial-action')
  @Public()
  async dialAction(
    @Body() body: TwilioWebhookBody,
    @Query('tenant', ParseUUIDPipe) tenantId: string,
    @Res() res: Response,
  ): Promise<void> {
    const twiml = await this.telephony.handleDialAction(parseDialAction(body), tenantId)
    res.type(TWIML).send(twiml)
  }
}
