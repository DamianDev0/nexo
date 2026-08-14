import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import type { AddressSuggestion } from '@repo/shared-types'
import type {
  PlacePrediction,
  PlacesAutocompleteResponse,
} from '../interfaces/place-autocomplete.interfaces'

const PLACES_AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete'
const REQUEST_TIMEOUT_MS = 2500
const REGION_CODES = ['co']
const LANGUAGE_CODE = 'es'

@Injectable()
export class AddressAutocompleteService {
  constructor(
    @InjectPinoLogger(AddressAutocompleteService.name)
    private readonly logger: PinoLogger,
    private readonly config: ConfigService,
  ) {}

  async suggest(input: string, sessionToken?: string): Promise<AddressSuggestion[]> {
    const apiKey = this.config.get<string>('app.googleMapsApiKey')
    if (!apiKey) return []

    try {
      const response = await fetch(PLACES_AUTOCOMPLETE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
        },
        body: JSON.stringify({
          input,
          languageCode: LANGUAGE_CODE,
          includedRegionCodes: REGION_CODES,
          ...(sessionToken ? { sessionToken } : {}),
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      })

      if (!response.ok) {
        this.logger.warn({ status: response.status }, 'Places autocomplete request failed')
        return []
      }

      const payload = (await response.json()) as PlacesAutocompleteResponse
      return (payload.suggestions ?? [])
        .map((suggestion) => suggestion.placePrediction)
        .filter((prediction): prediction is PlacePrediction => Boolean(prediction))
        .map((prediction) => ({
          description: prediction.text.text,
          mainText: prediction.structuredFormat?.mainText?.text ?? prediction.text.text,
          secondaryText: prediction.structuredFormat?.secondaryText?.text ?? '',
          placeId: prediction.placeId,
        }))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      this.logger.warn({ error: message }, 'Places autocomplete unavailable')
      return []
    }
  }
}
