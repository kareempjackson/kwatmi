import { IsString, IsNotEmpty, IsOptional, IsObject, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum NotificationType {
  RIDE_ACCEPTED = 'RIDE_ACCEPTED',
  DRIVER_ARRIVED = 'DRIVER_ARRIVED',
  RIDE_COMPLETED = 'RIDE_COMPLETED',
  RIDE_CANCELLED = 'RIDE_CANCELLED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  GENERAL = 'GENERAL',
}

export class SendNotificationDto {
  @ApiProperty({ description: 'Target user ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Notification title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Notification body' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({ description: 'Notification type', enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: 'Additional data payload', required: false })
  @IsObject()
  @IsOptional()
  data?: Record<string, string>;
}
