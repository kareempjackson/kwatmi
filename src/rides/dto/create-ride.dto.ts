import { IsString, IsNumber, IsEnum, IsOptional, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum VehicleType {
  KEKE = 'keke',
  MOTORCYCLE = 'motorcycle',
  CAR = 'car',
  SUV = 'suv',
}

export class CoordinatesDto {
  @ApiProperty({ description: 'Latitude', example: 6.5244 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @ApiProperty({ description: 'Longitude', example: 3.3792 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;
}

export class CreateRideDto {
  @ApiProperty({ type: CoordinatesDto, description: 'Pickup coordinates' })
  @ValidateNested()
  @Type(() => CoordinatesDto)
  pickupCoords: CoordinatesDto;

  @ApiPropertyOptional({ description: 'Pickup address', example: 'Victoria Island, Lagos' })
  @IsOptional()
  @IsString()
  pickupAddress?: string;

  @ApiProperty({ type: CoordinatesDto, description: 'Dropoff coordinates' })
  @ValidateNested()
  @Type(() => CoordinatesDto)
  dropoffCoords: CoordinatesDto;

  @ApiPropertyOptional({ description: 'Dropoff address', example: 'Lekki Phase 1, Lagos' })
  @IsOptional()
  @IsString()
  dropoffAddress?: string;

  @ApiProperty({ enum: VehicleType, description: 'Type of vehicle requested' })
  @IsEnum(VehicleType)
  vehicleType: VehicleType;
}
