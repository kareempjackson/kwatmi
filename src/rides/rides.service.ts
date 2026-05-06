import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { RideStatus, VehicleType, UserRole } from '@prisma/client';
import { RidesGateway } from './rides.gateway';
import { SmsService } from '../sms/sms.service';

interface Coordinates {
  lat: number;
  lng: number;
}

interface NearbyDriver {
  id: string;
  userId: string;
  vehicleType: VehicleType;
  vehiclePlate: string;
  currentLat: number;
  currentLng: number;
  distance: number;
}

@Injectable()
export class RidesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ridesGateway: RidesGateway,
    private readonly smsService: SmsService,
  ) {}

  /**
   * Creates a new ride request for a passenger
   */
  async createRide(userId: string, dto: CreateRideDto) {
    // Verify user is a passenger
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.PASSENGER) {
      throw new ForbiddenException('Only passengers can request rides');
    }

    // Validate pickup zone exists
    const pickupZone = await this.findZoneByCoordinates({
      lat: dto.pickupLat,
      lng: dto.pickupLng,
    });

    if (!pickupZone) {
      throw new BadRequestException('Pickup location is not in a serviceable zone');
    }

    // Validate dropoff zone exists
    const dropoffZone = await this.findZoneByCoordinates({
      lat: dto.dropoffLat,
      lng: dto.dropoffLng,
    });

    if (!dropoffZone) {
      throw new BadRequestException('Dropoff location is not in a serviceable zone');
    }

    // Calculate fare
    const fare = await this.calculateFare(
      pickupZone.id,
      dropoffZone.id,
      dto.vehicleType,
      { lat: dto.pickupLat, lng: dto.pickupLng },
      { lat: dto.dropoffLat, lng: dto.dropoffLng },
    );

    // Create the ride
    const ride = await this.prisma.ride.create({
      data: {
        passengerId: userId,
        pickupLat: dto.pickupLat,
        pickupLng: dto.pickupLng,
        dropoffLat: dto.dropoffLat,
        dropoffLng: dto.dropoffLng,
        vehicleType: dto.vehicleType,
        pickupZoneId: pickupZone.id,
        dropoffZoneId: dropoffZone.id,
        fare,
        status: RideStatus.REQUESTED,
      },
      include: {
        passenger: true,
        pickupZone: true,
        dropoffZone: true,
      },
    });

    // Find and notify nearby drivers
    await this.matchAndNotifyDrivers(ride);

    return {
      id: ride.id,
      status: ride.status,
      fare: ride.fare,
      vehicleType: ride.vehicleType,
      pickup: {
        lat: ride.pickupLat,
        lng: ride.pickupLng,
        zone: ride.pickupZone.name,
      },
      dropoff: {
        lat: ride.dropoffLat,
        lng: ride.dropoffLng,
        zone: ride.dropoffZone.name,
      },
      createdAt: ride.createdAt,
    };
  }

  /**
   * Driver accepts a ride request
   */
  async acceptRide(driverId: string, rideId: string) {
    // Verify user is a driver
    const driver = await this.prisma.driver.findFirst({
      where: { userId: driverId },
      include: { user: true },
    });

    if (!driver) {
      throw new ForbiddenException('Only drivers can accept rides');
    }

    if (!driver.isOnline || !driver.isAvailable) {
      throw new BadRequestException('Driver must be online and available to accept rides');
    }

    // Use transaction with SELECT FOR UPDATE to handle race conditions
    const ride = await this.prisma.$transaction(async (tx) => {
      // Lock the ride row
      const rides = await tx.$queryRaw<any[]>`
        SELECT * FROM "Ride" 
        WHERE id = ${rideId}::uuid 
        FOR UPDATE NOWAIT
      `;

      if (!rides || rides.length === 0) {
        throw new NotFoundException('Ride not found');
      }

      const lockedRide = rides[0];

      if (lockedRide.status !== RideStatus.REQUESTED) {
        throw new ConflictException('Ride is no longer available');
      }

      if (lockedRide.vehicleType !== driver.vehicleType) {
        throw new BadRequestException('Vehicle type does not match ride request');
      }

      // Update ride with driver assignment
      const updatedRide = await tx.ride.update({
        where: { id: rideId },
        data: {
          driverId: driver.id,
          status: RideStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
        include: {
          passenger: true,
          driver: {
            include: { user: true },
          },
          pickupZone: true,
          dropoffZone: true,
        },
      });

      // Mark driver as unavailable
      await tx.driver.update({
        where: { id: driver.id },
        data: { isAvailable: false },
      });

      return updatedRide;
    });

    // Calculate ETA (simplified: 2 minutes per km)
    const distanceToPickup = this.calculateDistance(
      { lat: driver.currentLat, lng: driver.currentLng },
      { lat: ride.pickupLat, lng: ride.pickupLng },
    );
    const etaMinutes = Math.ceil(distanceToPickup * 2);

    // Notify passenger via WebSocket
    this.ridesGateway.notifyPassenger(ride.passengerId, {
      type: 'RIDE_ACCEPTED',
      data: {
        rideId: ride.id,
        driver: {
          name: ride.driver.user.name || 'Driver',
          phone: ride.driver.user.phoneNumber,
          vehiclePlate: ride.driver.vehiclePlate,
          vehicleType: ride.driver.vehicleType,
        },
        etaMinutes,
      },
    });

    // Send SMS to passenger
    await this.smsService.sendRideAcceptedSms(
      ride.passenger.phoneNumber,
      ride.driver.user.name || 'Your driver',
      ride.driver.vehiclePlate,
      etaMinutes,
    );

    return {
      id: ride.id,
      status: ride.status,
      fare: ride.fare,
      passenger: {
        name: ride.passenger.name,
        phone: ride.passenger.phoneNumber,
      },
      pickup: {
        lat: ride.pickupLat,
        lng: ride.pickupLng,
        zone: ride.pickupZone.name,
      },
      dropoff: {
        lat: ride.dropoffLat,
        lng: ride.dropoffLng,
        zone: ride.dropoffZone.name,
      },
      etaMinutes,
      acceptedAt: ride.acceptedAt,
    };
  }

  /**
   * Find zone containing the given coordinates using PostGIS
   */
  private async findZoneByCoordinates(coords: Coordinates) {
    const zones = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, "baseOkadaFare", "baseKekeFare"
      FROM "Zone"
      WHERE ST_Contains(
        polygon::geometry,
        ST_SetSRID(ST_MakePoint(${coords.lng}, ${coords.lat}), 4326)
      )
      LIMIT 1
    `;

    return zones.length > 0 ? zones[0] : null;
  }

  /**
   * Calculate fare based on zones and vehicle type
   */
  private async calculateFare(
    pickupZoneId: string,
    dropoffZoneId: string,
    vehicleType: VehicleType,
    pickup: Coordinates,
    dropoff: Coordinates,
  ): Promise<number> {
    // Get zone pricing if available
    const zonePricing = await this.prisma.zonePricing.findFirst({
      where: {
        fromZoneId: pickupZoneId,
        toZoneId: dropoffZoneId,
      },
    });

    // Get base fares from pickup zone
    const pickupZone = await this.prisma.zone.findUnique({
      where: { id: pickupZoneId },
    });

    const baseFare = vehicleType === VehicleType.OKADA
      ? pickupZone.baseOkadaFare
      : pickupZone.baseKekeFare;

    // Calculate distance in km
    const distance = this.calculateDistance(pickup, dropoff);

    // Use zone pricing or calculate based on distance
    let distanceFee: number;
    if (zonePricing) {
      distanceFee = vehicleType === VehicleType.OKADA
        ? zonePricing.okadaFare
        : zonePricing.kekeFare;
    } else {
      // Default: ₦100/km for okada, ₦150/km for keke
      const perKmRate = vehicleType === VehicleType.OKADA ? 100 : 150;
      distanceFee = Math.round(distance * perKmRate);
    }

    return baseFare + distanceFee;
  }

  /**
   * Find nearby online drivers and notify them via WebSocket
   */
  private async matchAndNotifyDrivers(ride: any) {
    const radiusMeters = 3000; // 3km

    // Find online drivers within 3km using PostGIS
    const nearbyDrivers = await this.prisma.$queryRaw<NearbyDriver[]>`
      SELECT 
        d.id,
        d."userId",
        d."vehicleType",
        d."vehiclePlate",
        d."currentLat",
        d."currentLng",
        ST_Distance(
          ST_SetSRID(ST_MakePoint(d."currentLng", d."currentLat"), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${ride.pickupLng}, ${ride.pickupLat}), 4326)::geography
        ) as distance
      FROM "Driver" d
      WHERE d."isOnline" = true
        AND d."isAvailable" = true
        AND d."vehicleType" = ${ride.vehicleType}::"VehicleType"
        AND ST_DWithin(
          ST_SetSRID(ST_MakePoint(d."currentLng", d."currentLat"), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${ride.pickupLng}, ${ride.pickupLat}), 4326)::geography,
          ${radiusMeters}
        )
      ORDER BY distance ASC
      LIMIT 10
    `;

    if (nearbyDrivers.length === 0) {
      return;
    }

    // Prepare ride data for drivers
    const rideData = {
      type: 'NEW_RIDE_REQUEST',
      data: {
        rideId: ride.id,
        fare: ride.fare,
        vehicleType: ride.vehicleType,
        pickup: {
          lat: ride.pickupLat,
          lng: ride.pickupLng,
          zone: ride.pickupZone.name,
        },
        dropoff: {
          lat: ride.dropoffLat,
          lng: ride.dropoffLng,
          zone: ride.dropoffZone.name,
        },
        passengerName: ride.passenger.name || 'Passenger',
      },
    };

    // Notify drivers in order of proximity (nearest first)
    for (const driver of nearbyDrivers) {
      const distanceKm = Math.round(driver.distance / 100) / 10; // Convert to km, 1 decimal
      this.ridesGateway.notifyDriver(driver.userId, {
        ...rideData,
        data: {
          ...rideData.data,
          distanceToPickup: distanceKm,
        },
      });
    }
  }

  /**
   * Calculate distance between two coordinates in km using Haversine formula
   */
  private calculateDistance(from: Coordinates, to: Coordinates): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(to.lat - from.lat);
    const dLng = this.toRad(to.lng - from.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(from.lat)) *
        Math.cos(this.toRad(to.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
