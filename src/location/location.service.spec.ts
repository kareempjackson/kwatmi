import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { LocationService } from './location.service';
import { GoogleMapsService } from './google-maps.service';
import { Cache } from 'cache-manager';

describe('LocationService', () => {
  let service: LocationService;
  let googleMapsService: jest.Mocked<GoogleMapsService>;
  let cacheManager: jest.Mocked<Cache>;

  beforeEach(async () => {
    const mockGoogleMapsService = {
      placeAutocomplete: jest.fn(),
      reverseGeocode: jest.fn(),
    };

    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        {
          provide: GoogleMapsService,
          useValue: mockGoogleMapsService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
    googleMapsService = module.get(GoogleMapsService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  describe('autocomplete', () => {
    it('should return cached results if available', async () => {
      const cachedResults = [{ placeId: 'cached', description: 'Cached', mainText: 'C', secondaryText: 'ached' }];
      cacheManager.get.mockResolvedValue(cachedResults);

      const result = await service.autocomplete('test');

      expect(result).toEqual(cachedResults);
      expect(googleMapsService.placeAutocomplete).not.toHaveBeenCalled();
    });

    it('should fetch from API and cache when not cached', async () => {
      const apiResults = [{ placeId: 'api', description: 'API', mainText: 'A', secondaryText: 'PI' }];
      cacheManager.get.mockResolvedValue(null);
      googleMapsService.placeAutocomplete.mockResolvedValue(apiResults);

      const result = await service.autocomplete('test');

      expect(result).toEqual(apiResults);
      expect(googleMapsService.placeAutocomplete).toHaveBeenCalledWith('test');
      expect(cacheManager.set).toHaveBeenCalledWith('autocomplete:test', apiResults, 86400000);
    });

    it('should use lowercase cache key', async () => {
      cacheManager.get.mockResolvedValue(null);
      googleMapsService.placeAutocomplete.mockResolvedValue([]);

      await service.autocomplete('TEST');

      expect(cacheManager.get).toHaveBeenCalledWith('autocomplete:test');
    });
  });

  describe('reverseGeocode', () => {
    it('should return cached results if available', async () => {
      const cachedResult = {
        placeId: 'cached',
        formattedAddress: 'Cached Address',
        coordinates: { lat: 6.4281, lng: 3.4219 },
        addressComponents: {},
      };
      cacheManager.get.mockResolvedValue(cachedResult);

      const result = await service.reverseGeocode(6.4281, 3.4219);

      expect(result).toEqual(cachedResult);
      expect(googleMapsService.reverseGeocode).not.toHaveBeenCalled();
    });

    it('should round coordinates for cache key', async () => {
      cacheManager.get.mockResolvedValue(null);
      googleMapsService.reverseGeocode.mockResolvedValue({
        placeId: 'test',
        formattedAddress: 'Test',
        coordinates: { lat: 6.4281, lng: 3.4219 },
        addressComponents: {},
      });

      await service.reverseGeocode(6.42814567, 3.42189012);

      expect(cacheManager.get).toHaveBeenCalledWith('reverse:6.4281,3.4219');
    });
  });
});
