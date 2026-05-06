import { IsString, IsNotEmpty } from 'class-validator';

export class FareEstimateDto {
  @IsString()
  @IsNotEmpty()
  pickup_lat: string;

  @IsString()
  @IsNotEmpty()
  pickup_lng: string;

  @IsString()
  @IsNotEmpty()
  dropoff_lat: string;

  @IsString()
  @IsNotEmpty()
  dropoff_lng: string;

  @IsString()
  @IsNotEmpty()
  vehicle_type: string;
}
