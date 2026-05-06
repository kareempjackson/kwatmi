import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RidesService } from './rides.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CancelRideDto, RideQueryDto, RideResponseDto, PaginatedRidesResponseDto } from './dto/ride.dto';

@Controller('rides')
@UseGuards(JwtAuthGuard)
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  @Get()
  async getPassengerRides(
    @Request() req,
    @Query() query: RideQueryDto,
  ): Promise<PaginatedRidesResponseDto> {
    return this.ridesService.getPassengerRideHistory(req.user.sub, query);
  }

  @Get(':id')
  async getRide(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<RideResponseDto> {
    return this.ridesService.getRideById(id, req.user.sub);
  }

  @Post(':id/arrived')
  async driverArrived(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<RideResponseDto> {
    // In production, would verify user is a driver via role check
    return this.ridesService.driverArrived(id, req.user.sub);
  }

  @Post(':id/start')
  async startRide(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<RideResponseDto> {
    return this.ridesService.startRide(id, req.user.sub);
  }

  @Post(':id/complete')
  async completeRide(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<RideResponseDto> {
    return this.ridesService.completeRide(id, req.user.sub);
  }

  @Post(':id/cancel')
  async cancelRide(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelRideDto,
    @Request() req,
  ): Promise<RideResponseDto> {
    // Determine if user is passenger or driver based on the ride
    // For now, we try passenger first, then driver
    const userRole = req.user.role || 'passenger';
    return this.ridesService.cancelRide(id, req.user.sub, userRole, dto);
  }
}
