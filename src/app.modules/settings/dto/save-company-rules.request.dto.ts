import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ICompanyRuleResponse } from './company-rule.response.dto';

export class SaveCompanyRulesRequestDto {

  @ApiProperty({ description: "Rules to save" })
  @IsNotEmpty()
  rules: CompanyRuleRequestDto[];
}

export class CompanyRuleRequestDto {
  @ApiProperty({ description: 'Rule id in the system', example: 123456789})
  @IsNotEmpty()
  id: number;

  @ApiProperty({ description: 'Name of the rule', example: "Can Chief make Chief" })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Value of the rule', example: true })
  @IsNotEmpty()
  value: boolean;
}