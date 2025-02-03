import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface ICompanyInfoResponse {
    id: number;
    companyName?: string;
    isCurrent: boolean;
    isPersonal: boolean;
}

// MARK: - Swagger class

export class CompanyInfoResponseDto implements ICompanyInfoResponse {
    @ApiProperty({ description: 'Company id in the system', example: 123456789})
    id: number;

    @ApiProperty({ description: 'Name of the Company', example: "Acme LLC" })
    companyName: string;

    @ApiProperty({ description: 'Is current user account company', example: true })
    isCurrent: boolean;

    @ApiProperty({ description: 'Is user personal company', example: true })
    isPersonal: boolean;
}