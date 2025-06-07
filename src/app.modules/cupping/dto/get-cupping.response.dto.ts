import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CuppingStatus } from './types/cupping-status.enum';
import { IOptionListResponse } from '.';
import { IGetCuppingSampleTest } from './nested/get-cupping-sample-text.response.dto';
import { IGetCuppingSampleResponse } from './nested/get-cupping-sample.response.dto';

// MARK: - Project implementation

export interface IGetCuppingResponse {
    status: CuppingStatus;
    cuppingName: string;
    eventDate?: string;
    endDate?: string;
    canUserStartCupiing: boolean;
    canUserEndCupiing: boolean;
    samples: IGetCuppingSampleResponse[];
}

// MARK: - Swagger class

export class GetCuppingResponseDto implements IGetCuppingResponse {

    @ApiProperty({ description: 'Status of the cupping, type is important for frontend' })
    status: CuppingStatus;

    @ApiProperty({ description: 'Name of the cupping' })
    cuppingName: string;

    @ApiProperty({ description: 'Date of the event start' })
    eventDate?: string;

    @ApiProperty({ description: 'Date when cupping will end' })
    endDate?: string;

    @ApiProperty({ description: 'Flag for chiefs of owners' })
    canUserStartCupiing: boolean;

    @ApiProperty({ description: 'Flag for chiefs of owners' })
    canUserEndCupiing: boolean;

    @ApiProperty({ description: 'Array with samples Data' })
    samples: IGetCuppingSampleResponse[];
}