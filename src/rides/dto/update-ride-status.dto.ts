import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum RideStatusUpdate {
  ARRIVED = 'arrived',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class UpdateRideStatusDto {
  @ApiProperty({ enum: RideStatusUpdate, description: 'New ride status' })
  @IsEnum(RideStatusUpdate)
  status: RideStatusUpdate;
}
