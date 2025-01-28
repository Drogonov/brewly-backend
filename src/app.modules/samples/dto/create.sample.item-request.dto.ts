import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSampleItemRequestDto {
  @IsNotEmpty()
  @ApiProperty({ example: 666 })
  companyId: number;
  
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '20.12.2021' })
  roastDate: Date;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '26.12.2021' })
  openDate: Date;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: "Wheight in gramms", example: 250 })
  wheight: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '666666' })
  barCode: string;
}