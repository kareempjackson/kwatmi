import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GoogleMapsService } from './google-maps.service';
import { AutocompleteResult, ReverseGeocodeResult } from './interfaces/location.interface';

const CACHE_TTL_SECONDS = 86400; // 24 hours
const AUTOCOMPLETE_CACHE_PREFIX = 'autocomplete:';
const REVERSE_GEOCODE_CACHE_PREFIX = 'reverse:';

@Injectable()
export class LocationService {
  constructor(
    private readonly googleMapsService: GoogleMapsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async autocomplete(query: string): Promise<AutocompleteResult[]> {
    const cacheKey = `${AUTOCOMPLETE_CACHE_PREFIX}${query.toLowerCase()}`;
    
    const cached = await this.cacheManager.get<AutocompleteResult[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const results = await this.googleMapsService.placeAutocomplete(query);
      await this.cacheManager.set(cacheKey, results, CACHE_TTL_SECONDS * 1000);
      return results;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch autocomplete suggestions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
    const roundedLat = Math.round(lat * 10000) / 10000;
    const roundedLng = Math.round(lng * 10000) / 10000;
    const cacheKey = `${REVERSE_GEOCODE_CACHE_PREFIX}${roundedLat},${roundedLng}`;
    
    const cached = await this.cacheManager.get<ReverseGeocodeResult>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const result = await this.googleMapsService.reverseGeocode(lat, lng);
      await this.cacheManager.set(cacheKey, result, CACHE_TTL_SECONDS * 1000);
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to reverse geocode coordinates',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
