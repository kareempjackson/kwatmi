import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterFcmTokenDto, DeviceType } from './dto/register-fcm-token.dto';
import { NotificationType } from './dto/send-notification.dto';
import { NotificationStatus } from '@prisma/client';

export interface NotificationJobData {
  notificationId: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, string>;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('notifications') private readonly notificationQueue: Queue<NotificationJobData>,
  ) {}

  async registerFcmToken(userId: string, dto: RegisterFcmTokenDto): Promise<{ success: boolean }> {
    const existingToken = await this.prisma.fcmToken.findUnique({
      where: { token: dto.token },
    });

    if (existingToken) {
      if (existingToken.userId !== userId) {
        await this.prisma.fcmToken.update({
          where: { token: dto.token },
          data: { userId, isActive: true },
        });
      } else if (!existingToken.isActive) {
        await this.prisma.fcmToken.update({
          where: { token: dto.token },
          data: { isActive: true },
        });
      }
    } else {
      await this.prisma.fcmToken.create({
        data: {
          token: dto.token,
          userId,
          deviceType: dto.deviceType as any,
        },
      });
    }

    this.logger.log(`FCM token registered for user ${userId}`);
    return { success: true };
  }

  async unregisterFcmToken(userId: string, token: string): Promise<{ success: boolean }> {
    await this.prisma.fcmToken.updateMany({
      where: { token, userId },
      data: { isActive: false },
    });
    this.logger.log(`FCM token unregistered for user ${userId}`);
    return { success: true };
  }

  async sendNotification(
    userId: string,
    title: string,
    body: string,
    type: NotificationType,
    data?: Record<string, string>,
  ): Promise<void> {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        title,
        body,
        type: type as any,
        data: data || {},
        status: NotificationStatus.QUEUED,
      },
    });

    await this.notificationQueue.add(
      'send-notification',
      {
        notificationId: notification.id,
        userId,
        title,
        body,
        type,
        data,
      },
      {
        priority: this.getNotificationPriority(type),
      },
    );

    this.logger.log(`Notification queued for user ${userId}: ${type}`);
  }

  async notifyRideAccepted(
    riderId: string,
    rideId: string,
    driverName: string,
    vehicleInfo: string,
  ): Promise<void> {
    await this.sendNotification(
      riderId,
      'Ride Accepted!',
      `${driverName} has accepted your ride request. ${vehicleInfo}`,
      NotificationType.RIDE_ACCEPTED,
      {
        rideId,
        driverName,
        vehicleInfo,
        action: 'VIEW_RIDE',
      },
    );
  }

  async notifyDriverArrived(riderId: string, rideId: string, driverName: string): Promise<void> {
    await this.sendNotification(
      riderId,
      'Driver Has Arrived!',
      `${driverName} has arrived at your pickup location.`,
      NotificationType.DRIVER_ARRIVED,
      {
        rideId,
        driverName,
        action: 'VIEW_RIDE',
      },
    );
  }

  async notifyRideCompleted(
    riderId: string,
    rideId: string,
    fare: number,
    currency: string = 'NGN',
  ): Promise<void> {
    await this.sendNotification(
      riderId,
      'Ride Completed!',
      `Your ride has been completed. Total fare: ${currency} ${fare.toFixed(2)}`,
      NotificationType.RIDE_COMPLETED,
      {
        rideId,
        fare: fare.toString(),
        currency,
        action: 'RATE_RIDE',
      },
    );
  }

  async notifyDriverRideCompleted(
    driverId: string,
    rideId: string,
    earnings: number,
    currency: string = 'NGN',
  ): Promise<void> {
    await this.sendNotification(
      driverId,
      'Ride Completed!',
      `You've earned ${currency} ${earnings.toFixed(2)} for this ride.`,
      NotificationType.RIDE_COMPLETED,
      {
        rideId,
        earnings: earnings.toString(),
        currency,
        action: 'VIEW_EARNINGS',
      },
    );
  }

  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    notifications: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return { notifications, total, page, limit };
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { readAt: new Date(), status: NotificationStatus.READ },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date(), status: NotificationStatus.READ },
    });
  }

  private getNotificationPriority(type: NotificationType): number {
    const priorities: Record<NotificationType, number> = {
      [NotificationType.RIDE_ACCEPTED]: 1,
      [NotificationType.DRIVER_ARRIVED]: 1,
      [NotificationType.RIDE_COMPLETED]: 2,
      [NotificationType.RIDE_CANCELLED]: 1,
      [NotificationType.PAYMENT_RECEIVED]: 3,
      [NotificationType.GENERAL]: 5,
    };
    return priorities[type] || 5;
  }
}
