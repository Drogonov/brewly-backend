import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface IIconTextNumberInfoBlockResponse {
    iconName?: string;
    text?: string;
    number?: number;
}

// MARK: - Swagger class

export class IconTextNumberInfoBlockResponseDto implements IIconTextNumberInfoBlockResponse {
    @ApiPropertyOptional({
        description: 'Identifier of the icon in design system',
        example: 'ic_24_attention',
        type: String,
    })
    iconName?: string;

    @ApiPropertyOptional({
        description: 'Text of the block',
        example: 'Текст',
        type: String,
    })
    text?: string;

    @ApiPropertyOptional({
        description: 'Number sent in block',
        example: 1,
        type: Number,
    })
    number?: number;
}