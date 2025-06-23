import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ICuppingResponse } from './nested/cupping.response.dto';
import { CuppingResponseDto } from "./nested/cupping.response.dto";

// MARK: - Project implementation

export interface IGetCuppingsListResponse {
    cuppings: ICuppingResponse[];
}

// MARK: - Swagger class

export class GetCuppingsListResponseDto implements IGetCuppingsListResponse {
    @ApiProperty({
        description: 'array of the cuppings',
        type: () => CuppingResponseDto,
        isArray: true
    })
    cuppings: ICuppingResponse[];
}