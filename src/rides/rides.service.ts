import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DriverService } from '../driver/driver.service';
import { RideStatus } from '@prisma/client';

@Injectable()
export class RidesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly driverService: DriverService,
  ) {}

  async getDriverLocationForRide(
    rideId: string,
    passengerId: string,
  ): Promise<{ latitude: number; longitude: number; timestamp: string }> {
    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
      include: { driver: true },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    if (ride.passengerId !== passengerId) {
      throw new ForbiddenException('You can only track your own rides');
    }

    const activeStatuses: RideStatus[] = [
      RideStatus.ACCEPTED,
      RideStatus.DRIVER_ARRIVED,
      RideStatus.IN_PROGRESS,
    ];

    if (!activeStatuses.includes(ride.status)) {
      throw new ForbiddenException('Driver location is only available for active rides');
    }

    if (!ride.driverId) {
      throw new NotFoundException('No driver assigned to this ride');
    }

    const location = await this.driverService.getDriverLocation(ride.driverId);

    if (!location) {
      throw new NotFoundException('Driver location not available');
    }

    return location;
  }
}
