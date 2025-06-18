import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IOptionListResponse, OptionListResponseDto } from 'src/app.common/dto/option-list.response.dto';

// MARK: - Project implementation

export interface IGetSampleCreationOptionsResponse {
    options: IOptionListResponse[];
}

// MARK: - Swagger class

export class GetSampleCreationOptionsResponseDTO implements IGetSampleCreationOptionsResponse {
    @ApiProperty({
        description: 'Options to create Sample',
        type: () => OptionListResponseDto,
        isArray: true,
    })
    @Type(() => OptionListResponseDto)
    options: IOptionListResponse[];
}