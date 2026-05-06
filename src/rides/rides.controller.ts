import {
  Controller,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RidesService } from './rides.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PassengerGuard } from '../auth/guards/passenger.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('rides')
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  @Get(':id/driver-location')
  @UseGuards(JwtAuthGuard, PassengerGuard)
  @HttpCode(HttpStatus.OK)
  async getDriverLocation(
    @Param('id') rideId: string,
    @CurrentUser('sub') passengerId: string,
  ) {
    return this.ridesService.getDriverLocationForRide(rideId, passengerId);
  }
}
