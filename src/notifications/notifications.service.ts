import { Injectable, Logger } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { SmsService } from './sms.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly gateway: NotificationsGateway,
    private readonly smsService: SmsService,
  ) {}

  async notifyPassengerDriverArrived(
    passengerId: string,
    rideId: string,
    phoneNumber: string,
    driverName: string,
    vehiclePlate: string,
  ): Promise<void> {
    // WebSocket notification
    this.gateway.sendToUser(passengerId, 'ride:driver_arrived', {
      rideId,
      message: `Your driver ${driverName} has arrived`,
      vehiclePlate,
      timestamp: new Date().toISOString(),
    });

    // SMS notification
    const smsMessage = `Kwatmi: Your driver ${driverName} (${vehiclePlate}) has arrived at your pickup location.`;
    await this.smsService.sendSms(phoneNumber, smsMessage);

    this.logger.log(`Notified passenger ${passengerId} that driver arrived for ride ${rideId}`);
  }

  async notifyRideStarted(passengerId: string, rideId: string): Promise<void> {
    this.gateway.sendToUser(passengerId, 'ride:started', {
      rideId,
      message: 'Your ride has started',
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Notified passenger ${passengerId} that ride ${rideId} started`);
  }

  async notifyRideCompleted(
    passengerId: string,
    rideId: string,
    phoneNumber: string,
    fareAmount: number,
  ): Promise<void> {
    this.gateway.sendToUser(passengerId, 'ride:completed', {
      rideId,
      fareAmount,
      message: 'Your ride has been completed. Thank you for using Kwatmi!',
      timestamp: new Date().toISOString(),
    });

    const smsMessage = `Kwatmi: Your ride is complete! Fare: ₦${fareAmount}. Thank you for riding with us.`;
    await this.smsService.sendSms(phoneNumber, smsMessage);

    this.logger.log(`Notified passenger ${passengerId} that ride ${rideId} completed`);
  }

  async notifyDriverRideCancelled(driverId: string, rideId: string): Promise<void> {
    this.gateway.sendToUser(driverId, 'ride:cancelled', {
      rideId,
      message: 'The passenger has cancelled the ride',
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Notified driver ${driverId} that ride ${rideId} was cancelled by passenger`);
  }

  async notifyPassengerDriverCancelled(passengerId: string, rideId: string): Promise<void> {
    this.gateway.sendToUser(passengerId, 'ride:driver_cancelled', {
      rideId,
      message: 'Your driver had to cancel. We are finding you another driver.',
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Notified passenger ${passengerId} that driver cancelled ride ${rideId}`);
  }

  async notifyNewRideRequest(driverId: string, rideId: string, rideDetails: any): Promise<void> {
    this.gateway.sendToUser(driverId, 'ride:new_request', {
      rideId,
      ...rideDetails,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Notified driver ${driverId} of new ride request ${rideId}`);
  }
}
