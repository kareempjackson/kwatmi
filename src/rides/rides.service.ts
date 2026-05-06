import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRideDto, VehicleType, CoordinatesDto } from './dto/create-ride.dto';
import { UpdateRideStatusDto, RideStatusUpdate } from './dto/update-ride-status.dto';

export enum RideStatus {
  REQUESTED = 'requested',
  ACCEPTED = 'accepted',
  ARRIVED = 'arrived',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

interface FareCalculation {
  baseFare: number;
  distanceFare: number;
  totalFare: number;
  estimatedDistance: number;
  currency: string;
}

@Injectable()
export class RidesService {
  private readonly BASE_FARES: Record<VehicleType, number> = {
    [VehicleType.KEKE]: 200,
    [VehicleType.MOTORCYCLE]: 150,
    [VehicleType.CAR]: 500,
    [VehicleType.SUV]: 800,
  };

  private readonly PER_KM_RATES: Record<VehicleType, number> = {
    [VehicleType.KEKE]: 50,
    [VehicleType.MOTORCYCLE]: 30,
    [VehicleType.CAR]: 100,
    [VehicleType.SUV]: 150,
  };

  private readonly SEARCH_RADIUS_KM = 3;

  constructor(private readonly prisma: PrismaService) {}

  async createRide(riderId: string, dto: CreateRideDto) {
    const rider = await this.prisma.user.findUnique({ where: { id: riderId } });
    if (!rider) {
      throw new NotFoundException('Rider not found');
    }

    const fareCalculation = this.calculateFare(dto.pickupCoords, dto.dropoffCoords, dto.vehicleType);
    const nearestDriver = await this.findNearestAvailableDriver(
      dto.pickupCoords,
      dto.vehicleType,
      this.SEARCH_RADIUS_KM
    );

    const rideData: any = {
      riderId,
      pickupLat: dto.pickupCoords.lat,
      pickupLng: dto.pickupCoords.lng,
      pickupAddress: dto.pickupAddress || null,
      dropoffLat: dto.dropoffCoords.lat,
      dropoffLng: dto.dropoffCoords.lng,
      dropoffAddress: dto.dropoffAddress || null,
      vehicleType: dto.vehicleType,
      fareAmount: fareCalculation.totalFare,
      fareCurrency: fareCalculation.currency,
      estimatedDistance: fareCalculation.estimatedDistance,
      status: RideStatus.REQUESTED,
    };

    if (nearestDriver) {
      rideData.driverId = nearestDriver.id;
      rideData.status = RideStatus.ACCEPTED;
      rideData.acceptedAt = new Date();
    }

    const ride = await this.prisma.ride.create({
      data: rideData,
      include: {
        rider: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
        driver: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
      },
    });

    if (nearestDriver) {
      await this.prisma.user.update({
        where: { id: nearestDriver.id },
        data: { isAvailable: false },
      });
    }

    return {
      ...ride,
      fareBreakdown: fareCalculation,
      driverFound: !!nearestDriver,
    };
  }

  async getRideById(rideId: string, userId: string) {
    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        rider: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
        driver: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, vehicleType: true, vehiclePlate: true } },
      },
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    if (ride.riderId !== userId && ride.driverId !== userId) {
      throw new ForbiddenException('You do not have access to this ride');
    }

    return ride;
  }

  async updateRideStatus(rideId: string, driverId: string, dto: UpdateRideStatusDto) {
    const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    if (ride.driverId !== driverId) {
      throw new ForbiddenException('Only the assigned driver can update ride status');
    }

    this.validateStatusTransition(ride.status as RideStatus, dto.status as RideStatus);

    const updateData: any = { status: dto.status };

    switch (dto.status) {
      case RideStatusUpdate.ARRIVED:
        updateData.arrivedAt = new Date();
        break;
      case RideStatusUpdate.IN_PROGRESS:
        updateData.startedAt = new Date();
        break;
      case RideStatusUpdate.COMPLETED:
        updateData.completedAt = new Date();
        await this.prisma.user.update({
          where: { id: driverId },
          data: { isAvailable: true },
        });
        break;
      case RideStatusUpdate.CANCELLED:
        updateData.cancelledAt = new Date();
        await this.prisma.user.update({
          where: { id: driverId },
          data: { isAvailable: true },
        });
        break;
    }

    return this.prisma.ride.update({
      where: { id: rideId },
      data: updateData,
      include: {
        rider: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
        driver: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
      },
    });
  }

  async getRiderHistory(riderId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [rides, total] = await Promise.all([
      this.prisma.ride.findMany({
        where: { riderId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          driver: { select: { id: true, firstName: true, lastName: true, vehicleType: true, vehiclePlate: true } },
        },
      }),
      this.prisma.ride.count({ where: { riderId } }),
    ]);

    return {
      rides,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private calculateFare(pickup: CoordinatesDto, dropoff: CoordinatesDto, vehicleType: VehicleType): FareCalculation {
    const distance = this.calculateDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
    const baseFare = this.BASE_FARES[vehicleType];
    const distanceFare = Math.round(distance * this.PER_KM_RATES[vehicleType]);
    const totalFare = baseFare + distanceFare;

    return {
      baseFare,
      distanceFare,
      totalFare,
      estimatedDistance: Math.round(distance * 100) / 100,
      currency: 'NGN',
    };
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private async findNearestAvailableDriver(pickup: CoordinatesDto, vehicleType: VehicleType, radiusKm: number) {
    const drivers = await this.prisma.user.findMany({
      where: {
        role: 'driver',
        isAvailable: true,
        vehicleType: vehicleType,
        currentLat: { not: null },
        currentLng: { not: null },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        currentLat: true,
        currentLng: true,
        vehicleType: true,
        vehiclePlate: true,
      },
    });

    let nearestDriver = null;
    let minDistance = radiusKm;

    for (const driver of drivers) {
      if (driver.currentLat && driver.currentLng) {
        const distance = this.calculateDistance(
          pickup.lat,
          pickup.lng,
          driver.currentLat,
          driver.currentLng
        );

        if (distance <= minDistance) {
          minDistance = distance;
          nearestDriver = driver;
        }
      }
    }

    return nearestDriver;
  }

  private validateStatusTransition(currentStatus: RideStatus, newStatus: RideStatus): void {
    const validTransitions: Record<RideStatus, RideStatus[]> = {
      [RideStatus.REQUESTED]: [RideStatus.ACCEPTED, RideStatus.CANCELLED],
      [RideStatus.ACCEPTED]: [RideStatus.ARRIVED, RideStatus.CANCELLED],
      [RideStatus.ARRIVED]: [RideStatus.IN_PROGRESS, RideStatus.CANCELLED],
      [RideStatus.IN_PROGRESS]: [RideStatus.COMPLETED, RideStatus.CANCELLED],
      [RideStatus.COMPLETED]: [],
      [RideStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'`
      );
    }
  }
}
