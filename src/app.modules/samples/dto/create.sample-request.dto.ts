import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateSampleTypeRequestDto } from './create.sample.type-request.dto';
import { CreateSampleItemRequestDto } from './create.sample.item-request.dto';

export class CreateSampleRequestDto {
  @IsNotEmpty()
  @ApiProperty({ example: 666 })
  companyId: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'Type describing sample' })
  type: CreateSampleTypeRequestDto;

  @IsNotEmpty()
  @ApiProperty({ example: 'Properties of current sample' })
  item: CreateSampleItemRequestDto;
}