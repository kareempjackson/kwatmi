import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    this.logger.log('Connecting to PostgreSQL database...');
    await this.$connect();
    this.logger.log('Successfully connected to database');
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from database...');
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }

  /**
   * Find nearby online drivers within a radius using PostGIS
   */
  async findNearbyDrivers(
    lat: number,
    lng: number,
    radiusMeters: number = 5000,
    vehicleType?: 'OKADA' | 'KEKE'
  ) {
    const vehicleFilter = vehicleType ? `AND d.vehicle_type = '${vehicleType}'` : '';
    
    return this.$queryRawUnsafe<Array<{
      id: string;
      user_id: string;
      vehicle_type: string;
      plate_number: string;
      current_lat: number;
      current_lng: number;
      distance_meters: number;
      driver_name: string;
      driver_phone: string;
    }>>(`
      SELECT 
        d.id,
        d.user_id,
        d.vehicle_type,
        d.plate_number,
        d.current_lat,
        d.current_lng,
        ST_Distance(
          d.location::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) as distance_meters,
        u.name as driver_name,
        u.phone as driver_phone
      FROM drivers d
      JOIN users u ON d.user_id = u.id
      WHERE d.is_online = true
        AND d.location IS NOT NULL
        ${vehicleFilter}
        AND ST_DWithin(
          d.location::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          $3
        )
      ORDER BY distance_meters ASC
      LIMIT 20
    `, lng, lat, radiusMeters);
  }

  /**
   * Find which zone contains a given point using PostGIS
   */
  async findZoneByPoint(lat: number, lng: number) {
    const result = await this.$queryRawUnsafe<Array<{ id: string; name: string }>>(`
      SELECT id, name
      FROM zones
      WHERE ST_Contains(
        ST_GeomFromGeoJSON(polygon::text),
        ST_SetSRID(ST_MakePoint($1, $2), 4326)
      )
      LIMIT 1
    `, lng, lat);

    return result[0] || null;
  }

  /**
   * Health check for database connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
