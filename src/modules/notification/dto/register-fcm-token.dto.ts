import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum DeviceType {
  ANDROID = 'ANDROID',
  IOS = 'IOS',
  WEB = 'WEB',
}

export class RegisterFcmTokenDto {
  @ApiProperty({
    description: 'FCM device token',
    example: 'eKd9sJ3kR...',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'Device type',
    enum: DeviceType,
    default: DeviceType.ANDROID,
  })
  @IsEnum(DeviceType)
  @IsOptional()
  deviceType?: DeviceType = DeviceType.ANDROID;
}
