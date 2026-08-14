export interface PlacePrediction {
  placeId: string
  text: { text: string }
  structuredFormat?: {
    mainText?: { text: string }
    secondaryText?: { text: string }
  }
}

export interface PlacesAutocompleteResponse {
  suggestions?: Array<{ placePrediction?: PlacePrediction }>
}
