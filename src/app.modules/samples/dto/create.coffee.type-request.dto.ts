import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCoffeeTypeRequestDto {
  @IsNotEmpty()
  @ApiProperty({ example: 666 })
  companyId: number;
  
  @IsNotEmpty()
  @ApiProperty({ example: 'Medium+' })
  value: string;
}