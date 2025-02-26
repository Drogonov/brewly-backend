import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'src/app.common/dto';

// MARK: - Project implementation

export interface ICompanyInfoResponse {
    companyId: number;
    ownerId: number;
    companyName?: string;
    companyImageURL?: string;
}

// MARK: - Swagger class

export class CompanyInfoResponseDto implements ICompanyInfoResponse {
    @ApiProperty({ example: 666 })
    companyId: number;

    @ApiProperty({ example: 777 })
    ownerId: number;

    @ApiPropertyOptional({ description: 'Current user company name' })
    companyName?: string;

    @ApiPropertyOptional({ description: 'Image of the company', example: "https://picsum.photos/seed/picsum/200/300" })
    companyImageURL?: string;
}