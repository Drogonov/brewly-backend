import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum RequestTypeEnum {
  FRIEND = 'friend',
  TEAM = 'team',
}

export interface IGetUserSendedRequestResponse {
  requestId: number;
  requestDate: string;
  description: string;
  type: RequestTypeEnum;
  status?: string;
}

export class GetUserSendedRequestResponseDto implements IGetUserSendedRequestResponse {
  @ApiProperty({ example: 666, type: Number })
  @Type(() => Number)
  requestId: number;

  @ApiProperty({
    example: '2025-01-01T00:00:00Z',
    description: 'ISO8601 format date',
    type: String,
  })
  requestDate: string;

  @ApiProperty({ example: 'Friend request to John', type: String })
  description: string;

  @ApiProperty({
    enum: RequestTypeEnum,
    example: RequestTypeEnum.FRIEND,
    enumName: 'RequestTypeEnum',
    type: String,
  })
  type: RequestTypeEnum;

  @ApiPropertyOptional({ example: 'pending', type: String })
  status?: string;
}