import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetCompanyRulesRequestDto {
  @ApiProperty({ description: "id for rule" })
  @IsNotEmpty()
  @Type(() => Number)
  companyId: number;
}

