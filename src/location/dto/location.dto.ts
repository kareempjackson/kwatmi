import { IsString, IsNotEmpty, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AutocompleteQueryDto {
  @ApiProperty({
    description: 'Search query for place autocomplete',
    example: 'Victoria Island',
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  query: string;
}

export class ReverseGeocodeQueryDto {
  @ApiProperty({
    description: 'Latitude coordinate',
    example: '6.4281',
  })
  @IsNumberString()
  @IsNotEmpty()
  lat: string;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: '3.4219',
  })
  @IsNumberString()
  @IsNotEmpty()
  lng: string;
}
