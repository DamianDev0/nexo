import { request } from '@/shared/api/request'

import type { VoiceToken } from '@repo/shared-types'

const telephonyService = {
  voiceToken: () => request<VoiceToken>({ method: 'get', url: '/telephony/voice/token' }),
}

export default telephonyService
