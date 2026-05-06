import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { FareEstimateDto } from './dto/fare-estimate.dto';
import { FareResponseDto } from './dto/fare-response.dto';

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('estimate')
  async getEstimate(@Query() query: FareEstimateDto): Promise<FareResponseDto> {
    const pickupLat = parseFloat(query.pickup_lat);
    const pickupLng = parseFloat(query.pickup_lng);
    const dropoffLat = parseFloat(query.dropoff_lat);
    const dropoffLng = parseFloat(query.dropoff_lng);
    const vehicleType = query.vehicle_type;

    if (isNaN(pickupLat) || isNaN(pickupLng) || isNaN(dropoffLat) || isNaN(dropoffLng)) {
      throw new BadRequestException('Invalid coordinates provided');
    }

    if (!['okada', 'keke'].includes(vehicleType)) {
      throw new BadRequestException('Vehicle type must be okada or keke');
    }

    return this.pricingService.calculateFare(
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
      vehicleType as 'okada' | 'keke',
    );
  }
}
