import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RideStatus } from '@prisma/client';
import { CancelRideDto, RideQueryDto, RideResponseDto, PaginatedRidesResponseDto } from './dto/ride.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class RidesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getRideById(rideId: string, userId: string): Promise<RideResponseDto> {
    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        driver: true,
        passenger: true,
      },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    // Check if user is passenger or driver of this ride
    if (ride.passengerId !== userId && ride.driverId !== userId) {
      throw new ForbiddenException('You do not have access to this ride');
    }

    return this.mapRideToResponse(ride);
  }

  async getPassengerRideHistory(
    passengerId: string,
    query: RideQueryDto,
  ): Promise<PaginatedRidesResponseDto> {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;

    const where: any = { passengerId };
    if (status) {
      where.status = status;
    }

    const [rides, total] = await Promise.all([
      this.prisma.ride.findMany({
        where,
        include: {
          driver: true,
          passenger: true,
        },
        orderBy: { requestedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.ride.count({ where }),
    ]);

    return {
      rides: rides.map((ride) => this.mapRideToResponse(ride)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async driverArrived(rideId: string, driverId: string): Promise<RideResponseDto> {
    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
      include: { passenger: true, driver: true },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    if (ride.driverId !== driverId) {
      throw new ForbiddenException('You are not the driver for this ride');
    }

    if (ride.status !== RideStatus.ACCEPTED) {
      throw new BadRequestException(`Cannot mark arrived: ride status is ${ride.status}`);
    }

    const updatedRide = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        status: RideStatus.ARRIVED,
        arrivedAt: new Date(),
      },
      include: { driver: true, passenger: true },
    });

    // Notify passenger via WebSocket and SMS
    await this.notificationsService.notifyPassengerDriverArrived(
      ride.passengerId,
      rideId,
      ride.passenger.phoneNumber,
      ride.driver?.firstName || 'Your driver',
      ride.driver?.vehiclePlate || '',
    );

    return this.mapRideToResponse(updatedRide);
  }

  async startRide(rideId: string, driverId: string): Promise<RideResponseDto> {
    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
      include: { driver: true, passenger: true },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    if (ride.driverId !== driverId) {
      throw new ForbiddenException('You are not the driver for this ride');
    }

    if (ride.status !== RideStatus.ARRIVED) {
      throw new BadRequestException(`Cannot start ride: ride status is ${ride.status}`);
    }

    const updatedRide = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        status: RideStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
      include: { driver: true, passenger: true },
    });

    // Notify passenger ride started
    await this.notificationsService.notifyRideStarted(ride.passengerId, rideId);

    return this.mapRideToResponse(updatedRide);
  }

  async completeRide(rideId: string, driverId: string): Promise<RideResponseDto> {
    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
      include: { driver: true, passenger: true },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    if (ride.driverId !== driverId) {
      throw new ForbiddenException('You are not the driver for this ride');
    }

    if (ride.status !== RideStatus.IN_PROGRESS) {
      throw new BadRequestException(`Cannot complete ride: ride status is ${ride.status}`);
    }

    const completedAt = new Date();

    const updatedRide = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        status: RideStatus.COMPLETED,
        completedAt,
      },
      include: { driver: true, passenger: true },
    });

    // Update driver status back to available
    await this.prisma.driver.update({
      where: { id: driverId },
      data: { isAvailable: true },
    });

    // Notify passenger ride completed
    await this.notificationsService.notifyRideCompleted(
      ride.passengerId,
      rideId,
      ride.passenger.phoneNumber,
      ride.fareAmount?.toNumber() || 0,
    );

    return this.mapRideToResponse(updatedRide);
  }

  async cancelRide(
    rideId: string,
    userId: string,
    userRole: 'passenger' | 'driver',
    dto: CancelRideDto,
  ): Promise<RideResponseDto> {
    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
      include: { driver: true, passenger: true },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    if (userRole === 'passenger') {
      if (ride.passengerId !== userId) {
        throw new ForbiddenException('You are not the passenger for this ride');
      }

      // Passenger can only cancel if status is REQUESTED or ACCEPTED
      if (ride.status !== RideStatus.REQUESTED && ride.status !== RideStatus.ACCEPTED) {
        throw new BadRequestException(
          `Passenger cannot cancel ride: ride status is ${ride.status}`,
        );
      }

      const updatedRide = await this.prisma.ride.update({
        where: { id: rideId },
        data: {
          status: RideStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelledBy: 'PASSENGER',
          cancellationReason: dto.reason || null,
        },
        include: { driver: true, passenger: true },
      });

      // If driver was assigned, make them available again
      if (ride.driverId) {
        await this.prisma.driver.update({
          where: { id: ride.driverId },
          data: { isAvailable: true },
        });

        // Notify driver of cancellation
        await this.notificationsService.notifyDriverRideCancelled(ride.driverId, rideId);
      }

      return this.mapRideToResponse(updatedRide);
    } else {
      // Driver cancellation
      if (ride.driverId !== userId) {
        throw new ForbiddenException('You are not the driver for this ride');
      }

      // Driver can only cancel if status is ACCEPTED
      if (ride.status !== RideStatus.ACCEPTED) {
        throw new BadRequestException(
          `Driver cannot cancel ride: ride status is ${ride.status}`,
        );
      }

      // Ride goes back to matching (REQUESTED status, driver removed)
      const updatedRide = await this.prisma.ride.update({
        where: { id: rideId },
        data: {
          status: RideStatus.REQUESTED,
          driverId: null,
          acceptedAt: null,
        },
        include: { driver: true, passenger: true },
      });

      // Make driver available again
      await this.prisma.driver.update({
        where: { id: userId },
        data: { isAvailable: true },
      });

      // Notify passenger that driver cancelled and ride is being re-matched
      await this.notificationsService.notifyPassengerDriverCancelled(
        ride.passengerId,
        rideId,
      );

      return this.mapRideToResponse(updatedRide);
    }
  }

  private mapRideToResponse(ride: any): RideResponseDto {
    return {
      id: ride.id,
      passengerId: ride.passengerId,
      driverId: ride.driverId,
      status: ride.status,
      vehicleType: ride.vehicleType,
      pickupAddress: ride.pickupAddress,
      pickupLat: ride.pickupLat.toNumber(),
      pickupLng: ride.pickupLng.toNumber(),
      dropoffAddress: ride.dropoffAddress,
      dropoffLat: ride.dropoffLat.toNumber(),
      dropoffLng: ride.dropoffLng.toNumber(),
      fareAmount: ride.fareAmount?.toNumber() || null,
      pickupZoneId: ride.pickupZoneId,
      dropoffZoneId: ride.dropoffZoneId,
      requestedAt: ride.requestedAt,
      acceptedAt: ride.acceptedAt,
      arrivedAt: ride.arrivedAt,
      startedAt: ride.startedAt,
      completedAt: ride.completedAt,
      cancelledAt: ride.cancelledAt,
      cancelledBy: ride.cancelledBy,
      cancellationReason: ride.cancellationReason,
      driver: ride.driver
        ? {
            id: ride.driver.id,
            firstName: ride.driver.firstName,
            lastName: ride.driver.lastName,
            phoneNumber: ride.driver.phoneNumber,
            vehicleType: ride.driver.vehicleType,
            vehiclePlate: ride.driver.vehiclePlate,
            vehicleModel: ride.driver.vehicleModel,
            rating: ride.driver.rating.toNumber(),
          }
        : null,
      passenger: ride.passenger
        ? {
            id: ride.passenger.id,
            firstName: ride.passenger.firstName,
            lastName: ride.passenger.lastName,
            phoneNumber: ride.passenger.phoneNumber,
          }
        : undefined,
    };
  }
}
