import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DriverService } from './driver.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DriverGuard } from '../auth/guards/driver.guard';
import { CurrentDriver } from '../auth/decorators/current-driver.decorator';

@Controller('driver')
@UseGuards(JwtAuthGuard, DriverGuard)
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Post('online')
  @HttpCode(HttpStatus.OK)
  async goOnline(@CurrentDriver('id') driverId: string) {
    return this.driverService.goOnline(driverId);
  }

  @Post('offline')
  @HttpCode(HttpStatus.OK)
  async goOffline(@CurrentDriver('id') driverId: string) {
    return this.driverService.goOffline(driverId);
  }

  @Post('location')
  @HttpCode(HttpStatus.OK)
  async updateLocation(
    @CurrentDriver('id') driverId: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return this.driverService.updateLocation(driverId, updateLocationDto);
  }
}
