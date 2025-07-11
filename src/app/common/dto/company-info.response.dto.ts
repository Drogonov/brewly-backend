import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// MARK: - Project implementation

export interface ICompanyInfoResponse {
    companyId: number;
    ownerId: number;
    companyName?: string;
    companyImageURL?: string;
    isPersonal: boolean;
}

// MARK: - Swagger class

export class CompanyInfoResponseDto implements ICompanyInfoResponse {
    @ApiProperty({ example: 666 })
    @Type(() => Number)
    companyId: number;

    @ApiProperty({ example: 777 })
    @Type(() => Number)
    ownerId: number;

    @ApiPropertyOptional({ description: 'Current user company name' })
    companyName?: string;

    @ApiPropertyOptional({ description: 'Image of the company', example: "https://picsum.photos/seed/picsum/200/300" })
    companyImageURL?: string;

    @ApiProperty({ example: false })
    isPersonal: boolean;
}