import { IsUUID, IsNotEmpty } from 'class-validator';

export class AcceptRideDto {
  @IsUUID()
  @IsNotEmpty()
  rideId: string;
}
