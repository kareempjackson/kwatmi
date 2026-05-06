import { Controller, Get } from '@nestjs/common';
import { ZonesService } from './zones.service';
import { ZoneResponseDto } from './dto/zone-response.dto';

@Controller('zones')
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Get()
  async getAllZones(): Promise<ZoneResponseDto[]> {
    return this.zonesService.getAllZones();
  }
}
