import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SampleTypeRequestDto } from './nested/sample-type.request.dto';
import { CoffeePackRequestDto } from './nested/coffee-pack.request.dto';
import { Type } from 'class-transformer';

export class SampleRequestDto {
  @IsNotEmpty()
  @Type(() => SampleTypeRequestDto)
  @ApiProperty({ description: 'Type describing sample' })
  sampleTypeInfo: SampleTypeRequestDto;

  @IsNotEmpty()
  @Type(() => CoffeePackRequestDto)
  @ApiProperty({ example: 'Current coffee packs of that sample type' })
  coffeePacksInfo: CoffeePackRequestDto[];
}