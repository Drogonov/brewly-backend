import { IsNotEmpty, IsString, IsEmail, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SearchUserType } from '../types/search-user-type';
import { RequestTypeEnum } from '../nested/get-user-sended-request.response.dto';
import { Type } from 'class-transformer';

export class RejectUserSendedRequestRequest {

  @ApiProperty({ example: 666 })
  @IsNotEmpty()
  @Type(() => Number)
  requestId: number;

  @IsNotEmpty()
  @ApiProperty({ example: RequestTypeEnum.FRIEND })
  requestType: RequestTypeEnum;
}