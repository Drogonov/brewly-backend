import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface IIconTextNumberInfoBlockResponse {
    iconName: string;
    text: string;
    number: number;
}

// MARK: - Swagger class

export class IconTextNumberInfoBlockResponseDto implements IIconTextNumberInfoBlockResponse {
    @ApiProperty({ description: 'Идентификатор иконки в дизайн-системе', example: "ic_24_attention"})
    iconName: string;

    @ApiProperty({ description: 'Текст блока', example: "Текст" })
    text: string;

    @ApiProperty({ description: 'Число передаваемое в блоке', example: "1" })
    number: number;
}