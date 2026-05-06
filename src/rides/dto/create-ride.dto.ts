import { IsNumber, IsEnum, IsNotEmpty, Min, Max } from 'class-validator';
import { VehicleType } from '@prisma/client';

export class CreateRideDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(-90)
  @Max(90)
  pickupLat: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(-180)
  @Max(180)
  pickupLng: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(-90)
  @Max(90)
  dropoffLat: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(-180)
  @Max(180)
  dropoffLng: number;

  @IsEnum(VehicleType)
  @IsNotEmpty()
  vehicleType: VehicleType;
}
