import { Module } from '@nestjs/common'
import { TelephonyController } from './controllers/telephony.controller'
import { TwilioVoiceWebhooksController } from './controllers/twilio-voice-webhooks.controller'
import { CallsRepository } from './repositories/calls.repository'
import { CallsService } from './services/calls.service'
import { TelephonyService } from './services/telephony.service'

@Module({
  controllers: [TelephonyController, TwilioVoiceWebhooksController],
  providers: [TelephonyService, CallsService, CallsRepository],
})
export class TelephonyModule {}
