import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { LocationService } from './location.service';
import { AutocompleteQueryDto, ReverseGeocodeQueryDto } from './dto/location.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Location')
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('autocomplete')
  @ApiOperation({ summary: 'Get place autocomplete suggestions filtered to Lagos' })
  @ApiQuery({ name: 'query', required: true, description: 'Search query for places' })
  @ApiResponse({ status: 200, description: 'List of place suggestions' })
  @ApiResponse({ status: 400, description: 'Invalid query parameter' })
  @ApiResponse({ status: 500, description: 'Google Maps API error' })
  async autocomplete(@Query() query: AutocompleteQueryDto) {
    if (!query.query || query.query.trim().length < 2) {
      throw new HttpException('Query must be at least 2 characters', HttpStatus.BAD_REQUEST);
    }
    return this.locationService.autocomplete(query.query.trim());
  }

  @Get('reverse')
  @ApiOperation({ summary: 'Reverse geocode coordinates to address' })
  @ApiQuery({ name: 'lat', required: true, description: 'Latitude' })
  @ApiQuery({ name: 'lng', required: true, description: 'Longitude' })
  @ApiResponse({ status: 200, description: 'Address information for coordinates' })
  @ApiResponse({ status: 400, description: 'Invalid coordinates' })
  @ApiResponse({ status: 404, description: 'No address found for coordinates' })
  @ApiResponse({ status: 500, description: 'Google Maps API error' })
  async reverseGeocode(@Query() query: ReverseGeocodeQueryDto) {
    const lat = parseFloat(query.lat);
    const lng = parseFloat(query.lng);

    if (isNaN(lat) || isNaN(lng)) {
      throw new HttpException('Invalid latitude or longitude', HttpStatus.BAD_REQUEST);
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new HttpException('Coordinates out of valid range', HttpStatus.BAD_REQUEST);
    }

    return this.locationService.reverseGeocode(lat, lng);
  }
}
