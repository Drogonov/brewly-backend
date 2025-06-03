import { IsNotEmpty, IsString, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ValidationErrorKeys } from 'src/app.common/localization/generated';

export class AuthRequestDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail({}, { context: { validationErrorKey: ValidationErrorKeys.INCORRECT_EMAIL } })
  @ApiProperty({ description: 'The users email', example: 'test@test.com' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { context: { validationErrorKey: ValidationErrorKeys.PASSWORD_IS_SHORT } })
  @ApiProperty({ description: 'The users password', example: 'qqqqqqqq' })
  password: string;
}