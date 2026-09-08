import { request } from '@/shared/api/request'

import type { Message, SendMessageInput } from '@repo/shared-types'

const messagingService = {
  send: (data: SendMessageInput) =>
    request<Message>({ method: 'post', url: '/messaging/messages', data }),
}

export default messagingService
