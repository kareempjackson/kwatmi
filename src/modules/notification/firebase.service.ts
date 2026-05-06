import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export interface FcmMessage {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface FcmResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private app: admin.app.App;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const projectId = this.configService.get<string>('firebase.projectId');
    const clientEmail = this.configService.get<string>('firebase.clientEmail');
    const privateKey = this.configService.get<string>('firebase.privateKey');

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn('Firebase credentials not configured. Push notifications will be disabled.');
      return;
    }

    try {
      this.app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      this.logger.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', error);
    }
  }

  async sendPushNotification(message: FcmMessage): Promise<FcmResponse> {
    if (!this.app) {
      this.logger.warn('Firebase not initialized. Skipping notification.');
      return { success: false, error: 'Firebase not initialized' };
    }

    try {
      const fcmMessage: admin.messaging.Message = {
        token: message.token,
        notification: {
          title: message.title,
          body: message.body,
        },
        data: message.data,
        android: {
          priority: 'high',
          notification: {
            channelId: 'kwatmi_rides',
            priority: 'high',
            defaultSound: true,
            defaultVibrateTimings: true,
          },
        },
      };

      const messageId = await admin.messaging().send(fcmMessage);
      this.logger.log(`Push notification sent successfully: ${messageId}`);
      return { success: true, messageId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send push notification: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  async sendMulticastNotification(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<{ successCount: number; failureCount: number }> {
    if (!this.app) {
      this.logger.warn('Firebase not initialized. Skipping multicast notification.');
      return { successCount: 0, failureCount: tokens.length };
    }

    if (tokens.length === 0) {
      return { successCount: 0, failureCount: 0 };
    }

    try {
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: { title, body },
        data,
        android: {
          priority: 'high',
          notification: {
            channelId: 'kwatmi_rides',
            priority: 'high',
            defaultSound: true,
          },
        },
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      this.logger.log(
        `Multicast notification sent: ${response.successCount} success, ${response.failureCount} failed`,
      );
      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      this.logger.error('Failed to send multicast notification', error);
      return { successCount: 0, failureCount: tokens.length };
    }
  }
}
