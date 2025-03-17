import { IsNotEmpty, IsString, IsEmail, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendNewEmailOTPRequest {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ example: "test@test.com" })
  email: string;
}