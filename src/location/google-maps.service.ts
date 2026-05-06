import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AutocompleteResult, ReverseGeocodeResult } from './interfaces/location.interface';

const LAGOS_LOCATION = { lat: 6.5244, lng: 3.3792 };
const LAGOS_RADIUS_METERS = 50000; // 50km radius around Lagos center
const GOOGLE_PLACES_AUTOCOMPLETE_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const GOOGLE_GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

@Injectable()
export class GoogleMapsService {
  private readonly apiKey: string;
  private readonly logger = new Logger(GoogleMapsService.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      this.logger.error('GOOGLE_MAPS_API_KEY is not configured');
      throw new Error('GOOGLE_MAPS_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
  }

  async placeAutocomplete(query: string): Promise<AutocompleteResult[]> {
    const params = new URLSearchParams({
      input: query,
      key: this.apiKey,
      location: `${LAGOS_LOCATION.lat},${LAGOS_LOCATION.lng}`,
      radius: LAGOS_RADIUS_METERS.toString(),
      strictbounds: 'true',
      components: 'country:ng',
      types: 'geocode|establishment',
    });

    const url = `${GOOGLE_PLACES_AUTOCOMPLETE_URL}?${params.toString()}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'ZERO_RESULTS') {
        return [];
      }

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        this.logger.error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
        throw new HttpException(
          `Google Maps API error: ${data.status}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return (data.predictions || []).map((prediction: any) => ({
        placeId: prediction.place_id,
        description: prediction.description,
        mainText: prediction.structured_formatting?.main_text || '',
        secondaryText: prediction.structured_formatting?.secondary_text || '',
      }));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Failed to call Google Places API', error);
      throw new HttpException(
        'Failed to communicate with Google Maps API',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
    const params = new URLSearchParams({
      latlng: `${lat},${lng}`,
      key: this.apiKey,
      result_type: 'street_address|route|neighborhood|sublocality|locality',
    });

    const url = `${GOOGLE_GEOCODE_URL}?${params.toString()}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'ZERO_RESULTS') {
        throw new HttpException(
          'No address found for the given coordinates',
          HttpStatus.NOT_FOUND,
        );
      }

      if (data.status !== 'OK') {
        this.logger.error(`Google Geocode API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
        throw new HttpException(
          `Google Maps API error: ${data.status}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const result = data.results[0];
      const addressComponents = this.parseAddressComponents(result.address_components || []);

      return {
        placeId: result.place_id,
        formattedAddress: result.formatted_address,
        coordinates: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
        },
        addressComponents,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Failed to call Google Geocode API', error);
      throw new HttpException(
        'Failed to communicate with Google Maps API',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private parseAddressComponents(components: any[]): Record<string, string> {
    const result: Record<string, string> = {};
    const typeMapping: Record<string, string> = {
      street_number: 'streetNumber',
      route: 'street',
      neighborhood: 'neighborhood',
      sublocality_level_1: 'sublocality',
      sublocality: 'sublocality',
      locality: 'city',
      administrative_area_level_1: 'state',
      administrative_area_level_2: 'lga',
      country: 'country',
      postal_code: 'postalCode',
    };

    for (const component of components) {
      for (const type of component.types) {
        if (typeMapping[type]) {
          result[typeMapping[type]] = component.long_name;
        }
      }
    }

    return result;
  }
}
