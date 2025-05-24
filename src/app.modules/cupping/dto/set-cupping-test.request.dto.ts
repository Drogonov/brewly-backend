import { IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class PropertyDto {
  @IsNotEmpty()
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  propertyTypeId: number;

  @IsNotEmpty()
  @ApiProperty({ example: 5 })
  @Type(() => Number)
  intensity: number;

  @IsNotEmpty()
  @ApiProperty({ example: 4 })
  @Type(() => Number)
  quality: number;

  @ApiProperty({ example: 'Nice aromas' })
  comment: string;
}

export class SetCuppingTestRequestDto {
  @IsNotEmpty()
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  cuppingId: number;

  @IsNotEmpty()
  @ApiProperty({ example: 10 })
  @Type(() => Number)
  coffeePackId: number;

  @IsNotEmpty()
  @ApiProperty({ example: 120 })
  @Type(() => Number)
  userTestingTimeInSeconds: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyDto)
  @ApiProperty({ type: [PropertyDto] })
  properties: PropertyDto[];
}