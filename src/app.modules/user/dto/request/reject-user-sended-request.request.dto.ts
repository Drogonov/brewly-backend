import { IsNotEmpty, IsString, IsEmail, IsOptional, IsNumber, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RequestTypeEnum } from 'src/app.modules/user/dto/nested/get-user-sended-request.response.dto';
import { Type } from 'class-transformer';
import { ValidationErrorKeys } from 'src/app.common/localization/generated';

export class RejectUserSendedRequestRequest {
  @ApiProperty({ example: 666 })
  @IsNotEmpty()
  @IsNumber({}, { context: { validationErrorKey: ValidationErrorKeys.VALUE_REQUIRED } })
  @Type(() => Number)
  requestId: number;

  @ApiProperty({ example: RequestTypeEnum.FRIEND })
  @IsNotEmpty()
  @IsIn(Object.values(RequestTypeEnum), {
    context: { validationErrorKey: ValidationErrorKeys.VALUE_REQUIRED },
  })
  requestType: RequestTypeEnum;
}