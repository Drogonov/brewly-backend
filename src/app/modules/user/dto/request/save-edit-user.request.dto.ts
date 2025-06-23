import { IsNotEmpty, IsString, IsEmail, IsOptional, IsNumber, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ValidationErrorKeys } from 'src/app/common/localization/generated';

export class SaveEditUserRequest {
  @ApiProperty({ example: "Jon Wayne" })
  @IsNotEmpty()
  @IsString({ context: { validationErrorKey: ValidationErrorKeys.INVALID_CHARS } })
  @MinLength(2, { context: { validationErrorKey: ValidationErrorKeys.USERNAME_TOO_SHORT } })
  userName: string;

  @ApiProperty({ example: "test@test.com" })
  @IsNotEmpty()
  @IsEmail({}, { context: { validationErrorKey: ValidationErrorKeys.INCORRECT_EMAIL } })
  email: string;

  @ApiProperty({ example: "Some Info" })
  @IsString({ context: { validationErrorKey: ValidationErrorKeys.INVALID_CHARS } })
  @IsOptional()
  @MinLength(1, { context: { validationErrorKey: ValidationErrorKeys.VALUE_REQUIRED } })
  about?: string;
}