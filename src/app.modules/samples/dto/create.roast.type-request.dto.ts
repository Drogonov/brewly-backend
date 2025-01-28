import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoastTypeRequestDto {
  @IsNotEmpty()
  @ApiProperty({ example: 666 })
  companyId: number;

  @IsNotEmpty()
  @ApiProperty({ example: 'Natural' })
  value: string;
}