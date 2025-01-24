import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface ICompanyRuleResponse {
    id: string;
    name: string;
    value: boolean;
}

// MARK: - Swagger class

export class CompanyRuleResponseDto implements ICompanyRuleResponse {
    @ApiProperty({ description: 'Идентификатор правила в системе', example: "123456789"})
    id: string;

    @ApiProperty({ description: 'Название правила', example: "Can Chief make Chief" })
    name: string;

    @ApiProperty({ description: 'Значение правила', example: "true" })
    value: boolean;
}