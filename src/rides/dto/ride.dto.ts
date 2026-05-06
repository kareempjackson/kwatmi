import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, IsNumber, Min, Max } from 'class-validator';
import { RideStatus, VehicleType } from '@prisma/client';

export class CreateRideDto {
  @IsNotEmpty()
  @IsString()
  pickupAddress: string;

  @IsNotEmpty()
  @IsNumber()
  pickupLat: number;

  @IsNotEmpty()
  @IsNumber()
  pickupLng: number;

  @IsNotEmpty()
  @IsString()
  dropoffAddress: string;

  @IsNotEmpty()
  @IsNumber()
  dropoffLat: number;

  @IsNotEmpty()
  @IsNumber()
  dropoffLng: number;

  @IsNotEmpty()
  @IsEnum(VehicleType)
  vehicleType: VehicleType;
}

export class CancelRideDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class RideQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(RideStatus)
  status?: RideStatus;
}

export class RideResponseDto {
  id: string;
  passengerId: string;
  driverId: string | null;
  status: RideStatus;
  vehicleType: VehicleType;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  fareAmount: number | null;
  pickupZoneId: string | null;
  dropoffZoneId: string | null;
  requestedAt: Date;
  acceptedAt: Date | null;
  arrivedAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  cancelledBy: string | null;
  cancellationReason: string | null;
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    vehicleType: VehicleType;
    vehiclePlate: string;
    vehicleModel: string;
    rating: number;
  } | null;
  passenger?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string;
  };
}

export class PaginatedRidesResponseDto {
  rides: RideResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
