import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// MARK: - Project implementation

export interface ICompanyRuleResponse {
    id: number;
    name: string;
    value: boolean;
}

// MARK: - Swagger class

export class CompanyRuleResponseDto implements ICompanyRuleResponse {
    @ApiProperty({ description: 'Rule id in the system', example: 123456789})
    @Type(() => Number)
    id: number;

    @ApiProperty({ description: 'Name of the rule', example: "Can Chief make Chief" })
    name: string;

    @ApiProperty({ description: 'Value of the rule', example: true })
    value: boolean;
}