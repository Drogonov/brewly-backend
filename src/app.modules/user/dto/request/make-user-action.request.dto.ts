import { IsNotEmpty, IsString, IsEmail, IsOptional, IsNumber, IsIn, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidationErrorKeys } from 'src/app.common/localization/generated';
import { UserActionType } from 'src/app.modules/user/dto/types/user-action.type';
import { BooleanTransformer } from 'src/app.common/decorators';

export class MakeUserActionRequest {
  @ApiProperty({ example: 666 })
  @IsNotEmpty()
  @IsNumber({}, { context: { validationErrorKey: ValidationErrorKeys.USER_ID_MUST_BE_INT } })
  @Type(() => Number)
  userId: number;

  @ApiProperty({ example: UserActionType.addToFriends })
  @IsNotEmpty()
  @IsIn(Object.values(UserActionType), {
    context: { validationErrorKey: ValidationErrorKeys.VALUE_REQUIRED },
  })
  type: UserActionType;

  @ApiProperty({ example: false })
  @IsOptional()
  @BooleanTransformer()
  @IsBoolean({
    context: { validationErrorKey: ValidationErrorKeys.INVALID_BOOLEAN },
  })
  switchIsOn?: boolean;
}