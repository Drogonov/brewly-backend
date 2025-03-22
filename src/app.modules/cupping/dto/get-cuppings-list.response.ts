import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ICuppingResponse } from './nested/cupping.response';

// MARK: - Project implementation

export interface IGetCuppingsListResponse {
    cuppings: ICuppingResponse[];
}

// MARK: - Swagger class

export class GetCuppingsListResponseDto implements IGetCuppingsListResponse {
    @ApiProperty({ description: 'array of the cuppings' })
    cuppings: ICuppingResponse[];
}