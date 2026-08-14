import type { ConfigService } from '@nestjs/config'
import type { PinoLogger } from 'nestjs-pino'
import { AddressAutocompleteService } from '../services/address-autocomplete.service'

function buildService(apiKey?: string) {
  const logger = { warn: jest.fn() } as unknown as PinoLogger
  const config = { get: jest.fn().mockReturnValue(apiKey) } as unknown as ConfigService
  return new AddressAutocompleteService(logger, config)
}

describe('AddressAutocompleteService', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it('returns an empty list without calling Google when no API key is configured', async () => {
    const fetchSpy = jest.fn()
    global.fetch = fetchSpy as unknown as typeof fetch

    const result = await buildService(undefined).suggest('carrera 45')

    expect(result).toEqual([])
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('maps Google predictions to address suggestions', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          suggestions: [
            {
              placePrediction: {
                placeId: 'place-1',
                text: { text: 'Carrera 45 #26-85, Bogotá, Colombia' },
                structuredFormat: {
                  mainText: { text: 'Carrera 45 #26-85' },
                  secondaryText: { text: 'Bogotá, Colombia' },
                },
              },
            },
            { placePrediction: { placeId: 'place-2', text: { text: 'Carrera 45, Medellín' } } },
            {},
          ],
        }),
    }) as unknown as typeof fetch

    const result = await buildService('key').suggest('carrera 45', 'session-token')

    expect(result).toEqual([
      {
        description: 'Carrera 45 #26-85, Bogotá, Colombia',
        mainText: 'Carrera 45 #26-85',
        secondaryText: 'Bogotá, Colombia',
        placeId: 'place-1',
      },
      {
        description: 'Carrera 45, Medellín',
        mainText: 'Carrera 45, Medellín',
        secondaryText: '',
        placeId: 'place-2',
      },
    ])
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://places.googleapis.com/v1/places:autocomplete')
    expect(JSON.parse(init.body as string)).toEqual({
      input: 'carrera 45',
      languageCode: 'es',
      includedRegionCodes: ['co'],
      sessionToken: 'session-token',
    })
    expect((init.headers as Record<string, string>)['X-Goog-Api-Key']).toBe('key')
  })

  it('returns an empty list when Google responds with an error status', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 429 }) as unknown as typeof fetch

    const result = await buildService('key').suggest('carrera 45')

    expect(result).toEqual([])
  })

  it('returns an empty list when the request fails or times out', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network down')) as unknown as typeof fetch

    const result = await buildService('key').suggest('carrera 45')

    expect(result).toEqual([])
  })
})
