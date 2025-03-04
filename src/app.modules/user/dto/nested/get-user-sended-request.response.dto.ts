import { ApiProperty } from '@nestjs/swagger';
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
    @ApiProperty({ example: 666 })
    @Type(() => Number)
    requestId: number;

    // ISO8601 format date
    @ApiProperty({ example: "2025-01-01T00:00:00Z" })
    requestDate: string;

    @ApiProperty({ example: "Friend request to John" })
    description: string;

    @ApiProperty({ enum: RequestTypeEnum, example: RequestTypeEnum.FRIEND })
    type: RequestTypeEnum;

    @ApiProperty({ example: "pending" })
    status?: string;
}