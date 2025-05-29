import { IsNotEmpty, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TestType } from '.';

class PropertyDto {
  @IsNotEmpty()
  @ApiProperty({ enum: TestType })
  testPropertyType: TestType;

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyDto)
  @ApiProperty({ type: [PropertyDto] })
  properties: PropertyDto[];
}

export class SetCuppingTestsRequestDto {
  @ApiProperty({ type: [SetCuppingTestRequestDto], isArray: true })
  @IsNotEmpty()
  @Type(() => SetCuppingTestRequestDto)
  tests: SetCuppingTestRequestDto[];
}