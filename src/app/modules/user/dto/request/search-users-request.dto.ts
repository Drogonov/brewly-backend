import { IsNotEmpty, IsString, IsEmail, IsOptional, MinLength, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SearchUserType } from 'src/app/modules/user/dto/types/search-user-type';
import { ValidationErrorKeys } from 'src/app/common/localization/generated';

export class SearchUsersRequestDto {
  @ApiProperty({ example: "Vlad Emeliyanov" })
  @IsNotEmpty()
  @IsString({ context: { validationErrorKey: ValidationErrorKeys.INVALID_CHARS } })
  @MinLength(1, { context: { validationErrorKey: ValidationErrorKeys.VALUE_REQUIRED } })
  searchStr: string;

  @ApiProperty({ example: SearchUserType.friendsList })
  @IsNotEmpty()
  @IsIn(Object.values(SearchUserType), {
    context: { validationErrorKey: ValidationErrorKeys.VALUE_REQUIRED },
  })
  type: SearchUserType;
}