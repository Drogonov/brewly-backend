import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OTPRequestDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ description: 'The user\'s email', example: 'test@test.com' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'One Time Password', example: '123456' })
  otp: string;
}