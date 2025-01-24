import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface ICompanyRulesResponse {
    id: string;
    rules: ICompanyRulesResponse;
}

// MARK: - Swagger class

export class CompanyRulesResponseDto implements ICompanyRulesResponse {
    @ApiProperty({ description: 'Идентификатор компании в системе', example: "123456789"})
    id: string;

    @ApiProperty({ description: 'Список доступных правил пользователя для компании'})
    rules: ICompanyRulesResponse;
}