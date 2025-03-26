import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateSampleTypeRequestDto } from './nested/create-sample-type.request.dto';
import { CreateCoffeePackRequestDto } from './nested/create-coffee-pack.request.dto';

export class CreateSampleRequestDto {
  @IsNotEmpty()
  @ApiProperty({ description: 'Type describing sample' })
  sampleTypeInfo: CreateSampleTypeRequestDto;

  @IsNotEmpty()
  @ApiProperty({ example: 'Current coffee packs of that sample type' })
  coffeePacksInfo: CreateCoffeePackRequestDto[];
}