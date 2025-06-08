import { IsNotEmpty, IsString, IsEmail, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ValidationErrorKeys } from '../localization/generated';

export class OTPRequestDto {
  @IsNotEmpty({ context: { validationErrorKey: ValidationErrorKeys.INCORRECT_EMAIL } })
  @IsEmail({}, { context: { validationErrorKey: ValidationErrorKeys.INCORRECT_EMAIL } })
  @ApiProperty({ description: 'The user\'s email', example: 'test@test.com' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { context: { validationErrorKey: ValidationErrorKeys.OTP_OUT_OF_RANGE } })
  @Matches(/^\d{6}$/, { context: { validationErrorKey: ValidationErrorKeys.OTP_OUT_OF_RANGE } })
  @ApiProperty({ description: 'One Time Password', example: '123456' })
  otp: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'The user system language', example: 'en' })
  language: string;
}