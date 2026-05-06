import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { UpdateLocationDto } from './dto/update-location.dto';

const DRIVER_LOCATIONS_KEY = 'driver:locations:online';
const LOCATION_SYNC_INTERVAL_MS = 60000; // Sync to PostgreSQL every 60 seconds
const LOCATION_TTL_SECONDS = 120; // Location expires after 2 minutes without update

@Injectable()
export class DriverService {
  private lastSyncTimes: Map<string, number> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async goOnline(driverId: string): Promise<{ status: string; message: string }> {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    if (!driver.isVerified) {
      throw new ForbiddenException('Driver must be verified to go online');
    }

    await this.prisma.driver.update({
      where: { id: driverId },
      data: { isOnline: true },
    });

    return {
      status: 'online',
      message: 'You are now online and can receive ride requests',
    };
  }

  async goOffline(driverId: string): Promise<{ status: string; message: string }> {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    await this.prisma.driver.update({
      where: { id: driverId },
      data: { isOnline: false },
    });

    // Remove from Redis geo index when going offline
    await this.redis.geoRemove(DRIVER_LOCATIONS_KEY, driverId);
    await this.redis.del(`driver:location:${driverId}`);

    return {
      status: 'offline',
      message: 'You are now offline',
    };
  }

  async updateLocation(driverId: string, locationDto: UpdateLocationDto): Promise<{ success: boolean; timestamp: string }> {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    if (!driver.isOnline) {
      throw new BadRequestException('Driver must be online to update location');
    }

    const { latitude, longitude } = locationDto;
    const timestamp = new Date().toISOString();

    // Store in Redis geo index for spatial queries
    await this.redis.geoAdd(DRIVER_LOCATIONS_KEY, longitude, latitude, driverId);

    // Store detailed location data with TTL
    const locationData = JSON.stringify({
      latitude,
      longitude,
      timestamp,
      driverId,
    });
    await this.redis.set(`driver:location:${driverId}`, locationData, LOCATION_TTL_SECONDS);

    // Periodic sync to PostgreSQL (every 60 seconds per driver)
    const lastSync = this.lastSyncTimes.get(driverId) || 0;
    const now = Date.now();

    if (now - lastSync >= LOCATION_SYNC_INTERVAL_MS) {
      await this.syncLocationToDatabase(driverId, latitude, longitude);
      this.lastSyncTimes.set(driverId, now);
    }

    return {
      success: true,
      timestamp,
    };
  }

  async getDriverLocation(driverId: string): Promise<{ latitude: number; longitude: number; timestamp: string } | null> {
    // First try Redis for real-time location
    const cachedLocation = await this.redis.get(`driver:location:${driverId}`);

    if (cachedLocation) {
      const parsed = JSON.parse(cachedLocation);
      return {
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        timestamp: parsed.timestamp,
      };
    }

    // Fallback to Redis geo position
    const geoPos = await this.redis.geoPos(DRIVER_LOCATIONS_KEY, driverId);
    if (geoPos) {
      return {
        latitude: geoPos.latitude,
        longitude: geoPos.longitude,
        timestamp: new Date().toISOString(),
      };
    }

    // Final fallback to PostgreSQL
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
      select: { currentLat: true, currentLng: true, updatedAt: true },
    });

    if (driver && driver.currentLat && driver.currentLng) {
      return {
        latitude: driver.currentLat,
        longitude: driver.currentLng,
        timestamp: driver.updatedAt.toISOString(),
      };
    }

    return null;
  }

  async findNearbyDrivers(
    latitude: number,
    longitude: number,
    radiusKm: number = 5,
  ): Promise<string[]> {
    return this.redis.geoSearch(DRIVER_LOCATIONS_KEY, longitude, latitude, radiusKm);
  }

  private async syncLocationToDatabase(driverId: string, latitude: number, longitude: number): Promise<void> {
    await this.prisma.driver.update({
      where: { id: driverId },
      data: {
        currentLat: latitude,
        currentLng: longitude,
      },
    });
  }
}
