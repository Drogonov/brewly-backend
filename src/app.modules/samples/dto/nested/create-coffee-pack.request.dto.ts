import { IsNotEmpty, IsString, IsEmail, IsDate, IsDateString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCoffeePackRequestDto {

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

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: "Wheight in gramms", example: 250 })
  wheight: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '666666' })
  barCode?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: false })
  packIsOver?: boolean
}