import { SetMetadata } from '@nestjs/common'

export const API_RESPONSE_MESSAGE_KEY = 'api_response_message'

/**
 * Sets a custom success message for the response envelope.
 *
 * @example
 * @Post()
 * @ApiResponseMessage('Tenant created successfully')
 * create(@Body() dto: CreateTenantDto) { ... }
 */
export const ApiResponseMessage = (message: string) =>
  SetMetadata(API_RESPONSE_MESSAGE_KEY, message)
