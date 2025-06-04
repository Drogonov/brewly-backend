import { IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ValidationErrorKeys } from 'src/app.common/localization/generated';

export class ResendNewEmailOTPRequest {
  @ApiProperty({ example: "test@test.com" })
  @IsNotEmpty()
  @IsEmail({}, { context: { validationErrorKey: ValidationErrorKeys.INCORRECT_EMAIL } })
  email: string;
}