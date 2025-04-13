import { IsNotEmpty, IsString, IsEmail, IsDate, IsDateString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CoffeePackRequestDto {
  @IsOptional()
  @ApiProperty({ example: 666 })
  packId?: number;

  // ISO8601 format date
  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({ example: "2025-01-01T00:00:00Z" })
  roastDate: string;

  // ISO8601 format date
  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ example: "2025-01-01T00:00:00Z" })
  openDate?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: false })
  packIsOver?: boolean

  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({ description: "Weight in gramms", example: 250 })
  weight: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '666666' })
  barCode?: string;
}