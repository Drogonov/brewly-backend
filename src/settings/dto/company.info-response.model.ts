import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface ICompanyInfoResponse {
    id: string;
    companyName: string;
}

// MARK: - Swagger class

export class CompanyInfoResponseDto implements ICompanyInfoResponse {
    @ApiProperty({ description: 'Идентификатор компании в системе', example: "123456789"})
    id: string;

    @ApiProperty({ description: 'Название компании', example: "ООО Вектор" })
    companyName: string;
}