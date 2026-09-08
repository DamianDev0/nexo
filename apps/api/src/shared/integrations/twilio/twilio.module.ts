import { Global, Module } from '@nestjs/common'
import { TwilioMessagingService } from './twilio-messaging.service'
import { TwilioSettingsService } from './twilio-settings.service'
import { TwilioSignatureGuard } from './twilio-signature.guard'
import { TwilioVoiceService } from './twilio-voice.service'

const PROVIDERS = [
  TwilioSettingsService,
  TwilioVoiceService,
  TwilioMessagingService,
  TwilioSignatureGuard,
]

@Global()
@Module({
  providers: PROVIDERS,
  exports: PROVIDERS,
})
export class TwilioModule {}
