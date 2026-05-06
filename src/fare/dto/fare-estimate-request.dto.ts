import { IsString, IsNotEmpty } from 'class-validator';

export class FareEstimateRequestDto {
  @IsString()
  @IsNotEmpty()
  pickup_zone_id: string;

  @IsString()
  @IsNotEmpty()
  dropoff_zone_id: string;
}
