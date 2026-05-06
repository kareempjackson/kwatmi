import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RidesService } from './rides.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { UpdateRideStatusDto } from './dto/update-ride-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('rides')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rides')
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ride request' })
  @ApiResponse({ status: 201, description: 'Ride created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createRide(@Request() req: any, @Body() createRideDto: CreateRideDto) {
    return this.ridesService.createRide(req.user.sub, createRideDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get rider ride history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Rides retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRiderHistory(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.ridesService.getRiderHistory(req.user.sub, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ride details by ID' })
  @ApiResponse({ status: 200, description: 'Ride details retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Ride not found' })
  async getRideById(@Request() req: any, @Param('id') id: string) {
    return this.ridesService.getRideById(id, req.user.sub);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update ride status (driver only)' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Only assigned driver can update' })
  @ApiResponse({ status: 404, description: 'Ride not found' })
  async updateRideStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateRideStatusDto,
  ) {
    return this.ridesService.updateRideStatus(id, req.user.sub, updateStatusDto);
  }
}
