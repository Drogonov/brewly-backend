import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSampleTypeRequestDto {
  @IsNotEmpty()
  @ApiProperty({ example: 666 })
  companyId: number;
  
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Tasty Coffee' })
  companyName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Irgachiff 4' })
  sampleName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Medium' })
  roastType: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Blend' })
  coffeeType: string;
}