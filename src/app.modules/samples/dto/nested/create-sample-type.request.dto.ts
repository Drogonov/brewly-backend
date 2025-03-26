import { IsNotEmpty, IsString, IsEmail, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSampleTypeRequestDto {  
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Tasty Coffee' })
  companyName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Irgachiff 4' })
  sampleName: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1, {})
  @Max(5, {})
  @ApiProperty({description: "range from 1 to 5 of roast value", example: 1 })
  roastType: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Blend' })
  coffeeType: string;
}