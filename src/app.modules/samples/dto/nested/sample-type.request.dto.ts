import { IsNotEmpty, IsString, IsEmail, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CoffeePackRequestDto } from './coffee-pack.request.dto';
import { Type } from 'class-transformer';

export class SampleTypeRequestDto {
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({ example: 666 })
  sampleTypeId?: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Tasty Coffee' })
  companyName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Irgachiff 4' })
  sampleName: string;

  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({ example: 1 })
  beanOriginCode: number;

  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({ example: 2 })
  processingMethodCode: number;

  @IsNotEmpty()
  @Type(() => Number)
  @Min(1, {})
  @Max(5, {})
  @ApiProperty({description: "range from 1 to 5 of roast value", example: 1 })
  roastType: number;

  @IsNotEmpty()
  @Type(() => Number)
  @Min(1, {})
  @Max(5, {})
  @ApiProperty({description: "range from 1 to 10 of grind value", example: 1 })
  grindType: number;

  @IsNotEmpty()
  @ApiProperty({ description: "Labels of the pack" })
  labels: [string];
}