import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ICompanyRuleResponse } from './nested/company-rule.response.dto';
import { CompanyRuleResponseDto } from "./nested/company-rule.response.dto";

// MARK: - Project implementation

export interface IGetCompanyRulesResponse {
    companyName: string;
    rulesForOwner: ICompanyRuleResponse[];
    rulesForChief: ICompanyRuleResponse[];
    rulesForBarista: ICompanyRuleResponse[];
}

// MARK: - Swagger class

export class GetCompanyRulesResponseDto implements IGetCompanyRulesResponse {
    @ApiProperty({ description: 'Company name' })
    companyName: string;

    @ApiProperty({ description: 'Rules which owner add fo himself',
        type: () => CompanyRuleResponseDto,
        isArray: true
    })
    rulesForOwner: ICompanyRuleResponse[];

    @ApiProperty({ description: 'Rules for chief added by owner or other chiefs',
        type: () => CompanyRuleResponseDto,
        isArray: true
    })
    rulesForChief: ICompanyRuleResponse[];

    @ApiProperty({ description: 'Rules for barista added by owner or chief',
        type: () => CompanyRuleResponseDto,
        isArray: true
    })
    rulesForBarista: ICompanyRuleResponse[];
}