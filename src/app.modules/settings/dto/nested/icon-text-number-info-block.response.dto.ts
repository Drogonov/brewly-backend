import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface IIconTextNumberInfoBlockResponse {
    iconName?: string;
    text?: string;
    number?: number;
}

// MARK: - Swagger class

export class IconTextNumberInfoBlockResponseDto implements IIconTextNumberInfoBlockResponse {
    @ApiPropertyOptional({ description: 'Identifier of the icon in design system', example: "ic_24_attention"})
    iconName?: string;

    @ApiPropertyOptional({ description: 'Text of the block', example: "Текст" })
    text?: string;

    @ApiPropertyOptional({ description: 'Number sended in block', example: "1" })
    number?: number;
}