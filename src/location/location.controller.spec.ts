import { Test, TestingModule } from '@nestjs/testing';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('LocationController', () => {
  let controller: LocationController;
  let locationService: jest.Mocked<LocationService>;

  beforeEach(async () => {
    const mockLocationService = {
      autocomplete: jest.fn(),
      reverseGeocode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationController],
      providers: [
        {
          provide: LocationService,
          useValue: mockLocationService,
        },
      ],
    }).compile();

    controller = module.get<LocationController>(LocationController);
    locationService = module.get(LocationService);
  });

  describe('autocomplete', () => {
    it('should return autocomplete results', async () => {
      const mockResults = [
        {
          placeId: 'place123',
          description: 'Victoria Island, Lagos',
          mainText: 'Victoria Island',
          secondaryText: 'Lagos, Nigeria',
        },
      ];
      locationService.autocomplete.mockResolvedValue(mockResults);

      const result = await controller.autocomplete({ query: 'Victoria' });

      expect(result).toEqual(mockResults);
      expect(locationService.autocomplete).toHaveBeenCalledWith('Victoria');
    });

    it('should throw error for short query', async () => {
      await expect(controller.autocomplete({ query: 'V' }))
        .rejects
        .toThrow(new HttpException('Query must be at least 2 characters', HttpStatus.BAD_REQUEST));
    });

    it('should trim query whitespace', async () => {
      locationService.autocomplete.mockResolvedValue([]);

      await controller.autocomplete({ query: '  Victoria  ' });

      expect(locationService.autocomplete).toHaveBeenCalledWith('Victoria');
    });
  });

  describe('reverseGeocode', () => {
    it('should return reverse geocode result', async () => {
      const mockResult = {
        placeId: 'place123',
        formattedAddress: '123 Victoria Island, Lagos',
        coordinates: { lat: 6.4281, lng: 3.4219 },
        addressComponents: { city: 'Lagos', state: 'Lagos' },
      };
      locationService.reverseGeocode.mockResolvedValue(mockResult);

      const result = await controller.reverseGeocode({ lat: '6.4281', lng: '3.4219' });

      expect(result).toEqual(mockResult);
      expect(locationService.reverseGeocode).toHaveBeenCalledWith(6.4281, 3.4219);
    });

    it('should throw error for invalid latitude', async () => {
      await expect(controller.reverseGeocode({ lat: 'invalid', lng: '3.4219' }))
        .rejects
        .toThrow(new HttpException('Invalid latitude or longitude', HttpStatus.BAD_REQUEST));
    });

    it('should throw error for out of range coordinates', async () => {
      await expect(controller.reverseGeocode({ lat: '91', lng: '3.4219' }))
        .rejects
        .toThrow(new HttpException('Coordinates out of valid range', HttpStatus.BAD_REQUEST));
    });
  });
});
