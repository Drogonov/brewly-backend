import { IsNotEmpty, IsString, IsEmail, IsOptional, IsNumber, IsEnum, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SearchUserType } from 'src/app.modules/user/dto/types/search-user-type';
import { Type } from 'class-transformer';
import { ValidationErrorKeys } from 'src/app.common/localization/generated';

export class GetUserCardRequestDto {
  @ApiProperty({ example: 666 })
  @IsNotEmpty()
  @IsNumber({}, { context: { validationErrorKey: ValidationErrorKeys.USER_ID_MUST_BE_INT } })
  @Type(() => Number)
  userId: number;

  @ApiProperty({ example: SearchUserType.friendsList })
  @IsNotEmpty()
  @IsIn(Object.values(SearchUserType), {
    context: { validationErrorKey: ValidationErrorKeys.VALUE_REQUIRED },
  })
  type: SearchUserType;
}