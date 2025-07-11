import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// MARK: - Project implementation

export interface ISuccessIdResponse {
    id: number;
}

// MARK: - Swagger class

export class SuccessIdResponseDto implements ISuccessIdResponse {
    @ApiProperty({
        description: 'The generated primary key for the created resource',
        example: 666,
    })
    @Type(() => Number)
    id: number;
}