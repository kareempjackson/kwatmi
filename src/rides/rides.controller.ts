import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RidesService } from './rides.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('rides')
@UseGuards(JwtAuthGuard)
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  /**
   * Create a new ride request (passenger only)
   */
  @Post()
  async createRide(@Request() req, @Body() createRideDto: CreateRideDto) {
    return this.ridesService.createRide(req.user.id, createRideDto);
  }

  /**
   * Accept a ride request (driver only)
   */
  @Post(':id/accept')
  async acceptRide(
    @Request() req,
    @Param('id', ParseUUIDPipe) rideId: string,
  ) {
    return this.ridesService.acceptRide(req.user.id, rideId);
  }
}
