import { BadRequestException, type ArgumentsHost, NotFoundException } from '@nestjs/common'
import { HttpExceptionFilter } from './http-exception.filter'

function hostWith(): { host: ArgumentsHost; json: jest.Mock; status: jest.Mock } {
  const json = jest.fn()
  const status = jest.fn().mockReturnValue({ json })
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ url: '/api/v1/contacts/abc', method: 'PATCH' }),
    }),
  } as unknown as ArgumentsHost
  return { host, json, status }
}

describe('HttpExceptionFilter', () => {
  const filter = new HttpExceptionFilter()

  it('maps class-validator message arrays to field errors', () => {
    const { host, json, status } = hostWith()

    filter.catch(new BadRequestException(['email must be an email']), host)

    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Validation failed',
        errors: [{ field: 'email', message: 'email must be an email' }],
      }),
    )
  })

  it('keeps the domain message and surfaces string error lists as field errors', () => {
    const { host, json } = hostWith()

    filter.catch(
      new BadRequestException({
        message: 'Custom field validation failed',
        errors: ['Unknown field "role"', '"Cargo" must be text'],
      }),
      host,
    )

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Custom field validation failed',
        error: 'BAD_REQUEST',
        errors: [
          { field: 'role', message: 'Unknown field "role"' },
          { field: 'Cargo', message: '"Cargo" must be text' },
        ],
      }),
    )
  })

  it('serializes plain exceptions without an errors array', () => {
    const { host, json, status } = hostWith()

    filter.catch(new NotFoundException('Contact x not found'), host)

    expect(status).toHaveBeenCalledWith(404)
    const body = json.mock.calls[0]?.[0] as Record<string, unknown>
    expect(body).toMatchObject({ message: 'Contact x not found', error: 'NOT_FOUND' })
    expect(body).not.toHaveProperty('errors')
  })
})
