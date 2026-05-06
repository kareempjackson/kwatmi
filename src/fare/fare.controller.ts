import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { FareService } from './fare.service';
import { FareEstimateRequestDto } from './dto/fare-estimate-request.dto';
import { FareEstimateResponseDto } from './dto/fare-estimate-response.dto';

@Controller('fare')
export class FareController {
  constructor(private readonly fareService: FareService) {}

  @Post('estimate')
  @HttpCode(HttpStatus.OK)
  async estimateFare(
    @Body() request: FareEstimateRequestDto,
  ): Promise<FareEstimateResponseDto> {
    return this.fareService.calculateFareEstimate(
      request.pickup_zone_id,
      request.dropoff_zone_id,
    );
  }
}
