import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ZoneResponseDto } from './dto/zone-response.dto';

@Injectable()
export class ZonesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllZones(): Promise<ZoneResponseDto[]> {
    const zones = await this.prisma.zone.findMany({
      orderBy: { name: 'asc' },
    });

    return zones.map((zone) => ({
      id: zone.id,
      name: zone.name,
      polygon: zone.polygon as GeoJSON.Polygon,
    }));
  }

  async findZoneByCoordinates(lat: number, lng: number): Promise<string | null> {
    const result = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Zone"
      WHERE ST_Contains(
        ST_GeomFromGeoJSON(polygon::text),
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
      )
      LIMIT 1
    `;

    return result.length > 0 ? result[0].id : null;
  }
}
