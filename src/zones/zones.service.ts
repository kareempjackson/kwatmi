import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ZoneResponseDto } from './dto/zone-response.dto';

@Injectable()
export class ZonesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllActiveZones(): Promise<ZoneResponseDto[]> {
    const zones = await this.prisma.zone.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return zones.map((zone) => ({
      id: zone.id,
      name: zone.name,
      description: zone.description,
    }));
  }

  async getZoneById(id: string) {
    return this.prisma.zone.findUnique({ where: { id } });
  }
}
