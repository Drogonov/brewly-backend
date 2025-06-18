import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CuppingStatus } from './types/cupping-status.enum';
import { IOptionListResponse } from '.';
import { IGetCuppingSampleTest } from './nested/get-cupping-sample-text.response.dto';
import { IGetCuppingSampleResponse } from './nested/get-cupping-sample.response.dto';

// MARK: - Project implementation

export interface IGetCuppingStatusResponse {
    status: CuppingStatus;
}

// MARK: - Swagger class

export class GetCuppingStatusResponseDto implements IGetCuppingStatusResponse {
    @ApiProperty({
        description: 'Status of the cupping, type is important for frontend',
        enum: CuppingStatus,
        example: CuppingStatus.inProgress,
    })
    status: CuppingStatus;
}