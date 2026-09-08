import { Injectable, NotFoundException } from '@nestjs/common'
import type { Call } from '@repo/shared-types'
import { CALL_LIST_DEFAULT } from '../constants/call.constants'
import type { CallQueryDto } from '../dto/call-query.dto'
import { mapCall } from '../mappers/call.mapper'
import { CallsRepository } from '../repositories/calls.repository'

@Injectable()
export class CallsService {
  constructor(private readonly repository: CallsRepository) {}

  async findRecent(schemaName: string, query: CallQueryDto): Promise<Call[]> {
    const rows = await this.repository.findRecent(schemaName, {
      contactId: query.contactId,
      userId: query.userId,
      limit: query.limit ?? CALL_LIST_DEFAULT,
    })
    return rows.map(mapCall)
  }

  async findOne(schemaName: string, callId: string): Promise<Call> {
    const row = await this.repository.findById(schemaName, callId)
    if (!row) throw new NotFoundException(`Call ${callId} not found`)
    return mapCall(row)
  }
}
