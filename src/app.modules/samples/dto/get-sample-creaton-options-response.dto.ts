import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IOptionListResponse } from 'src/app.common/dto/option-list.response.dto';

// MARK: - Project implementation

export interface IGetSampleCreationOptionsResponse {
    options: IOptionListResponse[];
}

// MARK: - Swagger class

export class GetSampleCreationOptionsResponseDTO implements IGetSampleCreationOptionsResponse {
    @ApiProperty({ description: 'Options to create Sample' })
    options: IOptionListResponse[];
}