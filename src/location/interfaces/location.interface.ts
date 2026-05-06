export interface AutocompleteResult {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ReverseGeocodeResult {
  placeId: string;
  formattedAddress: string;
  coordinates: Coordinates;
  addressComponents: Record<string, string>;
}
