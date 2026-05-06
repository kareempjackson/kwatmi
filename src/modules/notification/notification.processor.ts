import { Processor, Process, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FirebaseService } from './firebase.service';
import { NotificationJobData } from './notification.service';
import { NotificationStatus } from '@prisma/client';

@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Process('send-notification')
  async handleSendNotification(job: Job<NotificationJobData>): Promise<void> {
    const { notificationId, userId, title, body, data } = job.data;
    this.logger.log(`Processing notification ${notificationId} for user ${userId}`);

    const fcmTokens = await this.prisma.fcmToken.findMany({
      where: { userId, isActive: true },
      select: { token: true },
    });

    if (fcmTokens.length === 0) {
      this.logger.warn(`No active FCM tokens found for user ${userId}`);
      await this.updateNotificationStatus(notificationId, NotificationStatus.FAILED, 'No active FCM tokens');
      return;
    }

    const tokens = fcmTokens.map((t) => t.token);
    
    if (tokens.length === 1) {
      const result = await this.firebaseService.sendPushNotification({
        token: tokens[0],
        title,
        body,
        data,
      });

      if (result.success) {
        await this.updateNotificationStatus(notificationId, NotificationStatus.SENT);
      } else {
        if (result.error?.includes('not registered') || result.error?.includes('invalid')) {
          await this.deactivateToken(tokens[0]);
        }
        throw new Error(result.error);
      }
    } else {
      const result = await this.firebaseService.sendMulticastNotification(tokens, title, body, data);

      if (result.successCount > 0) {
        await this.updateNotificationStatus(notificationId, NotificationStatus.SENT);
      } else {
        throw new Error(`Failed to send to all ${result.failureCount} devices`);
      }
    }
  }

  @OnQueueFailed()
  async handleFailedJob(job: Job<NotificationJobData>, error: Error): Promise<void> {
    this.logger.error(`Notification job ${job.id} failed: ${error.message}`);
    
    if (job.attemptsMade >= (job.opts.attempts || 3)) {
      await this.updateNotificationStatus(
        job.data.notificationId,
        NotificationStatus.FAILED,
        error.message,
      );
    }
  }

  private async updateNotificationStatus(
    notificationId: string,
    status: NotificationStatus,
    error?: string,
  ): Promise<void> {
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        status,
        sentAt: status === NotificationStatus.SENT ? new Date() : undefined,
        error,
      },
    });
  }

  private async deactivateToken(token: string): Promise<void> {
    await this.prisma.fcmToken.updateMany({
      where: { token },
      data: { isActive: false },
    });
    this.logger.log(`Deactivated invalid FCM token`);
  }
}
